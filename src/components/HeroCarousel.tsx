import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FocusEvent, PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight } from 'lucide-react';
import HeroStats from '@/components/HeroStats';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import DrawnRule from '@/components/motion/DrawnRule';
import SplitReveal from '@/components/motion/SplitReveal';
import { EASE, isStill, useReveal } from '@/lib/motion';
import { heroImages } from '@/content/images';
import { hero } from '@/content/site';

const slides = heroImages;

const AUTOPLAY_MS = 6000;
const WIPE_MS = 1200;
// The incoming slide is unmasked from the right edge leftwards.
const WIPE_FROM = 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)';
const WIPE_TO = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';

/**
 * A full-screen cover crop scales the photo to the viewport HEIGHT on portrait
 * screens, so it is drawn ~1.79 × the viewport height wide there (the masters are
 * 1920×1072), not 100vw. Saying so stops phones from picking a file that looks soft.
 */
const HERO_SIZES = '(max-aspect-ratio: 1/1) 179vh, 100vw';

/**
 * The headline: .display-xl, with a fluid size of its own that answers to the window's
 * width AND height — one clamp(), no breakpoint ladder. The width term rules on a
 * phone, the height term on a laptop, so a short window shrinks the type instead of
 * pushing the figures below the fold.
 *
 * Always two lines, "From Seed" / "to Smoke", held by an em measure rather than a
 * <br> (the words are hero.title, untouched): "From Seed" (3.3em) fits the 3.6em
 * measure, "From Seed to" (4em) does not — in Instrument Serif and in its
 * metric-matched fallback alike (src/fonts.css). The line count is therefore fixed
 * before the webfont lands, and its arrival shifts nothing.
 *
 * The size is a custom property on the grid (HERO_SIZE) so the column beside the
 * headline can use it too: at a line-height of 0.95 the serif's baseline sits 0.135em
 * above the foot of its line box, and the buttons are stood on that baseline, not on
 * the box.
 */
const HERO_SIZE = '[--hero-size:clamp(3.5rem,min(20vw,16vh),10rem)]';
const HEADLINE = 'display-xl max-w-[3.6em] text-[length:var(--hero-size)] text-ink-foreground';

/** Hairlines over photography are a chalk tint: the ink hairline would vanish into the scrim. */
const LINE = 'bg-ink-foreground/25';

/** Seconds into the load choreography: headline, the rule beside it, lead, buttons, figures, controls. */
const AT = { headline: 0.15, divider: 0.5, lead: 0.6, actions: 0.7, stats: 0.8, controls: 1.15 } as const;

// The hero section is bg-ink, so the ink context (index.css) gives every control here
// the sage focus ring.
const CONTROL = 'flex h-11 items-center rounded-sm';
const MONO = 'font-mono text-[11px] font-medium uppercase leading-none tracking-[0.2em]';

const twoDigits = (n: number) => String(n).padStart(2, '0');

/**
 * Full-screen hero: photography wipes behind a fixed block of live text.
 *
 * Composed on the page's 12-column grid like a drawing sheet, not around a badge or a
 * panel: the headline takes eight columns, the lead and the two ways on take the last
 * four behind a vertical hairline, and under them the figures and the carousel's
 * controls run as two ruled rows across the full width. Nothing floats; the only
 * surfaces are the two buttons.
 *
 * The wipe is the Shah Agro clip-path reveal, with two changes. The outgoing slide
 * now holds still underneath until the wipe has finished, because this hero carries
 * light text and must never flash the page background through. And the mask is
 * played with the Web Animations API rather than left on the hidden slides as a
 * resting clip-path, so <LazyImage>'s IntersectionObserver always sees them.
 *
 * min-h (not h) so a short landscape phone grows the hero instead of clipping the
 * headline; on every ordinary viewport it is exactly one screen.
 *
 * Load choreography (once, after the age gate): the photograph settles from 1.06 while
 * the headline rises word by word, the vertical rule draws down beside it, the lead
 * and the buttons follow, then the long rule draws across and the figures rise. Every
 * piece is data-enter, so the prerendered copy waits unpainted for the app instead of
 * showing and replaying (index.css). The photograph is never hidden — it is the LCP
 * element.
 */
