import { useParams, Link } from 'react-router-dom';
import DetailPage from '@/components/DetailPage';
import { ArrowTravel, SectionHead } from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import SpecCard from '@/components/SpecCard';
import NotFound from '@/pages/NotFound';
import { categoryBySlug, productBySlug } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';

/*
 * Row labels for the data sheet while the workbook holds no technical values: every
 * one renders as "On request" (see SpecCard). Whole leaf is traded on grade and
 * chemistry, processed tobacco on its physical properties — hence two sets.
 */
const LEAF_LABELS = ['Type', 'Grades', 'Packing', 'Nicotine', 'Sugar', 'Crop Year', 'Minimum Order'];
const PROCESSED_LABELS = ['Form', 'Cut Width', 'Moisture', 'Filling Value', 'Packing', 'Minimum Order'];
const LEAF_SLUGS = new Set(['virginia-flue-cured', 'burley', 'scrap']);

const pad = (n: number) => String(n).padStart(2, '0');

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
      // Its place in the range, in the masthead's mono index.
      counter={`${pad(index + 1)} / ${pad(siblings.length)}`}
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
            <SectionHead
              number="02"
              label="Product Range"
              meta={`${pad(others.length)} Products`}
              title={`More ${category.label}`}
              id="more-products-heading"
            />
            <ul role="list" className="hairline-grid mt-14 grid grid-cols-2 md:mt-20 lg:grid-cols-4">
              {others.map((other, i) => (
                <li key={other.slug} className="min-w-0">
                  <ProductCard
                    to={`${categoryPath}/${other.slug}`}
                    image={productImages[other.slug]?.[0] ?? categoryImages[category.slug]}
                    name={other.name}
                    short={other.short}
                    // Only the column matters: the stagger restarts on every row of the grid.
                    index={i}
                    // Its number in the full range, so a product keeps it from page to page.
                    number={siblings.indexOf(other) + 1}
                  />
                </li>
              ))}
              {/* The grid's closing cell: back to the whole category. It also squares
                  off a row the products alone would leave short. */}
              <li className="min-w-0">
                <Link
                  to={categoryPath}
                  data-cursor="open"
                  className="group relative flex h-full min-h-40 flex-col justify-between gap-10 px-3.5 pb-6 pt-4 text-foreground transition-colors hover:text-accent focus-visible:z-10 focus-visible:text-accent sm:px-5 sm:pb-7 sm:pt-5"
                >
                  <span className="index-num uppercase">{pad(category.products.length)} Products</span>
                  <span className="flex items-end justify-between gap-4">
                    <span className="display-xs">All {category.label}</span>
                    <ArrowTravel className="mb-1.5" />
                  </span>
                </Link>
              </li>
            </ul>
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
