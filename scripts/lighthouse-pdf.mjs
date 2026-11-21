// Builds a one-file PDF summary of the Lighthouse results for people who
// don't know Lighthouse. It prints an HTML page with the Chrome that
// Lighthouse already uses, so it needs no PDF library.
// Usage: node scripts/lighthouse-pdf.mjs [--in=dir] [--out=file.pdf]
//   --in   folder holding the summary.json of scripts/lighthouse.mjs.
//          Default: .lighthouseci
//   --out  default: <in>/lighthouse-report.pdf
// npm run report:lighthouse measures every group and calls this script; run
// it directly only to rebuild a PDF from existing results.
// Groups with no results are reported as "no disponible", never omitted.
// Text is Spanish on purpose: this is a dev tool, not site UI (no next-intl).

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getChromePath } from "chrome-launcher";
import { knownExceptions, scopes } from "../lighthouse/blocking.mjs";
import { groupDefinitions, OUTPUT_DIRS, REPO_ROOT } from "./lighthouse-groups.mjs";

const args = process.argv.slice(2);
const IN_DIR = path.resolve(args.find((a) => a.startsWith("--in="))?.slice(5) ?? path.join(REPO_ROOT, OUTPUT_DIRS.ci));
const OUT = path.resolve(args.find((a) => a.startsWith("--out="))?.slice(6) ?? path.join(IN_DIR, "lighthouse-report.pdf"));
// Validated before anything is written: OUT is deleted below.
if (path.extname(OUT).toLowerCase() !== ".pdf") throw new Error(`--out must be a .pdf file: ${OUT}`);

const CATEGORIES = {
  performance: { label: "Rendimiento", help: "Qué tan rápido carga y responde la página." },
  accessibility: { label: "Accesibilidad", help: "Si la página se puede usar con lector de pantalla, teclado, buen contraste, etc." },
  "best-practices": { label: "Buenas prácticas", help: "Seguridad, errores en consola y uso correcto de APIs del navegador." },
  seo: { label: "SEO", help: "Si los buscadores pueden indexar y entender la página." },
};
const CATEGORY_ORDER = Object.keys(CATEGORIES);

// Keys match what scripts/lighthouse.mjs extracts into row.metrics.
const METRICS = [
  ["fcp", "FCP", "First Contentful Paint: cuándo aparece el primer contenido."],
  ["lcp", "LCP", "Largest Contentful Paint: cuándo aparece el elemento principal."],
  ["tbt", "TBT", "Total Blocking Time: cuánto tiempo la página no responde a la interacción mientras carga."],
  ["cls", "CLS", "Cumulative Layout Shift: cuánto se mueve el contenido mientras carga."],
  ["si", "Speed Index", "Qué tan rápido se ve el contenido completo."],
];

const DESKTOP_NOTE =
  "Escritorio no mide Accesibilidad ni SEO: el DOM es el mismo que en móvil, así que esas notas salen de los grupos móviles.";

// --- Load -------------------------------------------------------------------

const sources = [];
const resultsByGroup = new Map();
const notes = [];
const summaryFile = path.join(IN_DIR, "summary.json");
if (existsSync(summaryFile)) {
  try {
    const summary = JSON.parse(readFileSync(summaryFile, "utf8"));
    sources.push({ file: path.relative(REPO_ROOT, summaryFile), meta: summary.meta ?? {} });
    for (const result of summary.results ?? []) resultsByGroup.set(result.group.name, result);
  } catch (err) {
    notes.push(`No se pudo leer ${path.relative(REPO_ROOT, summaryFile)}: ${err.message}`);
  }
}

// Group metadata comes from the definitions, so missing groups still show up.
const definitions = groupDefinitions();
const executedAnywhere = new Set(sources.flatMap((s) => s.meta.executedGroups ?? []));

// --- Formatting helpers ---------------------------------------------------

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// Lighthouse titles use Markdown backticks for code.
const md = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");

const band = (score) => (score >= 90 ? "pass" : score >= 50 ? "average" : "fail");
const SHAPE = { pass: "●", average: "■", fail: "▲" };

