// Smoke test against a running server (next start). A green build does not
// prove pages render: data fetching and locale routing only run on request.
// Usage: node scripts/smoke-test.mjs [baseUrl]
const BASE_URL = process.argv[2] ?? "http://localhost:3000";
const READY_TIMEOUT_MS = 60_000;

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

let failures = 0;

async function expectStatus(path, expected) {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
  const ok = res.status === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} ${path} -> ${res.status} (expected ${expected})`);
  return res;
}

async function expectRedirect(path, pathnamePattern) {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
  const location = res.headers.get("location");
  // Location may be relative or absolute depending on the proxy.
  const target = location ? new URL(location, BASE_URL).pathname : null;
  const ok =
    res.status >= 300 && res.status < 400 && pathnamePattern.test(target ?? "");
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} ${path} -> ${res.status} ${location ?? "(no location)"} (expected 3xx to ${pathnamePattern})`);
}

await waitForServer();

// "/" has no page (src/app has no root layout): only the src/proxy.ts matcher
// redirects it, so dropping "/" from that matcher must fail here.
await expectRedirect("/", /^\/(es|en)\/?$/);

await expectStatus("/es", 200);
await expectStatus("/en", 200);
await expectStatus("/en/projects", 200);

const projectsRes = await expectStatus("/es/projects", 200);
const slug = (await projectsRes.text()).match(/href="\/es\/projects\/([^"/?#]+)"/)?.[1];
if (slug) {
  await expectStatus(`/es/projects/${slug}`, 200);
} else {
  failures++;
  console.log("FAIL no project link found in /es/projects");
}

// Regression for #8: an unknown locale used to return 500.
await expectStatus("/fr", 404);

if (failures > 0) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.log("All smoke checks passed");
