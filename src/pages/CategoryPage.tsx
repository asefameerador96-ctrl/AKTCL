import { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader, { DISPLAY_H2, DrawnRule, LABEL } from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import FormatCard from '@/components/FormatCard';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import Parallax from '@/components/motion/Parallax';
import SplitReveal from '@/components/motion/SplitReveal';
import NotFound from '@/pages/NotFound';
import { categories, categoryBySlug } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

// Same gutters as the navbar and footer, so page content lines up with the chrome.
const WRAP = 'mx-auto max-w-7xl px-4 sm:px-6';

const LONG_COPY = 'max-w-[64ch] text-lg/[1.7] md:text-xl/[1.65]';

const pad = (n: number) => String(n).padStart(2, '0');

const enquiryHref = (product: string) => `/contact?product=${encodeURIComponent(product)}`;

/** /products/:category — the category's copy and its full range. */
const CategoryPage = () => {
  const params = useParams<{ category: string }>();
  const category = categoryBySlug(params.category?.toLowerCase());
  if (!category) return <NotFound />;

  const path = `/products/${category.slug}`;
  const cover = categoryImages[category.slug];
  // The cigarette formats have no pages or photography of their own: one shared pack
  // shot opens the page and each format card leads straight to an enquiry.
  const isFormats = category.slug === 'finished-cigarettes';

  return (
    <PageLayout enquiryProduct={category.label}>
      {/* Keyed so moving between the two categories replays the entrances. */}
      <Fragment key={category.slug}>
        <PageHeader
          breadcrumbs={
            ROUTE_BY_PATH[path]?.breadcrumbs ?? [
              { name: 'Products', path: '/products' },
              { name: category.label, path },
            ]
          }
          eyebrow={category.eyebrow}
          title={category.title}
          meta={`${pad(categories.indexOf(category) + 1)} / ${pad(categories.length)}`}
          lead={category.short}
        />

        {isFormats && cover ? (
          // Full-bleed light panel: the tile is light in both themes, so its text takes
          // the tile's own foreground, never the page's (which is ivory in dark mode).
          <section
            aria-label="Overview"
            className="relative isolate overflow-hidden bg-tile text-tile-foreground"
          >
            <div className={`${WRAP} grid lg:grid-cols-12`}>
              <div data-enter="" className="py-16 md:py-24 lg:col-span-5 lg:py-36">
                <Reveal>
                  <p className={cn(LABEL, 'text-tile-foreground/70')}>Overview</p>
                  <p className={`mt-6 ${LONG_COPY} text-tile-foreground/85`}>{category.long}</p>
                </Reveal>
              </div>
            </div>
            {/* The pack shot: under the copy on a phone, the panel's whole right half
                from lg. Its studio sweep is a shade off the tile, so the edge that meets
                the panel is feathered out rather than left as a seam. */}
            <div className="relative aspect-[4/3] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%)] sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[52%] lg:[mask-image:linear-gradient(to_right,transparent,black_22%)]">
              <Parallax speed={0.07} className="h-full w-full">
                <LazyImage
                  image={cover.image}
                  alt={cover.alt}
                  sizes="(min-width: 1024px) 58vw, 110vw"
                  priority
                  // scale: the bleed that covers the parallax travel.
                  className="product-shot h-full w-full scale-110 object-cover object-[50%_82%]"
                />
              </Parallax>
            </div>
          </section>
        ) : (
          <div data-enter="" className={`${WRAP} pb-20 md:pb-28`}>
            <Reveal className="grid gap-x-16 gap-y-6 lg:grid-cols-12">
              <p className={`${LABEL} lg:col-span-3`}>Overview</p>
              <p className={`${LONG_COPY} text-foreground/85 lg:col-span-8 lg:col-start-5`}>{category.long}</p>
            </Reveal>
          </div>
        )}

        <section
          aria-labelledby="range-heading"
          className={isFormats ? 'py-20 md:py-28' : 'border-t border-border py-20 md:py-28'}
        >
          <div className={WRAP}>
            <Reveal as="p" from="none" className="eyebrow">
              {category.label}
            </Reveal>
            <SplitReveal as="h2" id="range-heading" text="Product Range" className={`mt-4 ${DISPLAY_H2}`} />
            <DrawnRule className="mt-8 md:mt-12" delay={0.15} />

            {isFormats ? (
              <ul role="list" className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-3 lg:gap-6">
                {category.products.map((product, i) => (
                  <Reveal as="li" key={product.slug} delay={(i % 3) * 0.08} className="h-full">
                    <FormatCard
                      name={product.name}
                      short={product.short}
                      rows={product.specs}
                      to={enquiryHref(product.name)}
                    />
                  </Reveal>
                ))}
              </ul>
            ) : (
              <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:mt-14 lg:grid-cols-4">
                {category.products.map((product, i) => (
                  <ProductCard
                    key={product.slug}
                    to={product.hasDetailPage ? `${path}/${product.slug}` : undefined}
                    image={productImages[product.slug]?.[0] ?? cover}
                    name={product.name}
                    short={product.short}
                    // The stagger restarts on every desktop row: a row is what comes into view.
                    index={i % 4}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </Fragment>
    </PageLayout>
  );
};

export default CategoryPage;
