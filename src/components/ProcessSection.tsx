import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import ScrollTextReveal from '@/components/ScrollTextReveal';
import LazyImage from '@/components/LazyImage';
import { cn } from '@/lib/utils';
import { journey, journeyIntro, type JourneyStage } from '@/content/journey';
import { journeyImages } from '@/content/images';

const stages = journey.map((stage) => ({ stage, cover: journeyImages[stage.slug]?.[0] }));
const STAGE_TOTAL = String(stages.length).padStart(2, '0');

/** Scroll distance given to each stage, in viewport heights. */
const VH_PER_STAGE = 1.25;
// The incoming photograph is held back until the current stage has had time to be
// read, then slides up over the rest of that stage's progress.
const HANDOFF_START = 0.64;
const FADE_IN_END = 0.12;
const FADE_OUT_START = HANDOFF_START + 0.02;
const FADE_OUT_END = FADE_OUT_START + 0.13;

/**
 * True when the stages should be laid out as a plain list: for the prerenderer, so
 * crawlers get all seven stages as ordinary markup, and for visitors who have asked
 * for reduced motion, since the scroller is scroll-driven movement by definition.
 */
const usePlainLayout = () => {
  const reduced = usePrefersReducedMotion();
  return window.__PRERENDER__ === true || reduced;
};

interface StageCopyProps {
  stage: JourneyStage;
  index: number;
  /** Right-align on desktop (stages whose text sits left of the photograph). */
  alignEnd?: boolean;
  /** false takes the link out of the tab order (layers that are not on screen). */
  focusable?: boolean;
  /** Draws the rule; the scroller ties this to the text being readable. */
  settled?: boolean;
  /** The mobile scroller panel is half a screen tall, so the text is clamped there. */
  clamp?: boolean;
}

const StageCopy = ({
  stage,
  index,
  alignEnd = false,
  focusable = true,
  settled = true,
  clamp = false,
}: StageCopyProps) => (
  <>
    <span className="eyebrow text-[10px] md:text-xs">
      {String(index + 1).padStart(2, '0')} / {STAGE_TOTAL}
    </span>
    <h3 className="mt-2 font-display text-2xl font-medium text-foreground md:mt-3 md:text-4xl lg:text-5xl">
      {stage.label}
    </h3>
    <p className="mt-2 font-display text-base leading-snug text-accent md:mt-3 md:text-2xl lg:text-3xl">
      {stage.title}
    </p>
    <p
      className={cn(
        'mt-2 text-sm leading-relaxed text-muted-foreground md:mt-4 md:text-base lg:text-lg',
        clamp && 'line-clamp-3 md:line-clamp-none'
      )}
    >
      {stage.short}
    </p>
    <span
      aria-hidden="true"
      className={cn(
        'mt-3 block h-px bg-gold/70 transition-[width] duration-700 ease-out md:mt-6',
        settled ? 'w-16' : 'w-0',
        alignEnd && 'md:ml-auto'
      )}
    />
    <Link
      to={`/journey/${stage.slug}`}
      tabIndex={focusable ? undefined : -1}
      className="group mt-1 inline-flex min-h-11 items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-accent transition-colors duration-300 hover:text-foreground md:mt-3"
    >
      Know More
      <span className="sr-only">: {stage.label}</span>
      <ArrowRight
        aria-hidden="true"
        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  </>
);

/** Every stage in the flow of the page: photograph and text, alternating sides. */
const StageList = () => (
  <ol className="mx-auto max-w-7xl space-y-16 px-4 pb-24 sm:px-6 md:space-y-24 md:pb-32">
    {stages.map(({ stage, cover }, i) => (
      <li key={stage.slug} className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
        <div
          className={cn(
            'relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary',
            i % 2 === 1 && 'md:order-2'
          )}
        >
          {cover && (
            <LazyImage
              image={cover.image}
              alt={cover.alt}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 608px"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: cover.position }}
            />
          )}
        </div>
        <div>
          <StageCopy stage={stage} index={i} />
        </div>
      </li>
    ))}
  </ol>
);

