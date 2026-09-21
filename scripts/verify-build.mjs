#!/usr/bin/env node
/**
 * Release gate for the built dist/. Two passes over every route in dist/routes.json:
 *
 *  static — reads the HTML that was written, i.e. what a crawler that runs no
 *           JavaScript receives: metadata, JSON-LD, one <h1>, real body text, and
 *           no placeholder or reference-site text anywhere.
 *  live   — loads each page in Chromium from a server that behaves like Azure Static
 *           Web Apps (same 404 handling, same response headers, so the CSP is
 *           enforced), as a new visitor behind the age gate and as a confirmed one,
 *           at phone and desktop widths: no console errors, real visible text, no
 *           sideways overflow, first-viewport images loaded.
 *
 * Any failure exits 1 and the deploy workflow stops.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { chromium } from "playwright";
import { SITE, dist, htmlFileFor } from "./lib/site.mjs";
import { serveDist } from "./lib/serve-dist.mjs";
import { CSP_HASH_TOKEN, inlineScriptHashes } from "./lib/csp.mjs";

const FORBIDDEN = /shah\s*agro|shahagro|jute|lorem ipsum|TODO|STUB/i;
const AGE_KEY = "aktcl-age-ok";
const VIEWPORTS = [
  { name: "360px", width: 360, height: 740 },
  { name: "1280px", width: 1280, height: 800 },
];
const MIN_STATIC_TEXT = 300;
const MIN_VISIBLE_TEXT = 500;
const OG_IMAGE_MAX_BYTES = 300 * 1024;
const CONCURRENCY = 4;
const TIMEOUT = 45000;

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

// ---- helpers -------------------------------------------------------------------

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

const htmlFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "assets" ? [] : htmlFiles(file);
    return entry.name.endsWith(".html") ? [file] : [];
  });

/** Attributes of every <name ...> tag, e.g. tags(html, "meta") -> [{ name, content }, ...]. */
const tags = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map(([, raw]) =>
    Object.fromEntries([...raw.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map(([, k, v]) => [k.toLowerCase(), v]))
  );

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const bodyText = (html) =>
  html
    .slice(html.search(/<body\b/i))
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

// ---- static pass -----------------------------------------------------------------

if (!existsSync(join(dist, "routes.json"))) {
  console.error("verify-build: dist/routes.json not found — run `npm run build` first");
  process.exit(1);
}
const { routes } = readJson(join(dist, "routes.json"));
const paths = routes.map((r) => r.path);
if (paths.length === 0) fail("routes.json", "no routes");

const titles = new Map();
for (const path of paths) {
  const file = htmlFileFor(path);
  if (!existsSync(file)) {
    fail(path, "no prerendered HTML file");
    continue;
  }
  const html = readFileSync(file, "utf8");

  const title = decode(html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "");
  if (!title) fail(path, "missing <title>");
  else if (titles.has(title)) fail(path, `<title> duplicates ${titles.get(title)}: "${title}"`);
  else titles.set(title, path);

  const canonical = tags(html, "link").find((l) => l.rel === "canonical")?.href;
  if (canonical !== `${SITE}${path}`) fail(path, `canonical is "${canonical}", expected "${SITE}${path}"`);

  const metas = tags(html, "meta");
  const description = metas.find((m) => m.name === "description")?.content ?? "";
  if (description.trim().length < 50) fail(path, "meta description missing or too short");
  if (/noindex/i.test(metas.find((m) => m.name === "robots")?.content ?? "")) fail(path, "indexable route is marked noindex");
  if (metas.find((m) => m.property === "og:image")?.content !== `${SITE}/og-image.jpg`) fail(path, "og:image is not the site image");

  const jsonLd = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if (jsonLd.length === 0) fail(path, "no JSON-LD");
  for (const [, body] of jsonLd) {
    try {
      JSON.parse(body);
    } catch (err) {
      fail(path, `JSON-LD does not parse: ${err.message}`);
    }
  }

  const h1 = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1 !== 1) fail(path, `${h1} <h1> elements, expected exactly 1`);

  const text = bodyText(html);
  if (text.length < MIN_STATIC_TEXT) fail(path, `only ${text.length} chars of body text in the static HTML`);

  // A scroll reveal the prerenderer never triggered: present in the HTML, invisible
  // to anyone reading it without JavaScript. Every reveal primitive renders its final
  // state under isStill() (src/lib/motion.ts); each of these is the mark one of them
  // leaves when it did not.
  const unrevealed = (html.match(/style="[^"]*opacity: 0;[^"]*transition:/g) ?? []).length;
  if (unrevealed) fail(path, `${unrevealed} scroll-reveal block(s) captured at opacity 0`);
  // SplitReveal: per-word masks only exist in its animated render.
  const splitWords = (html.match(/data-split-word/g) ?? []).length;
  if (splitWords) fail(path, `${splitWords} SplitReveal word(s) captured in their masked, animated state`);
  // Masked lines parked under (or over) their window: SplitReveal, the journey's stage copy.
  const parked = (html.match(/style="[^"]*transform: translate3d\(0(?:px)?, (?:calc\()?-?1\d\d%[^"]*transition:/g) ?? []).length;
  if (parked) fail(path, `${parked} masked line(s) captured outside their mask`);
  // DrawnRule / SectionMarker: a hairline that was never drawn.
  const undrawn = (html.match(/style="[^"]*transform: scale[XY]\(0\);[^"]*transition:/g) ?? []).length;
  if (undrawn) fail(path, `${undrawn} drawn rule(s) captured at scale 0`);
  // ImageReveal: a photograph still waiting behind its closed frame. It waits at
  // opacity 0 now (kept in the accessibility tree); visibility is the older mark.
  const framed = (html.match(/data-image-reveal=""[^>]*(?:visibility: hidden|opacity: 0)/g) ?? []).length;
  if (framed) fail(path, `${framed} ImageReveal frame(s) captured hidden`);
}

// Every HTML file in dist, not only the routed ones (404.html, anything stray).
const config = existsSync(join(dist, "staticwebapp.config.json")) ? readJson(join(dist, "staticwebapp.config.json")) : null;
const csp = config?.globalHeaders?.["Content-Security-Policy"] ?? "";
for (const file of htmlFiles(dist)) {
  const name = relative(dist, file).replaceAll("\\", "/");
  const html = readFileSync(file, "utf8");
  // Hashed asset names are random letters; keep them out of a word search.
  const searchable = html.replace(/\/assets\/[\w.@-]+/g, "");
  const hit = searchable.match(FORBIDDEN);
  if (hit) {
    const context = searchable.slice(Math.max(0, hit.index - 40), hit.index + 40).replace(/\s+/g, " ");
    fail(name, `forbidden text "${hit[0]}" in "…${context}…"`);
  }
  if (/127\.0\.0\.1|localhost/.test(html)) fail(name, "contains a local development URL");
  for (const hash of inlineScriptHashes(html)) {
    if (!csp.includes(hash)) fail(name, `inline script ${hash} is not allowed by the Content-Security-Policy`);
  }
}

if (!config) fail("staticwebapp.config.json", "missing from dist");
else if (JSON.stringify(config).includes(CSP_HASH_TOKEN)) fail("staticwebapp.config.json", "CSP hash placeholder was not replaced");

const notFound = existsSync(join(dist, "404.html")) ? readFileSync(join(dist, "404.html"), "utf8") : "";
if (!notFound) fail("404.html", "missing");
else {
  if (!/noindex/i.test(tags(notFound, "meta").find((m) => m.name === "robots")?.content ?? "")) fail("404.html", "not marked noindex");
  if ((notFound.match(/<h1[\s>]/gi) ?? []).length !== 1) fail("404.html", "expected exactly one <h1>");
}

const sitemap = existsSync(join(dist, "sitemap.xml")) ? readFileSync(join(dist, "sitemap.xml"), "utf8") : "";
for (const path of paths) {
  if (!sitemap.includes(`<loc>${SITE}${path}</loc>`)) fail("sitemap.xml", `missing ${path}`);
}
const robots = existsSync(join(dist, "robots.txt")) ? readFileSync(join(dist, "robots.txt"), "utf8") : "";
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail("robots.txt", "missing the Sitemap line");

const ogImage = join(dist, "og-image.jpg");
if (!existsSync(ogImage)) fail("og-image.jpg", "missing — run `npm run og-image`");
else if (statSync(ogImage).size > OG_IMAGE_MAX_BYTES) fail("og-image.jpg", `${statSync(ogImage).size} bytes, over the 300 KB budget`);

console.log(`static: ${paths.length} routes, ${htmlFiles(dist).length} HTML files checked`);

// ---- live pass -------------------------------------------------------------------

const server = await serveDist(dist, { headers: config?.globalHeaders ?? {} });
const browser = await chromium.launch();

/** Opens `path` in a fresh browser profile and hands the page to `inspect`. */
async function visit(path, viewport, confirmed, inspect) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  if (confirmed) {
    await context.addInitScript((key) => localStorage.setItem(key, String(Date.now())), AGE_KEY);
  }
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  try {
    const response = await page.goto(`${server.base}${path}`, { waitUntil: "networkidle", timeout: TIMEOUT });
    await page.waitForFunction(() => document.querySelector("#root h1") !== null, null, { timeout: TIMEOUT });
    await inspect(page, errors, response);
  } catch (err) {
    errors.push(err.message.split("\n")[0]);
  }
  await context.close();
  return errors;
}

async function inspectPage(page, errors, gateExpected) {
  const gateShown = await page.locator('[role="dialog"][aria-modal="true"]').isVisible();
  if (gateShown !== gateExpected) errors.push(gateExpected ? "age gate did not appear" : "age gate shown to a confirmed visitor");

  // What LazyImage itself would call "on screen": IntersectionObserver accounts for
  // carousel slides that sit inside the window but are clipped by their track.
  const imagesLoaded = () =>
    new Promise((done) => {
      if (document.images.length === 0) return done(true);
      const observer = new IntersectionObserver((entries) => {
        observer.disconnect();
        done(entries.filter((e) => e.isIntersecting).every((e) => e.target.complete && e.target.naturalWidth > 0));
      });
      for (const img of document.images) observer.observe(img);
    });
  let pending = true;
  for (let waited = 0; pending && waited < 15000; waited += 300) {
    pending = !(await page.evaluate(imagesLoaded));
    if (pending) await page.waitForTimeout(300);
  }
  if (pending) errors.push("an image in the first viewport did not load");

  const { textLength, scrollWidth, innerWidth, h1 } = await page.evaluate(() => ({
    textLength: document.body.innerText.length,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    h1: document.querySelectorAll("#root h1").length,
  }));
  if (textLength < MIN_VISIBLE_TEXT) errors.push(`only ${textLength} chars of visible text`);
  if (scrollWidth > innerWidth + 1) errors.push(`horizontal overflow: page is ${scrollWidth}px wide in a ${innerWidth}px window`);
  if (h1 !== 1) errors.push(`${h1} <h1> elements after client render`);
}

const jobs = paths.flatMap((path) =>
  VIEWPORTS.flatMap((viewport) => [false, true].map((confirmed) => ({ path, viewport, confirmed })))
);
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < jobs.length) {
      const { path, viewport, confirmed } = jobs[next++];
      const errors = await visit(path, viewport, confirmed, (page, errs) => inspectPage(page, errs, !confirmed));
      const label = `${path} @ ${viewport.name}, ${confirmed ? "age confirmed" : "age gate up"}`;
      for (const e of errors) fail(label, e);
      console.log(`  ${errors.length ? "FAIL" : "ok  "} ${label}`);
    }
  })
);

// The gate itself: shown to a new visitor, gone after "Yes", and remembered.
for (const viewport of VIEWPORTS) {
  const label = `age gate @ ${viewport.name}`;
  const errors = await visit("/", viewport, false, async (page, errs) => {
    const dialog = page.locator('[role="dialog"][aria-modal="true"]');
    await dialog.waitFor({ state: "visible", timeout: 10000 });
    if (!(await page.evaluate(() => document.getElementById("root").hasAttribute("inert")))) errs.push("page behind the gate is not inert");
    await dialog.getByRole("button", { name: /^yes/i }).click();
    await dialog.waitFor({ state: "hidden", timeout: 10000 });
    const state = await page.evaluate((key) => ({
      inert: document.getElementById("root").hasAttribute("inert"),
      pending: document.documentElement.classList.contains("age-pending"),
      stored: Number(localStorage.getItem(key)) > 0,
    }), AGE_KEY);
    if (state.inert) errs.push("page is still inert after confirming");
    if (state.pending) errs.push("page is still hidden (age-pending) after confirming");
    if (!state.stored) errs.push("confirmation was not remembered");
    await page.reload({ waitUntil: "networkidle" });
    if (await dialog.isVisible()) errs.push("gate came back after a reload");
  });
  for (const e of errors) fail(label, e);
  console.log(`  ${errors.length ? "FAIL" : "ok  "} ${label}`);
}

// Unknown URLs: a real 404 status, carrying the not-found page.
{
  const label = "unknown URL";
  const errors = await visit("/no-such-page", VIEWPORTS[1], true, async (page, errs, response) => {
    if (response.status() !== 404) errs.push(`status ${response.status()}, expected 404`);
    const robotsMeta = await page.evaluate(() => document.querySelector('meta[name="robots"]')?.content ?? "");
    if (!/noindex/i.test(robotsMeta)) errs.push("not marked noindex after client render");
  });
  // Chromium logs the 404 document itself as a console error; that one is the point.
  for (const e of errors.filter((e) => !/status of 404/.test(e))) fail(label, e);
  console.log(`  ${problems.some((p) => p.startsWith(label)) ? "FAIL" : "ok  "} ${label}`);
}

await browser.close();
await server.close();

if (problems.length) {
  console.error(`\nverify-build FAILED (${problems.length}):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`\nverify-build: ${paths.length} routes pass the static and live checks`);
