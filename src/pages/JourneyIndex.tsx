import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader, {
  ArrowTravel,
  GROUP_UNDERLINE,
  ROW_LINE,
  ROW_SHIFT,
  SECTION_B,
  TEXT_LINK,
  WRAP,
} from '@/components/PageHeader';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import ImageReveal from '@/components/motion/ImageReveal';
import { journey, journeyIntro } from '@/content/journey';
import { journeyImages } from '@/content/images';
import { hero } from '@/content/site';
import { isStill } from '@/lib/motion';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

// Painted width of a row's photograph: a quarter of the sheet from lg, a thumbnail below.
const SIZES = '(min-width: 1280px) 308px, (min-width: 1024px) 25vw, (min-width: 640px) 192px, 104px';

const pad = (n: number) => String(n).padStart(2, '0');

/** How far down the screen the line has been "poured": a little past the middle. */
const POUR_LINE = 0.6;

/**
 * The seven stages as a ruled ledger: one wide row each — the stage's number, its name
 * in the display serif, its line of copy, and the photograph flush against the rules
 * on the right. The whole row opens the stage (the "Read More" link is stretched over
 * it); on hover or focus the row's hairline is redrawn in the accent, the name steps
 * 8px and the arrow travels. The photograph stays still.
 *
 * Down the ledger's margin runs one hairline that a 1px line of accent fills as the
 * page is scrolled, squaring off each row's tick as it passes. Scroll work is one
 * passive, rAF-throttled listener that writes a transform and toggles an attribute:
 * no React state, no layout written.
 *
 * isStill() (prerender, reduced motion): the margin line is simply drawn in full.
 */
const Ledger = () => {
  const [still] = useState(isStill);
  const threadRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const thread = threadRef.current;
    const fill = fillRef.current;
    if (still || !thread || !fill) return;

    const rows = Array.from(thread.querySelectorAll<HTMLElement>('ol > li'));
    let frame = 0;
    const update = () => {
      frame = 0;
      // Reads first, then writes. A row's offset is within the thread.
      const rect = thread.getBoundingClientRect();
      const poured = Math.max(0, Math.min(rect.height, window.innerHeight * POUR_LINE - rect.top));
      const reached = rows.map((row) => row.offsetTop <= poured);
      fill.style.transform = `scaleY(${(rect.height ? poured / rect.height : 0).toFixed(4)})`;
      rows.forEach((row, i) => row.toggleAttribute('data-on', reached[i]));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [still]);

  return (
    <section aria-label={`${journeyIntro.eyebrow}: the stages`} className={cn(WRAP, SECTION_B)}>
      <div ref={threadRef} className="relative">
        {/* The margin line and its fill. The fill only ever scales. */}
        <span aria-hidden="true" className="absolute inset-y-0 left-0 z-10 w-px bg-border">
          <span
            ref={fillRef}
            className="absolute inset-0 origin-top bg-accent will-change-transform"
            style={still ? undefined : { transform: 'scaleY(0)' }}
          />
        </span>

        <ol
          // Preflight removes the markers, and with them the list role in Safari.
          role="list"
          // The masthead's closing hairline is the first row's top rule.
          className="border-b border-border"
        >
          {journey.map((stage, i) => {
            const cover = journeyImages[stage.slug]?.[0];
            return (
              <li
                key={stage.slug}
                data-on={still ? '' : undefined}
                className={cn('group relative', i > 0 && 'border-t border-border')}
              >
                <span aria-hidden="true" className={ROW_LINE} />
                {/* The row's tick on the margin line: hollow until the fill reaches it. */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 z-20 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 border border-accent bg-background transition-colors duration-500 ease-expo-out group-data-[on]:bg-accent"
                />

                {/* The first row can open the page on a tall screen, so it plays with
                    the masthead (data-enter, see index.css); the rest play on view. */}
                <Reveal
                  trigger={i === 0 ? 'enter' : 'view'}
                  delay={i === 0 ? 0.4 : 0}
                  className="grid grid-cols-[minmax(0,1fr)_6.5rem] sm:grid-cols-[minmax(0,1fr)_12rem] lg:grid-cols-12"
                >
                  <div className="col-start-1 row-start-1 pb-2 pl-5 pr-4 pt-7 sm:pl-8 lg:col-span-5 lg:grid lg:grid-cols-5 lg:pb-10 lg:pr-0 lg:pt-10">
                    {/* The <ol> carries the order; the numeral is its visual echo. Kept, unlike
                        the site's other indices: seed to smoke is a real sequence. */}
                    <p
                      aria-hidden="true"
                      className="index-num transition-colors duration-500 ease-expo-out group-data-[on]:text-foreground lg:pt-3"
                    >
                      {pad(i + 1)}
                    </p>
                    <h2 className={cn('display-md mt-4 text-foreground lg:col-span-4 lg:mt-0', ROW_SHIFT)}>
                      {stage.label}
                    </h2>
                  </div>

                  <div className="col-span-2 row-start-2 pb-8 pl-5 pr-4 pt-3 sm:pl-8 lg:col-span-4 lg:col-start-6 lg:row-start-1 lg:py-10 lg:pl-0 lg:pr-10">
                    <p className="eyebrow lg:pt-3">{stage.title}</p>
                    <p className="mt-4 max-w-[46ch] text-secondary text-muted-foreground">
                      {stage.short}
                    </p>
                    {/* Stretched over the row, so the whole row is one target with one name. */}
                    <Link
                      to={`/journey/${stage.slug}`}
                      data-cursor="open"
                      className={cn(TEXT_LINK, 'mt-3 after:absolute after:inset-0 after:z-10')}
                    >
                      <span className={GROUP_UNDERLINE}>
                        Read More
                        <span className="sr-only">
                          {' '}
                          — {stage.label}: {stage.title}
                        </span>
                      </span>
                      <ArrowTravel />
                    </Link>
                  </div>

                  {cover && (
                    <ImageReveal
                      className="col-start-2 row-start-1 aspect-square self-start bg-secondary lg:col-span-3 lg:col-start-10 lg:aspect-auto lg:h-full lg:min-h-[16rem] lg:self-stretch"
                    >
                      <LazyImage
                        image={cover.image}
                        alt={cover.alt}
                        sizes={SIZES}
                        priority={i === 0}
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ objectPosition: cover.position }}
                      />
                    </ImageReveal>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

/** /journey — the seven stages in order, each leading to its own page. */
const JourneyIndex = () => (
  <PageLayout>
    <PageHeader
      breadcrumbs={
        ROUTE_BY_PATH['/journey']?.breadcrumbs ?? [{ name: journeyIntro.heading, path: '/journey' }]
      }
      eyebrow={journeyIntro.eyebrow}
      title={journeyIntro.heading}
      italicWords={['Our']}
      lead={hero.body}
    />
    {/* The ledger hangs from the masthead's closing hairline: the two read as one sheet. */}
    <Ledger />
  </PageLayout>
);

export default JourneyIndex;
