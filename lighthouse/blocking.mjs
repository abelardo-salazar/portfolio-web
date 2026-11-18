// Blocking assertions: Accessibility and SEO on every page (mobile), plus the
// two 404 pages. Thresholds were set from the baseline; A11y/SEO audits read
// the DOM, so they don't vary between runs and need no noise margin.

// Audit lists come from the pinned Lighthouse itself, so a Lighthouse bump
// asserts any new audit without editing this file. Zero-weight audits are
// manual checks that always score 0, so they are excluded.
import defaultConfig from "lighthouse/core/config/default-config.js";

const scoredAudits = (category) =>
  defaultConfig.categories[category].auditRefs.filter((ref) => ref.weight > 0).map((ref) => ref.id);

// A bare "error" means minScore 0.9 in LHCI; audits must pass outright.
const requireAll = (ids, knownFailures = []) =>
  Object.fromEntries(
    ids.map((id) => [id, knownFailures.includes(id) ? "off" : ["error", { minScore: 1 }]]),
  );

const a11y = scoredAudits("accessibility");
const seo = scoredAudits("seo");

const pageAssertions = (knownFailures) => ({
  "categories:accessibility": ["error", { minScore: 0.98 }],
  // The 8 points below 100 are canonical: SITE_URL is hardcoded to the
  // production domain, so on localhost the canonical always points elsewhere.
  "categories:seo": ["error", { minScore: 0.92 }],
  ...requireAll([...a11y, ...seo], ["canonical", ...knownFailures]),
});

// Patterns are disjoint on purpose: when several entries match one URL, LHCI
// applies all of them, so an exception in one would be overridden by another.
// "lighthouse-404" is the probe segment from scripts/lighthouse-urls.mjs.
const config = {
  ci: {
    assert: {
      assertMatrix: [
        {
          // Home pages (anything outside /projects).
          matchingUrlPattern: "^(?!.*lighthouse-404)(?!.*/projects(/|$)).*$",
          assertions: pageAssertions([]),
        },
        {
          // Listing and project details: their cards jump from h1 to h3.
          matchingUrlPattern: "^(?!.*lighthouse-404).*/projects(/|$)",
          assertions: pageAssertions(["heading-order"]),
        },
        {
          // Unknown path: the global src/app/not-found.tsx renders outside
          // the locale layout, with no lang, title or main landmark.
          matchingUrlPattern: "/(es|en)/lighthouse-404$",
          assertions: {
            "categories:accessibility": ["error", { minScore: 0.87 }],
            ...requireAll(a11y, ["html-has-lang", "document-title", "landmark-one-main"]),
            // Informative: the 404 response itself always logs a console error.
            "categories:best-practices": ["warn", { minScore: 0.96 }],
          },
        },
        {
          // Unknown slug: the localized [locale]/not-found.tsx.
          matchingUrlPattern: "/projects/lighthouse-404$",
          assertions: {
            "categories:accessibility": ["error", { minScore: 1 }],
            ...requireAll(a11y),
            "categories:best-practices": ["warn", { minScore: 0.96 }],
          },
        },
      ],
    },
  },
};

export default config;
