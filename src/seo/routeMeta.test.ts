import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { journey } from '@/content/journey';
import { categories } from '@/content/products';
import { ROUTES, ROUTE_BY_PATH, SITE, normalisePath } from './routeMeta';

// Text modules only: routeMeta imports no images, so this runs without the Vite
// image pipeline. Files are read relative to the repo root, where vitest runs.
const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');

const paths = ROUTES.map((r) => r.path);

/** <Route path="..."> patterns declared in App.tsx, minus the catch-all. */
const appPatterns = [...read('src/App.tsx').matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((pattern) => pattern !== '*');

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