const fmtDate = (iso) =>
  iso
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }).format(new Date(iso)) +
      " UTC"
    : "desconocida";

const shortSha = (sha) => (sha ? sha.slice(0, 7) : "desconocido");

const isLocalhost = (url) => {
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname);
  } catch {
    return false;
  }
};

const isDesktop = (g) => g.settings.preset === "desktop";
const device = (g) => (isDesktop(g) ? "Escritorio" : "Móvil simulado");
const theme = (g) => (g.colorScheme === "dark" ? "tema oscuro" : "tema claro");
// Same matching LHCI does: the scope's URL pattern plus the group's theme.
const isKnownException = (def, pagePath, auditId) =>
  def.assert === "blocking.mjs" &&
  knownExceptions.some(
    (e) =>
      e.kind === "off" &&
      e.audit === auditId &&
      (!e.theme || e.theme === def.colorScheme) &&
      e.scopes.some((scope) => new RegExp(scopes[scope].pattern).test(pagePath)),
  );

const runsText = (g) => (g.runs > 1 ? `mediana de ${g.runs} corridas` : "1 corrida");

function groupStatus(name) {
  const r = resultsByGroup.get(name);
  if (!r) {
    const reason = executedAnywhere.has(name)
      ? "Se ejecutó pero su resultado no llegó."
      : !sources.length
        ? "No llegó ningún resultado."
        : "No se ejecutó en esta corrida (--only).";
    return { key: "missing", label: "No disponible", reason };
  }
  if (r.failed === "collect") return { key: "fail", label: "Falló la medición", reason: "Lighthouse no pudo medir las páginas." };
  if (r.failed === "assert") {
    const errors = (r.assertions ?? []).filter((a) => a.level === "error").length;
    return { key: "fail", label: "No pasa", reason: `${errors} comprobación(es) por debajo del mínimo.` };
  }
  const warns = (r.assertions ?? []).filter((a) => a.level === "warn").length;
  return warns
    ? { key: "warn", label: "Pasa con avisos", reason: `${warns} aviso(s): no bloquean.` }
    : { key: "pass", label: "Pasa", reason: "" };
}

// --- Sections ---------------------------------------------------------------

function header() {
  const metas = sources.map((s) => s.meta);
  const m = metas[0] ?? {};
  const baseUrls = [...new Set(metas.map((x) => x.baseUrl).filter(Boolean))];
  const local = baseUrls.length > 0 && baseUrls.every(isLocalhost);
  const env = [...resultsByGroup.values()].find((r) => r.environment)?.environment;
  const chrome = env?.userAgent?.match(/Chrome\/([\d.]+)/)?.[1];

  const commitText = m.commit
    ? `<code>${shortSha(m.commit)}</code>${m.dirty ? " con cambios sin commitear" : ""}`
    : "desconocido";

  // Missing when scripts/lighthouse.mjs ran on its own, as in CI.
  const BUILD_MODES = { fresh: "nuevo", reused: "reutilizado (<code>--no-build</code>)" };
  const buildText = BUILD_MODES[m.build?.mode]
    ? `${BUILD_MODES[m.build.mode]}, compilado el ${fmtDate(m.build.builtAt)}`
    : "desconocido";

  const where = local
    ? "Build de producción servido con <code>next start</code> en localhost."
    : `URL medida: ${baseUrls.map((u) => `<code>${esc(u)}</code>`).join(", ") || "desconocida"}. No es el build local servido con <code>next start</code>.`;

  return `
  <header>
    <h1>Informe de Lighthouse</h1>
    <dl class="meta">
      <dt>Medido</dt><dd>${fmtDate(m.measuredAt)}</dd>
      <dt>Commit</dt><dd>${commitText}</dd>
      <dt>Build</dt><dd>${buildText}</dd>
      <dt>Entorno</dt><dd>${where} Red y CPU con throttling ${env?.throttlingMethod === "simulate" ? "simulado" : esc(env?.throttlingMethod ?? "desconocido")} de Lighthouse. Cada grupo indica su dispositivo, tema y número de corridas.</dd>
      <dt>Versiones</dt><dd>Lighthouse ${esc(env?.lighthouseVersion ?? "?")}, Chrome ${esc(chrome ?? "?")}</dd>
      <dt>Generado</dt><dd>${fmtDate(new Date().toISOString())}</dd>
    </dl>
    <div class="callout">
      <strong>Estos números no son el score real del sitio.</strong>
      ${local ? "Se miden sobre un servidor local, sin la red, el CDN ni la latencia de producción. " : ""}En producción los scores pueden ser menores.
      Hay una discrepancia sin diagnosticar entre este informe y Lighthouse de DevTools sobre el sitio desplegado.
      Úsalo para detectar regresiones entre commits, no como medida del sitio publicado.
    </div>
  </header>`;
}

