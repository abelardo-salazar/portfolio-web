// Runs Lighthouse CI against a running production server (next start), never
// next dev: dev builds are unminified and would skew every category.
// Usage: node scripts/lighthouse.mjs [baseUrl] [--only=group1,group2] [--out=folder]
// Reports land in --out (default .lighthouseci/, gitignored), one folder per
// group. The folder is wiped on every run, so it only ever holds the groups
// just run. --out only accepts the folders in OUTPUT_DIRS.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { swapLocale } from "lighthouse/shared/localization/swap-locale.js";
import { groupDefinitions, groups, OUTPUT_DIRS, outputDir, removeOutputDir, REPO_ROOT } from "./lighthouse-groups.mjs";
import { getLighthouseUrls } from "./lighthouse-urls.mjs";

const args = process.argv.slice(2);
const BASE_URL = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000";
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
// Throws on anything outside OUTPUT_DIRS, before the cleanup below runs.
const OUT_DIR = outputDir(args.find((a) => a.startsWith("--out="))?.slice(6) ?? OUTPUT_DIRS.ci);
const LHCI = createRequire(import.meta.url).resolve("@lhci/cli/src/cli.js");
// lighthouse/blocking.mjs builds its audit lists from this root copy; LHCI
// must measure with the same one or assertions drift silently.
const EXPECTED_LH_VERSION = createRequire(import.meta.url)("lighthouse/package.json").version;
const READY_TIMEOUT_MS = 60_000;
// Audit titles go to the PDF report, whose text is Spanish.
const REPORT_LOCALE = "es";

// Lighthouse's own audit ids for the metrics the PDF shows.
const PERF_METRICS = {
  fcp: "first-contentful-paint",
  lcp: "largest-contentful-paint",
  tbt: "total-blocking-time",
  cls: "cumulative-layout-shift",
  si: "speed-index",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      await fetch(`${BASE_URL}/es`);
      return;
    } catch {
      await sleep(1000);
    }
  }
  throw new Error(`Server at ${BASE_URL} not ready after ${READY_TIMEOUT_MS}ms`);
}

const IS_WINDOWS = process.platform === "win32";
const STOP_TIMEOUT_MS = 5_000;
const running = new Set();
// Set once any group throws, so siblings between lhci steps spawn nothing new.
let aborted = false;

// Whole lines only, so parallel groups never interleave within a line.
function pipePrefixed(stream, out, prefix) {
  let pending = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    const lines = (pending + chunk).split(/\r?\n/);
    pending = lines.pop();
    for (const line of lines) out.write(`${prefix}${line}\n`);
  });
  stream.on("end", () => pending && out.write(`${prefix}${pending}\n`));
}

function lhci(group, cwd, lhciArgs, env = {}) {
  if (aborted) return Promise.resolve(1);
  // Not detached: children stay in this process group, so a terminal Ctrl-C
  // and lighthouse-report.mjs's group kill still reach them.
  const child = spawn(process.execPath, [LHCI, ...lhciArgs], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...env },
    windowsHide: true,
  });
  running.add(child);
  const prefix = `[${group.name}] `;
  pipePrefixed(child.stdout, process.stdout, prefix);
  pipePrefixed(child.stderr, process.stderr, prefix);
  return new Promise((resolve) => {
    child.once("error", (err) => {
      process.stderr.write(`${prefix}${err.message}\n`);
      resolve(1);
    });
    child.once("close", (code) => resolve(code ?? 1));
  }).finally(() => running.delete(child));
}

// lhci -> lighthouse CLI -> Chrome: killing only the direct child would
// orphan Chrome, so the whole subtree goes.
function descendantsOf(pid) {
  const res = spawnSync("ps", ["-A", "-o", "pid=,ppid="], { encoding: "utf8" });
  const children = new Map();
  for (const line of (res.stdout ?? "").trim().split("\n")) {
    const [p, pp] = line.trim().split(/\s+/).map(Number);
    if (!children.has(pp)) children.set(pp, []);
    children.get(pp).push(p);
  }
  const out = [];
  const stack = [pid];
  while (stack.length) {
    const next = children.get(stack.pop()) ?? [];
    out.push(...next);
    stack.push(...next);
  }
  return out;
}

