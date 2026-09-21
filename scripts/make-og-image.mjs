#!/usr/bin/env node
/**
 * Builds public/og-image.jpg — the 1200×630 card WhatsApp, LinkedIn, Facebook and X
 * show when a link to the site is shared. Run by hand (`npm run og-image`) when the
 * hero photograph or the wording changes, and commit the result.
 *
 * JPEG on purpose: link previews do not reliably render WebP or AVIF.
 */
import { statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { root } from "./lib/site.mjs";
import { GOLD, INK, IVORY, markGroup } from "./lib/brand.mjs";

const WIDTH = 1200;
const HEIGHT = 630;
const MAX_BYTES = 300 * 1024;
const source = join(root, "src/assets/hero/hero-field.webp");
const output = join(root, "public/og-image.jpg");

// Must match src/content/site.ts (tagline, name).
const TAGLINE = "From Seed to Smoke";
const NAME = "Abul Khair Tobacco Co. Ltd.";

// The AKT monogram, 300px wide, sitting where the wordmark text used to.
const mark = markGroup({ x: 82, y: 150, width: 300, fill: IVORY });

// Fraunces is not installed on build machines, so the card uses the closest serif
// the machine has; librsvg falls back along the list.
const SERIF = "Georgia, 'Times New Roman', 'DejaVu Serif', serif";
const SANS = "'Segoe UI', Helvetica, Arial, 'DejaVu Sans', sans-serif";

const overlay = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${INK}" stop-opacity="0.45"/>
      <stop offset="0.45" stop-color="${INK}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${INK}" stop-opacity="0.92"/>
    </linearGradient>
    <linearGradient id="side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${INK}" stop-opacity="0.6"/>
      <stop offset="0.7" stop-color="${INK}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#shade)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#side)"/>

  ${mark.fragment}
  <rect x="84" y="372" width="96" height="3" fill="${GOLD}"/>
  <text x="82" y="450" font-family="${SERIF}" font-size="58" fill="${IVORY}">${TAGLINE}</text>
  <text x="84" y="540" font-family="${SANS}" font-size="26" font-weight="600" letter-spacing="7" fill="${GOLD}">${NAME.toUpperCase()}</text>
</svg>`;

await sharp(source)
  .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
  .composite([{ input: Buffer.from(overlay) }])
  .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:2:0" })
  .toFile(output);

const bytes = statSync(output).size;
console.log(`make-og-image: public/og-image.jpg ${WIDTH}x${HEIGHT}, ${(bytes / 1024).toFixed(0)} KB`);
if (bytes > MAX_BYTES) {
  console.error("make-og-image: over the 300 KB budget — lower the JPEG quality");
  process.exit(1);
}
