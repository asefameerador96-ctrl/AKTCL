# aktcl.com

Export-facing B2B website for **Abul Khair Tobacco Co. Ltd. (AKTCL)**, part of Abul Khair
Group, Bangladesh — <https://www.aktcl.com>. The audience is overseas importers, distributors
and brand owners; the goal is qualified trade enquiries. It is not a consumer site: there is a
legal-age gate on entry, a health warning and trade-only notice on every page, and nothing is
sold here.

`CLAUDE.md` is the project brief (sources of truth, conventions, compliance rules). Read it
before changing anything.

## Stack

Vite · React 18 · TypeScript · Tailwind CSS 3 · a small shadcn/ui subset · react-router 6.
Fonts (Instrument Serif, Plus Jakarta Sans, JetBrains Mono) are self-hosted. The app is client-rendered; the build then opens every
route in headless Chromium (Playwright) and writes static HTML for it, so crawlers and link
previews get real pages. The only server code is `api/` — an Azure Static Web Apps managed
Function that receives the enquiry form.

```
src/content/     all copy, facts and the image manifest   <- edit content here
src/seo/         routeMeta.ts: the one list of URLs (metadata, breadcrumbs, JSON-LD, sitemap)
src/pages/       one file per route; src/App.tsx maps URLs to them
src/components/  sections and shared chrome; ui/ is the shadcn subset
src/index.css    design tokens (light and dark)
scripts/         image import, OG image, prerender, release checks
api/             enquiry Function (own package.json and tests)
public/          favicon, og-image.jpg, llms.txt, staticwebapp.config.json
docs/            plan, content inventory and gap list, deployment, enquiry API
```

## Getting started

Node 22 (20 works).

```bash
npm ci
npx playwright install chromium   # once; the build needs it to prerender
npm run dev                       # http://localhost:8080
```

## Content workflow

All company and product copy is verbatim from AKTCL's content workbook and lives in
`src/content/*.ts` (`site.ts`, `about.ts`, `journey.ts`, `products.ts`). To change wording, add
a product or a journey stage, fill in contact details or product specifications, edit those
files — pages, navigation, metadata, breadcrumbs, the sitemap and the enquiry form's product
list all follow. Never add a fact, figure, certification or contact detail AKTCL has not
supplied: leave the field empty and it simply is not rendered. What is still missing is listed
in `docs/content-inventory.md`.

Photography:

```bash
npm run images:import -- "D:\AKTCL Website\AKTCL Website Content\VISUAL Content"
```

writes optimised WebP masters into `src/assets/` (the multi-MB originals stay out of git).
Register each image, with its alt text and crop position, in `src/content/images.ts`; the
responsive AVIF/WebP sizes are generated at build time. Components only ever use images through
that file and `<LazyImage>`.

A new URL needs two things: an entry in `src/seo/routeMeta.ts` and a `<Route>` in
`src/App.tsx`. `npm test` fails if the two disagree, or if `public/llms.txt` falls out of step.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 8080 |
| `npm run check` | `typecheck` + `lint` + `test` — run before committing |
| `npm run build` | `vite build`, then `scripts/prerender.mjs`: static HTML for every route, `404.html`, `sitemap.xml`, `robots.txt`, `routes.json`, and the inline-script hash in the Content-Security-Policy. The first build encodes about 220 image variants and takes several minutes; later builds reuse `node_modules/.cache/imagetools` |
| `npm run verify` | `scripts/verify-build.mjs`: checks the built HTML (titles, canonicals, descriptions, JSON-LD, one `<h1>`, no placeholder text) and loads every page in Chromium at 360px and 1280px, with and without the age gate (console errors, overflow, images, the gate itself). Run after `build`, before pushing |
| `npm run build:nopre` / `npm run preview` | Plain Vite build / preview, without prerendering |
| `npm run images:import -- "<folder>"` | Import content photography (above) |
| `npm run og-image` | Regenerate `public/og-image.jpg`, the 1200×630 link-preview card |
| `npm run brand-assets` | Rebuild favicon, app icons, `logo.png`/`logo.svg` and the manifest from the AKT logo vector (`scripts/lib/brand.mjs`) |
| `cd api && npm test` | Enquiry API tests |

## Deployment

Hosted on **Azure Static Web Apps** (`aktcl-web`, Free tier, resource group `rg-aktcl`); DNS is
an Azure DNS zone for `aktcl.com`.

A push to `main` runs `.github/workflows/azure-static-web-apps.yml`: `npm ci` → `npm run
check` → API tests → `npm run build` → `npm run verify` → upload of the prebuilt `dist/` plus
`api/`. Any failing step stops the deploy. Pull requests get a staging URL that is removed when
the PR closes.

- Repository secret: **`AZURE_STATIC_WEB_APPS_API_TOKEN`** (the Static Web App's deployment
  token).
- The website needs no environment variables. The enquiry API's settings (storage connection
  string, SMTP) are **application settings on the Static Web App**, never files in git — see
  `.env.example`.
- Routing, the 404 page, caching and security headers (including the Content-Security-Policy)
  are in `public/staticwebapp.config.json`. There is deliberately no SPA fallback: every real
  URL has its own prerendered file, so an unknown URL returns a genuine 404.

## Documentation

| File | Contents |
| --- | --- |
| `CLAUDE.md` | Project brief: sources of truth, conventions, compliance |
| `docs/plan.md` | Build plan and sitemap |
| `docs/content-inventory.md` | What AKTCL supplied, and the gap list of what is still needed |
| `docs/reference-sites.md` | The layout and content references the owner chose |
| `docs/deployment.md` | Azure resources, DNS, custom domains, token rotation, analytics |
| `docs/enquiry-api.md` | The enquiry Function: settings, sinks, spam controls, local testing |

## Before launch

The age gate, health warning, trade-only notice, Privacy Notice and Terms of Use are drafts
until AKTCL legal/regulatory signs them off. The typographic logo and favicon are stand-ins
until the official artwork arrives. Contact details and product specifications are empty until
AKTCL supplies them (`src/content/site.ts`, `src/content/products.ts`).
