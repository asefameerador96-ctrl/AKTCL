import { useCallback, useEffect, useRef, useState } from 'react';
import type { FocusEvent, PointerEvent } from 'react';
import { Pause, Play } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import SplitReveal from '@/components/motion/SplitReveal';
import { EASE, isStill, useReveal } from '@/lib/motion';
import { heroSlides } from '@/content/images';
import { hero } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The hero rotation: the photograph of the growers, then AKTCL's two trade-fair
 * banners (heroSlides, in src/content/images.ts). The banners are finished artwork
 * carrying their own words, so the headline is taken off the screen while one is up.
 * It stays in the page all the same — the section's heading and its accessible name —
 * and it keeps its place in the layout, so the controls under it never jump.
 *
 * The change is a dissolve, not a wipe or a slide: two of the three slides are flat
 * artwork with set type, and anything that shears or crops that type reads as a fault.
 * The arriving slide is the one that fades, over the outgoing one at full strength, so
 * the composite never dips toward the ink underneath at the crossover.
 */
const SLIDE_MS = 6000;
const FADE_S = 1.2;
/** The photograph's arrival settle. Flat artwork is left alone: see `settleOf`. */
const SCALE_S = 1.6;
const RESTING = 'scale(1.04)';

/**
 * A full-screen cover crop scales the photo to the viewport HEIGHT on portrait
 * screens, so it is drawn ~1.79 × the viewport height wide there (the masters are
 * 1920×1072), not 100vw. Saying so stops phones from picking a file that looks soft.
 * A contained banner is never wider than the screen.
 */
const SIZES = {
  cover: '(max-aspect-ratio: 1/1) 179vh, 100vw',
  // A banner is covered like the photograph, except on a portrait phone, where it is
  // fitted whole and drawn at twice the width of the window (see the class below).
  contain: '(max-aspect-ratio: 9/10) 200vw, (max-aspect-ratio: 1/1) 179vh, 100vw',
} as const;

/**
 * The headline is the hero's only text, so it is set large: .display-xl with a fluid
 * size of its own that answers to the window's width AND height — one clamp(), no
 * breakpoint ladder. The width term rules on a phone, the height term on a laptop, so
 * a short window shrinks the type rather than pushing it into the navbar.
 *
 * Always two lines, "From Seed" / "to Smoke", held by an em measure rather than a
 * <br> (the words are hero.title, untouched): "From Seed" (3.3em) fits the 3.6em
 * measure, "From Seed to" (4em) does not — in Instrument Serif and in its
 * metric-matched fallback alike (src/fonts.css). The line count is therefore fixed
 * before the webfont lands, and its arrival shifts nothing.
 */
const HEADLINE =
  'display-xl max-w-[3.6em] text-[length:clamp(3.5rem,min(21vw,19vh),11.5rem)] text-ink-foreground';

/** Seconds into the load choreography at which the first word rises. */
const HEADLINE_AT = 0.15;

/**
 * If the load event is slow or never arrives, the later slides still mount: a hero
 * that cannot rotate because one picture is still in flight is worse than one that
 * asks for the file a moment early.
 */
const MOUNT_FALLBACK_MS = 4000;

/** 44px targets, in the site's control language: colour and a hairline, nothing moves. */
const CONTROL =
  'flex h-11 min-w-11 items-center justify-center transition-colors focus-visible:relative focus-visible:z-10';
/**
 * The marks take the ground they stand on — white over the photograph, black over the
 * banners, which are drawn on near-white (HeroSlide.dark). Both colours are fixed in
 * both themes: the picture under them does not change with the theme.
 */
const MARK = {
  on: { true: 'bg-ink-foreground', false: 'bg-scrim' },
  off: { true: 'bg-ink-foreground/40', false: 'bg-scrim/40' },
  icon: {
    true: 'text-ink-foreground/70 [@media(hover:hover)]:hover:text-ink-foreground',
    false: 'text-scrim/70 [@media(hover:hover)]:hover:text-scrim',
  },
} as const;

/**
 * Full-screen hero: one picture and the headline, nothing else. No subtitle, no
 * buttons, no figures — the navbar over it carries the way on.
 *
 * The headline stands at the foot of the sheet on the page's left edge, the way a
 * title block reads from its bottom line, with the picture open above it.
 *
 * min-h (not h) so a short landscape phone grows the hero instead of clipping the
 * headline; on every ordinary viewport it is exactly one screen (100svh).
 *
 * Load choreography (once, after the age gate): the photograph settles from 1.06 while
 * the headline rises word by word. The headline is data-enter, so the prerendered copy
 * waits unpainted for the app instead of showing and replaying (index.css). The
 * photograph is never hidden — it is the LCP element, loaded at high priority; the
 * banners wait for the load event before they ask for a file of their own.
 *
 * isStill() — the prerender snapshot, and visitors who ask for reduced motion — gets
 * every slide and its controls, but nothing moves on its own: no rotation, no fade, no
 * dwell meter, and so no need of a pause control (WCAG 2.2.2). The banners are still
 * reachable by their controls, which is the point: reduced motion asks for stillness,
 * not for content to be withheld.
 */
