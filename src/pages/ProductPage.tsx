import { useParams } from 'react-router-dom';
import DetailPage from '@/components/DetailPage';
import { SectionHead } from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import SpecCard from '@/components/SpecCard';
import { RowLink } from '@/components/Ruled';
import NotFound from '@/pages/NotFound';
import { categoryBySlug, paragraphs, productBySlug } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

/*
 * Row labels for the leaf data sheet while the workbook holds no technical values:
 * every one renders as "On request" (see SpecCard). Whole leaf is traded on grade and
 * chemistry, processed tobacco on its physical properties — hence two sets. Finished
 * cigarettes have no template: a product page there (AKT Signature Collection) shows
 * a data sheet only once AKTCL supplies real rows, and its "Enquire Now" is the route
 * to a specification meanwhile.
 */
const LEAF_LABELS = ['Type', 'Grades', 'Packing', 'Nicotine', 'Sugar', 'Crop Year', 'Minimum Order'];
const PROCESSED_LABELS = ['Form', 'Cut Width', 'Moisture', 'Filling Value', 'Packing', 'Minimum Order'];
const LEAF_SLUGS = new Set(['virginia-flue-cured', 'burley', 'scrap']);
const LEAF_CATEGORY = 'leaf-tobacco';

/** "More …" is one full row: never a short row, never an empty ruled cell. */
const RELATED_MAX = 4;
// Static class names, so Tailwind sees them. Every cell the same width — a quarter of
// the sheet from lg, as in the catalogue — and the grid only as wide as its cells.
const RELATED_COLUMNS: Record<number, string> = {
  1: 'grid-cols-1 max-w-[20rem]',
  2: 'grid-cols-2 lg:max-w-[50%]',
  3: 'grid-cols-1 sm:grid-cols-3 lg:max-w-[75%]',
  4: 'grid-cols-2 lg:grid-cols-4',
};

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
  // The ones that follow this product in the range, wrapping round, one row's worth.
  const others = [...siblings.slice(index + 1), ...siblings.slice(0, index)].slice(0, RELATED_MAX);

  const templateLabels =
    category.slug === LEAF_CATEGORY ? (LEAF_SLUGS.has(product.slug) ? LEAF_LABELS : PROCESSED_LABELS) : [];
  const hasSheet = product.specs.length > 0 || templateLabels.length > 0;

  return (
    <DetailPage
      breadcrumbs={
        ROUTE_BY_PATH[path]?.breadcrumbs ?? [
          { name: 'Products', path: '/products' },
          { name: category.label, path: categoryPath },
          { name: product.name, path },
        ]
      }
      // No "03 / 08" counter: a product's place in the list is not information.
      eyebrow={category.label}
      title={product.name}
      lead={product.short}
      // The workbook splits some long descriptions into paragraphs (AKT Signature
      // Collection has two); each is set as its own paragraph.
      body={paragraphs(product.long)}
      // A product without photography of its own (AKT Signature Collection: its image
      // is still to be supplied) shows its category's cover.
      images={productImages[product.slug] ?? [categoryImages[category.slug]]}
      containImages
      enquiryProduct={product.name}
      specs={
        hasSheet ? <SpecCard rows={product.specs} templateLabels={templateLabels} product={product.name} /> : undefined
      }
      related={
        others.length > 0 && (
          <section aria-labelledby="more-products-heading">
            <SectionHead label="Product Range" title={`More ${category.label}`} id="more-products-heading" />
            <ul
              role="list"
              className={cn('hairline-grid mt-10 grid md:mt-12', RELATED_COLUMNS[others.length] ?? RELATED_COLUMNS[4])}
            >
              {others.map((other, i) => (
                <li key={other.slug} className="min-w-0">
                  <ProductCard
                    to={`${categoryPath}/${other.slug}`}
                    image={productImages[other.slug]?.[0] ?? categoryImages[category.slug]}
                    name={other.name}
                    short={other.short}
                    // Only the column matters: the stagger restarts on every row of the grid.
                    index={i}
                  />
                </li>
              ))}
            </ul>
            {/* The directory's closing row: back to the whole category. */}
            <RowLink to={categoryPath} display className="border-t-0 border-b">
              All {category.label}
            </RowLink>
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
