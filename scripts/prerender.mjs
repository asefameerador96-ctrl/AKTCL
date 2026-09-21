#!/usr/bin/env node
/**
 * Post-build prerender. Serves the freshly built dist/, asks the running app which
 * routes exist, visits each one with headless Chromium and writes the rendered HTML
 * to dist/<route>/index.html. Then writes everything else that depends on the route
 * list: 404.html, routes.json, sitemap.xml, robots.txt, and the inline-script hashes
 * in staticwebapp.config.json.
 *
 * Why: the app is a client-rendered SPA, so without this step every crawler that does
 * not execute JavaScript — Bing, WhatsApp, Facebook, LinkedIn, GPTBot, PerplexityBot —
 * receives an empty <div id="root"> and no per-route metadata.
 *
 * The client does not hydrate this markup; it replaces it (see src/main.tsx).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { chromium } from "playwright";
import { SITE, dist, htmlFileFor } from "./lib/site.mjs";
import { serveDist } from "./lib/serve-dist.mjs";
import { CSP_HASH_TOKEN, inlineScriptHashes } from "./lib/csp.mjs";

const NOT_FOUND_PROBE = "/__prerender-not-found__";
const TIMEOUT = 45000;

// Read ONCE, before anything is written. The loop overwrites dist/index.html with the
// prerendered homepage; every route must start from this untouched shell instead.
let shell;
try {
  shell = readFileSync(join(dist, "index.html"), "utf8");
} catch {
  console.error("prerender: dist/index.html not found — run `vite build` first");
  process.exit(1);
}
if (shell.includes("data-prerendered")) {
  console.error("prerender: dist/index.html is already prerendered — run `vite build` again for a clean shell");
  process.exit(1);
}
const shellTitle = shell.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";

const server = await serveDist(dist, { shell });
const browser = await chromium.launch();
const failures = [];
let routes = [];

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Before any app code: main.tsx exposes the route list when it sees this flag, the
  // age gate and floating button stay out of the snapshot, count-ups show their final
  // values, carousels hold still and the scroll-driven sections render as plain lists.
  await context.addInitScript(() => {
    window.__PRERENDER__ = true;
  });
  const page = await context.newPage();
  page.on("pageerror", (err) => failures.push(`pageerror on ${page.url()}: ${err.message}`));

  // The route list comes from the running app (src/seo/routeMeta.ts via main.tsx),
  // so nothing here parses TypeScript source.
  await page.goto(`${server.base}/`, { waitUntil: "load", timeout: TIMEOUT });
  await page.waitForFunction(() => Array.isArray(window.__AKTCL_ROUTES__), null, { timeout: TIMEOUT });
  routes = await page.evaluate(() =>
    window.__AKTCL_ROUTES__.map(({ path, priority, changefreq }) => ({ path, priority, changefreq }))
  );

  const paths = routes.map((r) => r.path);
  const bad = paths.filter((p) => typeof p !== "string" || !p.startsWith("/") || (p !== "/" && p.endsWith("/")));
  const duplicates = paths.filter((p, i) => paths.indexOf(p) !== i);
  if (routes.length === 0) throw new Error("the app reported zero routes");
  if (bad.length) throw new Error(`malformed route path(s): ${bad.join(", ")}`);
  if (duplicates.length) throw new Error(`duplicate route(s): ${[...new Set(duplicates)].join(", ")}`);

  /** Loads `url`, waits until `ready` holds in the page, scrolls it through and returns the HTML. */
  const snapshot = async (url, ready, readyArg, { stripUrls = false } = {}) => {
    await page.goto(`${server.base}${url}`, { waitUntil: "networkidle", timeout: TIMEOUT });
    // Seo.tsx writes the head in an effect and the page itself is a lazy chunk, so
    // "loaded" is: metadata is this route's own, and the page has rendered its <h1>.
    await page.waitForFunction(ready, readyArg, { timeout: TIMEOUT });
    await page.waitForFunction(() => document.querySelector("#root h1") !== null, null, { timeout: TIMEOUT });

    // Sections reveal themselves on scroll (Reveal, LazyImage, ScrollTextReveal).
    // Walk the page so each has fired, otherwise the snapshot holds content still
    // sitting at opacity: 0. scrollHeight is re-read every step: it grows as lazy
    // sections and images arrive.
    await page.evaluate(async () => {
      const pause = (ms) => new Promise((r) => setTimeout(r, ms));
      // "instant": index.css sets scroll-behavior: smooth, and an animated scroll
      // that is re-targeted every 150 ms never arrives anywhere.
      const jump = (top) => window.scrollTo({ top, behavior: "instant" });
      const step = Math.round(window.innerHeight * 0.8);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        jump(y);
        await pause(150);
      }
      jump(document.documentElement.scrollHeight);
      await pause(250);
      jump(0);
      await pause(250);
    });
    // Reveal transitions run for up to a second, plus their stagger delay.
    await page.waitForTimeout(1300);

    // Proof that the walk worked: nothing with text may still be waiting at opacity 0.
    const unrevealed = await page.evaluate(() =>
      [...document.querySelectorAll('#root [style*="opacity: 0"]')]
        .filter((el) => el.style.opacity === "0" && el.textContent.trim() !== "")
        .map((el) => el.textContent.trim().slice(0, 40))
    );
    if (unrevealed.length) throw new Error(`${unrevealed.length} block(s) never revealed, e.g. "${unrevealed[0]}"`);

    return page.evaluate((strip) => {
      // In the snapshot every image exists at once, and any <img> without an explicit
      // loading attribute is eager. Mark everything below the first viewport lazy so
      // the static HTML requests roughly what the client-rendered page does. Slides
      // of a horizontal carousel share one vertical offset, so loading="lazy" alone
      // would not hold them back; low priority keeps them behind the hero image.
      const fold = window.innerHeight;
      for (const img of document.images) {
        if (img.getBoundingClientRect().top > fold) {
          img.setAttribute("loading", "lazy");
          img.setAttribute("fetchpriority", "low");
        }
        if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");
      }

      // Vite adds <link rel="modulepreload" as="script"> at runtime when a dynamic
      // import fires (its build-time preloads carry no "as"). Shah Agro's script
      // removed them because its polluted shell leaked one page's chunks into every
      // other page. Every route starts from the clean shell here, so the links
      // present are exactly this route's own page chunk and its dependencies — kept,
      // so the browser fetches them alongside the entry bundle instead of after it.
      // Path only, so the local prerender origin can never leak into shipped HTML.
      for (const link of document.querySelectorAll('link[rel="modulepreload"][as="script"]')) {
        link.setAttribute("href", new URL(link.href).pathname);
      }

      if (strip) {
        // The 404 document is served for every unknown URL; it must not name one.
        document.querySelector('link[rel="canonical"]')?.remove();
        document.querySelector('meta[property="og:url"]')?.remove();
      }

      document.getElementById("root")?.setAttribute("data-prerendered", "true"); // informational
      return "<!doctype html>\n" + document.documentElement.outerHTML;
    }, stripUrls);
  };

  for (const { path } of routes) {
    try {
      const html = await snapshot(
        path,
        ({ shellTitle, canonical }) =>
          document.title !== shellTitle &&
          document.querySelector('link[rel="canonical"]')?.getAttribute("href") === canonical,
        { shellTitle, canonical: `${SITE}${path}` }
      );
      const file = htmlFileFor(path);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, html);
      console.log(`  prerendered ${path}`);
    } catch (err) {
      failures.push(`${path}: ${err.message.split("\n")[0]}`);
    }
  }

  // A URL that can never exist renders the catch-all page. Azure serves this file,
  // with a real 404 status, for every unknown URL (responseOverrides).
  try {
    const html = await snapshot(
      NOT_FOUND_PROBE,
      (title) =>
        document.title !== title &&
        /noindex/i.test(document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? ""),
      shellTitle,
      { stripUrls: true }
    );
    if (!/<meta[^>]+name="robots"[^>]+noindex/i.test(html)) throw new Error("snapshot is missing noindex");
    writeFileSync(join(dist, "404.html"), html);
    console.log("  prerendered 404.html");
  } catch (err) {
    failures.push(`404.html: ${err.message.split("\n")[0]}`);
  }
} catch (err) {
  failures.push(err.message.split("\n")[0]);
} finally {
  await browser.close();
  await server.close();
}