const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState(-1);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  // Read once per mount: the prerender snapshot and reduced-motion visitors get a
  // still hero — no autoplay, and the ticks cut straight to the slide.
  const [still] = useState(isStill);
  // The opening photograph eases back as the words arrive. Scale only: see above.
  const settled = useReveal(true);
  // Slide 0 is the LCP image. The rest mount after window load so they never
  // compete with it for bandwidth.
  const [restMounted, setRestMounted] = useState(
    () => window.__PRERENDER__ === true || document.readyState === 'complete'
  );
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wipeTimer = useRef<number>();

  const wiping = previous !== -1;

  const goTo = useCallback(
    (next: number) => {
      if (wiping || next === current) return;
      setRestMounted(true);
      setCurrent(next);
      if (still) return;
      setPrevious(current);
      wipeTimer.current = window.setTimeout(() => setPrevious(-1), WIPE_MS);
    },
    [current, wiping, still]
  );

  useEffect(() => () => window.clearTimeout(wipeTimer.current), []);

  useEffect(() => {
    if (restMounted) return;
    const mount = () => setRestMounted(true);
    // "load" may have fired between the first render and this effect.
    if (document.readyState === 'complete') {
      mount();
      return;
    }
    window.addEventListener('load', mount, { once: true });
    return () => window.removeEventListener('load', mount);
  }, [restMounted]);

  // Layout effect: the mask has to be in place before the incoming slide's first
  // paint, or it would show in full for one frame.
  useLayoutEffect(() => {
    if (!wiping) return;
    const el = slideRefs.current[current];
    if (!el || typeof el.animate !== 'function') return;
    const wipe = el.animate({ clipPath: [WIPE_FROM, WIPE_TO] }, { duration: WIPE_MS, easing: EASE.expoInOut });
    return () => wipe.cancel();
  }, [current, wiping]);

  const autoplay = !still && !userPaused && !hovered && !focusWithin && slides.length > 1;

  // A timeout re-armed after each wipe, so every slide rests for the full interval.
  useEffect(() => {
    if (!autoplay || wiping) return;
    const id = window.setTimeout(() => goTo((current + 1) % slides.length), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, wiping, current, goTo]);

  // Mouse only: on touch, "enter" fires on tap and "leave" may never follow.
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setHovered(true);
  };
  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false);
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-screen-safe w-full flex-col overflow-hidden bg-ink"
      onPointerEnter={onPointerEnter}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={onBlur}
    >
      {slides.map((slide, i) => {
        if (i > 0 && !restMounted) return null;
        const isActive = i === current;
        const isPrev = i === previous;
        return (
          <div
            key={slide.alt}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            // index.css holds the prerendered copy of the first slide at the same 1.06
            // until the app is live, so the hand-over is not a jump.
            data-hero-settle={i === 0 ? '' : undefined}
            className="absolute inset-0"
            style={{
              zIndex: isActive ? 3 : isPrev ? 2 : 1,
              visibility: isActive || isPrev ? 'visible' : 'hidden',
              ...(i === 0 && !still
                ? { transform: settled ? 'none' : 'scale(1.06)', transition: `transform 1.2s ${EASE.expoOut}` }
                : null),
            }}
          >
            <LazyImage
              image={slide.image}
              alt={slide.alt}
              sizes={HERO_SIZES}
              priority={i === 0}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: slide.position }}
            />
          </div>
        );
      })}

      {/* Legibility, in washes rather than panels — measured, not guessed: with the text
          hidden, the brightest pixel behind the 16px lead still has to leave it 4.5:1 on
          both photographs. An even veil (heavier below lg, where the copy runs the height
          of the screen); a lean to the left, where the headline stands; from lg its
          mirror on the right, behind the narrow column; and a foot that closes to solid
          ink, because the figures and the controls have no surface of their own. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-t from-ink/60 via-ink/50 to-ink/45 lg:via-ink/30 lg:to-ink/40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-r from-ink/50 via-ink/10 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-[4] hidden w-1/2 bg-gradient-to-l from-ink/60 via-ink/45 to-transparent lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[70%] bg-gradient-to-t from-ink via-ink/75 to-transparent lg:h-[60%]"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-end pt-24 lg:pt-28">
        <div className={`mx-auto grid w-full max-w-7xl px-4 sm:px-6 lg:grid-cols-12 ${HERO_SIZE}`}>
          {/* The italic is typographic only: the words are hero.title, untouched. */}
          <SplitReveal
            as="h1"
            id="hero-heading"
            trigger="enter"
            delay={AT.headline}
            stagger={0.09}
            text={hero.title}
            italicWords={['to']}
            className={`${HEADLINE} pb-7 lg:col-span-8 lg:pb-14`}
          />

          {/* The narrow column: lead, then the two ways on, stacked like directory rows.
              Its rule runs the height of the headline and lands on the figures' top line. */}
          <div className="relative flex flex-col justify-end pb-8 lg:col-span-4 lg:pb-[calc(3.5rem+var(--hero-size)*0.135)] lg:pl-8">
            <DrawnRule
              axis="y"
              trigger="enter"
              delay={AT.divider}
              lineClassName={LINE}
              className="absolute left-0 top-0 hidden lg:block"
            />
            <Reveal
              as="p"
              trigger="enter"
              delay={AT.lead}
              className="max-w-[34ch] text-base/relaxed text-ink-foreground"
            >
              {hero.subtitle}
            </Reveal>
            {/* No backdrop blur on the outline button: inside a wrapper that is fading
                in, a backdrop filter has nothing behind it and pops on at the end. */}
            <Reveal
              trigger="enter"
              delay={AT.actions}
              className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-8 lg:flex-col"
            >
              <Link
                to="/contact"
                data-lead="hero-request-quote"
                data-cursor="enquire"
                className="btn btn-lg btn-ink justify-between sm:min-w-[15rem]"
              >
                Request a Quote
                <ArrowRight aria-hidden="true" className="btn-arrow" />
              </Link>
              <Link to="/products" className="btn btn-lg btn-outline-ink justify-between border-ink-foreground/50 sm:min-w-[15rem]">
                Explore Products
                <ArrowRight aria-hidden="true" className="btn-arrow" />
              </Link>
            </Reveal>
          </div>
        </div>

        <HeroStats delay={AT.stats} />

        {/* The foot of the sheet: which photograph, the way to stop them, the way on. */}
        <Reveal trigger="enter" from="none" delay={AT.controls} className="border-t border-ink-foreground/25">
          <div className="mx-auto flex min-h-12 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            {slides.length > 1 ? (
              <div role="group" aria-label="Hero photographs" className="flex items-center">
                {/* The buttons below say the same to a screen reader (aria-current). */}
                <p aria-hidden="true" className={`${MONO} mr-3 tabular-nums text-ink-muted`}>
                  <span className="text-ink-foreground">{twoDigits(current + 1)}</span> / {twoDigits(slides.length)}
                </p>
                {slides.map((slide, i) => (
                  <button
                    key={slide.alt}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show photograph ${i + 1} of ${slides.length}`}
                    aria-current={i === current ? 'true' : undefined}
                    className={`${CONTROL} group w-11 justify-center`}
                  >
                    {/* A hairline that lengthens for the slide on show: scaled, never resized. */}
                    <span
                      aria-hidden="true"
                      className={`block h-px w-8 origin-left transition-[transform,background-color] duration-700 ease-expo-out ${
                        i === current ? 'bg-sage' : 'scale-x-[0.35] bg-ink-foreground/50 group-hover:bg-ink-foreground'
                      }`}
                    />
                  </button>
                ))}
                {/* Hover and focus already pause the rotation; this is the explicit
                    control WCAG 2.2.2 asks for. Pointless when nothing auto-advances. */}
                {!still && (
                  <button
                    type="button"
                    onClick={() => setUserPaused((paused) => !paused)}
                    // The visible word leads the name, so speech input finds it.
                    aria-label={userPaused ? 'Play photograph rotation' : 'Pause photograph rotation'}
                    className={`${CONTROL} ${MONO} ml-2 min-w-[4.25rem] px-1 text-ink-muted transition-colors hover:text-ink-foreground focus-visible:text-ink-foreground`}
                  >
                    {userPaused ? 'Play' : 'Pause'}
                  </button>
                )}
              </div>
            ) : (
              <span />
            )}
            {/* A cue, not a control: the page scrolls by itself. */}
            <p aria-hidden="true" className={`${MONO} hidden items-center gap-2 text-ink-muted min-[400px]:flex`}>
              Scroll
              <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HeroCarousel;
