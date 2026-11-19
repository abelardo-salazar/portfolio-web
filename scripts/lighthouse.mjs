// Runs Lighthouse CI against a running production server (next start), never
// next dev: dev builds are unminified and would skew every category.
// Usage: node scripts/lighthouse.mjs [baseUrl] [--only=group1,group2]
// Reports land in .lighthouseci/ (gitignored), one folder per group. The
// folder is wiped on every run, so it only ever holds the groups just run.

import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { swapLocale } from "lighthouse/shared/localization/swap-locale.js";
import { groupDefinitions, groups } from "./lighthouse-groups.mjs";
import { getLighthouseUrls } from "./lighthouse-urls.mjs";

const args = process.argv.slice(2);
const BASE_URL = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000";
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
// Anchored to the repo, not the cwd: the cleanup below deletes this folder.
const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT_DIR = path.join(REPO_ROOT, ".lighthouseci");
const LHCI = createRequire(import.meta.url).resolve("@lhci/cli/src/cli.js");
const READY_TIMEOUT_MS = 60_000;
// Audit titles go to the PDF report, whose text is Spanish.
const REPORT_LOCALE = "es";

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

function lhci(cwd, lhciArgs, env = {}) {
  const res = spawnSync(process.execPath, [LHCI, ...lhciArgs], {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  return res.status ?? 1;
}

function settingsFlags(settings) {
  return Object.entries(settings).flatMap(([key, value]) =>
    Array.isArray(value)
      ? value.map((v) => `--settings.${key}=${v}`)
      : [`--settings.${key}=${value}`],
  );
}

function runGroup(group) {
  // Each group gets its own folder: lhci collect wipes .lighthouseci on start.
  const cwd = path.join(OUT_DIR, group.name);
  mkdirSync(cwd, { recursive: true });

  const collectStatus = lhci(cwd, [
    "collect",
    `--numberOfRuns=${group.runs}`,
    ...group.urls.map((u) => `--url=${u}`),
    ...settingsFlags(group.settings),
    // Blink's PreferredColorScheme enum: 0 = dark, 1 = light.
    `--settings.chromeFlags=--blink-settings=preferredColorScheme=${group.colorScheme === "dark" ? 0 : 1}`,
  ]);
  if (collectStatus !== 0) return { group, failed: "collect" };

  // The filesystem manifest marks the median run of each URL.
  lhci(cwd, ["upload", "--target=filesystem", "--outputDir=reports"]);
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
      const failing = Object.entries(lhr.categories).flatMap(([, category]) =>
        category.auditRefs
          .filter((ref) => ref.weight > 0 && lhr.audits[ref.id].score !== null && lhr.audits[ref.id].score < 1)
          .map((ref) => ref.id),
      );
      const ids = [...new Set(failing)];
      return {
        path: new URL(entry.url).pathname,
        scores: Object.fromEntries(
          Object.entries(lhr.categories).map(([id, c]) => [id, Math.round(c.score * 100)]),
        ),
        failing: ids,
        audits: ids.map((id) => {
          const { title, displayValue, score } = lhr.audits[id];
          return { id, title, displayValue, score };
        }),
        warnings: lhr.runWarnings.length,
        report: path.relative(OUT_DIR, entry.htmlPath),
      };
    });

  const assertStatus = lhci(
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

// Only ever deletes <repo>/.lighthouseci, and refuses if that path is a
// symlink, so a crafted link can't redirect the delete elsewhere.
function cleanOutDir() {
  if (path.basename(OUT_DIR) !== ".lighthouseci" || path.dirname(OUT_DIR) !== REPO_ROOT) {
    throw new Error(`Refusing to clean unexpected path: ${OUT_DIR}`);
  }
  if (existsSync(OUT_DIR)) {
    if (lstatSync(OUT_DIR).isSymbolicLink()) throw new Error(`Refusing to clean symlink: ${OUT_DIR}`);
    rmSync(OUT_DIR, { recursive: true, force: true });
  }
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

cleanOutDir();
const results = selected.map(runGroup);

const meta = {
  baseUrl: BASE_URL,
  measuredAt: new Date().toISOString(),
  // In a PR, actions/checkout measures the merge commit, not the PR head.
  commit: git("rev-parse", "HEAD"),
  // Untracked files are ignored: CI writes next.log into the checkout.
  dirty: Boolean(git("status", "--porcelain", "--untracked-files=no")),
  ci: Boolean(process.env.GITHUB_ACTIONS),
  prNumber: process.env.LH_PR_NUMBER || undefined,
  prHead: process.env.LH_PR_HEAD || undefined,
  executedGroups: selected.map((g) => g.name),
};

writeFileSync(path.join(OUT_DIR, "summary.json"), JSON.stringify({ meta, urls, results }, null, 2));
writeFileSync(path.join(OUT_DIR, "summary.md"), toMarkdown(urls, results));
console.log(`\nSummary: ${path.join(OUT_DIR, "summary.md")}`);

if (results.some((r) => r.failed)) process.exit(1);
