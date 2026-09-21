import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader, { ArrowTravel, DISPLAY_H2, GROUP_UNDERLINE, TEXT_LINK } from '@/components/PageHeader';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import ImageReveal from '@/components/motion/ImageReveal';
import Parallax from '@/components/motion/Parallax';
import SplitReveal from '@/components/motion/SplitReveal';
import { journey, journeyIntro } from '@/content/journey';
import { journeyImages } from '@/content/images';
import { hero } from '@/content/site';
import { isStill } from '@/lib/motion';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

const SIZES = '(min-width: 1280px) 560px, (min-width: 768px) 45vw, calc(100vw - 60px)';

const pad = (n: number) => String(n).padStart(2, '0');

/** How far down the screen the gold line has been "poured": a little past the middle. */
const POUR_LINE = 0.6;

/**
 * The seven stages on one thread. A hairline runs the length of the list — down the
 * left edge on a phone, down the middle from md, where the rows alternate sides — and
 * a gold line fills it as the page is scrolled, lighting each stage's node as it
 * passes. Scroll work is one passive, rAF-throttled listener that writes a transform
 * and toggles an attribute: no React state, no layout written.
 *
 * isStill() (prerender, reduced motion): the thread is simply drawn in full.
 */
const Timeline = () => {
  const [still] = useState(isStill);
  const threadRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const thread = threadRef.current;
    const fill = fillRef.current;
    if (still || !thread || !fill) return;

    const nodes = Array.from(thread.querySelectorAll<HTMLElement>('[data-node]'));
    let frame = 0;
    const update = () => {
      frame = 0;
      // Reads first, then writes. A node's offset is within its <li>, the <li>'s within the thread.
      const rect = thread.getBoundingClientRect();
      const poured = Math.max(0, Math.min(rect.height, window.innerHeight * POUR_LINE - rect.top));
      const reached = nodes.map((node) => (node.parentElement?.offsetTop ?? 0) + node.offsetTop <= poured);
      fill.style.transform = `scaleY(${(rect.height ? poured / rect.height : 0).toFixed(4)})`;
      nodes.forEach((node, i) => node.toggleAttribute('data-on', reached[i]));
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
    <div className="mx-auto max-w-7xl overflow-x-clip px-4 pb-24 sm:px-6 md:pb-36">
      <div ref={threadRef} className="relative">
        {/* The thread and its fill. The fill only ever scales. */}
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-border md:left-1/2">
          <span
            ref={fillRef}
            className="absolute inset-0 origin-top bg-gold will-change-transform"
            style={still ? undefined : { transform: 'scaleY(0)' }}
          />
        </span>

        <ol
          // Preflight removes the markers, and with them the list role in Safari.
          role="list"
          className="space-y-20 md:space-y-36"
        >
          {journey.map((stage, i) => {
            const cover = journeyImages[stage.slug]?.[0];
            const flip = i % 2 === 1;
            const picture = cover && (
              <ImageReveal direction={flip ? 'left' : 'right'} className="aspect-[4/3] rounded-lg bg-secondary">
                <LazyImage
                  image={cover.image}
                  alt={cover.alt}
                  sizes={SIZES}
                  priority={i === 0}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: cover.position }}
                />
              </ImageReveal>
            );

            return (
              <li key={stage.slug} className="relative pl-7 md:pl-0">
                {/* The stage's node on the thread: hollow until the gold reaches it. */}
                <span
                  aria-hidden="true"
                  data-node=""
                  data-on={still ? '' : undefined}
                  className="absolute left-0 top-0 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-gold bg-background transition-[background-color,transform] duration-700 ease-expo-out data-[on]:scale-125 data-[on]:bg-gold md:left-1/2 md:top-1/2"
                />

                <article className="grid items-center gap-x-24 gap-y-8 md:grid-cols-2 lg:gap-x-32">
                  {picture && (
                    <div className={cn('min-w-0', flip && 'md:order-2')}>
                      {/* The first photograph can open the page on a tall screen: see
                          data-enter in index.css. */}
                      {i === 0 ? <div data-enter="">{picture}</div> : picture}
                    </div>
                  )}

                  <div className="min-w-0">
                    {/* The <ol> carries the order; the numeral is its visual echo. */}
                    <div aria-hidden="true">
                      <Parallax speed={0.05}>
                        <Reveal
                          as="p"
                          className="font-display text-[length:clamp(5.5rem,12vw,10.5rem)] font-normal tabular-nums leading-[0.8] tracking-[-0.04em] text-outline text-accent"
                        >
                          {pad(i + 1)}
                        </Reveal>
                      </Parallax>
                    </div>
                    <SplitReveal as="h2" text={stage.label} className={cn('mt-8 md:mt-10', DISPLAY_H2)} />
                    <Reveal delay={0.12}>
                      <p className="mt-3 font-display text-xl/snug italic text-foreground/80 md:text-2xl/snug">
                        {stage.title}
                      </p>
                      <p className="mt-5 max-w-[52ch] text-base/relaxed text-muted-foreground md:text-[1.0625rem]/[1.75]">
                        {stage.short}
                      </p>
                      <Link to={`/journey/${stage.slug}`} data-cursor="open" className={cn(TEXT_LINK, 'mt-6')}>
                        <span className={GROUP_UNDERLINE}>
                          Read More
                          <span className="sr-only">
                            {' '}
                            — {stage.label}: {stage.title}
                          </span>
                        </span>
                        <ArrowTravel />
                      </Link>
                    </Reveal>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
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
      meta={`${pad(1)} — ${pad(journey.length)}`}
      lead={hero.body}
    />
    <Timeline />
  </PageLayout>
);

export default JourneyIndex;