function signalAll(pids, signal) {
  for (const pid of pids) {
    try {
      process.kill(pid, signal);
    } catch {}
  }
}

async function stopTree(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise((resolve) => child.once("close", resolve));
  if (IS_WINDOWS) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    await exited;
    return;
  }
  // Snapshot before signalling: once a parent dies its children get reparented.
  const tree = [child.pid, ...descendantsOf(child.pid)];
  signalAll(tree, "SIGTERM");
  await Promise.race([exited, sleep(STOP_TIMEOUT_MS)]);
  // Chrome may outlive lhci's exit; kill whatever in the snapshot survived.
  signalAll(tree.filter(isAlive), "SIGKILL");
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

const stopAll = () => Promise.all([...running].map(stopTree));

function settingsFlags(settings) {
  return Object.entries(settings).flatMap(([key, value]) =>
    Array.isArray(value)
      ? value.map((v) => `--settings.${key}=${v}`)
      : [`--settings.${key}=${value}`],
  );
}

// Audits that move the category score. Shared by the counts and the failing
// list so every ✗ in the PDF also shows up in its detail section.
const weightedAudits = (lhr, category) =>
  category.auditRefs.map((ref) => ({ ref, audit: lhr.audits[ref.id] })).filter(({ ref, audit }) => ref.weight > 0 && audit.score !== null);

// Pass threshold as in the Lighthouse report's "Passed audits". Lighthouse
// sets weight 0 on not-applicable audits, so those are counted apart.
function auditCounts(lhr, category) {
  const weighted = weightedAudits(lhr, category);
  return {
    passed: weighted.filter(({ audit }) => audit.score >= 0.9).length,
    failed: weighted.filter(({ audit }) => audit.score < 0.9).length,
    notApplicable: category.auditRefs.filter((ref) => lhr.audits[ref.id].scoreDisplayMode === "notApplicable").length,
  };
}

function perfMetrics(lhr) {
  if (!lhr.categories.performance) return undefined;
  return Object.fromEntries(
    Object.entries(PERF_METRICS).map(([key, id]) => {
      const { numericValue, displayValue, score } = lhr.audits[id] ?? {};
      return [key, { value: numericValue, display: displayValue, score }];
    }),
  );
}

// Expected failure: reported as a plain message at the top level, no stack.
class VersionGuardError extends Error {}

// Reads the raw LHRs collect just wrote, before upload/assert/summary.
function checkLighthouseVersion(cwd) {
  const lhrDir = path.join(cwd, ".lighthouseci");
  const files = existsSync(lhrDir) ? readdirSync(lhrDir).filter((f) => /^lhr-.*\.json$/.test(f)) : [];
  // A guard that checked nothing must not pass.
  if (!files.length) {
    throw new VersionGuardError(
      `Lighthouse version check: no LHCI results (lhr-*.json) found to verify in ${lhrDir}. ` +
        `@lhci/cli may have changed its result file naming.`,
    );
  }
  const measured = new Set(files.map((f) => JSON.parse(readFileSync(path.join(lhrDir, f), "utf8")).lighthouseVersion));
  const mismatched = [...measured].filter((v) => v !== EXPECTED_LH_VERSION);
  if (mismatched.length) {
    throw new VersionGuardError(
      `Lighthouse version mismatch: LHCI measured with ${mismatched.join(", ")} but the root "lighthouse" package is ${EXPECTED_LH_VERSION}. ` +
        `@lhci/cli probably nested its own copy (see node_modules/@lhci/cli/node_modules/lighthouse); ` +
        `align the root "lighthouse" pin with the version @lhci/cli requires.`,
    );
  }
}

