// Full local Lighthouse report, never run in CI: builds if needed, serves the
// build with next start on a free port, measures every group (informative
// included) and prints the PDF.
// Usage: npm run report:lighthouse [-- --build]
//   --build  force next build even when the current one looks up to date
// Result: .lighthouse-report/lighthouse-report.pdf plus the raw reports. Only
// the last report is kept, and it's replaced only when a run completes.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, renameSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import { groupDefinitions, OUTPUT_DIRS, outputDir, removeOutputDir, REPO_ROOT } from "./lighthouse-groups.mjs";

const FLAGS = ["--build"];
const args = process.argv.slice(2);
// Validated before anything is built, deleted or replaced.
const unknownArgs = args.filter((a) => !FLAGS.includes(a));
if (unknownArgs.length) {
  console.error(`Unknown argument(s): ${unknownArgs.join(" ")}. Allowed: ${FLAGS.join(" ")}`);
  process.exit(2);
}
const FORCE_BUILD = args.includes("--build");

const REPORT_DIR = outputDir(OUTPUT_DIRS.report);
const STAGING_DIR = outputDir(OUTPUT_DIRS.staging);
const BACKUP_DIR = outputDir(OUTPUT_DIRS.backup);
const PDF_NAME = "lighthouse-report.pdf";
const NEXT_BIN = createRequire(import.meta.url).resolve("next/dist/bin/next");
// Not "localhost": on Windows it may resolve to ::1 while Next listens on IPv4.
const HOST = "127.0.0.1";
const READY_TIMEOUT_MS = 60_000;
const STOP_TIMEOUT_MS = 5_000;
const LOG_TAIL_LINES = 40;
const IS_WINDOWS = process.platform === "win32";

// Changes here never reach the build output, so they don't force a rebuild.
const BUILD_IRRELEVANT = [/^scripts\//, /^lighthouse\//, /^\.github\//, /\.md$/i];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Interrupted extends Error {}

// --- Child processes ----------------------------------------------------------

const children = new Set();
let interrupted;

function startNode(nodeArgs, { captureTo } = {}) {
  const child = spawn(process.execPath, nodeArgs, {
    cwd: REPO_ROOT,
    stdio: ["ignore", captureTo ? "pipe" : "inherit", captureTo ? "pipe" : "inherit"],
    // POSIX: own process group, so the whole tree (Next workers, Chrome) can
    // be signalled at once. Windows: detached would open a new console window;
    // taskkill /T covers the tree there.
    detached: !IS_WINDOWS,
    windowsHide: true,
  });
  if (captureTo) {
    for (const stream of [child.stdout, child.stderr]) {
      stream.on("data", (chunk) => {
        captureTo.push(...chunk.toString().split(/\r?\n/).filter(Boolean));
        captureTo.splice(0, Math.max(0, captureTo.length - LOG_TAIL_LINES));
      });
    }
  }
  children.add(child);
  child.exited = new Promise((resolve) => {
    child.once("error", (err) => {
      console.error(err.message);
      resolve(1);
    });
    child.once("exit", (code) => resolve(code ?? 1));
  }).finally(() => children.delete(child));
  return child;
}

const isRunning = (child) => child.exitCode === null && child.signalCode === null;

async function stopChild(child) {
  if (!isRunning(child)) return;
  if (IS_WINDOWS) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {}
  }
  const stopped = await Promise.race([child.exited.then(() => true), sleep(STOP_TIMEOUT_MS).then(() => false)]);
  if (!stopped && !IS_WINDOWS) {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {}
  }
}

const stopAll = () => Promise.all([...children].map(stopChild));

// The handler only flags and stops the children; the main flow notices,
// unwinds through its finally and exits. A second signal exits right away.
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    if (interrupted) process.exit(130);
    interrupted = signal;
    console.error(`\n${signal} received: stopping the server and the measurement...`);
    stopAll();
  });
}

function checkInterrupted() {
  if (interrupted) throw new Interrupted(`Interrupted by ${interrupted}`);
}

async function runNode(nodeArgs) {
  const code = await startNode(nodeArgs).exited;
  checkInterrupted();
  return code;
}

// --- Steps ------------------------------------------------------------------

function buildStaleReason() {
  const buildId = path.join(REPO_ROOT, ".next", "BUILD_ID");
  if (!existsSync(buildId)) return "no build found";
  const builtAt = statSync(buildId).mtimeMs;
  const res = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  if (res.status !== 0) return "could not list files with git";
  const files = res.stdout.split("\0").filter((f) => f && !BUILD_IRRELEVANT.some((re) => re.test(f)));
  // Gitignored, but next build inlines its NEXT_PUBLIC_* values.
  files.push(".env.local");
  const changed = files.find((f) => {
    try {
      return statSync(path.join(REPO_ROOT, f)).mtimeMs > builtAt;
    } catch {
      return false;
    }
  });
  return changed && `${changed} changed after the last build`;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, HOST, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

async function waitForServer(baseUrl, server) {
  let exited = false;
  server.exited.then(() => (exited = true));
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    checkInterrupted();
    // Also catches the port being taken between freePort() and next start.
    if (exited) throw new Error("next start exited before it was ready");
    try {
      await fetch(`${baseUrl}/es`, { signal: AbortSignal.timeout(5_000) });
      return;
    } catch {
      await sleep(500);
    }
  }
  throw new Error(`Server at ${baseUrl} not ready after ${READY_TIMEOUT_MS}ms`);
}

