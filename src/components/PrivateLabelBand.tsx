import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import SectionMarker from '@/components/SectionMarker';
import ImageReveal from '@/components/motion/ImageReveal';
import Magnetic from '@/components/motion/Magnetic';
import Parallax from '@/components/motion/Parallax';
import SplitReveal from '@/components/motion/SplitReveal';
import { categoryImages } from '@/content/images';
import { categoryBySlug } from '@/content/products';

const CATEGORY_SLUG = 'finished-cigarettes';
const SERVICE_SLUG = 'private-label-manufacturing';

/**
 * Private label / OEM band — Orchid's "services" block, cut down to what the
 * workbook actually says: the service's name as the headline, its one line, the
 * category description, and the names of the finished-cigarette lines it sits
 * beside. No MOQs, pack counts or lead times are shown because AKTCL has not
 * supplied any.
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
    <section aria-labelledby="private-label-heading" className="bg-secondary/50 py-24 md:py-36 lg:py-44">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionMarker number="05">Manufacturing Partner</SectionMarker>
        {/* Sized so the longest word still fits a 320px phone. */}
        <SplitReveal
          as="h2"
          id="private-label-heading"
          by="line"
          text={service.name}
          italicWords={['label']}
          className="mt-10 text-[length:clamp(2.5rem,11.5vw,10.5rem)] font-normal leading-[0.95] tracking-[-0.035em] md:mt-14"
        />

        <div className="mt-14 grid gap-x-8 gap-y-14 md:mt-20 lg:mt-24 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal as="p" className="text-xl leading-relaxed text-foreground md:text-2xl md:leading-relaxed">
              {service.short}
            </Reveal>
            <Reveal as="p" delay={0.08} className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
              {category.long}
            </Reveal>

            {range.length > 0 && (
              <Reveal delay={0.16} className="mt-12">
                <p
                  id="private-label-range"
                  className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {category.label} range
                </p>
                {/* Names only: these lines have no page of their own, so the single
                    link to the category page below does the navigating. */}
                <ul
                  aria-labelledby="private-label-range"
                  className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-5"
                >
                  {range.map((product, i) => (
                    <li key={product.slug} className="flex items-baseline gap-2.5 font-display text-lg text-foreground md:text-xl">
                      <span aria-hidden="true" className="font-sans text-[11px] font-medium tabular-nums tracking-[0.15em] text-accent">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {product.name}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal delay={0.24} className="mt-12 flex flex-col gap-x-10 gap-y-6 sm:flex-row sm:items-center">
              <Magnetic>
                {/* The darker fill rises from the bottom edge; the label never changes colour, so it never dips in contrast. */}
                <Link
                  to={`/contact?product=${encodeURIComponent(service.name)}`}
                  data-lead="private-label-enquire"
                  data-cursor="enquire"
                  className="relative isolate inline-flex min-h-14 items-center justify-center overflow-hidden rounded-md bg-accent px-9 text-[13px] font-semibold uppercase tracking-[0.18em] text-accent-foreground before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-700 before:ease-expo-out hover:before:scale-y-100 focus-visible:before:scale-y-100"
                >
                  Discuss Your Brand
                </Link>
              </Magnetic>
              <Link
                to={`/products/${category.slug}`}
                className="link-underline group relative inline-flex items-center gap-3 self-start pb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent after:absolute after:inset-x-0 after:-inset-y-3.5 sm:self-auto"
              >
                View {category.label}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-500 ease-expo-out group-hover:translate-x-1.5"
                />
              </Link>
            </Reveal>
          </div>

          {packShot && (
            // Second in the DOM (copy first on phones), first on the desktop row.
            <div className="mx-auto w-full max-w-md lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:max-w-none">
              <ImageReveal className="aspect-[4/5] rounded-sm">
                {/* Taller than its frame by the distance the parallax travels. The tile
                    travels with the cut-out: shot on white, it multiplies into the tile in
                    light mode and sits on the same light tile in dark mode (.product-shot). */}
                <Parallax speed={0.05} className="absolute inset-x-0 -inset-y-[8%]">
                  <div className="relative h-full w-full bg-tile">
                    <LazyImage
                      image={packShot.image}
                      alt={packShot.alt}
                      sizes="(min-width: 1280px) 520px, (min-width: 1024px) 42vw, (min-width: 496px) 448px, 100vw"
                      className="product-shot absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: packShot.position }}
                    />
                  </div>
                </Parallax>
              </ImageReveal>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PrivateLabelBand;