async function runGroup(group) {
  // Each group gets its own folder: lhci collect wipes .lighthouseci on start.
  const cwd = path.join(OUT_DIR, group.name);
  mkdirSync(cwd, { recursive: true });

  const collectStatus = await lhci(group, cwd, [
    "collect",
    `--numberOfRuns=${group.runs}`,
    ...group.urls.map((u) => `--url=${u}`),
    ...settingsFlags(group.settings),
    // Blink's PreferredColorScheme enum: 0 = dark, 1 = light.
    `--settings.chromeFlags=--blink-settings=preferredColorScheme=${group.colorScheme === "dark" ? 0 : 1}`,
  ]);
  if (collectStatus !== 0) return { group, failed: "collect" };
  checkLighthouseVersion(cwd);

  // The filesystem manifest marks the median run of each URL.
  await lhci(group, cwd, ["upload", "--target=filesystem", "--outputDir=reports"]);
  const manifest = JSON.parse(readFileSync(path.join(cwd, "reports", "manifest.json"), "utf8"));
  let environment;
  const rows = manifest
    .filter((entry) => entry.isRepresentativeRun)
    .map((entry) => {
      // Lighthouse's own translations, so the PDF names audits in plain words.
      const lhr = swapLocale(JSON.parse(readFileSync(entry.jsonPath, "utf8")), REPORT_LOCALE).lhr;
      environment ??= {
        lighthouseVersion: lhr.lighthouseVersion,
        userAgent: lhr.environment.hostUserAgent,
        formFactor: lhr.configSettings.formFactor,
        throttlingMethod: lhr.configSettings.throttlingMethod,
      };
      const failing = Object.values(lhr.categories).flatMap((category) =>
        weightedAudits(lhr, category)
          .filter(({ audit }) => audit.score < 1)
          .map(({ ref }) => ref.id),
      );
      const ids = [...new Set(failing)];
      return {
        path: new URL(entry.url).pathname,
        scores: Object.fromEntries(
          Object.entries(lhr.categories).map(([id, c]) => [id, Math.round(c.score * 100)]),
        ),
        counts: Object.fromEntries(Object.entries(lhr.categories).map(([id, c]) => [id, auditCounts(lhr, c)])),
        metrics: perfMetrics(lhr),
        failing: ids,
        audits: ids.map((id) => {
          const { title, displayValue, score } = lhr.audits[id];
          return { id, title, displayValue, score };
        }),
        warnings: lhr.runWarnings.length,
        report: path.relative(OUT_DIR, entry.htmlPath),
      };
    });

  const assertStatus = await lhci(
    group,
    cwd,
    ["assert", `--config=${path.join(REPO_ROOT, "lighthouse", group.assert)}`],
    // Configs can't tell groups apart by URL, so they read the group here.
    {
      LH_FORM_FACTOR: group.settings.preset === "desktop" ? "desktop" : "mobile",
      LH_COLOR_SCHEME: group.colorScheme,
      LH_CATEGORIES: group.settings.onlyCategories.join(","),
    },
  );
  const resultsFile = path.join(cwd, ".lighthouseci", "assertion-results.json");
  // Missing when assert crashes before evaluating; its exit code still counts.
  const assertions = (existsSync(resultsFile) ? JSON.parse(readFileSync(resultsFile, "utf8")) : []).map((a) => ({
    level: a.level,
    path: new URL(a.url).pathname,
    audit: a.auditProperty ? `${a.auditId}:${a.auditProperty}` : a.auditId,
    expected: a.expected,
    actual: a.actual,
  }));

  return { group, rows, environment, assertions, failed: assertStatus !== 0 ? "assert" : undefined };
}

