import { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import FormatCard from '@/components/FormatCard';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import NotFound from '@/pages/NotFound';
import { categoryBySlug } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';

// Same gutters as the navbar and footer, so page content lines up with the chrome.
const WRAP = 'mx-auto max-w-7xl px-4 sm:px-6';

const LONG_COPY = 'text-base/relaxed text-muted-foreground md:text-lg/relaxed';

const enquiryHref = (product: string) => `/contact?product=${encodeURIComponent(product)}`;

/** /products/:category — the category's copy and its full range. */
const CategoryPage = () => {
  const params = useParams<{ category: string }>();
  const category = categoryBySlug(params.category?.toLowerCase());
  if (!category) return <NotFound />;

  const path = `/products/${category.slug}`;
  const cover = categoryImages[category.slug];
  // The cigarette formats have no pages or photography of their own: one shared pack
  // shot stands beside the copy and each format card leads straight to an enquiry.
  const isFormats = category.slug === 'finished-cigarettes';

  return (
    <PageLayout enquiryProduct={category.label}>
      {/* Keyed so moving between the two categories replays the reveals. */}
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
          lead={category.short}
        />

        {isFormats && cover ? (
          <div className={`${WRAP} grid items-center gap-10 pb-16 md:grid-cols-[7fr_5fr] md:gap-14 md:pb-24 lg:gap-20`}>
            <Reveal as="p" className={LONG_COPY}>
              {category.long}
            </Reveal>
            <Reveal delay={0.15} className="mx-auto w-full max-w-sm md:max-w-none">
              {/* The frame takes the cut-out's own ratio, so no hairline of tile shows beside it. */}
              <div
                className="relative overflow-hidden rounded-lg bg-tile"
                style={{ aspectRatio: `${cover.image.img.w} / ${cover.image.img.h}` }}
              >
                <LazyImage
                  image={cover.image}
                  alt={cover.alt}
                  sizes="(min-width: 1280px) 480px, (min-width: 768px) 40vw, (min-width: 432px) 384px, calc(100vw - 32px)"
                  priority
                  className="product-shot absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        ) : (
          <div className={`${WRAP} pb-16 md:pb-24`}>
            <Reveal as="p" className={`max-w-3xl ${LONG_COPY}`}>
              {category.long}
            </Reveal>
          </div>
        )}

        <section
          aria-labelledby="range-heading"
          className="border-t border-border py-16 md:py-24"
        >
          <div className={WRAP}>
            <Reveal>
              <p className="eyebrow">{category.label}</p>
              <h2
                id="range-heading"
                className="mt-4 font-display text-3xl/tight font-medium text-foreground md:text-4xl/tight"
              >
                Product Range
              </h2>
              <div className="rule mt-6" aria-hidden="true" />
            </Reveal>

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
                    index={i}
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
