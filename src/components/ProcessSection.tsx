import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import SplitReveal from '@/components/motion/SplitReveal';
import Reveal from '@/components/Reveal';
import { RowLink, SectionHead, TravelArrow } from '@/components/Ruled';
import LazyImage from '@/components/LazyImage';
import { cn } from '@/lib/utils';
import { EASE, isStill } from '@/lib/motion';
import { journey, journeyIntro, type JourneyStage } from '@/content/journey';
import { hero } from '@/content/site';
import { journeyImages } from '@/content/images';

const stages = journey.map((stage) => ({ stage, cover: journeyImages[stage.slug]?.[0] }));
const LAST = stages.length - 1;
const STAGE_TOTAL = String(stages.length).padStart(2, '0');
const numeral = (index: number) => String(index + 1).padStart(2, '0');

/** Scroll distance given to each stage, in viewport heights. */
const VH_PER_STAGE = 1.25;
// A stage's copy is held for a long readable plateau, leaves, and only then does the
// next photograph start to wipe up over the rest of that stage's progress.
const COPY_OUT_AT = 0.58;
const HANDOFF_START = 0.64;
/** How far the photograph underneath sinks into shadow while the next one covers it. */
const OUTGOING_DIM = 0.14;
const STAGGER_S = 0.07;

/** Photograph beside copy (tablets up, and any landscape phone); stacked otherwise. */
const SIDE_QUERY = '(min-width: 768px), (orientation: landscape)';
/** A landscape phone: the side-by-side panel is there, but only ~360px tall. */
const SHORT_QUERY = '(max-height: 540px)';

// The giant numeral is drawn in the hairline colour: part of the plan drawing, not a
// headline. Colour here, outline on the child — cn() would merge the pair away.
const NUMERAL_TYPE =
  'pointer-events-none select-none font-display text-[length:clamp(10rem,26vw,24rem)] font-normal leading-none tracking-[-0.04em] text-border';
// A directory row, not a button: ruled off above, label left, arrow right.
const ROW_LINK =
  'group relative flex w-full items-center justify-between gap-6 border-t font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-foreground';
const ON_ROW = 'group-hover:scale-x-100 group-focus-visible:scale-x-100';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * True when the stages should be laid out as a plain list: for the prerenderer, so
 * crawlers get all seven stages as ordinary markup, and for visitors who have asked
 * for reduced motion, since the scroller is scroll-driven movement by definition.
 * The hook keeps it live if the setting changes while the page is open.
 */
const usePlainLayout = () => {
  const reduced = usePrefersReducedMotion();
  return reduced || isStill();
};

/** Where a stage's copy is: waiting below its masks, in place, or gone out of the top. */
type Phase = 'before' | 'in' | 'out';

interface StageCopyProps {
  stage: JourneyStage;
  index: number;
  /** Scroller only. Without it the copy is simply there (plain list). */
  phase?: Phase;
  /** Little room (the stacked phone panel, a landscape phone): smaller steps, clamped text. */
  compact?: boolean;
  /** The fluid display step of the stage name. */
  labelSize: 'display-lg' | 'display-md';
}

