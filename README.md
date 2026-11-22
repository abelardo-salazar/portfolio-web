# Portfolio Web

Abelardo Salazar's personal portfolio. Next.js 16 (App Router, Server Components), i18n (es/en) with `next-intl`, content managed in Sanity CMS through a "content-as-code" workflow (`content/`), and a UI built on the `@abelardo-salazar/core-ui-design-system` design system.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **next-intl** — i18n, `es`/`en` locales
- **Sanity CMS** (`sanity`, `next-sanity`, `@sanity/client`) — Studio embedded at `/studio`
- **@abelardo-salazar/core-ui-design-system** — public package on npm
- **Resend** — sends the contact form
- **Tailwind CSS** — app styling
- **styled-components** — for Sanity Studio only; see [why it is a direct dependency](#styled-components-why-it-is-a-direct-dependency)
- **react-hook-form + zod** — contact form; the same zod schema validates on the client and the server

## Prerequisites

- Node.js 22.19 or later (required by `lighthouse` and `@lhci/cli`, which the Lighthouse scripts use)

## Installation

1. Clone the repo.
2. Install dependencies:

   ```bash
   npm install
   ```

   > `.npmrc` includes `legacy-peer-deps=true`. It's needed because Sanity's `peerDependencies` tree (`sanity`, `next-sanity`, `@sanity/ui`, `@sanity/vision`, `@sanity/visual-editing`) doesn't resolve cleanly with npm 7+'s strict resolver as it's versioned today — without this flag, `npm install` fails with `ERESOLVE`.

## Environment variables

Variables expected in `.env.local` (not versioned):

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (app client and Studio) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset to query |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Optional. Default API version for the Studio's Vision tool; if missing, it uses the one in `src/sanity/env.ts`. The app client doesn't read it |
| `SANITY_WRITE_TOKEN` | Token with write permission, used by `npm run sync` to sync `content/` to Sanity |
| `SANITY_REVALIDATE_SECRET` | Secret shared with the Sanity webhook; validates the signature at `/api/revalidate` |
| `RESEND_API_KEY` | Resend API key for sending the contact form |
| `CONTACT_EMAIL` | Address that receives the contact form messages. Only read on the server; if missing, the form returns a generic error and the server logs the cause |

## Scripts

```bash
npm run dev               # development server
npm run build             # production build
npm run start             # serves the production build
npm run lint              # eslint
npm run sync              # syncs content/ (Markdown/YAML) to the Sanity dataset
npm run lighthouse        # Lighthouse CI against an already running server (default http://localhost:3000)
npm run report:lighthouse # full Lighthouse PDF report
npm run lighthouse:pdf    # builds a PDF from results already measured (by default, those in .lighthouseci/)
```

`report:lighthouse` builds by default (`npm run report:lighthouse -- --no-build` reuses the existing `.next`), serves the build with `next start` on a free port, measures every group and writes the report to `.lighthouse-report/`. Only the last report is kept, and it's replaced only when the run completes. `lighthouse:pdf` is the internal step that generates that PDF; you only need to run it by hand to rebuild a PDF without measuring again.

## `styled-components`: why it is a direct dependency

`styled-components` is in `dependencies` even though the app does **not** use CSS-in-JS — all of the app's styling goes through Tailwind and the design system. It's a **required peer dependency** of the Sanity Studio stack embedded at `/studio`: `next-sanity`, `sanity`, `@sanity/ui`, `@sanity/vision` and `@sanity/visual-editing` need it to render the Studio UI. Without declaring it explicitly, `npm install` would resolve it only as a transitive dependency — which, combined with `legacy-peer-deps=true` (see above), can leave it at a version the resolver picked for convenience rather than one the team controls. It's pinned explicitly in `package.json` to have direct version control over something `/studio` depends on at runtime.
