import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader, {
  ArrowTravel,
  BODY,
  DrawnRule,
  GROUP_UNDERLINE,
  TEXT_LINK,
  WRAP,
} from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import FormatCard from '@/components/FormatCard';
import Reveal from '@/components/Reveal';
import SectionMarker from '@/components/SectionMarker';
import SplitReveal from '@/components/motion/SplitReveal';
import { categories, productsIntro, type ProductCategory } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

const enquiryHref = (product: string) => `/contact?product=${encodeURIComponent(product)}`;

/**
 * Leaf products have photography and their own pages, so they are cells of the
 * shared-border catalogue grid. The cigarette formats have one line of copy each and
 * no pages, so they are directory rows whose one action is an enquiry.
 */
const CategoryRange = ({ category }: { category: ProductCategory }) => {
  const base = `/products/${category.slug}`;

  if (category.slug === 'finished-cigarettes') {
    return (
      // Each row draws its own top hairline; the list closes the last one.
      <ul role="list" className="border-b border-border">
        {category.products.map((product, i) => (
          <Reveal as="li" key={product.slug} delay={Math.min(i, 3) * 0.07}>
            <FormatCard
              layout="row"
              name={product.name}
              short={product.short}
              rows={product.specs}
              to={product.hasDetailPage ? `${base}/${product.slug}` : enquiryHref(product.name)}
            />
          </Reveal>
        ))}
      </ul>
    );
  }

  return (
    <ul role="list" className="hairline-grid grid grid-cols-2 lg:grid-cols-4">
      {category.products.map((product, i) => (
        <li key={product.slug} className="min-w-0">
          <ProductCard
            to={product.hasDetailPage ? `${base}/${product.slug}` : undefined}
            image={productImages[product.slug]?.[0] ?? categoryImages[category.slug]}
            name={product.name}
            short={product.short}
            // Only the column matters: the stagger restarts on every row of the grid.
            index={i}
          />
        </li>
      ))}
    </ul>
  );
};

/** /products — the two categories, each with its full range. */
const ProductsIndex = () => (
  <PageLayout>
    <PageHeader
      breadcrumbs={ROUTE_BY_PATH['/products']?.breadcrumbs ?? [{ name: 'Products', path: '/products' }]}
      eyebrow={productsIntro.eyebrow}
      title={productsIntro.heading}
      italicWords={['Our']}
      lead={productsIntro.short}
    />

    {/* The long introduction hangs from the masthead's closing rule: a 5/7 split, the
        label alone in the narrow cell. data-enter: it can share the first screen with
        the masthead (see index.css). */}
    <section aria-label="Overview" data-enter="" className={WRAP}>
      <Reveal className="relative grid lg:grid-cols-12">
        <span aria-hidden="true" className="absolute inset-y-0 left-[41.666667%] hidden w-px bg-border lg:block" />
        <p className="eyebrow pt-6 lg:col-span-5 lg:pt-10">Overview</p>
        <p className={`${BODY} pt-5 lg:col-span-7 lg:pb-24 lg:pl-8 lg:pt-10`}>{productsIntro.long}</p>
      </Reveal>
    </section>

    {categories.map((category, i) => (
      <section
        key={category.slug}
        aria-labelledby={`${category.slug}-heading`}
        className={cn(
          WRAP,
          // The first head closes the overview's split on a desktop, so no gap there.
          i === 0 ? 'pt-20 lg:pt-0' : 'pt-24 md:pt-36',
          i === categories.length - 1 && 'pb-24 md:pb-36'
        )}
      >
        {/* The category's head: a ruled 7/5 split — name over the wide cell, its line
            and onward links over the narrow one. The range below closes it. */}
        <DrawnRule />
        <div className="relative grid lg:grid-cols-12">
          <DrawnRule axis="y" delay={0.2} className="absolute inset-y-0 left-[58.333333%] hidden lg:block" />

          <div className="pb-10 pt-4 md:pt-5 lg:col-span-7 lg:pb-20 lg:pr-8">
            {/* The workbook's "Category 01" without its number: the order of the two
                categories is not information. */}
            <SectionMarker>Category</SectionMarker>
            <SplitReveal
              as="h2"
              id={`${category.slug}-heading`}
              text={category.title}
              className="display-lg mt-12 max-w-[12ch] text-foreground md:mt-20"
            />
          </div>

          <Reveal delay={0.15} className="pb-12 lg:col-span-5 lg:self-end lg:pb-20 lg:pl-8">
            <p className="lead">{category.short}</p>
            <div className="mt-5 flex flex-wrap gap-x-10 gap-y-1">
              <Link to={`/products/${category.slug}`} data-cursor="open" className={TEXT_LINK}>
                <span className={GROUP_UNDERLINE}>View {category.label}</span>
                <ArrowTravel />
              </Link>
              <Link
                to={enquiryHref(category.label)}
                data-lead={`products-enquire-${category.slug}`}
                data-cursor="enquire"
                className={TEXT_LINK}
              >
                <span className={GROUP_UNDERLINE}>
                  Enquire
                  <span className="sr-only"> about {category.label}</span>
                </span>
                <ArrowTravel direction="up-right" />
              </Link>
            </div>
          </Reveal>
        </div>

        <CategoryRange category={category} />
      </section>
    ))}
  </PageLayout>
);

export default ProductsIndex;