function legend() {
  return `
  <p class="legend">
    Escala de Lighthouse (0-100):
    <span class="score pass">${SHAPE.pass} 90-100 bien</span>
    <span class="score average">${SHAPE.average} 50-89 mejorable</span>
    <span class="score fail">${SHAPE.fail} 0-49 mal</span>
    <span class="score na">— no se mide en este grupo</span>
  </p>
  <p class="legend-text">Bajo cada nota, los audits de esa categoría que pesan en la nota: <strong>✓</strong> aprobados (90 o más, el mismo umbral que usa Lighthouse) y <strong>✗</strong> no aprobados; cada ✗ aparece en el detalle. Los diagnósticos sin peso, los manuales y los informativos no se cuentan. <strong>n/a</strong> son los audits que no aplican a esa página (Lighthouse les quita el peso). En los grupos de rendimiento, la segunda tabla muestra las métricas; su color es la nota que Lighthouse da a cada valor.</p>`;
}

const scoreCell = (score, text, extra = "") =>
  score == null
    ? `<td class="score na">${esc(text ?? "—")}</td>`
    : `<td class="score ${band(score)}">${SHAPE[band(score)]} ${esc(text ?? score)}${extra}</td>`;

const countsText = (n) => (n ? `<span class="counts">${n.passed} ✓ · ${n.failed} ✗ · ${n.notApplicable} n/a</span>` : "");