const HeroCarousel = () => {
  // Read once per mount: see above.
  const [still] = useState(isStill);
  const [current, setCurrent] = useState(0);
  // The slide being left: it holds at full strength under the arriving one.
  const [leaving, setLeaving] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  // The banners mount once the page has loaded, so nothing competes with the LCP image.
  const [restMounted, setRestMounted] = useState(() => still || document.readyState === 'complete');
  // The photograph eases back as the words arrive. Scale only: see above.
  const settled = useReveal(true);

  const slides = heroSlides;
  const rotating =
    !still && slides.length > 1 && restMounted && !userPaused && !held && !tabHidden;
  const showHeadline = slides[current]?.headline ?? true;
  // Which of the two control colours the picture under them calls for.
  const ground = `${slides[current]?.dark ?? true}` as 'true' | 'false';

  useEffect(() => {
    if (restMounted) return undefined;
    // The listener can be set after the event has already fired, so read the state too.
    if (document.readyState === 'complete') {
      setRestMounted(true);
      return undefined;
    }
    const mount = () => setRestMounted(true);
    window.addEventListener('load', mount, { once: true });
    const fallback = window.setTimeout(mount, MOUNT_FALLBACK_MS);
    return () => {
      window.removeEventListener('load', mount);
      window.clearTimeout(fallback);
    };
  }, [restMounted]);

  // The rotation never advances past what is mounted: `rotating` requires restMounted,
  // so it can never hand the screen to a slide that is not there yet.
  useEffect(() => {
    if (!rotating) return undefined;
    const id = window.setTimeout(() => setCurrent((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [rotating, current, slides.length]);

  // A rotation nobody can see is only a way to run the set out behind a visitor's back.
  useEffect(() => {
    if (still) return undefined;
    const onVisibility = () => setTabHidden(document.visibilityState === 'hidden');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [still]);

  // The outgoing slide is kept at full strength until the arriving one has covered it.
  const shown = useRef(current);
  useEffect(() => {
    if (still || shown.current === current) return undefined;
    const left = shown.current;
    shown.current = current;
    setLeaving(left);
    const id = window.setTimeout(() => setLeaving((l) => (l === left ? null : l)), FADE_S * 1000);
    return () => window.clearTimeout(id);
  }, [current, still]);

  // A visitor who asks for a slide gets it whether or not the load event has fired.
  const go = useCallback((index: number) => {
    setRestMounted(true);
    setCurrent(index);
  }, []);

  // The hold belongs to the CONTROLS, not to the hero. The hero fills the window, so a
  // cursor left anywhere on the page — which is where a cursor usually is, and exactly
  // where the age gate's button leaves it — sat inside the hero and stopped the
  // rotation for good (owner, 2026-09-23: "why doesn't it go to the next banner").
  // Over the controls the hold is still right: a visitor reaching for a dot should not
  // have the set move under the pointer.
  //
  // Mouse only: on a touch screen "enter" fires on a tap and "leave" may never follow.
  const onPointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') setHeld(true);
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
  };

  /**
   * The arriving photograph eases down from RESTING to its own size. Flat artwork is
   * left alone: a banner is finished type, it already takes a scale of its own on
   * portrait screens, and a second one would set that type moving for no reason.
   */
  const settleOf = (slide: (typeof slides)[number], i: number, isCurrent: boolean) => {
    if (still || slide.fit !== 'cover') return undefined;
    if (i === 0 && !settled) return 'scale(1.06)'; // the load choreography comes first
    return isCurrent ? 'scale(1)' : RESTING;
  };

  return (
    <section
      aria-labelledby="hero-heading"
      aria-roledescription={slides.length > 1 ? 'carousel' : undefined}
      className="relative isolate flex min-h-screen-safe w-full flex-col overflow-hidden bg-ink"
    >
      {slides.map((slide, i) => {
        if (i > 0 && !restMounted) return null;
        const isCurrent = i === current;
        return (
          <div
            key={slide.label}
            // index.css holds the prerendered copy of the first frame at the same 1.06
            // until the app is live, so the hand-over is not a jump.
            data-hero-settle={i === 0 ? '' : undefined}
            aria-hidden={!isCurrent}
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: isCurrent || i === leaving ? 1 : 0,
              zIndex: isCurrent ? 2 : 1,
              transform: settleOf(slide, i, isCurrent),
              transition: still
                ? undefined
                : `opacity ${FADE_S}s ${EASE.expoInOut}, transform ${SCALE_S}s ${EASE.expoOut}`,
            }}
          >
            <LazyImage
              image={slide.image.image}
              alt={slide.image.alt}
              sizes={SIZES[slide.fit]}
              priority={i === 0}
              className={cn(
                'absolute inset-0 h-full w-full',
                // The banners (2026-09-23 artwork) carry their ink in the middle 39% of
                // the frame — measured on the wider of the two; the other is 29% — with
                // nothing but ground and pattern outside it. So they fill the screen
                // like the photograph does, and the crop takes only that empty margin:
                // covering a 1/1 window still shows the middle 56% of the artwork, and
                // anything wider shows more.
                //
                // Under about 9/10 that stops being true, so a phone held upright gets
                // the whole frame instead, drawn twice the size — which shows the middle
                // half, still a comfortable margin around the ink, and makes the dates
                // and stall numbers readable. Fitted without it, the banner would be a
                // 219px strip in an 844px screen.
                slide.fit === 'cover'
                  ? 'object-cover'
                  : 'object-cover [@media(max-aspect-ratio:9/10)]:scale-[2] [@media(max-aspect-ratio:9/10)]:object-contain'
              )}
              style={{ objectPosition: slide.fit === 'cover' ? slide.image.position : undefined }}
            />
          </div>
        );
      })}

      {/* Legibility, in washes rather than panels, and always in Black (scrim): the Slate
          ink of the light theme greys a photograph instead of darkening it. An even
          veil; a lean to the left, where the headline stands; and a foot that deepens
          under it. The upper photograph is left open — the navbar brings its own scrim.
          A banner carries no words of ours, so it is shown as it was drawn: the washes
          leave with the headline. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          opacity: showHeadline ? 1 : 0,
          transition: still ? undefined : `opacity ${FADE_S}s ${EASE.expoInOut}`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-scrim/50 via-scrim/30 to-scrim/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-scrim/50 via-scrim/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-scrim/80 via-scrim/45 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-end pt-24 lg:pt-28">
        <div className="mx-auto w-full max-w-7xl px-4 pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-20 lg:pb-24">
          {/* Off the screen while a banner is up, but still the section's heading and
              still holding its place: the page keeps one h1 whichever slide is showing,
              and the controls under it stay put as the slides change. */}
          <div
            className={cn(!showHeadline && 'pointer-events-none select-none')}
            style={{
              opacity: showHeadline ? 1 : 0,
              transition: still ? undefined : `opacity ${FADE_S}s ${EASE.expoInOut}`,
            }}
          >
            {/* The italic is typographic only: the words are hero.title, untouched. */}
            <SplitReveal
              as="h1"
              id="hero-heading"
              trigger="enter"
              delay={HEADLINE_AT}
              stagger={0.09}
              text={hero.title}
              italicWords={['to']}
              className={HEADLINE}
            />
          </div>

          {slides.length > 1 && (
            <div
              className="mt-8 flex w-fit items-center gap-1 md:mt-10"
              onPointerEnter={onPointerEnter}
              onPointerLeave={() => setHeld(false)}
              onFocus={() => setHeld(true)}
              onBlur={onBlur}
            >
              {slides.map((slide, i) => (
                <button
                  key={slide.label}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show ${slide.label}`}
                  aria-current={i === current ? 'true' : undefined}
                  className={CONTROL}
                >
                  {/* A rule, not a dot: the hairline is the site's mark for a step. 2px,
                      not 1: a hairline over a photograph is a hint, and this is a
                      control. The rule of the slide that is up doubles as the dwell
                      meter — it fills across the six seconds and stops where it stands
                      when the rotation is held, so the set is visibly alive and
                      visibly paused. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'relative block h-0.5 overflow-hidden transition-all duration-500',
                      i === current ? `w-10 ${MARK.off[ground]}` : `w-5 ${MARK.off[ground]}`
                    )}
                  >
                    {i === current &&
                      (still ? (
                        <span className={cn('absolute inset-0', MARK.on[ground])} />
                      ) : (
                        <span
                          key={current}
                          className={cn('hero-dwell absolute inset-0', MARK.on[ground])}
                          style={{
                            animationDuration: `${SLIDE_MS}ms`,
                            animationPlayState: rotating ? 'running' : 'paused',
                          }}
                        />
                      ))}
                  </span>
                </button>
              ))}
              {/* Hover and focus hold the rotation while a visitor is at the controls;
                  this is the explicit control WCAG 2.2.2 asks for. Nothing rotates
                  under isStill(), so it is not drawn there. */}
              {!still && (
                <button
                  type="button"
                  onClick={() => setUserPaused((paused) => !paused)}
                  aria-label={userPaused ? 'Play the hero rotation' : 'Pause the hero rotation'}
                  aria-pressed={userPaused}
                  className={cn(CONTROL, 'ml-1', MARK.icon[ground])}
                >
                  {userPaused ? (
                    <Play aria-hidden="true" className="h-3.5 w-3.5" />
                  ) : (
                    <Pause aria-hidden="true" className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
