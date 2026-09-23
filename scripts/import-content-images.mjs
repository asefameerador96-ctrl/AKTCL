#!/usr/bin/env node
/**
 * Imports the raw AKTCL content photography into src/assets as optimised WebP
 * masters. The multi-MB originals stay outside git (see .gitignore); only the
 * output of this script is committed.
 *
 *   npm run images:import -- "D:\AKTCL Website\AKTCL Website Content\VISUAL Content"
 *
 * The source folder can also be given through AKTCL_CONTENT_DIR. Responsive
 * AVIF/WebP width variants are NOT produced here — vite-imagetools generates those
 * at build time from the "?w=...&as=picture" import queries, so these masters only
 * need to be large enough for the widest variant requested (1920px).
 *
 * The map below is explicit on purpose: source names collide across folders
 * (H1/H2 exist in both HERO and HARVESTING) and carry no meaning, so every file is
 * renamed to what it shows.
 */
import { existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = process.argv[2] || process.env.AKTCL_CONTENT_DIR;
const outDir = join(root, "src", "assets");

const MAX_EDGE = 1920;
const QUALITY = 80;

/** [source path relative to the content folder, output path relative to src/assets] */
const MAP = [
  ["1. HERO/H1.jpeg", "hero/hero-field.webp"],
  ["1. HERO/H2.jpeg", "hero/hero-seed-to-smoke.webp"],

  // Event banners shown in the hero rotation (supplied 2026-09-23). Designed artwork,
  // 16:9: they carry their own text, so nothing may be cropped off them.
  ["11. HERO BANNERS/WT-MIDDLE-EAST.webp", "hero/wt-middle-east.webp"],
  ["11. HERO BANNERS/WT-ASIA.webp", "hero/wt-asia.webp"],

  ["2. SEED/S1.jpeg", "journey/seed-1.webp"],
  ["2. SEED/S2.jpeg", "journey/seed-2.webp"],
  ["2. SEED/S3.jpeg", "journey/seed-3.webp"],
  ["2. SEED/S4.jpeg", "journey/seed-4.webp"],
  ["2. SEED/S5.jpeg", "journey/seed-5.webp"],

  ["3. HARVESTING/H1.jpeg", "journey/harvest-1.webp"],
  ["3. HARVESTING/H2.jpeg", "journey/harvest-2.webp"],
  ["3. HARVESTING/H3.jpeg", "journey/harvest-3.webp"],
  ["3. HARVESTING/H4.jpeg", "journey/harvest-4.webp"],

  ["4. CURING/C1.jpeg", "journey/cure-1.webp"],
  ["4. CURING/C2.jpeg", "journey/cure-2.webp"],
  ["4. CURING/C3.jpeg", "journey/cure-3.webp"],
  ["4. CURING/C4.jpeg", "journey/cure-4.webp"],

  ["5. BUYING/B1.jpeg", "journey/buying-1.webp"],
  ["5. BUYING/B2.jpeg", "journey/buying-2.webp"],
  ["5. BUYING/B3.jpeg", "journey/buying-3.webp"],
  ["5. BUYING/B4.jpeg", "journey/buying-4.webp"],

  ["6. THRESHING/T-1.jpeg", "journey/process-1.webp"],
  ["6. THRESHING/T-2.jpeg", "journey/process-2.webp"],
  ["6. THRESHING/T-3.jpeg", "journey/process-3.webp"],

  ["7. MANUFACTURING/M-1.jpeg", "journey/manufacture-1.webp"],
  ["7. MANUFACTURING/M-2.jpeg", "journey/manufacture-2.webp"],
  ["7. MANUFACTURING/M-3.jpeg", "journey/manufacture-3.webp"],

  ["8. SMOKE/SM1.jpeg", "journey/smoke-1.webp"],

  ["9. PRODUCT/9.1 P1.jpeg", "products/virginia-flue-cured-1.webp"],
  ["9. PRODUCT/9.1 P2.jpeg", "products/virginia-flue-cured-2.webp"],
  ["9. PRODUCT/9.2.1 P3.jpeg", "products/burley-1.webp"],
  ["9. PRODUCT/9.2.3 P4.jpeg", "products/burley-2.webp"],
  ["9. PRODUCT/9.3 - CUTRAG.jpeg", "products/cutrag.webp"],
  ["9. PRODUCT/9.4 - DIET.jpeg", "products/diet.webp"],
  ["9. PRODUCT/9.5 - STEM.jpeg", "products/stem.webp"],
  ["9. PRODUCT/9.6 - SCRAP.jpeg", "products/scrap.webp"],
  ["9. PRODUCT/9.7 - RECON.jpeg", "products/recon.webp"],
  ["9. PRODUCT/9.8 - CRES.jpeg", "products/cres.webp"],
  ["9. PRODUCT/10.1 - KS.jpeg", "products/king-size.webp"],

  // Brand marks for the AKT Signature Collection page (supplied 2026-09-23). Logos, not
  // photographs: transparent PNGs that must keep their alpha and their own colours.
  ["10. AKT Signature Collection/ARIS.png", "brands/aris.webp"],
  ["10. AKT Signature Collection/AVON.png", "brands/avon.webp"],
  ["10. AKT Signature Collection/BD.png", "brands/black-diamond.webp"],
  ["10. AKT Signature Collection/MARISE.png", "brands/marise.webp"],
  ["10. AKT Signature Collection/MAXIM.png", "brands/maxim.webp"],
  ["10. AKT Signature Collection/SUPREME.png", "brands/supreme.webp"],
];

if (!sourceDir || !existsSync(sourceDir)) {
  console.error(
    "import-content-images: pass the VISUAL Content folder as the first argument " +
      "or set AKTCL_CONTENT_DIR.\n  got: " + (sourceDir ?? "(nothing)")
  );
  process.exit(1);
}

let before = 0;
let after = 0;
const missing = [];

for (const [from, to] of MAP) {
  const src = join(sourceDir, from);
  const dest = join(outDir, to);
  if (!existsSync(src)) {
    missing.push(from);
    continue;
  }
  mkdirSync(dirname(dest), { recursive: true });
  await sharp(src, { limitInputPixels: false })
    .rotate() // honour EXIF orientation before the metadata is stripped
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(dest);
  before += statSync(src).size;
  after += statSync(dest).size;
  console.log(`  ${from}  ->  src/assets/${to}  (${Math.round(statSync(dest).size / 1024)} KB)`);
}

const mb = (n) => (n / 1048576).toFixed(1);
console.log(
  `import-content-images: ${MAP.length - missing.length}/${MAP.length} images, ` +
    `${mb(before)} MB -> ${mb(after)} MB`
);
if (missing.length) {
  console.error("MISSING source files:\n  " + missing.join("\n  "));
  process.exit(1);
}
