# Content inventory and gap list

Audit of `D:\AKTCL Website\AKTCL Website Content` on 2026-09-21: one workbook
(`AKTCL - SITE CONTENTS, Plan, Written Content.xlsx`, a single sheet, rows 1–28) and 37
JPEGs in `VISUAL Content`. No logo, video, PDF or brand guideline was supplied, and
`AKTCL Website Design` is empty.

The workbook is the source of truth for wording. Its copy lives verbatim in
`src/content/*.ts`; each string there notes the cell it came from.

## 1. Workbook → pages

Columns: A Stage · B Phase · C Catchy Title · D Short Description · E VISUAL (empty) ·
F Long Description · G VISUAL (empty).

| Rows | Section | Feeds | Content file |
| --- | --- | --- | --- |
| 2 | HERO — "FROM SEED TO SMOKE", tagline, value-chain paragraph | Home hero (h1, subtitle), home "Who We Are", `/journey` intro | `site.ts` → `hero` |
| 3–9 | PROCESS — Seed, Harvest, Cure, Buying, Process, Manufacture, Smoke | Home sticky "Our Journey" section, `/journey`, `/journey/<stage>` ×7 | `journey.ts` |
| 10 | PRODUCT intro | Home product showcase, `/products` | `products.ts` → `productsIntro` |
| 11–20 | Category 01 Leaf Tobacco + 8 products | `/products/leaf-tobacco` and 8 product pages | `products.ts` |
| 21–27 | Category 02 Finished Cigarettes + 6 entries | `/products/finished-cigarettes` (cards only), home private-label band | `products.ts` |
| 28 | ABOUT US (3 paragraphs) | `/about-us`, facts strip, heritage timeline, Organization JSON-LD | `about.ts` |

Corrections made to the workbook text (please confirm):

1. B10 "Our Priduct line" → "Our Product Line".
2. F14 (Burley) "It characterized by…" → "It is characterized by…".
3. The reconstituted sheet is "RE-CON" in the product rows and "RECON" in About Us. The
   site uses "RE-CON" as the product name and leaves the About paragraph as written.
   **Decide on one spelling.**
4. "AKT Signature Collection" / "AKT's highest…" (rows 27) vs "AKTCL" elsewhere — left
   as written. **Confirm "AKT" is intended.**
5. Spelling is mixed British/American ("colour" in products, "color" in the journey).
   Left as written.

## 2. Images → where used

All 37 files are 2400×1792, 2752×1536 or 1792×2400. `npm run images:import` converts
them to WebP masters in `src/assets` (106.8 MB → 10.1 MB); AVIF/WebP width variants are
generated at build time. Originals are not committed.

| Source | Site name (`src/assets/…`) | Used on |
| --- | --- | --- |
| 1. HERO/H1 | `hero/hero-field` | Home hero slide 1, social share image |
| 1. HERO/H2 | `hero/hero-seed-to-smoke` | Home hero slide 2 |
| 2. SEED/S1–S5 | `journey/seed-1…5` | `/journey/seed` carousel; S5 = stage cover; gallery |
| 3. HARVESTING/H1–H4 | `journey/harvest-1…4` | `/journey/harvest`; H3 = cover; gallery |
| 4. CURING/C1–C4 | `journey/cure-1…4` | `/journey/cure`; C4 = cover; gallery |
| 5. BUYING/B1–B4 | `journey/buying-1…4` | `/journey/buying`; B2 = cover; About; gallery |
| 6. THRESHING/T-1…T-3 | `journey/process-1…3` | `/journey/process`; T-2 = cover; About; gallery |
| 7. MANUFACTURING/M-1…M-3 | `journey/manufacture-1…3` | `/journey/manufacture`; M-1 = cover; home "Who We Are"; About; gallery |
| 8. SMOKE/SM1 | `journey/smoke-1` | `/journey/smoke` (only image) |
| 9. PRODUCT/9.1 P1, P2 | `products/virginia-flue-cured-1, -2` | Virginia Flue-Cured page; Leaf Tobacco category cover |
| 9. PRODUCT/9.2.1 P3, 9.2.3 P4 | `products/burley-1, -2` | Burley page |
| 9. PRODUCT/9.3 CUTRAG … 9.8 CRES | `products/cutrag, diet, stem, scrap, recon, cres` | Matching product pages |
| 9. PRODUCT/10.1 KS | `products/king-size` | Finished Cigarettes category cover, home private-label band |

Assumption to confirm: files "9.1" are Virginia Flue-Cured (golden leaf) and "9.2.x" are
Burley (light-brown leaf). This matches the colours the workbook describes, but the file
names do not say so.

Honest note on provenance: the field, curing and product images have the dimensions and
finish of AI-generated imagery; the threshing/manufacturing floor shots and two of the
buying-centre shots look like real photographs. The brief asks for authentic factory and
farm photography where possible — see gaps 6 and 7.

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
   (`products.ts → specs`).
6. **Finished cigarettes** — one line of copy each and one shared pack shot. Need long
   descriptions and a pack shot per format (Premium King Size, King Size Filter, Super
   Slim, NANO, AKT Signature Collection) before they get their own pages
   (`hasDetailPage: true`). **SCRAP** also has only one line.
7. **Real photography** — GLT plant, cigarette factory, buying centres, farmer network,
   plus a second image for the Smoke stage. Video (hero loop, factory) if available.

**Would strengthen credibility (Sopariwala "proof layer")**

8. Heritage milestones beyond 1953 and 1997 (the timeline is built to take more).
9. Leadership names/roles/photos; Abul Khair Group context paragraph.
10. Certifications and standards (ISO etc.), awards, press.
11. Export markets/regions — enables the world map section and region pages that the
    Shah Agro layout and Orchid both have. Omitted for now.
12. Capacity figures (GLT throughput, cigarette output), brochures/catalogues (PDF) for
    "Download" buttons, CSR/sustainability content.
13. Social/profile links (LinkedIn etc.) for the footer and JSON-LD.
