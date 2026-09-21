import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { RowLink, SectionHead } from '@/components/Ruled';
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
 * A 5/7 split on the surface tone, ruled like a plan: the pack shot's tile fills the
 * narrow cell to its hairlines, one vertical rule divides it from the copy, the range
 * is a ruled inline list in mono, and the split closes on a second ruled row — the
 * enquiry button under the tile, the onward link under the copy.
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
    <section
      aria-labelledby="private-label-heading"
      className="border-y border-border bg-card py-24 md:py-32 lg:py-36"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead label="Manufacturing Partner" />

        {/* .display-lg keeps the longest word inside a 320px phone. */}
        <SplitReveal
          as="h2"
          id="private-label-heading"
          by="line"
          text={service.name}
          italicWords={['label']}
          className="display-lg mt-12 text-foreground md:mt-16 lg:mt-20"
        />

        {/*
          One set of cells, three plans. Phone: copy, tile, enquiry, link, stacked. Tablet:
          the copy runs full width and the tile stands beside the enquiry and the link.
          Desktop: tile beside copy, then enquiry beside link. The cut-out is portrait, so
          it is never asked to fill a frame much wider or much taller than 4:5.
        */}
        <div className="mt-14 grid border-y border-border md:mt-20 md:grid-cols-12 lg:mt-24">
          {/* border-b: below lg the tile follows, and a rule has to part them. */}
          <div className="flex flex-col border-b border-border md:col-span-12 lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:border-b-0 lg:border-l">
            <div className="py-10 md:py-14 lg:pl-10">
              <Reveal as="p" className="display-xs max-w-[30ch] text-foreground">
                {service.short}
              </Reveal>
              {/* Running copy at the body's own size; rem, not ch (see .lead in index.css). */}
              <Reveal as="p" delay={0.08} className="mt-6 max-w-[38rem] text-muted-foreground">
                {category.long}
              </Reveal>
            </div>

            {range.length > 0 && (
              <Reveal delay={0.16} className="mt-auto border-t border-border py-6 md:py-8 lg:pl-10">
                <p id="private-label-range" className="eyebrow">
                  {category.label} range
                </p>
                {/* Names only: these lines have no page of their own, so the single
                    link to the category page below does the navigating. */}
                <ul
                  role="list"
                  aria-labelledby="private-label-range"
                  className="mono-label mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2 tracking-[0.14em] text-foreground"
                >
                  {range.map((product, i) => (
                    // The slash travels with the name before it, so a line may end on one but never start with one.
                    <li key={product.slug} className="flex items-baseline gap-x-3">
                      {product.name}
                      {i < range.length - 1 && (
                        <span aria-hidden="true" className="text-muted-foreground">
                          /
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          {packShot && (
            // Second in the DOM (copy first on phones), first on the desktop row, where the
            // grid stretches the frame to the copy's height.
            <ImageReveal className="md:col-span-5 md:row-span-2 md:row-start-2 lg:col-start-1 lg:row-span-1 lg:row-start-1">
              {/* The frame's floor: near the cut-out's own 3:4, so little of it is cropped. */}
              <div aria-hidden="true" className="aspect-[4/5] sm:aspect-[5/4] md:aspect-[4/5]" />
              {/* Taller than its frame by the distance the parallax travels. The tile
                  travels with the cut-out: shot on white, it multiplies into the tile in
                  light mode and sits on the same light tile in dark mode (.product-shot). */}
              <Parallax speed={0.04} className="absolute inset-x-0 -inset-y-[6%]">
                <div className="relative h-full w-full bg-tile">
                  <LazyImage
                    image={packShot.image}
                    alt={packShot.alt}
                    sizes="(min-width: 1280px) 520px, (min-width: 768px) 42vw, 100vw"
                    className="product-shot absolute inset-0 h-full w-full object-cover"
                    // Large phones crop the portrait cut-out to a landscape frame: keep the packs in it.
                    style={{ objectPosition: packShot.position ?? '50% 62%' }}
                  />
                </div>
              </Parallax>
            </ImageReveal>
          )}

          {/* The closing cells continue the split: on the desktop the enquiry sits under the
              tile and the range link under the copy. */}
          <Reveal className="flex items-center border-t border-border py-8 md:col-span-7 md:col-start-6 md:row-start-2 md:border-l md:border-t-0 md:py-10 md:pl-10 lg:col-span-5 lg:col-start-1 lg:border-l-0 lg:border-t lg:pl-0 lg:pr-10">
            <Magnetic>
              <Link
                to={`/contact?product=${encodeURIComponent(service.name)}`}
                data-lead="private-label-enquire"
                data-cursor="enquire"
                className="btn btn-lg btn-solid w-full justify-between sm:w-auto md:min-h-14"
              >
                Discuss Your Brand
                <ArrowRight aria-hidden="true" className="btn-arrow" />
              </Link>
            </Magnetic>
          </Reveal>
          <Reveal
            delay={0.08}
            className="flex md:col-span-7 md:col-start-6 md:row-start-3 md:border-l md:border-border lg:row-start-2"
          >
            <RowLink to={`/products/${category.slug}`} className="w-full md:pl-10">
              View {category.label}
            </RowLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default PrivateLabelBand;