/**
 * The sticky scroller: a tall track with a pinned viewport. Each stage is a
 * full-screen layer (half photograph, half text, alternating sides); scrolling
 * slides the next layer up over the last.
 */
const StageScroller = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [{ activeIndex, stageProgress }, setScrollState] = useState({
    activeIndex: 0,
    stageProgress: 0,
  });

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!track || !sticky) return;
    const scrollable = track.offsetHeight - sticky.offsetHeight;
    if (scrollable <= 0) return;

    const overall = Math.max(0, Math.min(1, -track.getBoundingClientRect().top / scrollable));
    const raw = overall * stages.length;
    const nextIndex = Math.min(Math.floor(raw), stages.length - 1);
    const nextProgress = raw - nextIndex;

    // Away from the section the values stop changing; returning the same object
    // lets React skip the render instead of repainting seven layers per frame.
    setScrollState((prev) =>
      prev.activeIndex === nextIndex && prev.stageProgress === nextProgress
        ? prev
        : { activeIndex: nextIndex, stageProgress: nextProgress }
    );
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [handleScroll]);

  // A layer becomes aria-hidden the moment it stops being current; do not leave
  // keyboard focus stranded inside it.
  useEffect(() => {
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && focused.closest('[data-stage-layer][aria-hidden="true"]')) {
      focused.blur();
    }
  }, [activeIndex]);

  const goToStage = (index: number) => {
    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!track || !sticky) return;
    const scrollable = track.offsetHeight - sticky.offsetHeight;
    const trackTop = track.getBoundingClientRect().top + window.scrollY;
    // Land a little way into the stage, where its text has finished fading in.
    const into = index === 0 ? 0 : 0.25;
    window.scrollTo({
      top: trackTop + ((index + into) / stages.length) * scrollable,
      behavior: 'smooth',
    });
  };

  return (
    <div
      ref={trackRef}
      className="relative"
      style={{ height: `${stages.length * VH_PER_STAGE * 100}vh` }}
    >
      <div ref={stickyRef} className="h-screen-safe sticky top-0 w-full overflow-hidden">
        {stages.map(({ stage, cover }, i) => {
          const isEven = i % 2 === 0;
          const isActive = i === activeIndex;

          let translateY = 0;
          let scale = 1.04;
          let layerOpacity = 1;

          if (i < activeIndex) {
            scale = 1 + 0.02 * Math.max(0, 1 - (activeIndex - i) * 0.5);
          } else if (isActive) {
            scale = 1.04 - 0.02 * Math.min(stageProgress, 1);
          } else if (i === activeIndex + 1) {
            const incoming = Math.max(0, (stageProgress - HANDOFF_START) / (1 - HANDOFF_START));
            scale = 1.05;
            if (incoming > 0) {
              translateY = 100 - incoming * 100;
            } else {
              // Parked in place but invisible rather than below the fold: LazyImage
              // only fetches what intersects the viewport, and this gets the next
              // photograph loaded a full stage before it has to slide in.
              layerOpacity = 0;
            }
          } else {
            translateY = 120;
            layerOpacity = 0;
          }

          // Text arrives quickly once its photograph is in place, holds for a long
          // readable plateau, then fades just as the next photograph starts to rise.
          let textOpacity = 0;
          let textY = 30;
          if (isActive) {
            const isLast = i === stages.length - 1;
            // The first stage is already on screen when the section scrolls into view.
            const fadeIn = i === 0 ? 1 : Math.min(1, stageProgress / FADE_IN_END);
            const fadeOut =
              !isLast && stageProgress > FADE_OUT_START
                ? Math.min(1, (stageProgress - FADE_OUT_START) / (FADE_OUT_END - FADE_OUT_START))
                : 0;
            textOpacity = fadeIn * (1 - fadeOut);
            textY = 30 * (1 - fadeIn);
          }
          // A gentle drift in from the far side keeps the motion calm while reading.
          const textX = (isEven ? 1 : -1) * (1 - textOpacity) * 24;
          const readable = textOpacity > 0.3;

          return (
            <div
              key={stage.slug}
              data-stage-layer=""
              aria-hidden={!isActive}
              className="absolute inset-0 will-change-transform"
              style={{
                transform: `translateY(${translateY}%)`,
                zIndex: i + 1,
                opacity: layerOpacity,
                pointerEvents: layerOpacity === 0 ? 'none' : undefined,
              }}
            >
              {/* Stacked on portrait phones, side by side everywhere else */}
              <div
                className={cn(
                  'flex h-full w-full flex-col',
                  isEven ? 'md:flex-row landscape:flex-row' : 'md:flex-row-reverse landscape:flex-row-reverse'
                )}
              >
                <div className="relative h-1/2 w-full overflow-hidden bg-secondary md:h-full md:w-1/2 landscape:h-full landscape:w-1/2">
                  {cover && (
                    <LazyImage
                      image={cover.image}
                      alt={cover.alt}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: cover.position,
                        transform: `scale(${scale})`,
                        transition: 'transform 0.1s linear',
                      }}
                    />
                  )}
                </div>

                <div
                  className="flex h-1/2 w-full items-center bg-background md:h-full md:w-1/2 landscape:h-full landscape:w-1/2"
                  style={{ opacity: textOpacity, pointerEvents: readable ? 'auto' : 'none' }}
                >
                  <div
                    className={cn(
                      'w-full max-w-xl pl-6 pr-14 md:px-16 lg:px-20',
                      isEven ? 'md:text-left' : 'md:ml-auto md:text-right'
                    )}
                    style={{
                      transform: `translateY(${textY}px) translateX(${textX}px)`,
                      transition: 'transform 0.1s linear',
                    }}
                  >
                    <StageCopy
                      stage={stage}
                      index={i}
                      alignEnd={!isEven}
                      focusable={isActive && readable}
                      settled={textOpacity > 0.5}
                      clamp
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Stage rail: shows progress and jumps to a stage */}
        <div
          role="group"
          aria-label="Journey stages"
          className="absolute right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center md:right-4"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-3 left-1/2 w-5 -translate-x-1/2 rounded-full border border-border/60 bg-background/70 backdrop-blur-md md:inset-y-0"
          />
          {stages.map(({ stage }, i) => (
            <button
              key={stage.slug}
              type="button"
              onClick={() => goToStage(i)}
              aria-label={`Stage ${i + 1} of ${stages.length}: ${stage.label}`}
              aria-current={i === activeIndex ? 'step' : undefined}
              title={stage.label}
              className="relative flex h-11 w-11 items-center justify-center rounded-full md:h-7 md:w-7"
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-500',
                  i <= activeIndex ? 'bg-accent' : 'bg-accent/30',
                  i === activeIndex && 'scale-150'
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProcessSection = () => {
  const plain = usePlainLayout();
  const { ref: headingRef, isVisible: headingVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <section id="journey" aria-labelledby="journey-heading" className="relative bg-background">
      <div ref={headingRef} className="overflow-hidden px-4 pb-14 pt-24 text-center sm:px-6 md:pb-20 md:pt-32">
        {/* The reveal splits text into per-letter spans; hide those and label the real element. */}
        <div className="eyebrow">
          <span className="sr-only">{journeyIntro.eyebrow}</span>
          <span aria-hidden="true">
            <ScrollTextReveal text={journeyIntro.eyebrow} staggerDelay={25} />
          </span>
        </div>
        <h2
          id="journey-heading"
          aria-label={journeyIntro.heading}
          className="mt-4 overflow-hidden pb-1 font-display text-4xl font-medium leading-tight text-foreground md:text-6xl"
        >
          <span aria-hidden="true">
            <ScrollTextReveal text={journeyIntro.heading} staggerDelay={50} threshold={0.2} />
          </span>
        </h2>
        <div
          aria-hidden="true"
          className={cn(
            'mx-auto mt-6 h-px bg-gold/70 transition-[width] delay-500 duration-1000 ease-out',
            headingVisible ? 'w-20' : 'w-0'
          )}
        />
      </div>

      {plain ? <StageList /> : <StageScroller />}
    </section>
  );
};

export default ProcessSection;
