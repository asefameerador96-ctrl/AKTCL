import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { categoryImages } from '@/content/images';
import { categoryBySlug } from '@/content/products';

const CATEGORY_SLUG = 'finished-cigarettes';
const SERVICE_SLUG = 'private-label-manufacturing';

/**
 * Private label / OEM band — Orchid's "services" block, cut down to what the
 * workbook actually says: the service's one line, the category description, and the
 * names of the finished-cigarette lines it sits beside. No MOQs, pack counts or
 * lead times are shown because AKTCL has not supplied any.
 *
 * Everything is looked up by slug, so if the service or category is ever removed
 * from src/content/products.ts the band disappears rather than rendering half-empty.
 */
const PrivateLabelBand = () => {
  const category = categoryBySlug(CATEGORY_SLUG);
  const service = category?.products.find((p) => p.slug === SERVICE_SLUG);
  if (!category || !service) return null;

  const range = category.products.filter((p) => p.slug !== SERVICE_SLUG);
  const packShot = categoryImages[CATEGORY_SLUG];

  return (
    <section aria-labelledby="private-label-heading" className="bg-secondary/50 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-20">
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <p className="eyebrow">Manufacturing Partner</p>
          <h2
            id="private-label-heading"
            className="mt-4 text-3xl font-medium leading-tight md:text-4xl lg:text-5xl"
          >
            {service.name}
          </h2>
          <div className="rule mt-6" aria-hidden="true" />
          <p className="mt-8 text-lg leading-relaxed text-foreground md:text-xl">{service.short}</p>
          <p className="mt-5 leading-relaxed text-muted-foreground">{category.long}</p>

          {range.length > 0 && (
            <>
              <p
                id="private-label-range"
                className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
              >
                {category.label} range
              </p>
              {/* Names only: these lines have no page of their own, so the single
                  link to the category page below does the navigating. */}
              <ul aria-labelledby="private-label-range" className="mt-4 flex flex-wrap gap-2.5">
                {range.map((product) => (
                  <li
                    key={product.slug}
                    className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
                  >
                    {product.name}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-10 flex flex-col gap-x-8 gap-y-3 sm:flex-row sm:items-center">
            <Link
              to={`/contact?product=${encodeURIComponent(service.name)}`}
              data-lead="private-label-enquire"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-7 text-[13px] font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-colors duration-300 hover:bg-accent/90"
            >
              Discuss Your Brand
            </Link>
            <Link
              to={`/products/${category.slug}`}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-accent transition-colors hover:text-foreground"
            >
              View {category.label}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {packShot && (
          // Second in the DOM (copy first on phones), first on the desktop row.
          <Reveal delay={0.12} className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
            {/* The cut-out is shot on white: it multiplies into the tile in light
                mode and sits on the same light tile in dark mode (.product-shot). */}
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg border border-border bg-tile lg:aspect-[3/4] lg:max-w-none">
              <LazyImage
                image={packShot.image}
                alt={packShot.alt}
                sizes="(min-width: 1280px) 470px, (min-width: 1024px) 36vw, (min-width: 496px) 448px, 100vw"
                className="product-shot absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: packShot.position }}
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

export default PrivateLabelBand;
