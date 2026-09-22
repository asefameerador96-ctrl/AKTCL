import { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader, { BODY, SECTION_GAP, SECTION_Y, SectionHead, WRAP } from '@/components/PageHeader';
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
  // Most cigarette formats have no page or photography of their own: one shared pack
  // shot sits beside the overview, a format with a page (AKT Signature Collection)
  // links to it and the rest lead straight to an enquiry. (The leaf cover is the first
  // cell of the grid below, so it is not shown twice.)
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
        />

        {/* The overview hangs from the masthead's closing rule, every cell carrying
            copy: the category's line as a display standfirst beside (or over) its long
            description, the label set over the text it labels — never alone in a
            column of its own. With a cover, the pack shot takes the narrow cell, of
            about the copy's height, on the tile (light in both themes).
            data-enter="view" on the copy: it shares the first screen with the masthead,
            so its prerendered paint waits for the app (index.css). Not on the pack
            shot: a priority image is never held back. */}
        <section aria-label="Overview" className={WRAP}>
          {/* No closing rule of its own: the range's head, below, draws the next one. */}
          <div className={cn('grid gap-y-10 lg:grid-cols-12 lg:gap-x-8', SECTION_GAP)}>
            {showCover && cover ? (
              <>
                <div data-enter="view" className="lg:col-span-7 lg:pr-4">
                  <Reveal>
                    <p className="display-xs max-w-[30ch] leading-[1.18] text-foreground">{category.short}</p>
                    <SectionMarker className="mt-10 md:mt-12">Overview</SectionMarker>
                    <p className={`${BODY} mt-5`}>{category.long}</p>
                  </Reveal>
                </div>
                {/* The pack shot is a portrait; its packs sit in the middle half of the
                    frame, so a landscape crop centred a little low keeps all of them. */}
                <ImageReveal className="aspect-[4/3] bg-tile lg:col-span-5 lg:self-start">
                  <LazyImage
                    image={cover.image}
                    alt={cover.alt}
                    sizes="(min-width: 1280px) 486px, (min-width: 1024px) 40vw, calc(100vw - 32px)"
                    priority
                    className="product-shot absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: cover.position ?? '50% 56%' }}
                  />
                </ImageReveal>
              </>
            ) : (
              <>
                <div data-enter="view" className="lg:col-span-5">
                  <Reveal as="p" className="display-xs max-w-[30ch] leading-[1.18] text-foreground">
                    {category.short}
                  </Reveal>
                </div>
                <div data-enter="view" className="lg:col-span-7">
                  <Reveal delay={0.08}>
                    <SectionMarker>Overview</SectionMarker>
                    <p className={`${BODY} mt-5`}>{category.long}</p>
                  </Reveal>
                </div>
              </>
            )}
          </div>
        </section>

        <section aria-labelledby="range-heading" className={cn(WRAP, SECTION_Y)}>
          <SectionHead label={category.label} title="Product Range" id="range-heading" />

          {isFormats ? (
            // Each row draws its own top hairline; the list closes the last one.
            <ul role="list" className="mt-10 border-b border-border md:mt-12">
              {category.products.map((product, i) => (
                <Reveal as="li" key={product.slug} delay={Math.min(i, 3) * 0.05}>
                  <FormatCard
                    layout="row"
                    name={product.name}
                    short={product.short}
                    rows={product.specs}
                    to={product.hasDetailPage ? `${path}/${product.slug}` : enquiryHref(product.name)}
                  />
                </Reveal>
              ))}
            </ul>
          ) : (
            <ul role="list" className="hairline-grid mt-10 grid grid-cols-2 md:mt-12 lg:grid-cols-4">
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