const StageCopy = ({ stage, index, phase, compact = false, labelSize }: StageCopyProps) => {
  const shown = phase === 'in';
  const timing = (order: number) =>
    shown ? `0.9s ${EASE.expoOut} ${(order * STAGGER_S).toFixed(2)}s` : `0.5s ${EASE.expoInOut}`;
  // Display lines rise out of a mask; running text only drifts, which stays readable.
  const masked = (order: number): CSSProperties | undefined =>
    phase && {
      transform: shown ? 'none' : `translate3d(0, ${phase === 'out' ? -115 : 115}%, 0)`,
      transition: `transform ${timing(order)}`,
    };
  const soft = (order: number): CSSProperties | undefined =>
    phase && {
      opacity: shown ? 1 : 0,
      transform: shown ? 'none' : `translate3d(0, ${phase === 'out' ? -14 : 18}px, 0)`,
      transition: `opacity ${timing(order)}, transform ${timing(order)}`,
    };
  // The catchy title: one quiet serif line under the name. Its own clamp where room is short.
  const titleSize = compact ? 'text-[length:clamp(1.125rem,5vw,1.5rem)] leading-[1.15]' : 'display-xs';

  return (
    <>
      <p className="index-num flex items-center gap-3" style={soft(0)}>
        <span aria-hidden="true" className="text-foreground">
          {numeral(index)}
        </span>
        <span aria-hidden="true" className="h-px w-8 bg-border" />
        <span aria-hidden="true">{STAGE_TOTAL}</span>
        <span className="sr-only">
          Stage {index + 1} of {stages.length}
        </span>
      </p>
      {/* The masks carry the display size too, so their em padding is measured in the
          type's own em and keeps the descenders; the margin gives the space back. */}
      <div className={cn(labelSize, '-mb-[0.2em] overflow-hidden pb-[0.2em]', compact ? 'mt-3' : 'mt-5 lg:mt-6')}>
        <h3 className={cn(labelSize, 'text-foreground')} style={masked(1)}>
          {stage.label}
        </h3>
      </div>
      <div className={cn(titleSize, '-mb-[0.18em] overflow-hidden pb-[0.18em]', compact ? 'mt-2' : 'mt-3 lg:mt-4')}>
        <p className={cn('font-display tracking-[-0.02em] text-foreground', titleSize)} style={masked(2)}>
          {stage.title}
        </p>
      </div>
      <p
        className={cn(
          'leading-relaxed text-muted-foreground',
          compact ? 'mt-2 line-clamp-3 text-sm' : 'mt-5 max-w-md text-base'
        )}
        style={soft(3)}
      >
        {stage.short}
      </p>
      <div className={cn(compact ? 'mt-4' : 'mt-8 max-w-md lg:mt-10')} style={soft(4)}>
        <Link
          to={`/journey/${stage.slug}`}
          tabIndex={phase && !shown ? -1 : undefined}
          className={cn(ROW_LINK, compact ? 'min-h-11' : 'min-h-12')}
        >
          {/* Drawn over the row's own rule, so the line darkens from the left. */}
          <span
            aria-hidden="true"
            className={cn('absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-foreground transition-transform', ON_ROW)}
          />
          <span className="transition-transform motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2">
            Know More
            <span className="sr-only">: {stage.label}</span>
          </span>
          <TravelArrow />
        </Link>
      </div>
    </>
  );
};

/**
 * Every stage in the flow of the page, as ruled rows: photograph in seven columns, copy
 * in five, a hairline between them, sides alternating.
 */
const StageList = () => (
  <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 md:pb-32 lg:pb-36">
    <ol
      // Preflight removes the markers, and with them the list role in Safari.
      role="list"
      className="hairline-rows"
    >
      {stages.map(({ stage, cover }, i) => {
        const flipped = i % 2 === 1;
        return (
          <li key={stage.slug} className="grid gap-y-8 py-10 md:grid-cols-12 md:py-14 lg:py-16">
            {/* The 4:3 frame is a child of the cell, not the cell: a grid item with an
                aspect ratio takes its width from a stretched height and leaves its column. */}
            <div className={cn('md:col-span-7 md:self-center', flipped && 'md:order-2')}>
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                {cover && (
                  <LazyImage
                    image={cover.image}
                    alt={cover.alt}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 58vw, 710px"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: cover.position }}
                  />
                )}
              </div>
            </div>
            <div
              className={cn(
                'flex flex-col justify-center md:col-span-5',
                flipped ? 'md:mr-8 md:border-r md:pr-8 lg:mr-12 lg:pr-12' : 'md:ml-8 md:border-l md:pl-8 lg:ml-12 lg:pl-12'
              )}
            >
              <StageCopy stage={stage} index={i} labelSize="display-md" />
            </div>
          </li>
        );
      })}
    </ol>
  </div>
);

/**
 * The sticky scroller: a tall track with a pinned viewport. Each stage is a
 * full-screen layer (photograph and copy, alternating sides, a hairline between the
 * halves); scrolling wipes the next layer up over the last, and the Seed → Smoke rail
 * fills along the hairline that rules it off.
 *
 * Everything that changes per frame — the wipe, the photographs' settle, the drift
 * of the numerals, the rail — is written straight to the DOM from one rAF-throttled
 * scroll handler. React state only changes when a threshold is crossed (a new stage,
 * its copy leaving), and the copy's masked reveals are CSS transitions on that.
 */
