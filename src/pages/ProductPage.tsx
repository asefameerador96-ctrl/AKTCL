import { useParams } from 'react-router-dom';
import DetailPage from '@/components/DetailPage';
import ProductCard from '@/components/ProductCard';
import SpecCard from '@/components/SpecCard';
import NotFound from '@/pages/NotFound';
import { categoryBySlug, productBySlug } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';

/*
 * Row labels for the data card while the workbook holds no technical values: every
 * one renders as "On request" (see SpecCard). Whole leaf is traded on grade and
 * chemistry, processed tobacco on its physical properties — hence two sets.
 */
const LEAF_LABELS = ['Type', 'Grades', 'Packing', 'Nicotine', 'Sugar', 'Crop Year', 'Minimum Order'];
const PROCESSED_LABELS = ['Form', 'Cut Width', 'Moisture', 'Filling Value', 'Packing', 'Minimum Order'];
const LEAF_SLUGS = new Set(['virginia-flue-cured', 'burley', 'scrap']);

/** /products/:category/:slug — only for products flagged hasDetailPage. */
const ProductPage = () => {
  const params = useParams<{ category: string; slug: string }>();
  const category = categoryBySlug(params.category?.toLowerCase());
  const product = productBySlug(params.category?.toLowerCase(), params.slug?.toLowerCase());
  if (!category || !product || !product.hasDetailPage) return <NotFound />;

  const categoryPath = `/products/${category.slug}`;
  const path = `${categoryPath}/${product.slug}`;

  // Previous/next and "More …" only move between pages that exist.
  const siblings = category.products.filter((p) => p.hasDetailPage);
  const index = siblings.findIndex((p) => p.slug === product.slug);
  const before = siblings[index - 1];
  const after = siblings[index + 1];
  const others = siblings.filter((p) => p.slug !== product.slug);

  return (
    <DetailPage
      breadcrumbs={
        ROUTE_BY_PATH[path]?.breadcrumbs ?? [
          { name: 'Products', path: '/products' },
          { name: category.label, path: categoryPath },
          { name: product.name, path },
        ]
      }
      eyebrow={category.label}
      title={product.name}
      lead={product.short}
      body={product.long ? [product.long] : []}
      images={productImages[product.slug] ?? [categoryImages[category.slug]]}
      containImages
      enquiryProduct={product.name}
      specs={
        <SpecCard
          rows={product.specs}
          templateLabels={LEAF_SLUGS.has(product.slug) ? LEAF_LABELS : PROCESSED_LABELS}
          product={product.name}
        />
      }
      related={
        others.length > 0 && (
          <section aria-labelledby="more-products-heading">
            <p className="eyebrow">Product Range</p>
            <h2
              id="more-products-heading"
              className="mt-4 font-display text-3xl/tight font-medium text-foreground md:text-4xl/tight"
            >
              More {category.label}
            </h2>
            <div className="rule mt-6" aria-hidden="true" />
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:mt-14 lg:grid-cols-4">
              {others.map((other, i) => (
                <ProductCard
                  key={other.slug}
                  to={`${categoryPath}/${other.slug}`}
                  image={productImages[other.slug]?.[0] ?? categoryImages[category.slug]}
                  name={other.name}
                  short={other.short}
                  index={i}
                />
              ))}
            </div>
          </section>
        )
      }
      prev={before && { label: before.name, to: `${categoryPath}/${before.slug}` }}
      // The last product hands back to the full category rather than looping round.
      next={
        after
          ? { label: after.name, to: `${categoryPath}/${after.slug}` }
          : { label: `All ${category.label}`, to: categoryPath }
      }
    />
  );
};

export default ProductPage;
