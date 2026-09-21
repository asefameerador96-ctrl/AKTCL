#!/usr/bin/env node
/**
 * Builds every raster/standalone copy of the AKT logo in public/ from the vector
 * paths in scripts/lib/brand.mjs. Run by hand (`npm run brand-assets`) if the logo or
 * the brand colours change, and commit the results.
 *
 *   favicon.svg              browser tabs (modern browsers)
 *   favicon.ico              16/32/48 — legacy browsers, and what crawlers probe first
 *   favicon-96x96.png        Google Search shows the site icon from a multiple of 48px
 *   apple-touch-icon.png     iOS home screen (180, opaque — iOS adds its own rounding)
 *   icon-192.png/icon-512.png  web app manifest (mark kept inside the maskable safe zone)
 *   logo.png / logo.svg      the mark exactly as supplied (grey on white / transparent):
 *                            Organization "logo" in JSON-LD, press and partner use
 *   site.webmanifest
 *
 * Icons put the ivory mark on the brand's dark ink: the supplied mid-grey on white
 * is too faint to read at 16px. Google crops the icon to a circle on phones, so the
 * wide mark is kept inside that circle (coverage ≤ 0.7) on anything it may pick.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { root } from "./lib/site.mjs";
import { INK, IVORY, MARK_SUPPLIED_COLOUR, MARK_VIEWBOX, markGroup, tileSvg } from "./lib/brand.mjs";

const pub = (name) => join(root, "public", name);
const png = (svg, size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** ICO container holding PNG images (valid since Windows Vista; read by every browser). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// Browser tab: rounded tile, mark as large as the tile allows.
writeFileSync(pub("favicon.svg"), tileSvg({ size: 64, coverage: 0.8, background: INK, fill: IVORY, radius: 12 }) + "\n");

const tab = tileSvg({ size: 256, coverage: 0.82, background: INK, fill: IVORY, radius: 40 });
writeFileSync(
  pub("favicon.ico"),
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(tab, size) }))))
);

// Square and full-bleed from here on: these may be circle- or squircle-cropped.
const safe = (size) => tileSvg({ size, coverage: 0.66, background: INK, fill: IVORY });
writeFileSync(pub("favicon-96x96.png"), await png(safe(384), 96));
writeFileSync(pub("apple-touch-icon.png"), await png(safe(360), 180));
writeFileSync(pub("icon-192.png"), await png(safe(384), 192));
writeFileSync(pub("icon-512.png"), await png(safe(512), 512));

// The mark as supplied.
writeFileSync(
  pub("logo.png"),
  await png(tileSvg({ size: 1024, coverage: 0.83, background: "#ffffff", fill: MARK_SUPPLIED_COLOUR }), 1024)
);
{
  const { w, h } = MARK_VIEWBOX;
  const { fragment } = markGroup({ x: 0, y: 0, width: w, fill: MARK_SUPPLIED_COLOUR });
  writeFileSync(
    pub("logo.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="AKT — Abul Khair Tobacco Co. Ltd."><title>AKT — Abul Khair Tobacco Co. Ltd.</title>${fragment}</svg>\n`
  );
}

writeFileSync(
  pub("site.webmanifest"),
  JSON.stringify(
    {
      name: "Abul Khair Tobacco Co. Ltd.",
      short_name: "AKTCL",
      description: "From Seed to Smoke — leaf tobacco, processed tobacco and finished cigarettes for export. Trade enquiries only.",
      start_url: "/",
      display: "browser",
      background_color: INK,
      theme_color: INK,
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ],
    },
    null,
    2
  ) + "\n"
);

console.log("make-brand-assets: favicon.svg, favicon.ico, favicon-96x96.png, apple-touch-icon.png, icon-192.png, icon-512.png, logo.png, logo.svg, site.webmanifest");