const StageScroller = () => {
  const side = useMediaQuery(SIDE_QUERY);
  const short = useMediaQuery(SHORT_QUERY);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const edgeRef = useRef<HTMLSpanElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dimRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const numeralRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [{ activeIndex, leaving, arrived, engaged }, setScrollState] = useState({
    activeIndex: 0,
    /** The current stage's copy has been sent out ahead of the next photograph. */
    leaving: false,
    /** The scroller has come into view once: plays the first stage's entrance. */
    arrived: false,
    /** The pinned viewport is what the visitor is looking at: the rail can take focus. */
    engaged: false,
  });

  // Layout effect, so the resting state is on the layers before their first paint.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Skips writes that would not change anything: six of the seven layers are
    // parked at any moment, and their values do not move.
    const written = new Map<HTMLElement, Record<string, string>>();
    const put = (el: HTMLElement | null, prop: 'transform' | 'opacity' | 'clipPath' | 'visibility' | 'pointerEvents' | 'willChange', value: string) => {
      if (!el) return;
      const seen = written.get(el) ?? {};
      if (seen[prop] === value) return;
      seen[prop] = value;
      written.set(el, seen);
      el.style[prop] = value;
    };

    const update = () => {
      const viewport = window.innerHeight;
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - viewport;
      if (scrollable <= 0) return;

      const raw = clamp01(-rect.top / scrollable) * stages.length;
      const index = Math.min(Math.floor(raw), LAST);
      const progress = raw - index;
      const incoming = index < LAST ? clamp01((progress - HANDOFF_START) / (1 - HANDOFF_START)) : 0;
      const wipe = smooth(incoming);

      stages.forEach((_, i) => {
        const layer = layerRefs.current[i];
        const photo = photoRefs.current[i];
        const current = i === index;
        const next = i === index + 1;

        if (current) {
          put(layer, 'visibility', 'visible');
          put(layer, 'transform', 'none');
          put(layer, 'opacity', '1');
          put(layer, 'clipPath', 'none');
          put(layer, 'pointerEvents', '');
          put(photo, 'transform', `scale(${(1.06 - 0.06 * progress).toFixed(4)})`);
          put(dimRefs.current[i], 'opacity', (wipe * OUTGOING_DIM).toFixed(3));
          put(numeralRefs.current[i], 'transform', `translate3d(0, ${((0.5 - progress) * 12).toFixed(2)}%, 0)`);
        } else if (next) {
          put(layer, 'visibility', 'visible');
          put(layer, 'transform', 'none');
          // Parked in place but invisible rather than clipped or below the fold:
          // LazyImage only fetches what its observer can see, and this gets the next
          // photograph loaded most of a stage before it has to wipe in.
          put(layer, 'opacity', incoming > 0 ? '1' : '0');
          put(layer, 'clipPath', incoming > 0 ? `inset(${((1 - wipe) * 100).toFixed(2)}% 0 0 0)` : 'none');
          put(layer, 'pointerEvents', incoming > 0 ? '' : 'none');
          put(photo, 'transform', `scale(${(1.12 - 0.06 * wipe).toFixed(4)})`);
          put(dimRefs.current[i], 'opacity', '0');
          put(numeralRefs.current[i], 'transform', `translate3d(0, ${(6 + (1 - wipe) * 10).toFixed(2)}%, 0)`);
        } else {
          put(layer, 'visibility', 'hidden');
          // Later stages wait outside the pinned frame, where no observer finds them.
          put(layer, 'transform', i > index ? 'translate3d(0, 120%, 0)' : 'none');
        }
        // Only the two layers in play are promoted; the wipe then costs no repaint.
        put(layer, 'willChange', current || next ? 'clip-path' : 'auto');
        put(photo, 'willChange', current || next ? 'transform' : 'auto');
      });

      // The hairline that leads the wipe.
      put(edgeRef.current, 'opacity', incoming > 0 && incoming < 1 ? '1' : '0');
      put(edgeRef.current, 'transform', `translate3d(0, ${((1 - wipe) * 100).toFixed(2)}%, 0)`);
      // Reaches each tick as that stage takes over, and Smoke as the last one does.
      railRef.current?.style.setProperty('--journey-progress', clamp01(raw / LAST).toFixed(4));

      const nextState = {
        activeIndex: index,
        leaving: index < LAST && progress > COPY_OUT_AT,
        arrived: rect.top < viewport * 0.7,
        engaged: rect.top < viewport * 0.5 && rect.bottom > viewport * 0.5,
      };
      setScrollState((prev) =>
        prev.activeIndex === nextState.activeIndex &&
        prev.leaving === nextState.leaving &&
        (prev.arrived || !nextState.arrived) &&
        prev.engaged === nextState.engaged
          ? prev
          : { ...nextState, arrived: prev.arrived || nextState.arrived }
      );
    };

    let frame = 0;
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      }
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Lenis moves the page inside its own animation frame; painting from its event
    // keeps the wipe on the same frame as the scroll instead of one behind it.
    const offLenis = window.__lenis?.on('scroll', update);
    update();

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      offLenis?.();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // A layer becomes aria-hidden the moment it stops being current; do not leave
  // keyboard focus stranded inside it.
  useEffect(() => {
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && focused.closest('[data-stage-layer][aria-hidden="true"]')) {
      focused.blur();
    }
  }, [activeIndex]);

  return (
    <div
      ref={trackRef}
      data-journey-track=""
      className="relative border-t"
      style={{ height: `${stages.length * VH_PER_STAGE * 100}vh` }}
    >
      <div className="h-screen-safe sticky top-0 w-full overflow-hidden bg-background">
        {/* The rail has its own margin beside the layers, so it reads the same over
            every stage whichever side that stage's photograph is on. */}
        <div className={cn('absolute inset-y-0 left-0 overflow-hidden', side ? 'right-32 lg:right-40' : 'right-0')}>
          {stages.map(({ stage, cover }, i) => {
            const isEven = i % 2 === 0;
            const isActive = i === activeIndex;
            const phase: Phase =
              i < activeIndex ? 'out' : i > activeIndex ? 'before' : leaving ? 'out' : arrived ? 'in' : 'before';

            return (
              <div
                key={stage.slug}
                ref={(el) => {
                  layerRefs.current[i] = el;
                }}
                data-stage-layer=""
                aria-hidden={!isActive}
                className="absolute inset-0"
                style={{ zIndex: i + 1 }}
              >
                <div className={cn('flex h-full w-full', side ? (isEven ? 'flex-row' : 'flex-row-reverse') : 'flex-col')}>
                  <div className={cn('relative overflow-hidden bg-secondary', side ? 'h-full w-1/2' : 'h-[42%] w-full')}>
                    <div
                      ref={(el) => {
                        photoRefs.current[i] = el;
                      }}
                      className="h-full w-full"
                    >
                      {cover && (
                        <LazyImage
                          image={cover.image}
                          alt={cover.alt}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="h-full w-full object-cover"
                          style={{ objectPosition: cover.position }}
                        />
                      )}
                    </div>
                    <span
                      ref={(el) => {
                        dimRefs.current[i] = el;
                      }}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-ink opacity-0"
                    />
                  </div>

                  <div
                    className={cn(
                      'relative flex items-center overflow-hidden bg-background',
                      // The hairline between the halves is the copy's, on its photograph side.
                      // pt clears the navbar; on a phone it clears the rail on the seam.
                      side ? cn('h-full w-1/2 pt-16 lg:pt-20', isEven ? 'border-l' : 'border-r') : 'h-[58%] w-full pt-12',
                      phase !== 'in' && 'pointer-events-none'
                    )}
                  >
                    <span aria-hidden="true" className={cn('absolute -bottom-[0.1em] right-[0.06em]', NUMERAL_TYPE)}>
                      <span
                        ref={(el) => {
                          numeralRefs.current[i] = el;
                        }}
                        className="text-outline block"
                      >
                        {numeral(i)}
                      </span>
                    </span>

                    <div
                      className={cn(
                        'relative w-full',
                        side ? 'max-w-2xl px-6 md:px-10 lg:px-14 xl:px-20' : 'px-4 pb-4 sm:px-6'
                      )}
                    >
                      <StageCopy
                        stage={stage}
                        index={i}
                        phase={phase}
                        compact={!side || short}
                        labelSize="display-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <span
            ref={edgeRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 border-t border-foreground/60 opacity-0"
          />
        </div>

        {/* Seed → Smoke. Real links, so every stage page is one step away by keyboard;
            they only take focus while the pinned viewport is what is on screen. */}
        <nav
          ref={railRef}
          aria-label="Journey stages"
          className={cn(
            'absolute z-30 bg-background transition-opacity duration-700',
            side
              ? // pb keeps Smoke clear of the floating enquiry button on a short window;
                // pr keeps the links' focus ring inside the pinned frame.
                'inset-y-0 right-0 flex w-32 items-center border-l pb-24 pr-2 pt-16 lg:w-40 lg:pt-20'
              : 'inset-x-0 top-[42%] h-12 border-y px-4 sm:px-6',
            arrived ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Seven equal cells put a tick at 1/14, 3/14 … 13/14; the fill runs first tick to last. */}
          <div className={cn('relative w-full', side ? 'h-full max-h-[30rem]' : 'h-full')}>
            {/* No track of its own: the fill is drawn ON the hairline that rules the rail
                off (its left border, or its top border on a phone). 1px of accent — the
                one place this section spends it. */}
            <span
              aria-hidden="true"
              className={cn('absolute', side ? 'inset-y-[7.143%] -left-px w-px' : 'inset-x-[7.143%] -top-px h-px')}
            >
              <span
                className={cn(
                  'block h-full w-full bg-accent',
                  side
                    ? 'origin-top [transform:scaleY(var(--journey-progress,0))]'
                    : 'origin-left [transform:scaleX(var(--journey-progress,0))]'
                )}
              />
            </span>
            <ol role="list" className={cn('flex h-full w-full', side && 'flex-col')}>
              {stages.map(({ stage }, i) => {
                const current = i === activeIndex;
                return (
                  <li key={stage.slug} className="min-h-0 min-w-0 flex-1">
                    <Link
                      to={`/journey/${stage.slug}`}
                      tabIndex={engaged ? undefined : -1}
                      aria-current={current ? 'step' : undefined}
                      className={cn(
                        'group relative flex h-full w-full font-mono text-[11px] font-medium uppercase tracking-[0.14em] transition-colors hover:text-foreground lg:tracking-[0.18em]',
                        side ? 'items-center' : 'flex-col items-center',
                        current ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'shrink-0 transition-[transform,background-color]',
                          side ? 'h-px w-3 origin-left lg:w-5' : 'h-2.5 w-px origin-top',
                          i <= activeIndex ? 'bg-accent' : 'bg-foreground/30',
                          current ? 'scale-100' : side ? 'scale-x-50' : 'scale-y-50'
                        )}
                      />
                      <span
                        className={cn(
                          'whitespace-nowrap transition-[opacity,transform]',
                          side ? 'pl-2 lg:pl-3' : 'mt-2',
                          side && (current ? 'translate-x-0' : '-translate-x-1.5'),
                          // On a phone only the current stage is named: seven labels do not fit a 360px line.
                          !side && (current ? 'opacity-100' : 'opacity-0')
                        )}
                      >
                        {stage.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>
      </div>
    </div>
  );
};

const ProcessSection = () => {
  const plain = usePlainLayout();

  return (
    <section id="journey" aria-labelledby="journey-heading" className="relative bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 md:pt-32 lg:pt-36">
        {/* Opens as every homepage section does: the drawn rule, one mono row, then the
            headline left over the wide cell with its note and onward row over the narrow one. */}
        <SectionHead number="04" label={journeyIntro.eyebrow} meta={`${STAGE_TOTAL} Stages`} />

        <div className="mt-12 grid gap-y-10 pb-14 md:mt-16 md:pb-20 lg:mt-20 lg:grid-cols-12 lg:items-end">
          <SplitReveal
            as="h2"
            id="journey-heading"
            text={journeyIntro.heading}
            italicWords={['Journey']}
            className="display-lg text-foreground lg:col-span-7 lg:pr-8"
          />
          <Reveal delay={0.15} className="lg:col-span-5 lg:pl-8">
            <p className="display-xs max-w-[26ch] pb-8 text-foreground">{hero.subtitle}</p>
            <RowLink to="/journey" meta={`(${STAGE_TOTAL})`} className="border-b">
              All stages
            </RowLink>
          </Reveal>
        </div>
      </div>

      {plain ? <StageList /> : <StageScroller />}
    </section>
  );
};

export default ProcessSection;