function metricsTable(rows) {
  const withMetrics = rows.filter((row) => row.metrics);
  if (!withMetrics.length) return "";
  const body = withMetrics
    .map(
      (row) =>
        `<tr><td class="path">${esc(row.path)}</td>${METRICS.map(([key]) => {
          const m = row.metrics[key];
          return scoreCell(m?.score == null ? null : Math.round(m.score * 100), m?.display);
        }).join("")}</tr>`,
    )
    .join("");
  return `
    <table class="metrics">
      <thead><tr><th>Página</th>${METRICS.map(([, label]) => `<th class="num">${label}</th>`).join("")}</tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

function groupTable(def) {
  const status = groupStatus(def.name);
  const r = resultsByGroup.get(def.name);
  const cats = CATEGORY_ORDER.filter((c) => def.settings.onlyCategories.includes(c));
  const caption = `${device(def)}, ${theme(def)}, ${runsText(def)}`;
  const head = `
    <div class="group-head">
      <h3>${esc(def.name)}</h3>
      <span class="status ${status.key}">${status.label}</span>
    </div>
    <p class="caption">${caption}.${status.reason ? ` ${esc(status.reason)}` : ""}${isDesktop(def) ? ` ${DESKTOP_NOTE}` : ""}</p>`;
  if (!r?.rows?.length) return `<section class="group">${head}</section>`;
  const rows = r.rows
    .map(
      (row) =>
        `<tr><td class="path">${esc(row.path)}</td>${cats
          .map((c) => scoreCell(row.scores[c], undefined, countsText(row.counts?.[c])))
          .join("")}</tr>`,
    )
    .join("");
  return `<section class="group">${head}
    <table>
      <thead><tr><th>Página</th>${cats.map((c) => `<th class="num">${CATEGORIES[c].label}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table>${metricsTable(r.rows)}</section>`;
}

function overview() {
  const blocking = definitions.filter((d) => d.assert === "blocking.mjs");
  const informative = definitions.filter((d) => d.assert !== "blocking.mjs");
  const missing = definitions.filter((d) => !resultsByGroup.has(d.name));
  return `
  <h2>Vista general</h2>
  ${legend()}
  ${missing.length ? `<p class="warning-line"><strong>Grupos no disponibles:</strong> ${missing.map((d) => esc(d.name)).join(", ")}. Este informe no los cubre.</p>` : ""}
  <div class="tier blocking">
    <h2 class="tier-title">Bloquea el PR</h2>
    <p class="tier-help">Son los grupos que corre el CI. Si alguna comprobación no llega a su mínimo, el check <code>lighthouse (blocking)</code> falla y el PR no debería mergearse.</p>
    ${blocking.map(groupTable).join("")}
  </div>
  <div class="tier informative">
    <h2 class="tier-title">Solo informa</h2>
    <p class="tier-help">Rendimiento y buenas prácticas varían entre corridas. Solo se miden en este informe local, no en el CI; sus mínimos generan avisos y nunca bloquean.</p>
    ${informative.map(groupTable).join("")}
  </div>`;
}

function details() {
  const blocks = definitions
    .filter((d) => resultsByGroup.get(d.name)?.rows?.length)
    .map((def) => {
      const r = resultsByGroup.get(def.name);
      const failedAssertions = (r.assertions ?? []).filter((a) => a.level === "error" || a.level === "warn");
      const perPage = r.rows
        .filter((row) => (row.audits ?? row.failing ?? []).length)
        .map((row) => {
          const audits = row.audits ?? row.failing.map((id) => ({ id }));
          return `<li><span class="path">${esc(row.path)}</span><ul>${audits
            .map(
              (a) =>
                `<li>${a.title ? md(a.title) : esc(a.id)}${a.displayValue ? ` <span class="value">(${esc(a.displayValue)})</span>` : ""} <span class="id">${esc(a.id)}</span>${isKnownException(def, row.path, a.id) ? ` <span class="known">excepción conocida</span>` : ""}</li>`,
            )
            .join("")}</ul></li>`;
        })
        .join("");
      const assertTable = failedAssertions.length
        ? `<table class="compact">
            <thead><tr><th>Nivel</th><th>Página</th><th>Comprobación</th><th class="num">Mínimo</th><th class="num">Obtenido</th></tr></thead>
            <tbody>${failedAssertions
              .map(
                (a) =>
                  `<tr><td>${a.level === "error" ? "Bloquea" : "Aviso"}</td><td class="path">${esc(a.path)}</td><td>${esc(a.audit)}</td><td class="num">${esc(a.expected)}</td><td class="num">${esc(a.actual)}</td></tr>`,
              )
              .join("")}</tbody></table>`
        : "";
      return `<section class="detail">
        <h3>${esc(def.name)} <span class="tier-tag">${def.assert === "blocking.mjs" ? "bloquea" : "informa"}</span></h3>
        ${assertTable}
        ${perPage ? `<ul class="audits">${perPage}</ul>` : `<p class="caption">Todas las páginas tienen todos los audits en 100.</p>`}
      </section>`;
    })
    .join("");
  return `
  <h2 class="page-break">Detalle: qué falta para 100</h2>
  <p>Por página, los audits que pesan en la nota y no puntúan al máximo, con el nombre que les da Lighthouse y su id técnico. Incluye audits entre 90 y 99, que la vista general cuenta como aprobados. En Rendimiento, una métrica por debajo de 100 no es un error: indica margen de mejora. Las comprobaciones de la tabla son las que no llegaron a su mínimo configurado. Lo marcado como <span class="known">excepción conocida</span> está apagado a propósito y no bloquea (ver la sección final).</p>
  ${blocks || "<p>No hay resultados disponibles.</p>"}`;
}

function exceptions() {
  const rows = knownExceptions
    .map((e) => {
      const pages = e.scopes.map((s) => scopes[s]?.label ?? s).join("; ");
      const what =
        e.kind === "off"
          ? `Audit <code>${esc(e.audit)}</code> apagado`
          : `${CATEGORIES[e.audit.replace("categories:", "")]?.label ?? esc(e.audit)}: mínimo rebajado a ${Math.round(e.value * 100)}`;
      return `<tr><td>${what}</td><td>${esc(pages)}${e.theme ? ` (solo ${e.theme === "dark" ? "tema oscuro" : "tema claro"})` : ""}</td><td>${esc(e.reason)}</td></tr>`;
    })
    .join("");
  return `
  <h2>Excepciones conocidas</h2>
  <p>Lo que la configuración bloqueante (<code>lighthouse/blocking.mjs</code>) apaga o relaja a propósito. Fuera de esta lista, toda página exige 100 en cada audit de Accesibilidad y SEO, y al menos 98 en la categoría Accesibilidad.</p>
  <table class="compact exceptions">
    <thead><tr><th>Qué</th><th>Dónde</th><th>Por qué</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function howToRead() {
  return `
  <h2>Cómo leer este informe</h2>
  <p>Lighthouse es la herramienta de Google que audita una página y da una nota de 0 a 100 por categoría:</p>
  <ul>${CATEGORY_ORDER.map((c) => `<li><strong>${CATEGORIES[c].label}:</strong> ${CATEGORIES[c].help}</li>`).join("")}</ul>
  <p>Cada categoría se calcula a partir de varios <em>audits</em> (comprobaciones concretas). "Móvil simulado" significa que Lighthouse emula un teléfono de gama media con una red lenta, lo que suele dar notas más bajas que escritorio. ${DESKTOP_NOTE}</p>
  <p>La nota de Rendimiento sale de estas métricas:</p>
  <ul>${METRICS.map(([, label, help]) => `<li><strong>${label}:</strong> ${help}</li>`).join("")}</ul>
  ${sources.length ? `<p class="caption">Datos leídos de: ${sources.map((s) => `<code>${esc(s.file)}</code>`).join(", ")}.</p>` : ""}
  ${notes.length ? `<p class="caption">${notes.map(esc).join("<br>")}</p>` : ""}`;
}

const CSS = `
  @page { size: A4; margin: 14mm 13mm; }
  :root { --pass: #0a7a3d; --pass-bg: #e3f6ea; --average: #a35200; --average-bg: #fff1dc; --fail: #c4161c; --fail-bg: #fde6e6; --muted: #5b6270; --line: #d9dde3; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", "Helvetica Neue", Arial, "DejaVu Sans", sans-serif; color: #1c2128; font-size: 10.5pt; line-height: 1.4; margin: 0; background: #fff; }
  h1 { font-size: 20pt; margin: 0 0 8px; }
  h2 { font-size: 14pt; margin: 18px 0 8px; }
  h3 { font-size: 11pt; margin: 0; }
  code { font-family: Consolas, "DejaVu Sans Mono", monospace; font-size: 0.92em; background: #f1f3f5; padding: 0 3px; border-radius: 3px; }
  .meta { display: grid; grid-template-columns: max-content 1fr; gap: 3px 12px; margin: 0 0 10px; }
  .meta dt { font-weight: 600; color: var(--muted); }
  .meta dd { margin: 0; }
  .callout { border-left: 4px solid var(--average); background: var(--average-bg); padding: 8px 12px; border-radius: 4px; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; color: var(--muted); }
  .legend-text { color: var(--muted); font-size: 9.5pt; }
  .warning-line { background: var(--fail-bg); color: var(--fail); padding: 6px 10px; border-radius: 4px; }
  .tier { border: 1px solid var(--line); border-radius: 6px; padding: 10px 12px 2px; margin: 12px 0; }
  .tier.blocking { border-top: 5px solid #1c2128; }
  .tier.informative { border-top: 5px solid #9aa3ad; break-before: page; }
  .tier-title { margin: 0 0 2px; font-size: 13pt; }
  .tier-help { margin: 0 0 8px; color: var(--muted); }
  /* Groups with a metrics table are too tall to keep whole; keep each table
     whole instead, and never strand a heading at the bottom of a page. */
  .group { margin: 0 0 12px; }
  .group table { break-inside: avoid; }
  .group-head, .group .caption { break-after: avoid; }
  .group-head { display: flex; align-items: center; gap: 8px; }
  .caption { color: var(--muted); margin: 2px 0 6px; font-size: 9.5pt; }
  .status { font-size: 9pt; font-weight: 600; padding: 1px 8px; border-radius: 10px; border: 1px solid currentColor; }
  .status.pass { color: var(--pass); background: var(--pass-bg); }
  .status.warn { color: var(--average); background: var(--average-bg); }
  .status.fail { color: var(--fail); background: var(--fail-bg); }
  .status.missing { color: var(--muted); background: #f1f3f5; border-style: dashed; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  th, td { border-bottom: 1px solid var(--line); padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: #f6f7f9; font-weight: 600; }
  tr { break-inside: avoid; }
  .num { text-align: right; }
  td.path, span.path { font-family: Consolas, "DejaVu Sans Mono", monospace; font-size: 9pt; }
  .score { text-align: right; font-weight: 600; white-space: nowrap; }
  .score.pass { color: var(--pass); background: var(--pass-bg); }
  .score.average { color: var(--average); background: var(--average-bg); }
  .score.fail { color: var(--fail); background: var(--fail-bg); }
  .score.na { color: var(--muted); font-weight: 400; }
  .counts { display: block; font-size: 7.5pt; font-weight: 400; color: var(--muted); }
  table.metrics { margin-top: 6px; }
  .legend .score { padding: 1px 6px; border-radius: 3px; }
  .page-break { break-before: page; }
  .detail { margin: 0 0 14px; }
  .detail h3 { margin-bottom: 4px; }
  .tier-tag { font-size: 8.5pt; font-weight: 400; color: var(--muted); border: 1px solid var(--line); border-radius: 8px; padding: 0 6px; }
  .audits { padding-left: 16px; margin: 6px 0; }
  .audits > li { margin-bottom: 4px; break-inside: avoid; }
  .audits ul { padding-left: 16px; margin: 2px 0; }
  .id { font-family: Consolas, "DejaVu Sans Mono", monospace; font-size: 8pt; color: var(--muted); }
  .value { color: var(--muted); }
  table.compact { margin: 4px 0 8px; }
  table.compact code { white-space: nowrap; }
  table.exceptions td:first-child { width: 30%; }
  .known { font-size: 8pt; color: #3d4a5c; background: #e8edf3; border-radius: 8px; padding: 0 6px; white-space: nowrap; }
`;

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Informe de Lighthouse</title><style>${CSS}</style></head>
<body>${header()}${overview()}${details()}${exceptions()}${howToRead()}</body></html>`;

// --- Print ------------------------------------------------------------------

mkdirSync(path.dirname(OUT), { recursive: true });
// Removed first so the existence check below proves this run wrote it.
rmSync(OUT, { force: true });
const tmp = mkdtempSync(path.join(os.tmpdir(), "lh-pdf-"));
try {
  const htmlFile = path.join(tmp, "report.html");
  writeFileSync(htmlFile, html);
  // Own profile dir: otherwise Chrome may hand the job to a running instance.
  const res = spawnSync(
    // Same chrome-launcher major as lighthouse, so it finds the Chrome that
    // audited the pages; honors CHROME_PATH.
    getChromePath(),
    [
      "--headless",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${path.join(tmp, "profile")}`,
      "--no-pdf-header-footer",
      `--print-to-pdf=${OUT}`,
      pathToFileURL(htmlFile).href,
    ],
    { encoding: "utf8", timeout: 60_000 },
  );
  if (res.status !== 0 || !existsSync(OUT)) {
    throw new Error(`Chrome failed to print the PDF (status ${res.status}): ${res.stderr || res.error}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const missing = definitions.filter((d) => !resultsByGroup.has(d.name)).map((d) => d.name);
console.log(`PDF: ${OUT}`);
if (missing.length) console.log(`Groups not available: ${missing.join(", ")}`);
