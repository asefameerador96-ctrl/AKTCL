import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import SectionMarker from '@/components/SectionMarker';
import ImageReveal from '@/components/motion/ImageReveal';
import Parallax from '@/components/motion/Parallax';
import SplitReveal from '@/components/motion/SplitReveal';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';
import { about } from '@/content/about';
import { journeyImages } from '@/content/images';
import { hero, site } from '@/content/site';

// The threshing floor: real plant, real people — the strongest "who we are" frame.
const photo = journeyImages.process?.[0];

// The offset gold frame, drawn clockwise one edge at a time once the photograph has
// mostly opened: [classes, resting-hidden transform, seconds, delay in seconds].
const FRAME_EDGES = [
  ['left-0 top-0 h-px w-full origin-left', 'scaleX(0)', 0.3, 0.5],
  ['right-0 top-0 h-full w-px origin-top', 'scaleY(0)', 0.6, 0.6],
  ['bottom-0 right-0 h-px w-full origin-right', 'scaleX(0)', 0.6, 0.85],
  ['bottom-0 left-0 h-full w-px origin-bottom', 'scaleY(0)', 0.3, 1.1],
] as const;

const Photo = ({ image }: { image: NonNullable<typeof photo> }) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { skip: still });
  const shown = useReveal(inView);

  const edge = (hidden: string, seconds: number, delay: number): CSSProperties | undefined =>
    still
      ? undefined
      : { transform: shown ? 'none' : hidden, transition: `transform ${seconds}s ${EASE.expoOut} ${delay}s` };

  return (
    <div ref={ref} className="relative lg:col-span-7 lg:self-start">
      {/* Kept inside the phone gutter so it never widens the page. */}
      <span aria-hidden="true" className="absolute -bottom-2.5 -right-2.5 h-full w-full lg:-bottom-5 lg:-right-5">
        {FRAME_EDGES.map(([classes, hidden, seconds, delay]) => (
          <span key={classes} className={`absolute bg-gold/60 ${classes}`} style={edge(hidden, seconds, delay)} />
        ))}
      </span>
      <ImageReveal className="aspect-[4/3] rounded-sm bg-secondary">
        {/* Taller than its frame by the distance the parallax travels. */}
        <Parallax speed={0.06} className="absolute inset-x-0 -inset-y-[10%]">
          <LazyImage
            image={image.image}
            alt={image.alt}
            // Cover-cropped into a box a fifth taller than the 4:3 frame, so it is
            // drawn ~1.2 × the column: 7 of 12 columns from lg up.
            sizes="(min-width: 1280px) 860px, (min-width: 1024px) 70vw, 120vw"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: image.position }}
          />
        </Parallax>
      </ImageReveal>
    </div>
  );
};

/**
 * "Who We Are" — the short company introduction that follows the hero (Orchid's
 * "manufacturing partner" blurb), set as an editorial pull-statement. The heading
 * only restates the hero line; the body is the workbook's hero paragraph and the
 * first About paragraph, verbatim.
 */
const WhoWeAre = () => (
  <section aria-labelledby="who-we-are-heading" className="py-24 md:py-36 lg:py-44">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionMarker number="01">Who We Are</SectionMarker>

      <div className="mt-10 grid gap-x-8 gap-y-12 md:mt-14 md:gap-y-16 lg:grid-cols-12 lg:gap-y-24">
        {/* Indented two columns: marker, statement, photograph and copy each take a different left edge. */}
        <SplitReveal
          as="h2"
          id="who-we-are-heading"
          by="line"
          text="Vertically integrated, from seed to smoke"
          italicWords={['integrated']}
          className="text-[length:clamp(2.5rem,5.5vw,5rem)] font-normal leading-[1.04] tracking-[-0.03em] lg:col-span-10 lg:col-start-3"
        />

        {photo && <Photo image={photo} />}

        <div className="lg:col-span-5 lg:pl-4 xl:col-span-4 xl:col-start-9 xl:pl-0">
          <Reveal as="p" className="text-lg leading-relaxed text-foreground">
            {hero.body}
          </Reveal>
          <Reveal as="p" delay={0.08} className="mt-6 leading-relaxed text-muted-foreground">
            {about.paragraphs[0]}
          </Reveal>
          <Reveal delay={0.16} className="mt-8">
            {/* The ::after lends the 44px touch target, so the drawn underline can sit tight under the words. */}
            <Link
              to="/about-us"
              className="link-underline group relative inline-flex items-center gap-3 pb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent after:absolute after:inset-x-0 after:-inset-y-3.5"
            >
              About {site.shortName}
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-500 ease-expo-out group-hover:translate-x-1.5"
              />
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

export default WhoWeAre;