// A completed run: every group was measured (assertion failures are results
// the PDF shows, not a broken run). Returns the groups that failed assertions.
function checkStagedRun() {
  const summaryFile = path.join(STAGING_DIR, "summary.json");
  if (!existsSync(summaryFile)) throw new Error("The measurement wrote no summary.json");
  const { results = [] } = JSON.parse(readFileSync(summaryFile, "utf8"));
  const measured = new Set(results.filter((r) => r.failed !== "collect").map((r) => r.group.name));
  const missing = groupDefinitions().filter((g) => !measured.has(g.name));
  if (missing.length) throw new Error(`Groups not measured: ${missing.map((g) => g.name).join(", ")}`);
  return results.filter((r) => r.failed === "assert").map((r) => r.group.name);
}

// Windows refuses to rename a folder while a file inside is open; retry
// briefly in case a scanner or the just-closed Chrome still holds a handle.
function renameWithRetry(from, to) {
  for (let attempt = 1; ; attempt++) {
    try {
      return renameSync(from, to);
    } catch (err) {
      if (attempt >= 5 || !["EPERM", "EBUSY", "EACCES"].includes(err.code)) throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
    }
  }
}

// Synchronous, so a signal can't land between the renames. If the second
// rename fails, the previous report is put back.
function publishReport() {
  if (existsSync(REPORT_DIR) && lstatSync(REPORT_DIR).isSymbolicLink()) {
    throw new Error(`Refusing to replace symlink: ${REPORT_DIR}`);
  }
  removeOutputDir(BACKUP_DIR);
  const hadPrevious = existsSync(REPORT_DIR);
  if (hadPrevious) renameWithRetry(REPORT_DIR, BACKUP_DIR);
  try {
    renameWithRetry(STAGING_DIR, REPORT_DIR);
  } catch (err) {
    if (hadPrevious) renameWithRetry(BACKUP_DIR, REPORT_DIR);
    throw err;
  }
  removeOutputDir(BACKUP_DIR);
}

// A backup without a report means a previous run died mid-swap: restore it.
function recoverInterruptedSwap() {
  if (existsSync(BACKUP_DIR) && !existsSync(REPORT_DIR)) renameWithRetry(BACKUP_DIR, REPORT_DIR);
  removeOutputDir(BACKUP_DIR);
  removeOutputDir(STAGING_DIR);
}

// --- Main -------------------------------------------------------------------

const serverLog = [];
let keepStaging = false;
let exitCode = 0;

try {
  recoverInterruptedSwap();

  const staleReason = FORCE_BUILD ? "--build" : buildStaleReason();
  if (staleReason) {
    console.log(`Building (${staleReason})...`);
    if ((await runNode([NEXT_BIN, "build"])) !== 0) throw new Error("next build failed");
  } else {
    console.log("Reusing the current build (.next is newer than every source file).");
  }

  const port = await freePort();
  const baseUrl = `http://${HOST}:${port}`;
  const server = startNode([NEXT_BIN, "start", "-H", HOST, "-p", String(port)], { captureTo: serverLog });
  await waitForServer(baseUrl, server);
  console.log(`Serving the build at ${baseUrl}`);

  // Exit code ignored on purpose: assertion failures exit 1 too, and the
  // staged summary tells them apart from a broken run.
  await runNode([path.join(REPO_ROOT, "scripts", "lighthouse.mjs"), baseUrl, `--out=${OUTPUT_DIRS.staging}`]);
  const failedGroups = checkStagedRun();

  const pdfArgs = [`--in=${STAGING_DIR}`, `--out=${path.join(STAGING_DIR, PDF_NAME)}`];
  if ((await runNode([path.join(REPO_ROOT, "scripts", "lighthouse-pdf.mjs"), ...pdfArgs])) !== 0) {
    throw new Error("PDF generation failed");
  }

  // Stopped before the swap so nothing still writes into the folders.
  await stopAll();
  checkInterrupted();
  try {
    publishReport();
  } catch (err) {
    keepStaging = true;
    throw new Error(
      `Could not replace ${OUTPUT_DIRS.report}/ (${err.code ?? err.message}); close any file open from it, e.g. the PDF. ` +
        `This run's report is kept in ${OUTPUT_DIRS.staging}/ until the next run.`,
    );
  }

  console.log(`\nReport: ${path.join(REPORT_DIR, PDF_NAME)}`);
  if (failedGroups.length) {
    console.error(`Assertions failed in: ${failedGroups.join(", ")} (see the PDF).`);
    exitCode = 1;
  }
} catch (err) {
  // Killing the children can surface as another error first; the signal wins.
  exitCode = interrupted ? 130 : 1;
  console.error(`\n${interrupted ? `Interrupted by ${interrupted}` : err.message}`);
  if (!interrupted && serverLog.length) {
    console.error(`\nLast lines from next start:\n${serverLog.join("\n")}`);
  }
  if (!keepStaging) console.error(`The previous report in ${OUTPUT_DIRS.report}/ was left untouched.`);
} finally {
  await stopAll();
  if (!keepStaging) removeOutputDir(STAGING_DIR);
}

process.exit(exitCode);