function toMarkdown(urls, results) {
  const lines = [
    `# Lighthouse report`,
    ``,
    `Base URL: ${BASE_URL}  `,
    `Slugs: ${urls.slugs.join(", ")} (representative: ${urls.representative})`,
    ``,
  ];
  for (const { group, rows, failed, assertions = [] } of results) {
    const status = failed ? `**${failed} failed**` : "passed";
    lines.push(`## ${group.name} (${group.runs} run${group.runs > 1 ? "s, median" : ""}): ${status}`, ``);
    if (!rows) continue;
    const categories = Object.keys(rows[0]?.scores ?? {});
    lines.push(
      `| Path | ${categories.join(" | ")} | Failing audits | Report |`,
      `|---|${categories.map(() => "---:").join("|")}|---|---|`,
      ...rows.map(
        (r) =>
          `| ${r.path} | ${categories.map((c) => r.scores[c]).join(" | ")} | ${r.failing.join(", ") || "-"} | ${r.report} |`,
      ),
      ``,
    );
    if (assertions.length) {
      lines.push(
        `| Level | Path | Assertion | Expected | Actual |`,
        `|---|---|---|---:|---:|`,
        ...assertions.map((a) => `| ${a.level} | ${a.path} | ${a.audit} | ${a.expected} | ${a.actual} |`),
        ``,
      );
    }
  }
  return lines.join("\n");
}

function cleanOutDir() {
  removeOutputDir(OUT_DIR);
  mkdirSync(OUT_DIR, { recursive: true });
}

function git(...gitArgs) {
  const res = spawnSync("git", gitArgs, { cwd: REPO_ROOT, encoding: "utf8" });
  return res.status === 0 ? res.stdout.trim() : undefined;
}

// Validate before waiting or cleaning: a typo must not wipe the last reports.
const knownGroups = groupDefinitions().map((g) => g.name);
const unknown = (only ?? []).filter((name) => !knownGroups.includes(name));
if (unknown.length) throw new Error(`Unknown group in --only: ${unknown.join(",")}`);

await waitForServer();
const urls = await getLighthouseUrls(BASE_URL);
const selected = groups(urls).filter((g) => !only || only.includes(g.name));

// Performance depends on CPU, so those groups never share the machine. The
// rest read the DOM and are deterministic, so they can run side by side.
const measuresPerformance = (g) => g.settings.onlyCategories.includes("performance");

async function runAll() {
  const byName = new Map();
  const parallel = selected.filter((g) => !measuresPerformance(g));
  (await Promise.all(parallel.map(runGroup))).forEach((r) => byName.set(r.group.name, r));
  for (const g of selected.filter(measuresPerformance)) byName.set(g.name, await runGroup(g));
  // Definition order, not completion order.
  return selected.map((g) => byName.get(g.name));
}

cleanOutDir();
let results;
try {
  results = await runAll();
} catch (err) {
  // Promise.all rejecting doesn't stop the siblings' processes; do it here.
  aborted = true;
  await stopAll();
  if (!(err instanceof VersionGuardError)) throw err;
  console.error(`\n${err.message}`);
  process.exit(1);
}

const meta = {
  baseUrl: BASE_URL,
  measuredAt: new Date().toISOString(),
  // In a PR, actions/checkout measures the merge commit, not the PR head.
  commit: git("rev-parse", "HEAD"),
  // Untracked files are ignored: CI writes next.log into the checkout.
  dirty: Boolean(git("status", "--porcelain", "--untracked-files=no")),
  executedGroups: selected.map((g) => g.name),
  // Only set by scripts/lighthouse-report.mjs; absent when run on its own (CI).
  build: process.env.LH_BUILD_MODE
    ? { mode: process.env.LH_BUILD_MODE, builtAt: process.env.LH_BUILD_TIME || undefined }
    : undefined,
};

writeFileSync(path.join(OUT_DIR, "summary.json"), JSON.stringify({ meta, urls, results }, null, 2));
writeFileSync(path.join(OUT_DIR, "summary.md"), toMarkdown(urls, results));
console.log(`\nSummary: ${path.join(OUT_DIR, "summary.md")}`);

if (results.some((r) => r.failed)) process.exit(1);
