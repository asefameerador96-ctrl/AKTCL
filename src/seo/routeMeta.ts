import { site } from '@/content/site';
import { journey } from '@/content/journey';
import { categories } from '@/content/products';

/**
 * The single source of truth for every indexable URL on the site.
 *
 * ROUTES is derived from the content modules, so adding a journey stage or a
 * product automatically adds its route, metadata, breadcrumb, sitemap entry and
 * prerendered page. Nothing parses this file as text: scripts/prerender.mjs reads
 * the list from the running app (window.__AKTCL_ROUTES__, set in src/main.tsx) and
 * writes dist/routes.json, sitemap.xml and robots.txt from it.
 *
 * src/seo/routeMeta.test.ts asserts that every entry here is served by App.tsx.
 */

export const SITE = site.url;
export const SITE_NAME = site.name;
export const BRAND_SUFFIX = site.shortName;

export interface Crumb {
  name: string;
  path: string;
}

export interface RouteMeta {
  path: string;
  /** Without the brand suffix — Seo.tsx appends " | AKTCL" (except on "/"). */
  title: string;
  description: string;
  /** Home is implied; list the chain after it, ending with this page. */
  breadcrumbs: Crumb[];
  /** Emits schema.org Product JSON-LD (no offers — this is not a shop). */
  product?: { name: string; category: string };
  priority: number;
  changefreq: 'weekly' | 'monthly' | 'yearly';
}

/** Search-led titles: what an importer would type, then the brand. */
const PRODUCT_SEO_TITLE: Record<string, string> = {
  'virginia-flue-cured': 'Virginia Flue-Cured (FCV) Tobacco Exporter from Bangladesh',
  burley: 'Burley Tobacco Exporter from Bangladesh',
  cutrag: 'Cut Rag (CUTRAG) Tobacco Supplier',
  cres: 'CRES — Cut Rolled Expanded Stem Supplier',
  diet: 'DIET — Dry Ice Expanded Tobacco Supplier',
  stem: 'Tobacco Stem Supplier',
  scrap: 'Tobacco Scrap Exporter',
  recon: 'Reconstituted Tobacco (RE-CON) Sheet Supplier',
};

const CATEGORY_SEO_TITLE: Record<string, string> = {
  'leaf-tobacco': 'Leaf Tobacco Exporter — FCV, Burley, Cut Rag, DIET, CRES, Stem & Recon',
  'finished-cigarettes': 'Finished Cigarettes & Private Label (OEM) Cigarette Manufacturing',
};

const JOURNEY_CRUMB: Crumb = { name: 'Our Journey', path: '/journey' };
const PRODUCTS_CRUMB: Crumb = { name: 'Products', path: '/products' };

