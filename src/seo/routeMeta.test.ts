import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FEATURES } from '@/content/features';
import { journey } from '@/content/journey';
import { categories, paragraphs } from '@/content/products';
import { SPEC_GROUPS, SPEC_LABELS, cigaretteSizes, sizeBySlug } from '@/content/sizes';
import { ROUTES, ROUTE_BY_PATH, SITE, normalisePath } from './routeMeta';

// Text modules only: routeMeta imports no images, so this runs without the Vite
// image pipeline. Files are read relative to the repo root, where vitest runs.
const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');

const paths = ROUTES.map((r) => r.path);

/** The parked Cigarette Sizes segment: the index and everything under it. */
const SIZES_PATH = '/cigarette-sizes';
const isSizesPath = (path: string) => path === SIZES_PATH || path.startsWith(`${SIZES_PATH}/`);

/** <Route path="..."> patterns in a piece of JSX source, minus the catch-all. */
const routePatterns = (source: string) =>
  [...source.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]).filter((pattern) => pattern !== '*');

const appSource = read('src/App.tsx');

/** App.tsx's `{FEATURES.cigaretteSizes && ( … )}` block: routes registered only while the flag is on. */
const sizesGate = appSource.match(/\{FEATURES\.cigaretteSizes && \(([\s\S]*?)\)\}/);
const gatedPatterns = routePatterns(sizesGate?.[1] ?? '');

/** The patterns App.tsx registers with the flags as they are now. */
const appPatterns = routePatterns(appSource).filter(
  (pattern) => FEATURES.cigaretteSizes || !gatedPatterns.includes(pattern)
);

/** "/journey/:slug" matches "/journey/seed": same depth, ":param" matches any one segment. */
const matches = (pattern: string, path: string) => {
  const want = pattern.split('/');
  const have = path.split('/');
  return (
    want.length === have.length &&
    want.every((segment, i) => (segment.startsWith(':') ? have[i].length > 0 : segment === have[i]))
  );
};

describe('ROUTES', () => {
  it('is not empty and starts with the homepage', () => {
    expect(ROUTES.length).toBeGreaterThan(0);
    expect(paths[0]).toBe('/');
  });

  it('has unique, well-formed paths', () => {
    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(path.startsWith('/'), `${path} starts with "/"`).toBe(true);
      if (path !== '/') expect(path.endsWith('/'), `${path} has no trailing slash`).toBe(false);
      // The canonical form is what normalisePath produces; a route that is not
      // already in that form could never be looked up.
      expect(normalisePath(path)).toBe(path);
    }
  });

  it('has unique titles of at most 70 characters', () => {
    const titles = ROUTES.map((r) => r.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const route of ROUTES) {
      // The homepage title is used as written; every other page gets " | AKTCL".
      const rendered = route.path === '/' ? route.title : `${route.title} | AKTCL`;
      expect(route.title.length, `title of ${route.path}`).toBeGreaterThan(0);
      expect(route.title.length, `title of ${route.path}: "${route.title}"`).toBeLessThanOrEqual(70);
      expect(rendered).not.toMatch(/\s{2,}/);
    }
  });

  it('has descriptions of 50 to 200 characters', () => {
    for (const route of ROUTES) {
      expect(route.description.length, `description of ${route.path}`).toBeGreaterThanOrEqual(50);
      expect(route.description.length, `description of ${route.path}`).toBeLessThanOrEqual(200);
    }
  });

  it('ends every breadcrumb trail on the page itself', () => {
    for (const route of ROUTES.filter((r) => r.path !== '/')) {
      expect(route.breadcrumbs.at(-1)?.path, `breadcrumbs of ${route.path}`).toBe(route.path);
      for (const crumb of route.breadcrumbs) {
        expect(ROUTE_BY_PATH[crumb.path], `crumb ${crumb.path} on ${route.path}`).toBeDefined();
      }
    }
  });

  it('gives sitemap values the prerenderer can write', () => {
    for (const route of ROUTES) {
      expect(route.priority).toBeGreaterThan(0);
      expect(route.priority).toBeLessThanOrEqual(1);
      expect(['weekly', 'monthly', 'yearly']).toContain(route.changefreq);
    }
  });
});

