// Derives the URLs Lighthouse audits from the running build, so a new project
// is audited without touching any config. Slugs come from the links the
// public listing actually renders, the same source smoke-test.mjs uses.
// Usage: node scripts/lighthouse-urls.mjs [baseUrl]  (prints the URL groups)

import { pathToFileURL } from "node:url";

// Keep in sync with src/i18n/routing.ts. Hardcoded rather than imported
// because this runs as plain Node, without the TS/path-alias toolchain.
const LOCALES = ["es", "en"];
// Path segment for the 404 probes; lighthouse/blocking.mjs matches on it.
const NOT_FOUND_MARKER = "lighthouse-404";

async function getSlugs(baseUrl, locale) {
  const res = await fetch(`${baseUrl}/${locale}/projects`);
  if (!res.ok) throw new Error(`/${locale}/projects -> ${res.status}`);
  const html = await res.text();
  const pattern = new RegExp(`href="/${locale}/projects/([^"/?#]+)"`, "g");
  // Document order matches the listing (projectsQuery: startDate desc).
  return [...new Set([...html.matchAll(pattern)].map((m) => m[1]))];
}

export async function getLighthouseUrls(baseUrl) {
  const slugsByLocale = Object.fromEntries(
    await Promise.all(LOCALES.map(async (l) => [l, await getSlugs(baseUrl, l)])),
  );

  // Fail loudly instead of silently auditing fewer pages, e.g. if the listing
  // ever paginates or stops rendering its links on the server.
  const [first, ...rest] = LOCALES;
  const reference = [...slugsByLocale[first]].sort().join(",");
  if (!reference) throw new Error(`No project links found in /${first}/projects`);
  for (const l of rest) {
    if ([...slugsByLocale[l]].sort().join(",") !== reference) {
      throw new Error(`Project slugs differ between /${first} and /${l}`);
    }
  }

  const slugs = slugsByLocale[first];
  if (slugs.includes(NOT_FOUND_MARKER)) {
    throw new Error(`A project slug collides with the 404 probe "${NOT_FOUND_MARKER}"`);
  }
  // Most recent project; picked by position so nothing is hardcoded.
  const representative = slugs[0];
  const url = (path) => `${baseUrl}${path}`;

  return {
    slugs,
    representative,
    blocking: LOCALES.flatMap((l) => [
      url(`/${l}`),
      url(`/${l}/projects`),
      ...slugs.map((s) => url(`/${l}/projects/${s}`)),
    ]),
    // Two different 404s: an unknown path falls through to the global
    // src/app/not-found.tsx, an unknown slug to the localized one.
    notFound: LOCALES.flatMap((l) => [
      url(`/${l}/${NOT_FOUND_MARKER}`),
      url(`/${l}/projects/${NOT_FOUND_MARKER}`),
    ]),
    informative: LOCALES.flatMap((l) => [
      url(`/${l}`),
      url(`/${l}/projects`),
      url(`/${l}/projects/${representative}`),
    ]),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const baseUrl = process.argv[2] ?? "http://localhost:3000";
  console.log(JSON.stringify(await getLighthouseUrls(baseUrl), null, 2));
}