function build(): RouteMeta[] {
  const routes: RouteMeta[] = [
    {
      path: '/',
      title: 'AKTCL | Abul Khair Tobacco — Leaf & Cigarette Exporter, Bangladesh',
      description:
        'Abul Khair Tobacco Co. Ltd. (AKTCL) — vertically integrated, from seed to smoke. Exporter of leaf tobacco, CUTRAG, DIET, CRES, RE-CON and finished cigarettes from Bangladesh. Trade enquiries only.',
      breadcrumbs: [],
      priority: 1.0,
      changefreq: 'weekly',
    },
    {
      path: '/about-us',
      title: "About AKTCL — Bangladesh's Largest Local Tobacco Company, Since 1953",
      description:
        'Shaping Bangladesh\'s tobacco industry since 1953: 50,000+ registered farmers, Green Leaf Threshing and high-speed cigarette manufacturing, and an integrated "Seed to Smoke" philosophy.',
      breadcrumbs: [{ name: 'About Us', path: '/about-us' }],
      priority: 0.8,
      changefreq: 'monthly',
    },
    {
      path: '/journey',
      title: 'From Seed to Smoke — Our Integrated Tobacco Value Chain',
      description:
        'Seven stages under one roof: seed, harvest, curing, buying, processing, manufacturing and the finished product. See how AKTCL controls quality across the whole value chain.',
      breadcrumbs: [JOURNEY_CRUMB],
      priority: 0.8,
      changefreq: 'monthly',
    },
    ...journey.map<RouteMeta>((stage) => ({
      path: `/journey/${stage.slug}`,
      title: `${stage.label} — ${stage.title}`,
      description: stage.short,
      breadcrumbs: [JOURNEY_CRUMB, { name: stage.label, path: `/journey/${stage.slug}` }],
      priority: 0.6,
      changefreq: 'monthly',
    })),
    {
      path: '/products',
      title: 'Tobacco Products for Export — Leaf Tobacco & Finished Cigarettes',
      description:
        'From premium tobacco leaf to finished cigarettes: Virginia flue-cured, Burley, CUTRAG, CRES, DIET, STEM, SCRAP, RE-CON, and own-brand, OEM and private label cigarettes.',
      breadcrumbs: [PRODUCTS_CRUMB],
      priority: 0.9,
      changefreq: 'monthly',
    },
  ];

  for (const category of categories) {
    const categoryPath = `/products/${category.slug}`;
    const categoryCrumb: Crumb = { name: category.label, path: categoryPath };
    routes.push({
      path: categoryPath,
      title: CATEGORY_SEO_TITLE[category.slug] ?? category.title,
      description: category.short,
      breadcrumbs: [PRODUCTS_CRUMB, categoryCrumb],
      priority: 0.9,
      changefreq: 'monthly',
    });
    for (const product of category.products) {
      if (!product.hasDetailPage) continue;
      const path = `${categoryPath}/${product.slug}`;
      routes.push({
        path,
        title: PRODUCT_SEO_TITLE[product.slug] ?? product.name,
        description: product.short,
        breadcrumbs: [PRODUCTS_CRUMB, categoryCrumb, { name: product.name, path }],
        product: { name: product.name, category: category.label },
        priority: 0.8,
        changefreq: 'monthly',
      });
    }
  }

  routes.push(
    {
      path: '/contact',
      title: 'Contact AKTCL — Export & Trade Enquiries',
      description:
        'Send a trade enquiry to Abul Khair Tobacco Co. Ltd. for leaf tobacco, processed tobacco, finished cigarettes or private label manufacturing. For importers, distributors and manufacturers only.',
      breadcrumbs: [{ name: 'Contact', path: '/contact' }],
      priority: 0.9,
      changefreq: 'yearly',
    },
    {
      path: '/privacy',
      title: 'Privacy Notice',
      description:
        'How aktcl.com handles the information you send through the trade enquiry form, and what the site does and does not collect.',
      breadcrumbs: [{ name: 'Privacy Notice', path: '/privacy' }],
      priority: 0.2,
      changefreq: 'yearly',
    },
    {
      path: '/terms',
      title: 'Terms of Use',
      description:
        'Terms of use for aktcl.com, a business-to-business website for tobacco trade professionals of legal age.',
      breadcrumbs: [{ name: 'Terms of Use', path: '/terms' }],
      priority: 0.2,
      changefreq: 'yearly',
    }
  );

  return routes;
}

export const ROUTES: RouteMeta[] = build();

export const ROUTE_BY_PATH: Record<string, RouteMeta> = Object.fromEntries(
  ROUTES.map((r) => [r.path, r])
);

/** Trailing slashes and casing must not produce a second canonical URL. */
export function normalisePath(pathname: string) {
  const p = pathname.replace(/\/+$/, '').toLowerCase();
  return p === '' ? '/' : p;
}

/** Only states what AKTCL has supplied; address/contact are added when site.contact is filled. */
export const ORGANIZATION_JSONLD: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE}/#organization`,
  name: site.name,
  legalName: site.legalName,
  alternateName: site.shortName,
  url: SITE,
  foundingDate: '1953',
  parentOrganization: { '@type': 'Organization', name: site.parent },
  address: { '@type': 'PostalAddress', addressCountry: 'BD' },
  ...(site.contact.email || site.contact.phone
    ? {
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          ...(site.contact.email ? { email: site.contact.email } : {}),
          ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
        },
      }
    : {}),
  ...(site.sameAs.length ? { sameAs: [...site.sameAs] } : {}),
};

export function breadcrumbJsonLd(route: RouteMeta): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      ...route.breadcrumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: c.name,
        item: `${SITE}${c.path}`,
      })),
    ],
  };
}

export function productJsonLd(route: RouteMeta): Record<string, unknown> | null {
  if (!route.product) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: route.product.name,
    category: route.product.category,
    description: route.description,
    url: `${SITE}${route.path}`,
    manufacturer: { '@id': `${SITE}/#organization` },
    countryOfOrigin: 'BD',
    audience: { '@type': 'BusinessAudience', name: 'Tobacco manufacturers, importers and distributors' },
  };
}