describe('content coverage', () => {
  it('has a route for every journey stage', () => {
    for (const stage of journey) {
      expect(ROUTE_BY_PATH[`/journey/${stage.slug}`], stage.slug).toBeDefined();
    }
  });

  it('has a route for every category and every product with a detail page', () => {
    for (const category of categories) {
      expect(ROUTE_BY_PATH[`/products/${category.slug}`], category.slug).toBeDefined();
      for (const product of category.products) {
        const route = ROUTE_BY_PATH[`/products/${category.slug}/${product.slug}`];
        if (product.hasDetailPage) expect(route, product.slug).toBeDefined();
        // No page, no URL: the sitemap must not advertise a 404.
        else expect(route, product.slug).toBeUndefined();
      }
    }
  });

  it('keeps every long description free of stray whitespace, paragraph by paragraph', () => {
    for (const product of categories.flatMap((c) => c.products)) {
      if (product.long === undefined) continue;
      const parts = paragraphs(product.long);
      expect(parts.length, product.slug).toBeGreaterThan(0);
      // Paragraphs are joined by exactly one blank line and nothing else.
      expect(parts.join('\n\n'), product.slug).toBe(product.long);
    }
  });

  it('splits long descriptions on blank lines only', () => {
    expect(paragraphs(undefined)).toEqual([]);
    expect(paragraphs('One paragraph.')).toEqual(['One paragraph.']);
    expect(paragraphs('First.\n\nSecond.')).toEqual(['First.', 'Second.']);
    expect(paragraphs('First.\n \n\nSecond.\n')).toEqual(['First.', 'Second.']);
  });

  it('gives the AKT Signature Collection its page and the workbook’s two F26 paragraphs', () => {
    const finished = categories.find((c) => c.slug === 'finished-cigarettes');
    const signature = finished?.products.find((p) => p.slug === 'akt-signature-collection');
    expect(signature?.hasDetailPage).toBe(true);
    expect(paragraphs(signature?.long)).toHaveLength(2);
    expect(ROUTE_BY_PATH['/products/finished-cigarettes/akt-signature-collection']).toBeDefined();
    // Row 22 was deleted from the workbook on 2026-09-22; the Excel's order is kept.
    expect(finished?.products.map((p) => p.slug)).toEqual([
      'king-size-filter',
      'super-slim',
      'nano',
      'private-label-manufacturing',
      'akt-signature-collection',
    ]);
  });
});

/*
 * The Cigarette Sizes segment is parked behind FEATURES.cigaretteSizes
 * (src/content/features.ts, docs/feature-flags.md). The route tests run only while it is
 * live; the data tests on sizes.ts always run, so the parked content stays ready to go
 * back on.
 */
