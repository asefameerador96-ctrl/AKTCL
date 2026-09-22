# Feature flags — parked segments

Some parts of the site are built, tested and kept in the code but are not live. Each one
is switched by a flag in `src/content/features.ts`:

```ts
export const FEATURES = { cigaretteSizes: false } as const;
```

## `cigaretteSizes` — the Cigarette Sizes segment

**State: off since 2026-09-22** (owner's change list, item 5: "keep it somewhere but not
live, because later on I might ask you to make it live again").

What the segment is: `/cigarette-sizes` (the formats index) and `/cigarette-sizes/<format>`
for King Size, 100s, Slim, Super Slim and Nano; the "Cigarette Sizes" link in the header
nav and the footer; the homepage "Cigarette Sizes" band.

What stays in the repo, unchanged, while it is off:

- `src/content/sizes.ts` — all copy and specifications (its data tests in
  `src/seo/routeMeta.test.ts` keep running, so it stays ready to go back on).
- `src/pages/SizesIndex.tsx`, `src/pages/SizePage.tsx`, `src/components/SizesBand.tsx`,
  `src/components/sizes/*`.
- The route metadata in `src/seo/routeMeta.ts` (titles, descriptions, breadcrumbs) and
  the two `<Route>`s in `src/App.tsx`, both inside `if (FEATURES.cigaretteSizes)` /
  `{FEATURES.cigaretteSizes && ( … )}`.

What the flag does while it is `false`:

- `src/seo/routeMeta.ts` adds no `/cigarette-sizes` route to `ROUTES`, so
  `scripts/prerender.mjs` (which takes its list from the running app) neither
  prerenders the pages nor writes them into `sitemap.xml` or `routes.json`.
- `src/App.tsx` registers no size route, so the URLs fall through to the 404 page. On
  Azure the missing prerendered file is answered with `404.html` and HTTP 404
  (`responseOverrides` in `public/staticwebapp.config.json`).
- The header nav, footer and homepage do not render their links or the band.
- `public/llms.txt` has no Cigarette Sizes section (the test that llms.txt links every
  route and nothing else would fail otherwise). The block is kept below, verbatim.

### Turning it back on

1. In `src/content/features.ts`, set `cigaretteSizes: true`.
2. Paste the block below back into `public/llms.txt`, between the "Finished Cigarettes"
   paragraph ("Specifications are available on request through the enquiry form.") and
   "## From Seed to Smoke — the integrated value chain". **Then correct its King Size
   line** to "The international standard format. AKTCL line: King Size Filter." —
   "Premium King Size" was deleted from the workbook on 2026-09-22, the same day the
   segment was parked, and `sizes.ts` now lists King Size Filter only. Check the other
   "AKTCL line" names against `src/content/products.ts` too, in case they have changed
   since.
3. Run `npm run check`, then `npm run build && npm run verify`. With the flag on,
   `routeMeta.test.ts` runs the size-route tests again (every format has a route, titles
   within 70 characters, descriptions lead with the tagline) and checks that llms.txt
   links all six pages.
4. Look at `/cigarette-sizes`, one format page, the nav, the footer and the homepage band
   at mobile and desktop widths, in light and dark, before merging.

### The `public/llms.txt` block, as it was when the segment was parked

Verbatim, as published until 2026-09-22 (correct the King Size line when pasting it
back — step 2 above).

```md
## Cigarette Sizes
Five cigarette formats, each run on dedicated lines to its own specification.
- Overview: https://www.aktcl.com/cigarette-sizes
- **King Size** (84 mm) — https://www.aktcl.com/cigarette-sizes/king-size
  The international standard format. AKTCL lines: Premium King Size, King Size Filter.
- **100s** (100 mm) — https://www.aktcl.com/cigarette-sizes/100s
  King Size girth, with added length.
- **Slim** (100–120 mm) — https://www.aktcl.com/cigarette-sizes/slim
  A narrower rod for modern pack formats.
- **Super Slim** (100 mm) — https://www.aktcl.com/cigarette-sizes/super-slim
  Premium positioning on a narrow rod. AKTCL line: Super Slim.
- **Nano** (84–100 mm) — https://www.aktcl.com/cigarette-sizes/nano
  The most compact format we make. AKTCL line: NANO.

Each size page lists the format's rod, packaging, dimension and container-load specifications. All five formats: 20 cigarettes per pack, 10 packs per outer, 50 outers (500 packs, 10,000 cigarettes) per master carton; 1,050 master cartons per 40′ high cube container and 450 per 20′ container; minimum order one full container load.
```

## Adding another flag

Add the key to `FEATURES` (default `false` for anything not yet live), gate its route
entries in `src/seo/routeMeta.ts` and its `<Route>`s in `src/App.tsx` the same way, hide
its links, keep its llms.txt block here, and add a section to this file.
