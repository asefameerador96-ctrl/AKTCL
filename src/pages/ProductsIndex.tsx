import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import FormatCard from '@/components/FormatCard';
import Reveal from '@/components/Reveal';
import { categories, productsIntro, type ProductCategory } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';

// Same gutters as the navbar and footer, so page content lines up with the chrome.
const WRAP = 'mx-auto max-w-7xl px-4 sm:px-6';

const TEXT_LINK =
  'group inline-flex min-h-11 items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-accent transition-colors hover:text-foreground';

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
          index={i}
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
      lead={productsIntro.short}
    />

    <div className={`${WRAP} pb-16 md:pb-24`}>
      <Reveal as="p" className="max-w-3xl text-base/relaxed text-muted-foreground md:text-lg/relaxed">
        {productsIntro.long}
      </Reveal>
    </div>

    {categories.map((category) => (
      <section
        key={category.slug}
        aria-labelledby={`${category.slug}-heading`}
        className="border-t border-border py-16 md:py-24"
      >
        <div className={WRAP}>
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="max-w-2xl">
              <p className="eyebrow">{category.eyebrow}</p>
              <h2
                id={`${category.slug}-heading`}
                className="mt-4 font-display text-3xl/tight font-medium text-foreground md:text-4xl/tight lg:text-5xl/tight"
              >
                {category.title}
              </h2>
              <div className="rule mt-6" aria-hidden="true" />
              <p className="mt-6 text-base/relaxed text-muted-foreground md:text-lg/relaxed">
                {category.short}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-x-8 gap-y-1">
              <Link to={`/products/${category.slug}`} className={TEXT_LINK}>
                View {category.label}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                to={enquiryHref(category.label)}
                data-lead={`products-enquire-${category.slug}`}
                className={TEXT_LINK}
              >
                Enquire
                <span className="sr-only"> about {category.label}</span>
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 md:mt-14">
            <CategoryGrid category={category} />
          </div>
        </div>
      </section>
    ))}
  </PageLayout>
);

export default ProductsIndex;
