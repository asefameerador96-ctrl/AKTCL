import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader, {
  ArrowTravel,
  DISPLAY_H2,
  DrawnRule,
  GROUP_UNDERLINE,
  LABEL,
  TEXT_LINK,
} from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import FormatCard from '@/components/FormatCard';
import Reveal from '@/components/Reveal';
import Parallax from '@/components/motion/Parallax';
import SplitReveal from '@/components/motion/SplitReveal';
import { categories, productsIntro, type ProductCategory } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';

// Same gutters as the navbar and footer, so page content lines up with the chrome.
const WRAP = 'mx-auto max-w-7xl px-4 sm:px-6';

const pad = (n: number) => String(n).padStart(2, '0');

const enquiryHref = (product: string) => `/contact?product=${encodeURIComponent(product)}`;

/**
 * Leaf products have photography and their own pages, so they show as image cards.
 * The cigarette formats have one line of copy each and no pages, so they show as
 * format cards whose only onward route is an enquiry.
 */
const CategoryGrid = ({ category }: { category: ProductCategory }) => {
  const base = `/products/${category.slug}`;

  if (category.slug === 'finished-cigarettes') {
    return (
      <ul role="list" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {category.products.map((product, i) => (
          <Reveal as="li" key={product.slug} delay={(i % 3) * 0.08} className="h-full">
            <FormatCard
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
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {category.products.map((product, i) => (
        <ProductCard
          key={product.slug}
          to={product.hasDetailPage ? `${base}/${product.slug}` : undefined}
          image={productImages[product.slug]?.[0] ?? categoryImages[category.slug]}
          name={product.name}
          short={product.short}
          // The stagger restarts on every desktop row: a row is what comes into view.
          index={i % 4}
        />
      ))}
    </div>
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
      meta={`${pad(categories.length)} Categories`}
      lead={productsIntro.short}
    />

    {/* The long introduction, set in two columns like a magazine's opening paragraph.
        data-enter: it can share the first screen with the masthead (see index.css). */}
    <div data-enter="" className={`${WRAP} pb-20 md:pb-28`}>
      <Reveal className="grid gap-x-16 gap-y-6 lg:grid-cols-12">
        <p className={`${LABEL} lg:col-span-3`}>Overview</p>
        <p className="text-base/[1.75] text-muted-foreground md:text-[1.0625rem]/[1.75] lg:col-span-9 lg:columns-2 lg:gap-x-16">
          {productsIntro.long}
        </p>
      </Reveal>
    </div>

    {categories.map((category, i) => (
      <section
        key={category.slug}
        aria-labelledby={`${category.slug}-heading`}
        className="overflow-x-clip border-t border-border py-20 md:py-28"
      >
        <div className={WRAP}>
          <div className="relative grid items-end gap-x-16 gap-y-8 lg:grid-cols-12">
            {/* The category's number, outlined and adrift behind the header: decoration. */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-6 right-0 hidden md:block lg:-top-10">
              <Parallax speed={0.06}>
                <p className="font-display text-[length:clamp(8rem,17vw,15rem)] font-normal leading-[0.8] tracking-[-0.04em] text-outline text-accent opacity-40">
                  {pad(i + 1)}
                </p>
              </Parallax>
            </div>

            <div className="relative lg:col-span-7">
              <Reveal as="p" from="none" className="eyebrow">
                {category.eyebrow}
              </Reveal>
              <SplitReveal
                as="h2"
                id={`${category.slug}-heading`}
                text={category.title}
                className={`mt-4 ${DISPLAY_H2}`}
              />
            </div>
          </div>

          <DrawnRule className="mt-8 md:mt-12" delay={0.15} />

          <Reveal delay={0.2} className="mt-6 grid gap-x-16 gap-y-4 md:mt-8 lg:grid-cols-12">
            <p className="max-w-2xl text-base/relaxed text-muted-foreground md:text-lg/relaxed lg:col-span-6 lg:col-start-7">
              {category.short}
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-1 lg:col-span-6 lg:col-start-7">
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

          <div className="mt-12 md:mt-16">
            <CategoryGrid category={category} />
          </div>
        </div>
      </section>
    ))}
  </PageLayout>
);

export default ProductsIndex;
