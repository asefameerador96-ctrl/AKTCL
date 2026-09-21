# Build plan — aktcl.com

One page. Read with `docs/content-inventory.md` (what we have, what is missing) and
`docs/reference-sites.md` (Orchid and Sopariwala research).

## Who decides what

| Reference | Decides |
| --- | --- |
| **Shah Agro** (`jute-journeys` repo — the live shahagro.com source) | Stack, top-line layout, scroll mechanics, deployment |
| **Orchid Cigarettes** | Conversion: hero with CTAs + stats, format cards with spec rows, private-label block, "Request a Quote" on every page, always-reachable contact |
| **Sopariwala** | Proof/catalogue: leaf product grid → product page with data card + "Enquire now", heritage timeline, 18+ entry gate |
| **The Excel** | Every word of company and product copy |

## Stack (same as Shah Agro)

Vite + React 18 + TypeScript + Tailwind 3 + shadcn/ui subset + react-router. Client-rendered,
then every route is prerendered to static HTML by headless Chromium (`scripts/prerender.mjs`)
and smoke-tested (`scripts/verify-build.mjs`). Hosted on Azure Static Web Apps (Free) with a
managed Function for the enquiry form. Fonts self-hosted (Instrument Serif + Plus Jakarta Sans + JetBrains Mono).

Differences from the reference, on purpose: content is data-driven (`src/content/*.ts`)
instead of hard-coded per component; routes/SEO/sitemap come from one list
(`src/seo/routeMeta.ts`); navigation uses real links; colours and fonts are tokens;
TypeScript and ESLint run in CI; unknown URLs return a real 404.

## Sitemap → Shah Agro layout mapping

| URL | Built from | Layout source |
| --- | --- | --- |
| `/` | Hero (h1 + CTAs + stats) → Who We Are → Product showcase → Facts → **Our Journey sticky scroll (7 stages)** → Private label band → Gallery → Request-a-Quote band → Footer → AKTCL wordmark | Shah Agro homepage order; Orchid hero/stats/services/CTA blocks |
| `/journey`, `/journey/<stage>` ×7 | Excel rows 3–9 | Shah Agro `DetailPage` (carousel + text), plus prev/next and "0N / 07" |
| `/products` | Excel row 10 + both categories | Sopariwala category listing |
| `/products/leaf-tobacco` + 8 product pages | Excel rows 11–20 | Sopariwala grid → data card page; Orchid spec table |
| `/products/finished-cigarettes` | Excel rows 21–27 | Orchid format cards (no detail pages until copy/pack shots exist) |
| `/about-us` | Excel row 28 | Sopariwala proof layer: facts, heritage timeline, facility imagery |
| `/contact` | — | Orchid/Sopariwala short enquiry form |
| `/privacy`, `/terms`, 404 | — | — |

Dropped from the proposed sitemap because the Excel has no content for them: Global
Exports/regions (and the world map), Sustainability/CSR, News/Media, leadership,
certifications. They are on the gap list and the structure leaves room for them.

## Compliance

B2B only. Legal-age gate on entry (kept out of the prerendered HTML so crawlers see
content; for a visitor who has not confirmed, an inline script in `index.html` keeps that
HTML unpainted until the gate is up), health warning and trade-only notice in the footer, no lifestyle or
consumer-appeal language, no consumer sales, plain unbranded pack imagery. Legal must sign
off before launch.

## Deployment

GitHub `asefameerador96-ctrl/AKTCL` → Actions (`check` → `build` → `verify` → deploy) →
Azure Static Web App `aktcl-web` in `rg-aktcl`. DNS: Azure DNS zone `aktcl.com`. See
`docs/deployment.md`.

## Status

- [x] Content audit, asset pipeline, content data files
- [x] Design tokens, routing, SEO manifest
- [x] Azure resource group, Static Web App, DNS zone, deploy secret
- [x] Pages and components
- [x] Build pipeline: prerender, `npm run verify` release gate, deploy workflow, CSP
- [x] Automated browser pass (every route at 360 / 768 / 1280 / 1920 px: no overflow, no
      console errors, nothing left unrevealed; age gate; blocked storage) and screenshot
      review of the main templates in light and dark
- [ ] Owner's own review on a real phone and desktop, light/dark
- [ ] First deploy; bind `www.aktcl.com` + apex after the nameserver change
- [ ] Owner inputs: see gap list
