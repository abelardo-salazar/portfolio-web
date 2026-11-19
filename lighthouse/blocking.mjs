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

// Set per group by scripts/lighthouse.mjs: URL patterns can't tell the theme
// apart, and asserting audits of a category that wasn't collected is ambiguous.
const colorScheme = process.env.LH_COLOR_SCHEME ?? "light";
const withSeo = (process.env.LH_CATEGORIES ?? "accessibility,seo").split(",").includes("seo");

// Patterns are disjoint on purpose: when several entries match one URL, LHCI
// applies all of them, so an exception in one would be overridden by another.
// "lighthouse-404" is the probe segment from scripts/lighthouse-urls.mjs.
// Labels are Spanish because scripts/lighthouse-pdf.mjs prints them.
export const scopes = {
  home: { label: "Inicio (/es, /en)", pattern: "^(?!.*lighthouse-404)(?!.*/projects(/|$)).*$" },
  listing: { label: "Listado de proyectos (/es/projects, /en/projects)", pattern: "^(?!.*lighthouse-404).*/projects/?$" },
  detail: { label: "Detalle de cada proyecto", pattern: "^(?!.*lighthouse-404).*/projects/[^/]+$" },
  // The global src/app/not-found.tsx, rendered outside the locale layout.
  notFoundPath: { label: "404 de ruta desconocida (/es/…, /en/…)", pattern: "/(es|en)/lighthouse-404$" },
  // The localized [locale]/not-found.tsx.
  notFoundSlug: { label: "404 de proyecto desconocido", pattern: "/projects/lighthouse-404$" },
};

// Single source for everything this file switches off or relaxes: the
// assertions below are built from it, and the PDF report lists it verbatim.
// kind "off": the audit is not asserted. kind "threshold": the category
// minScore is lowered. theme limits the exception to one color scheme.
const PAGES = ["home", "listing", "detail"];
export const knownExceptions = [
  {
    kind: "off",
    audit: "canonical",
    scopes: PAGES,
    reason:
      "SITE_URL está fijado al dominio de producción, así que en localhost el canonical siempre apunta a otro host. En producción no aplica.",
  },
  {
    kind: "threshold",
    audit: "categories:seo",
    value: 0.92,
    scopes: PAGES,
    reason: "Los 8 puntos que faltan para 100 son exactamente el audit canonical de arriba.",
  },
  {
    kind: "off",
    audit: "heading-order",
    scopes: ["listing", "detail"],
    reason: "Las tarjetas de proyecto saltan de h1 a h3.",
  },
  {
    kind: "off",
    audit: "color-contrast",
    scopes: ["listing"],
    theme: "light",
    reason: "El placeholder del Combobox del design system tiene contraste 3.09:1 en tema claro.",
  },
  {
    kind: "threshold",
    audit: "categories:accessibility",
    value: 0.94,
    scopes: ["listing"],
    theme: "light",
    reason: "Consecuencia de heading-order y color-contrast en esta página (el resto exige 0.98).",
  },
  ...["html-has-lang", "document-title", "landmark-one-main"].map((audit) => ({
    kind: "off",
    audit,
    scopes: ["notFoundPath"],
    reason: "El not-found global se renderiza fuera del layout de locale: no tiene lang, title ni landmark main.",
  })),
  {
    kind: "threshold",
    audit: "categories:accessibility",
    value: 0.87,
    scopes: ["notFoundPath"],
    reason: "Consecuencia de los tres audits apagados en esta página.",
  },
];

const exceptionsFor = (scope) =>
  knownExceptions.filter((e) => e.scopes.includes(scope) && (!e.theme || e.theme === colorScheme));
const offAudits = (scope) => exceptionsFor(scope).filter((e) => e.kind === "off").map((e) => e.audit);
const minScore = (scope, category, fallback) =>
  exceptionsFor(scope).find((e) => e.kind === "threshold" && e.audit === `categories:${category}`)?.value ??
  fallback;

const pageAssertions = (scope) => ({
  "categories:accessibility": ["error", { minScore: minScore(scope, "accessibility", 0.98) }],
  ...(withSeo && { "categories:seo": ["error", { minScore: minScore(scope, "seo", 1) }] }),
  ...requireAll(withSeo ? [...a11y, ...seo] : a11y, offAudits(scope)),
});

const notFoundAssertions = (scope) => ({
  "categories:accessibility": ["error", { minScore: minScore(scope, "accessibility", 1) }],
  ...requireAll(a11y, offAudits(scope)),
  // Informative: the 404 response itself always logs a console error.
  "categories:best-practices": ["warn", { minScore: 0.96 }],
});

const config = {
  ci: {
    assert: {
      assertMatrix: [
        ...PAGES.map((scope) => ({ matchingUrlPattern: scopes[scope].pattern, assertions: pageAssertions(scope) })),
        ...["notFoundPath", "notFoundSlug"].map((scope) => ({
          matchingUrlPattern: scopes[scope].pattern,
          assertions: notFoundAssertions(scope),
        })),
      ],
    },
  },
};

export default config;
