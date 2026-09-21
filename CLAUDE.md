# AKTCL export website — project brief

Export-facing B2B website for **Abul Khair Tobacco Company Ltd. (AKTCL)**, part of Abul Khair
Group, Bangladesh. Domain **aktcl.com**. Audience: overseas importers, distributors and brand
owners — never consumers. Primary goal: qualified export enquiries. Secondary: institutional
credibility.

Owner: Asef (product manager, AKTCL). He wants direct, honest assessments and results first.
Use the references and content he supplies; do not go researching other companies' sites
unasked.

## Sources of truth

1. **Content:** `D:\AKTCL Website\AKTCL Website Content` — one Excel workbook (all written
   copy) and 37 images. Audited in `docs/content-inventory.md`, which also holds the **gap
   list** of what AKTCL still has to supply.
   - Copy lives verbatim in `src/content/*.ts`. **Never invent** facts, figures, brand names,
     certifications, years, markets, spec values or contact details. Missing → leave `null` /
     empty, render nothing or an honest "on request" state, and add it to the gap list.
   - Images: `npm run images:import -- "<VISUAL Content folder>"` writes WebP masters to
     `src/assets`. Never commit the multi-MB originals or video masters.
2. **Top-line layout, stack, deployment:** Shah Agro — https://shahagro.com. Its real source is
   the repo **`asefameerador96-ctrl/jute-journeys`** (cloned read-only at
   `D:\AKTCL Website\_reference\jute-journeys`). `Shah-Agro-1st-draft` is an abandoned draft —
   ignore it. Port mechanics; never copy Shah Agro's copy, images, colours or font.
3. **Page content and components:** Orchid Cigarettes and Sopariwala — see
   `docs/reference-sites.md`. Orchid → hero CTAs + stats, spec-driven cards/tables, private
   label block, "Request a Quote" everywhere, contact always reachable. Sopariwala → leaf
   product grid → product page with a data card + "Enquire now", heritage timeline, 18+ gate.

Plan and sitemap: `docs/plan.md`. Deployment and DNS: `docs/deployment.md`. Enquiry API:
`docs/enquiry-api.md`.

## Stack

Vite + React 18 + TypeScript + Tailwind 3 + shadcn/ui subset + react-router 6, same as Shah
Agro. Client-rendered, then every route is prerendered with Playwright (`npm run build`) and
smoke-tested (`npm run verify`). The only server piece is `api/` — an Azure Static Web Apps
managed Function for the enquiry form.

Conventions that matter:

- **One route list:** `src/seo/routeMeta.ts` (derived from the content files) drives metadata,
  JSON-LD, breadcrumbs, prerendering, `sitemap.xml`. A new URL needs a `<Route>` in
  `src/App.tsx` too; `routeMeta.test.ts` checks they agree.
- **No hydration:** `src/main.tsx` clears the prerendered markup and renders fresh. Do not
  switch to `hydrateRoot` — scroll-animated snapshots cannot hydrate.
- **Prerender-safe:** real content must be in the DOM without interaction. Skip decorative
  or gating UI (age gate, floating button) when `window.__PRERENDER__` is set.
- **Tokens only:** colours via the Tailwind names backed by `src/index.css` variables
  (`bg-ink`, `text-accent`, `bg-tile`, …); fonts via `font-display` / `font-sans`. No colour
  literals in components. Light and dark must both work.
- **Images** only through `src/content/images.ts` + `<LazyImage>`.
- **Links** are real `<Link>`/`<a>`; enquiry CTAs, `mailto:`, `tel:` and WhatsApp links carry
  `data-lead="…"`.
- Accessibility: one `<h1>` per page, keyboard operable, reduced-motion respected.
  Performance: LCP < 2.5 s on 4G, no layout shift from media.

## Compliance — do not skip

Tobacco manufacturer. Bangladesh's tobacco control law and most destination markets restrict
advertising and promotion. Keep the site strictly B2B: legal-age gate on entry, health warning
and trade-only notice in the footer, no lifestyle or consumer-appeal messaging, no health
claims, no consumer sales, unbranded pack imagery. The gate, warning, Privacy Notice and Terms
are drafts until **AKTCL legal/regulatory signs off** — keep reminding Asef before launch.

## Hosting

Azure Static Web App `aktcl-web` (Free) in `rg-aktcl`, deployed by GitHub Actions from
`asefameerador96-ctrl/AKTCL` `main` (prebuilt `dist/` + `api/`, secret
`AZURE_STATIC_WEB_APPS_API_TOKEN`). DNS is an Azure DNS zone for `aktcl.com`; the domain is
registered at GoDaddy with nameservers pointed at Azure. Never commit secrets — application
settings live on the Static Web App; see `.env.example`.

## Working rules

- Branch from `main`, small commits, PRs for anything substantial.
- `npm run check` before committing; `npm run build && npm run verify` before pushing.
- Verify in a browser at mobile and desktop widths, light and dark, before calling a page done.
