import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader, {
  ArrowTravel,
  BODY,
  DrawnRule,
  GROUP_UNDERLINE,
  SECTION_B,
  SECTION_GAP,
  SECTION_T,
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
 * shared-border catalogue grid — every cell the same width, every frame the same 3:4.
 * The cigarette formats have one line of copy each and (bar one) no pages, so they are
 * directory rows whose one action is an enquiry or, where a page exists, the page.
 */
const CategoryRange = ({ category }: { category: ProductCategory }) => {
  const base = `/products/${category.slug}`;

  if (category.slug === 'finished-cigarettes') {
    return (
      // Each row draws its own top hairline; the list closes the last one.
      <ul role="list" className="border-b border-border">
        {category.products.map((product, i) => (
          <Reveal as="li" key={product.slug} delay={Math.min(i, 3) * 0.05}>
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
    />

    {/* The introduction hangs from the masthead's closing rule: the short line as a
        display standfirst over the narrow cell, the long one beside it with its label
        set over it — both cells carry copy, top-aligned, so neither is an empty column.
        data-enter="view": it shares the first screen with the masthead, so the
        prerendered copy waits unpainted for the app (see index.css). */}
    <section aria-label="Overview" className={WRAP}>
      <div className={cn('grid gap-y-10 lg:grid-cols-12 lg:gap-x-8', SECTION_GAP)}>
        <div data-enter="view" className="lg:col-span-5">
          <Reveal as="p" className="display-xs max-w-[30ch] leading-[1.18] text-foreground">
            {productsIntro.short}
          </Reveal>
        </div>
        <div data-enter="view" className="lg:col-span-7">
          <Reveal delay={0.08}>
            <SectionMarker>Overview</SectionMarker>
            <p className={`${BODY} mt-5`}>{productsIntro.long}</p>
          </Reveal>
        </div>
      </div>
    </section>

    {categories.map((category, i) => (
      <section
        key={category.slug}
        aria-labelledby={`${category.slug}-heading`}
        className={cn(WRAP, SECTION_T, i === categories.length - 1 && SECTION_B)}
      >
        {/* The category's head, in one column: its rule and marker, the name, its line
            and onward links straight under the name — headline and copy together, no
            cell left empty beside them. The range below closes it. */}
        <DrawnRule />
        <div className="pb-10 pt-4 md:pb-12 md:pt-5">
          {/* The workbook's "Category 01" without its number: the order of the two
              categories is not information. */}
          <SectionMarker>Category</SectionMarker>
          <SplitReveal
            as="h2"
            id={`${category.slug}-heading`}
            text={category.title}
            className="display-lg mt-6 max-w-[16ch] text-foreground md:mt-8"
          />
          <Reveal delay={0.1} className="mt-5 md:mt-6">
            <p className="lead">{category.short}</p>
            <div className="mt-4 flex flex-wrap gap-x-10 gap-y-1">
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
