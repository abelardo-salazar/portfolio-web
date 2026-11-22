# CLAUDE.md

Guide for working in this repo. The general context (stack, installation, environment variables) is in `README.md`.

## Workflow

- Branches from `main`, with a prefix from this closed list: `feat/`, `fix/`, `docs/`, `chore/`. Never commit or push directly to `main`.
- Every change goes in through a PR, with **Squash & Merge**.
- Commit messages and PR titles follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`...).
- Don't deploy. Deploys aren't done from here.
- Nothing is merged without CI (`verify`) green.
- **A green build doesn't prove the pages work.** Sanity fetching, locale routing and the `notFound()` calls run on every request. Before considering a change done: `npm run build`, `npm run start` and request the affected pages (or run the smoke test).
- Code comments: minimal, explaining the why and not the what.
- Language: code, comments and docs in English; user-facing text in both locales (next-intl). Exception: the Lighthouse PDF report is in Spanish on purpose, since it's a development tool.

## Commands

```bash
npm ci                          # install
npm run dev                     # development
npm run lint                    # eslint
npx tsc --noEmit                # typecheck
npm run build                   # production build
npm run start                   # serves the build (port 3000)
node scripts/smoke-test.mjs     # smoke test against an already running server (default http://localhost:3000)
npm audit --audit-level=critical # critical threshold: see issue #39. In CI it runs weekly in audit.yml
npm run sync                    # syncs content/ to Sanity
npm run lighthouse -- <url> --only=<groups> # Lighthouse against an already running server (reports in .lighthouseci/)
npm run report:lighthouse       # full PDF report, local only (see below)
```

CI (`.github/workflows/ci.yml`) runs exactly this sequence: `npm ci` → lint → tsc → build → `next start` + smoke test. `npm audit` is not part of the required check: it runs every week on `main` in `.github/workflows/audit.yml` (also by hand), warns and doesn't block; a new advisory against a dependency that didn't change must not fail an unrelated PR. Dependabot (`.github/dependabot.yml`) only proposes security updates.

`.github/workflows/lighthouse.yml` runs a single job in parallel with `verify`, `lighthouse (blocking)`: only the `blocking-*` and `notfound-mobile` groups (a11y, SEO and best practices of the 404). Page performance and best practices (`informative-*`) don't run in CI: they're measured with `npm run report:lighthouse`, which always builds (`-- --no-build` reuses the existing `.next`), starts `next start` on a free port, runs every group and leaves the PDF at `.lighthouse-report/lighthouse-report.pdf`. Only the last report is kept, and it's replaced only when the run completes. The groups are in `scripts/lighthouse-groups.mjs`.

## Relevant structure

- `src/app` has no root layout: each tree (`[locale]`, `studio`) has its own layout with `<html>`. Don't add standalone pages in `src/app`, because since Next 16.4 the build fails without a root layout. `/` is redirected by `src/proxy.ts` (next-intl), not by a page.
- The valid locales come from `src/i18n/routing.ts`.

## Consuming the design system (`@abelardo-salazar/core-ui-design-system`)

- Don't adjust heights with `className`. Use the component's `size` and `shape` props.
- The text the components expose (`xxxLabel` props) comes from next-intl, never hardcoded.
- The DS locales from `/locale` are only passed inside a client component, never as a prop from a Server Component.
- For touch filters over small, fixed sets use `Chip size="lg"`, not `Badge`. For tags that grow with the catalog (like the project tags), use `Combobox` with `multiple`.
