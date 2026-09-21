import { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader, { BODY, SectionHead, WRAP } from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import FormatCard from '@/components/FormatCard';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import SectionMarker from '@/components/SectionMarker';
import ImageReveal from '@/components/motion/ImageReveal';
import NotFound from '@/pages/NotFound';
import { categoryBySlug, productsIntro } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

const enquiryHref = (product: string) => `/contact?product=${encodeURIComponent(product)}`;

/** /products/:category — the category's copy and its full range. */
const CategoryPage = () => {
  const params = useParams<{ category: string }>();
  const category = categoryBySlug(params.category?.toLowerCase());
  if (!category) return <NotFound />;

  const path = `/products/${category.slug}`;
  const cover = categoryImages[category.slug];
  // The cigarette formats have no pages or photography of their own: one shared pack
  // shot sits beside the overview and each format row leads straight to an enquiry.
  // (The leaf cover is the first cell of the grid below, so it is not shown twice.)
  const isFormats = category.slug === 'finished-cigarettes';
  const showCover = isFormats && Boolean(cover);

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
          // Not the workbook's "Category 01": that numbering was decoration. The
          // products' own eyebrow says what the page is.
          eyebrow={productsIntro.eyebrow}
          title={category.title}
          lead={category.short}
        />

        {/* The overview hangs from the masthead's closing rule: a ruled split with the
            long copy in the wide cell. With a cover, the pack shot fills the narrow
            cell flush to the rules, on the tile (light in both themes). */}
        <section aria-label="Overview" data-enter="" className={WRAP}>
          <div className="relative grid border-b border-border lg:grid-cols-12">
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-y-0 hidden w-px bg-border lg:block',
                showCover ? 'left-[58.333333%]' : 'left-[41.666667%]'
              )}
            />

            {/* The marker and its copy stay together at the head of the cell, even beside
                the tall pack shot: a label pushed away from what it labels reads as a gap. */}
            <Reveal
              className={cn(
                'grid content-start gap-y-5 pb-12 pt-6 lg:pt-10',
                showCover ? 'lg:col-span-7 lg:pb-10 lg:pr-8' : 'lg:col-span-12 lg:grid-cols-12 lg:pb-24'
              )}
            >
              <SectionMarker className={cn(!showCover && 'lg:col-span-5')}>Overview</SectionMarker>
              <p className={showCover ? BODY : `${BODY} lg:col-span-7 lg:pl-8`}>{category.long}</p>
            </Reveal>

            {showCover && cover && (
              // The pack shot is a portrait: the frame keeps enough of its height that
              // neither the open pack nor the packs' feet are cropped.
              <ImageReveal direction="left" className="aspect-square bg-tile sm:aspect-[4/3] lg:col-span-5 lg:aspect-[4/5]">
                <LazyImage
                  image={cover.image}
                  alt={cover.alt}
                  sizes="(min-width: 1280px) 514px, (min-width: 1024px) 42vw, calc(100vw - 32px)"
                  priority
                  className="product-shot absolute inset-0 h-full w-full object-cover"
                />
              </ImageReveal>
            )}
          </div>
        </section>

        <section aria-labelledby="range-heading" className={cn(WRAP, 'pb-24 pt-24 md:pb-36 md:pt-36')}>
          <SectionHead label={category.label} title="Product Range" id="range-heading" />

          {isFormats ? (
            // Each row draws its own top hairline; the list closes the last one.
            <ul role="list" className="mt-14 border-b border-border md:mt-20">
              {category.products.map((product, i) => (
                <Reveal as="li" key={product.slug} delay={Math.min(i, 3) * 0.07}>
                  <FormatCard
                    layout="row"
                    name={product.name}
                    short={product.short}
                    rows={product.specs}
                    to={enquiryHref(product.name)}
                  />
                </Reveal>
              ))}
            </ul>
          ) : (
            <ul role="list" className="hairline-grid mt-14 grid grid-cols-2 md:mt-20 lg:grid-cols-4">
              {category.products.map((product, i) => (
                <li key={product.slug} className="min-w-0">
                  <ProductCard
                    to={product.hasDetailPage ? `${path}/${product.slug}` : undefined}
                    image={productImages[product.slug]?.[0] ?? cover}
                    name={product.name}
                    short={product.short}
                    // Only the column matters: the stagger restarts on every row of the grid.
                    index={i}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </Fragment>
    </PageLayout>
  );
};

export default CategoryPage;