if (failures.length) {
  console.error(`prerender FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1); // never ship a partially prerendered build
}

// ---- files derived from the route list ---------------------------------------

const lastmod = /^\d{4}-\d{2}-\d{2}$/.test(process.env.BUILD_DATE ?? "")
  ? process.env.BUILD_DATE
  : new Date().toISOString().slice(0, 10);

writeFileSync(join(dist, "routes.json"), JSON.stringify({ site: SITE, generated: lastmod, routes }, null, 2) + "\n");

const urls = routes.map(
  (r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${Number(r.priority).toFixed(1)}</priority>
  </url>`
);
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`
);

writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

// The Content-Security-Policy allows inline scripts by hash, not 'unsafe-inline'.
// Hash whatever index.html actually ships, so an edit there can never drift from the
// policy. Vite copied the config from public/; only the dist copy is touched.
const configFile = join(dist, "staticwebapp.config.json");
let config;
try {
  config = readFileSync(configFile, "utf8");
} catch {
  console.error("prerender: dist/staticwebapp.config.json is missing (expected from public/)");
  process.exit(1);
}
if (!config.includes(CSP_HASH_TOKEN)) {
  console.error(`prerender: the ${CSP_HASH_TOKEN} placeholder is not in staticwebapp.config.json`);
  process.exit(1);
}
const hashes = inlineScriptHashes(shell);
writeFileSync(configFile, config.replaceAll(CSP_HASH_TOKEN, hashes.join(" ")));

console.log(
  `prerender: ${routes.length} routes, 404.html, sitemap.xml, robots.txt, routes.json; ${hashes.length} inline-script hash(es) in the CSP`
);
