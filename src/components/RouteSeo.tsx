import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import Seo from './Seo';
import {
  ORGANIZATION_JSONLD,
  ROUTE_BY_PATH,
  breadcrumbJsonLd,
  normalisePath,
  productJsonLd,
} from '@/seo/routeMeta';

/**
 * Applies per-route metadata for the whole app from one place: a route exists for
 * SEO purposes if and only if it is in ROUTES (src/seo/routeMeta.ts). Unknown paths
 * (the 404 page) are marked noindex so soft-404s never get indexed.
 */
export default function RouteSeo() {
  const { pathname } = useLocation();
  const path = normalisePath(pathname);
  const route = ROUTE_BY_PATH[path];

  const jsonLd = useMemo(() => {
    if (!route) return undefined;
    const blocks: Record<string, unknown>[] = [ORGANIZATION_JSONLD];
    if (route.breadcrumbs.length) blocks.push(breadcrumbJsonLd(route));
    const product = productJsonLd(route);
    if (product) blocks.push(product);
    return blocks;
  }, [route]);

  if (!route) {
    return (
      <Seo
        title="Page not found"
        description="The page you are looking for is not available on aktcl.com."
        path={path}
        noindex
      />
    );
  }

  return <Seo title={route.title} description={route.description} path={path} jsonLd={jsonLd} />;
}
