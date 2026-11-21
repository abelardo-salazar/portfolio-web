// Lighthouse groups and output folders, shared by scripts/lighthouse.mjs
// (collection), scripts/lighthouse-pdf.mjs (which must know every group, even
// the ones whose results never arrived) and scripts/lighthouse-report.mjs.
// No side effects on import.

import { existsSync, lstatSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

// The only folders these scripts may write to or delete, all directly under
// the repo root. Keep in sync with .gitignore.
export const OUTPUT_DIRS = {
  ci: ".lighthouseci",
  report: ".lighthouse-report",
  staging: ".lighthouse-report.tmp",
  backup: ".lighthouse-report.bak",
};

// Throws unless `name` is one of OUTPUT_DIRS, so callers can validate
// user-supplied folders before touching anything.
export function outputDir(name) {
  if (!Object.values(OUTPUT_DIRS).includes(name)) {
    throw new Error(`Unknown output folder "${name}" (allowed: ${Object.values(OUTPUT_DIRS).join(", ")})`);
  }
  return path.join(REPO_ROOT, name);
}

// Anchored to REPO_ROOT and limited to OUTPUT_DIRS, and refuses symlinks, so
// neither a bad argument nor a crafted link can redirect the delete.
export function removeOutputDir(dir) {
  const resolved = path.resolve(dir);
  if (path.dirname(resolved) !== REPO_ROOT || !Object.values(OUTPUT_DIRS).includes(path.basename(resolved))) {
    throw new Error(`Refusing to delete unexpected path: ${resolved}`);
  }
  if (!existsSync(resolved)) return;
  if (lstatSync(resolved).isSymbolicLink()) throw new Error(`Refusing to delete symlink: ${resolved}`);
  rmSync(resolved, { recursive: true, force: true });
}

// Collection lives here rather than in rc files: URLs are derived at runtime,
// and LHCI merges array settings from rc files and flags unpredictably.
// Every group pins its color scheme: the site follows prefers-color-scheme,
// so otherwise the audited theme would depend on the machine running it.
export const groups = (urls) => [
  {
    // A11y and SEO read the DOM and are deterministic: one run is enough, and
    // skipping the performance trace keeps the per-slug cost low.
    name: "blocking-mobile-light",
    urls: urls.blocking,
    runs: 1,
    colorScheme: "light",
    settings: { onlyCategories: ["accessibility", "seo"] },
    assert: "blocking.mjs",
  },
  {
    // Both themes ship, and contrast differs between them. SEO doesn't depend
    // on the theme, so it only runs in the light group.
    name: "blocking-mobile-dark",
    urls: urls.blocking,
    runs: 1,
    colorScheme: "dark",
    settings: { onlyCategories: ["accessibility"] },
    assert: "blocking.mjs",
  },
  {
    // The localized 404 answers 404 by design; without ignoreStatusCode
    // Lighthouse refuses to audit it. SEO is left out because
    // http-status-code and is-crawlable would always fail here.
    name: "notfound-mobile",
    urls: urls.notFound,
    runs: 1,
    colorScheme: "light",
    settings: { onlyCategories: ["accessibility", "best-practices"], ignoreStatusCode: true },
    assert: "blocking.mjs",
  },
  {
    // Performance is noisy: LHCI keeps the median of 3 runs.
    name: "informative-mobile",
    urls: urls.informative,
    runs: 3,
    colorScheme: "light",
    settings: { onlyCategories: ["performance", "best-practices"] },
    assert: "informative.mjs",
  },
  {
    name: "informative-desktop",
    urls: urls.informative,
    runs: 3,
    colorScheme: "light",
    settings: { preset: "desktop", onlyCategories: ["performance", "best-practices"] },
    assert: "informative.mjs",
  },
];

// Group definitions without URLs, for consumers that only need the metadata.
export const groupDefinitions = () => groups({ blocking: [], notFound: [], informative: [] });
