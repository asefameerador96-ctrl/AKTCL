# Content inventory and gap list

Audit of `D:\AKTCL Website\AKTCL Website Content` on 2026-09-21: one workbook
(`AKTCL - SITE CONTENTS, Plan, Written Content.xlsx`, a single sheet, then rows 1–28) and
37 JPEGs in `VISUAL Content`. No logo, video, PDF or brand guideline was supplied, and
`AKTCL Website Design` is empty.

**Workbook updated by AKTCL on 2026-09-22** (now rows 1–27). Compared cell by cell with
the 2026-09-21 copy, three changes and nothing else:

1. **Row 22 "Premium King Size" deleted** (C22 "Premium King Size", D22 "Premium
   king-size cigarettes crafted for refined quality and consistency."). Every row below
   moved up one: the finished cigarettes are now rows 22–26 (King Size Filter, Super
   Slim, NANO, Private Label Manufacturing, AKT Signature Collection) and About Us is
   C27. The product is gone from the site, the enquiry form's product list and
   `llms.txt`; the King Size format's "AKTCL lines" in `sizes.ts` list King Size Filter
   only.
2. **F26 — a long description for "AKT Signature Collection"**, two paragraphs, published
   verbatim (its curly apostrophe and the capitalised "ABUL KHAIR TOBACCO" as written).
   With it the collection gets its own page,
   `/products/finished-cigarettes/akt-signature-collection`. The copy:

   > Our flagship premium cigarette portfolio represents ABUL KHAIR TOBACCO’s highest
   > standards of manufacturing excellence, product quality, and innovation. As the
   > largest local tobacco player in Bangladesh, we have developed a strong portfolio of
   > well-established brands with a significant presence across diverse segments of the
   > domestic market.
   >
   > These brands are backed by our extensive manufacturing capabilities, stringent
   > quality standards, carefully selected tobacco blends, and deep understanding of
   > local consumer preferences. With strong market recognition and broad market reach,
   > our premium portfolio caters to multiple local markets and consumer segments across
   > Bangladesh, reflecting the strength and scale of ABUL KHAIR TOBACCO as a leading
   > local tobacco manufacturer.

   **Legal to review** — see the compliance note under the gap list.
3. **E26 names an image, "AKT BRANDS_SITE.png"**, the first entry in column E. The file
   is not in the content folder (gap 6a).
   **Partly supplied 2026-09-23:** six brand marks (ARIS, AVON, Black Diamond, MARISE, MAXIM, SUPREME) arrived in `VISUAL Content/10. AKT Signature Collection` and are now the page's brand grid. "AKT BRANDS_SITE.png" itself is still missing, so the page's own picture is still the plain king-size pack shot.

The workbook is the source of truth for wording. Its copy lives verbatim in
`src/content/*.ts`; each string there notes the cell it came from.

## 1. Workbook → pages

Columns: A Stage · B Phase · C Catchy Title · D Short Description · E VISUAL (empty but
for E26) · F Long Description · G VISUAL (empty).

| Rows | Section | Feeds | Content file |
| --- | --- | --- | --- |
| 2 | HERO — "FROM SEED TO SMOKE", tagline, value-chain paragraph | Home hero (h1), home "Who We Are", `/journey` intro. The tagline (D2) is no longer shown in the hero (owner, 2026-09-22) | `site.ts` → `hero` |
| 3–9 | PROCESS — Seed, Harvest, Cure, Buying, Process, Manufacture, Smoke | Home sticky "Our Journey" section, `/journey`, `/journey/<stage>` ×7 | `journey.ts` |
| 10 | PRODUCT intro | Home product showcase, `/products` | `products.ts` → `productsIntro` |
| 11–20 | Category 01 Leaf Tobacco + 8 products | `/products/leaf-tobacco` and 8 product pages | `products.ts` |
| 21–26 | Category 02 Finished Cigarettes + 5 entries (rows 22–26) | `/products/finished-cigarettes` (cards; AKT Signature Collection also has its own page), home private-label band, line names on the parked `/cigarette-sizes/<format>` | `products.ts` (names read by `sizes.ts`) |
| 27 | ABOUT US (3 paragraphs) | `/about-us`, facts strip, heritage timeline, Organization JSON-LD | `about.ts` |
| — | Not in the workbook: cigarette-size specifications and format descriptions, supplied and confirmed by the owner on 2026-09-22 (see gap 7). **Parked** the same day — kept in the code, not live (`docs/feature-flags.md`) | `/cigarette-sizes`, `/cigarette-sizes/<format>`, home sizes band — all off while `FEATURES.cigaretteSizes` is false | `sizes.ts` |
| — | Not in the workbook: the group website, https://www.abulkhairgroup.com/ (owner, 2026-09-22). Every "Part of Abul Khair Group" mention links to it | The footer's "Part of Abul Khair Group" line, Organization JSON-LD `parentOrganization.url`, `llms.txt` | `site.ts` → `parentUrl` |

Corrections made to the workbook text (please confirm):

1. B10 "Our Priduct line" → "Our Product Line".
2. F14 (Burley) "It characterized by…" → "It is characterized by…".
3. The reconstituted sheet is "RE-CON" in the product rows and "RECON" in About Us. The
   site uses "RE-CON" as the product name and leaves the About paragraph as written.
   **Decide on one spelling.**
4. "AKT Signature Collection" / "AKT's highest…" (row 26) vs "AKTCL" elsewhere — left
   as written. **Confirm "AKT" is intended.** F26 adds a third form, "ABUL KHAIR
   TOBACCO" in capitals (twice), also left as written.
5. Spelling is mixed British/American ("colour" in products, "color" in the journey).
   Left as written.

## 2. Images → where used

All 37 files are 2400×1792, 2752×1536 or 1792×2400. `npm run images:import` converts
them to WebP masters in `src/assets` (106.8 MB → 10.1 MB); AVIF/WebP width variants are
generated at build time. Originals are not committed.

| Source | Site name (`src/assets/…`) | Used on |
| --- | --- | --- |
| 1. HERO/H1 | `hero/hero-field` | Home hero (its only photo since 2026-09-22), social share image |
| 1. HERO/H2 | `hero/hero-seed-to-smoke` | Home "Who We Are" (owner, 2026-09-22; formerly hero slide 2) |
| 2. SEED/S1–S5 | `journey/seed-1…5` | `/journey/seed` carousel; S5 = stage cover; gallery |
| 3. HARVESTING/H1–H4 | `journey/harvest-1…4` | `/journey/harvest`; H3 = cover; gallery |
| 4. CURING/C1–C4 | `journey/cure-1…4` | `/journey/cure`; C4 = cover; gallery |
| 5. BUYING/B1–B4 | `journey/buying-1…4` | `/journey/buying`; B2 = cover; About; gallery |
| 6. THRESHING/T-1…T-3 | `journey/process-1…3` | `/journey/process`; T-2 = cover; About; gallery |
| 7. MANUFACTURING/M-1…M-3 | `journey/manufacture-1…3` | `/journey/manufacture`; M-1 = cover; About; gallery |
| 8. SMOKE/SM1 | `journey/smoke-1` | `/journey/smoke` (only image) |
| 9. PRODUCT/9.1 P1, P2 | `products/virginia-flue-cured-1, -2` | Virginia Flue-Cured page; Leaf Tobacco category cover |
| 9. PRODUCT/9.2.1 P3, 9.2.3 P4 | `products/burley-1, -2` | Burley page |
| 9. PRODUCT/9.3 CUTRAG … 9.8 CRES | `products/cutrag, diet, stem, scrap, recon, cres` | Matching product pages |
| 9. PRODUCT/10.1 KS | `products/king-size` | Finished Cigarettes category cover, home private-label band; stand-in on the AKT Signature Collection page until "AKT BRANDS_SITE.png" arrives (gap 6a) |
| 10. AKT Signature Collection/ARIS, AVON, BD, MARISE, MAXIM, SUPREME | `brands/aris, avon, black-diamond, marise, maxim, supreme` | The brand grid on `/products/finished-cigarettes/akt-signature-collection` (supplied 2026-09-23). Logos, not photographs: transparent artwork in its own colours, shown on a light tile in both themes. BD.png is the Black Diamond mark |
| 11. HERO BANNERS/WT-MIDDLE-EAST, WT-ASIA | `hero/wt-middle-east, wt-asia` | The two trade-fair slides of the home hero (supplied 2026-09-23). Finished artwork carrying its own words, so it is never cropped and the hero headline steps aside while one is up. **Dated:** WT Asia 22–23 October 2026, WT Middle East 10–11 November 2026 — take both out of `heroSlides` once the events have passed |

Assumption to confirm: files "9.1" are Virginia Flue-Cured (golden leaf) and "9.2.x" are
Burley (light-brown leaf). This matches the colours the workbook describes, but the file
names do not say so.

Honest note on provenance: the field, curing and product images have the dimensions and
finish of AI-generated imagery; the threshing/manufacturing floor shots and two of the
buying-centre shots look like real photographs. The brief asks for authentic factory and
farm photography where possible — see gaps 6 and 8.

## 3. Gap list — needed from AKTCL

Nothing below has been invented on the site. Where a value is missing the element is
hidden or shows an honest "on request" state.

**Blocking launch**

1. **Contact details** — export desk email, phone, WhatsApp number, office/factory
   address. Footer, contact page, floating button and JSON-LD are wired to
   `src/content/site.ts → contact` and stay hidden while it is `null`.
2. **Enquiry delivery** — the mailbox that should receive enquiries, plus SMTP
   credentials (or approval to use another mail service). Until then enquiries are only
   stored in Azure Table Storage. See `docs/enquiry-api.md`.
3. ~~**Logo**~~ — **supplied 2026-09-21** ("AKT_LOGO ONLY.psd"). The vector was taken from
   the Illustrator smart object inside the PSD and is used in the header, footer, age gate,
   page sign-off, favicon/app icons, share image and Google structured data
   (`src/components/LogoMark.tsx`, `npm run brand-assets`). The file is single-colour grey
   and mark-only, so on the site it takes the surface's text colour and the company name is
   set in the site's type. **Still welcome:** official brand colours / a full lockup if one
   exists, and the Abul Khair Group mark if it should appear.
4. **Legal/regulatory sign-off** — age gate wording, footer health warning, Privacy
   Notice and Terms of Use are drafts. Terms has no governing-law clause yet.

**Needed for Orchid/Sopariwala-style product pages**

5. **Specifications** — the workbook has none. Leaf: type, grades, packing, nicotine %,
   sugar %, crop year/calendar, MOQ. Processed (CUTRAG, CRES, DIET, STEM, RE-CON): cut
   width, moisture, filling value, packing, MOQ. Cigarettes: length, circumference,
   filter, pack format, sticks/pack, packs/outer, outers/master case, cases per 20'/40'
   container, MOQ. Spec cards show the labels with "On request" until filled
   (`products.ts → specs`). Per cigarette *format* these are now supplied — see gap 7;
   the finished-cigarette product cards still need their own.
6. **Finished cigarettes** — one line of copy each and one shared pack shot. Need long
   descriptions and a pack shot per format (King Size Filter, Super Slim, NANO, Private
   Label Manufacturing) before they get their own pages (`hasDetailPage: true`). ("Premium
   King Size" left the workbook on 2026-09-22; AKT Signature Collection got its long
   description, F26, the same day and has its page.) **SCRAP** also has only one line.
   - **6a. "AKT BRANDS_SITE.png" — named in E26, not in the content folder.** The AKT
     Signature Collection page uses the plain king-size pack shot (`products/king-size`,
     the category cover) until it arrives. When it does: check it is unbranded or
     trade-appropriate pack imagery (see the compliance note below), run
     `npm run images:import`, and add it under `akt-signature-collection` in
     `src/content/images.ts → productImages`.
7. ~~**Cigarette size specifications**~~ — **supplied 2026-09-22, owner-confirmed.**
   *The Cigarette Sizes segment was parked later the same day (kept in the code, not
   live; `docs/feature-flags.md`). What follows still applies to `sizes.ts`, ready for
   when it goes back on.*
   The owner supplied five "Packaging & Logistics Specifications" sheets (King Size,
   100s, Slim, Super Slim, Nano) with the size-page references, confirmed that the
   figures are AKTCL's own, and then that AKTCL's specifications and format descriptions
   for these sizes are the same as the reference site's, so they are replicated. On the
   site: every figure the sheets give, in `src/content/sizes.ts → specs({ … })`, typed in
   the site's style (en-dash ranges, × dimensions, "(typical)" for nominal values); a
   tagline, two paragraphs, "Why brands choose it" and "Best for" per format, reworded by
   us for the trade (no consumer, lifestyle or health-appeal lines). The reference site's
   artwork and prose are not used. This also answers the old questions: 100s and Slim are
   AKTCL formats, and the copy per format now exists.
   - **Still open, per format:** what the sheets do not give is left off that size's data
     sheet (not shown, never guessed; a group with nothing in it is dropped), so the sheet
     prints only real figures — King Size and 100s: diameter, filter length, tobacco
     weight and type, moisture content, all pack/carton dimensions, gross weight, pallet
     configuration (no "Dimensions & weights" group yet); Slim: moisture content,
     pack/carton dimensions, gross weight, pallet configuration (no "Dimensions &
     weights" group yet); Super Slim: tobacco type, moisture content. Supplying any of
     them is a data edit in `sizes.ts`; the row appears by itself.
   - **Optional:** an infographic or pack shot per format that AKTCL owns the rights to
     (`infographic` in `sizes.ts`; renders only when present).

   **Caveat — Super Slim and Nano carton sizes: published as supplied at the owner's
   instruction — verify with AKTCL logistics.** The figures do not add up physically:
   - The labelled "master carton size" (Super Slim 105 × 60 × 100 mm, Nano
     105 × 55 × 95 mm) is outer-sized — roughly ten soft packs — not a box holding 500
     packs.
   - The "outer carton size" (Super Slim 540 × 280 × 115 mm ≈ 17.4 L, Nano
     540 × 275 × 110 mm ≈ 16.3 L) cannot hold the 50 of those boxes a master carton is
     said to contain (50 × 0.63 L ≈ 31.5 L; 50 × 0.55 L ≈ 27.4 L). The two labels look
     swapped, and even swapped the volumes do not reconcile.
   - The pallet configurations (Super Slim 8 outers per layer × 6 layers = 48; Nano 10
     per layer × 7 layers = 70) do not fit a standard pallet: boxes of 540 × 280 mm or
     540 × 275 mm go about 4–6 to a layer on a 1200 × 800 mm or 1200 × 1000 mm pallet,
     not 8 or 10, and 8 or 10 of the 105 mm boxes would cover a fraction of one.
   AKTCL logistics should confirm the pack, outer and master carton dimensions, gross
   weights and pallet patterns for these two formats; correcting them is a data edit in
   `sizes.ts` only.
8. **Real photography** — GLT plant, cigarette factory, buying centres, farmer network,
   plus a second image for the Smoke stage. Video (hero loop, factory) if available.

**Would strengthen credibility (Sopariwala "proof layer")**

9. Heritage milestones beyond 1953 and 1997 (the timeline is built to take more).
10. Leadership names/roles/photos; Abul Khair Group context paragraph.
11. Certifications and standards (ISO etc.), awards, press.
12. **Export markets/regions — still open.** The homepage "Global Reach" world map is live
    (2026-09-22, at the owner's request), but it shows a **stand-in** list of key import
    markets for leaf tobacco and cigarettes from Bangladesh and India — not AKTCL's
    confirmed export list — and its note line says exactly that. It named 21 countries;
    China was taken off at the owner's request the same day, so **20** remain. Needed
    from AKTCL: the confirmed export markets (country, and region if it should differ),
    to replace `markets` in `src/content/markets.ts` (marked `TODO(Asef)`); then the note
    line can say "Where we export". **Owner / legal to confirm** that naming these 20
    countries under the stand-in framing is acceptable until then. Region pages remain
    out of scope until the real list exists.
13. Capacity figures (GLT throughput, cigarette output), brochures/catalogues (PDF) for
    "Download" buttons, CSR/sustainability content.
14. Social/profile links (LinkedIn etc.) for the footer and JSON-LD. (The group website,
    https://www.abulkhairgroup.com/, is supplied — it is the parent organisation's site,
    not an AKTCL profile, so it is `parentOrganization.url` in the JSON-LD, not `sameAs`.)

## 4. Compliance notes for legal review

1. **F26 — AKT Signature Collection (added 2026-09-22).** The copy describes AKTCL's
   *domestic consumer* brands and market position: "well-established brands with a
   significant presence across diverse segments of the domestic market", "deep
   understanding of local consumer preferences", "caters to multiple local markets and
   consumer segments across Bangladesh", "largest local tobacco player", "leading local
   tobacco manufacturer". It is **published verbatim, as supplied** (owner's workbook).
   This is an export-facing, trade-only site that otherwise carries no consumer-appeal
   messaging, and Bangladesh's tobacco control law restricts tobacco advertising and
   promotion. **AKTCL legal/regulatory to confirm** that this wording — consumer
   segments, consumer preferences, "premium", brand strength and market recognition — is
   acceptable on the export site, or supply a trade-framed version. The same review
   should cover "AKT BRANDS_SITE.png" (gap 6a) before it is used: if it shows branded
   packs, it is brand imagery the site has so far avoided.
