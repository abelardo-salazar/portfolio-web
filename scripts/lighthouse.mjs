// Runs Lighthouse CI against a running production server (next start), never
// next dev: dev builds are unminified and would skew every category.
// Usage: node scripts/lighthouse.mjs [baseUrl] [--only=group1,group2]
// Reports land in .lighthouseci/ (gitignored), one folder per group.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { getLighthouseUrls } from "./lighthouse-urls.mjs";

const args = process.argv.slice(2);
const BASE_URL = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000";
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const OUT_DIR = path.resolve(".lighthouseci");
const LHCI = createRequire(import.meta.url).resolve("@lhci/cli/src/cli.js");
const READY_TIMEOUT_MS = 60_000;

// Collection lives here rather than in rc files: URLs are derived at runtime,
// and LHCI merges array settings from rc files and flags unpredictably.
const groups = (urls) => [
  {
    // A11y and SEO read the DOM and are deterministic: one run is enough, and
    // skipping the performance trace keeps the per-slug cost low.
    name: "blocking-mobile",
    urls: urls.blocking,
    runs: 1,
    settings: { onlyCategories: ["accessibility", "seo"] },
    assert: "blocking.mjs",
  },
  {
    // The localized 404 answers 404 by design; without ignoreStatusCode
    // Lighthouse refuses to audit it. SEO is left out because
    // http-status-code and is-crawlable would always fail here.
    name: "notfound-mobile",
    urls: urls.notFound,
    runs: 1,
    settings: { onlyCategories: ["accessibility", "best-practices"], ignoreStatusCode: true },
    assert: "blocking.mjs",
  },
  {
    // Performance is noisy: LHCI keeps the median of 3 runs.
    name: "informative-mobile",
    urls: urls.informative,
    runs: 3,
    settings: { onlyCategories: ["performance", "best-practices"] },
    assert: "informative.mjs",
  },
  {
    name: "informative-desktop",
    urls: urls.informative,
    runs: 3,
    settings: { preset: "desktop", onlyCategories: ["performance", "best-practices"] },
    assert: "informative.mjs",
  },
];

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
  rmSync(cwd, { recursive: true, force: true });
  mkdirSync(cwd, { recursive: true });

  const collectStatus = lhci(cwd, [
    "collect",
    `--numberOfRuns=${group.runs}`,
    ...group.urls.map((u) => `--url=${u}`),
    ...settingsFlags(group.settings),
  ]);
  if (collectStatus !== 0) return { group, failed: "collect" };

  // The filesystem manifest marks the median run of each URL.
  lhci(cwd, ["upload", "--target=filesystem", "--outputDir=reports"]);
  const manifest = JSON.parse(readFileSync(path.join(cwd, "reports", "manifest.json"), "utf8"));
  const rows = manifest
    .filter((entry) => entry.isRepresentativeRun)
    .map((entry) => {
      const lhr = JSON.parse(readFileSync(entry.jsonPath, "utf8"));
      const failing = Object.entries(lhr.categories).flatMap(([, category]) =>
        category.auditRefs
          .filter((ref) => ref.weight > 0 && lhr.audits[ref.id].score !== null && lhr.audits[ref.id].score < 1)
          .map((ref) => ref.id),
      );
      return {
        path: new URL(entry.url).pathname,
        scores: Object.fromEntries(
          Object.entries(lhr.categories).map(([id, c]) => [id, Math.round(c.score * 100)]),
        ),
        failing: [...new Set(failing)],
        warnings: lhr.runWarnings.length,
        report: path.relative(OUT_DIR, entry.htmlPath),
      };
    });

  const assertStatus = lhci(
    cwd,
    ["assert", `--config=${path.resolve("lighthouse", group.assert)}`],
    { LH_FORM_FACTOR: group.settings.preset === "desktop" ? "desktop" : "mobile" },
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

  return { group, rows, assertions, failed: assertStatus !== 0 ? "assert" : undefined };
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

await waitForServer();
const urls = await getLighthouseUrls(BASE_URL);
const selected = groups(urls).filter((g) => !only || only.includes(g.name));
if (only && selected.length !== only.length) {
  throw new Error(`Unknown group in --only=${only.join(",")}`);
}

mkdirSync(OUT_DIR, { recursive: true });
const results = selected.map(runGroup);

writeFileSync(path.join(OUT_DIR, "summary.json"), JSON.stringify({ urls, results }, null, 2));
writeFileSync(path.join(OUT_DIR, "summary.md"), toMarkdown(urls, results));
console.log(`\nSummary: ${path.join(OUT_DIR, "summary.md")}`);

if (results.some((r) => r.failed)) process.exit(1);