describe('cigarette sizes (parked segment)', () => {
  it('lists /cigarette-sizes routes only while FEATURES.cigaretteSizes is on', () => {
    const sizePaths = paths.filter(isSizesPath);
    if (FEATURES.cigaretteSizes) expect(sizePaths).toHaveLength(cigaretteSizes.length + 1);
    // Flag off: nothing under /cigarette-sizes is prerendered, in the sitemap or linked.
    else expect(sizePaths).toEqual([]);
  });

  it('registers the size routes in App.tsx behind the flag, and only there', () => {
    expect(sizesGate, 'App.tsx has a {FEATURES.cigaretteSizes && ( … )} block').not.toBeNull();
    expect(gatedPatterns).toEqual([SIZES_PATH, `${SIZES_PATH}/:slug`]);
    const ungated = routePatterns(appSource.replace(sizesGate?.[0] ?? '', ''));
    expect(ungated.filter(isSizesPath), 'size routes outside the gate').toEqual([]);
  });

  it.runIf(FEATURES.cigaretteSizes)(
    'has the sizes index and a route for every cigarette size, titled within 70 characters',
    () => {
      expect(ROUTE_BY_PATH[SIZES_PATH]).toBeDefined();
      for (const size of cigaretteSizes) {
        const route = ROUTE_BY_PATH[`${SIZES_PATH}/${size.slug}`];
        expect(route, size.slug).toBeDefined();
        expect(route.title.length, `title of ${SIZES_PATH}/${size.slug}: "${route.title}"`).toBeLessThanOrEqual(70);
        expect(route.breadcrumbs[0]?.path).toBe(SIZES_PATH);
        // Formats, not products: no Product JSON-LD.
        expect(route.product, size.slug).toBeUndefined();
        // The description leads with the tagline.
        expect(route.description.startsWith(size.tagline), size.slug).toBe(true);
      }
    }
  );

  it('has unique size slugs that sizeBySlug finds', () => {
    expect(new Set(cigaretteSizes.map((s) => s.slug)).size).toBe(cigaretteSizes.length);
    for (const size of cigaretteSizes) expect(sizeBySlug(size.slug)).toBe(size);
  });

  it('lists every size spec field exactly once, with a label', () => {
    const labelled = Object.keys(SPEC_LABELS).sort();
    const grouped = SPEC_GROUPS.flatMap((g) => g.keys);
    expect(new Set(grouped).size, 'no key in two groups').toBe(grouped.length);
    expect([...grouped].sort()).toEqual(labelled);
    for (const size of cigaretteSizes) {
      expect(Object.keys(size.specs).sort(), `spec keys of ${size.slug}`).toEqual(labelled);
    }
  });

  it('gives every cigarette size its copy', () => {
    for (const size of cigaretteSizes) {
      expect(size.tagline, `tagline of ${size.slug}`).toMatch(/\S.*\.$/);
      expect(size.paragraphs.length, `paragraphs of ${size.slug}`).toBeGreaterThan(0);
      expect(size.whyChoose.length, `whyChoose of ${size.slug}`).toBeGreaterThan(0);
      expect(size.bestFor.length, `bestFor of ${size.slug}`).toBeGreaterThan(0);
      for (const text of [size.tagline, ...size.paragraphs, ...size.whyChoose, ...size.bestFor]) {
        expect(text.trim(), `${size.slug}: "${text}"`).toBe(text);
        expect(text.length, `${size.slug}: empty copy`).toBeGreaterThan(0);
      }
      // (That each page's description leads with the tagline is checked with the routes,
      // above, while the segment is live.)
    }
  });

  it('types size spec values as supplied: en dashes, ×, no "~" (typical says it)', () => {
    for (const size of cigaretteSizes) {
      for (const [key, spec] of Object.entries(size.specs)) {
        if (!spec) continue;
        const where = `${size.slug}.${key}: "${spec.value}"`;
        expect(spec.value.trim(), where).toBe(spec.value);
        expect(spec.value, where).not.toMatch(/\d\s*-\s*\d/); // a range takes an en dash
        expect(spec.value, where).not.toMatch(/\d\s*[xX]\s*\d/); // a dimension takes ×
        expect(spec.value, where).not.toMatch(/~/);
      }
    }
  });

  it('keeps each size’s packaging ladder arithmetically whole', () => {
    const n = (value?: string) => Number((value ?? '').replace(/,/g, ''));
    for (const { slug, specs } of cigaretteSizes) {
      if (!specs.sticksPerPack || !specs.packsPerOuter || !specs.outersPerMasterCarton) continue;
      const packs = n(specs.packsPerOuter.value) * n(specs.outersPerMasterCarton.value);
      if (specs.packsPerMasterCarton) expect(n(specs.packsPerMasterCarton.value), slug).toBe(packs);
      if (specs.sticksPerMasterCarton) {
        expect(n(specs.sticksPerMasterCarton.value), slug).toBe(packs * n(specs.sticksPerPack.value));
      }
    }
  });
});

describe('App.tsx', () => {
  it('declares routes', () => {
    expect(appPatterns.length).toBeGreaterThan(0);
  });

  it('serves every path in ROUTES', () => {
    for (const path of paths) {
      expect(
        appPatterns.some((pattern) => matches(pattern, path)),
        `${path} is matched by a <Route> in src/App.tsx`
      ).toBe(true);
    }
  });

  it('has no static route that ROUTES does not know about', () => {
    for (const pattern of appPatterns.filter((p) => !p.includes(':'))) {
      expect(ROUTE_BY_PATH[pattern], `${pattern} is in src/seo/routeMeta.ts`).toBeDefined();
    }
  });
});

describe('static files that repeat the route list', () => {
  it('llms.txt links to every indexable page and to nothing else on the site', () => {
    const llms = read('public/llms.txt');
    const linked = new Set([...llms.matchAll(/https:\/\/www\.aktcl\.com(\/[^\s)]*)?/g)].map((m) => m[1] ?? '/'));
    for (const path of paths.filter((p) => p !== '/')) {
      expect(linked.has(path), `${path} is linked from public/llms.txt`).toBe(true);
    }
    for (const path of linked) {
      expect(ROUTE_BY_PATH[path], `${path} in public/llms.txt is a real route`).toBeDefined();
    }
  });

  it('scripts use the same site URL as the content', () => {
    expect(read('scripts/lib/site.mjs')).toContain(`export const SITE = "${SITE}";`);
  });
});
