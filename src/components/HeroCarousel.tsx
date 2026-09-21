import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FocusEvent, PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import HeroStats from '@/components/HeroStats';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import DrawnRule from '@/components/motion/DrawnRule';
import Magnetic from '@/components/motion/Magnetic';
import SplitReveal from '@/components/motion/SplitReveal';
import { EASE, isStill, useReveal } from '@/lib/motion';
import { heroImages } from '@/content/images';
import { hero, site } from '@/content/site';

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
 * The headline at the scale of the window. Below lg it is held to two lines by an em
 * measure — "From Seed" fits, "From Seed to" does not, in Fraunces and in the Georgia
 * fallback alike — and from lg it is one unbroken line across the grid. Either way the
 * line count is fixed before the webfont lands, so its arrival shifts nothing. Sized
 * by width AND height, so a short laptop window shrinks the type rather than pushing
 * the stat strip below the fold.
 */
const HEADLINE =
  'max-w-[5.1em] font-display text-[length:clamp(3.25rem,min(18.5vw,17vh),9.5rem)] font-normal leading-[0.94] tracking-[-0.035em] text-ink-foreground lg:max-w-none lg:whitespace-nowrap lg:text-[length:clamp(5rem,min(9.6vw,21vh),8.625rem)]';

/** Seconds into the load choreography: label, headline, rule, lead, buttons, figures. */
const AT = { eyebrow: 0.1, headline: 0.2, rule: 0.55, lead: 0.65, actions: 0.75, stats: 0.9, dots: 1.1 } as const;

const CTA =
  'inline-flex min-h-12 items-center justify-center rounded-md px-7 text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ease-quart-out focus-visible:ring-gold focus-visible:ring-offset-ink';
const CONTROL =
  'flex h-11 min-w-11 items-center justify-center rounded-full focus-visible:ring-gold focus-visible:ring-offset-ink';

/**
 * Full-screen hero: photography wipes behind a fixed block of live text.
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
 * the label fades in, the headline rises word by word, the gold rule draws across,
 * then the lead, the buttons and the figures follow. Every piece is data-enter, so
 * the prerendered copy waits unpainted for the app instead of showing and replaying
 * (index.css). The photograph is never hidden — it is the LCP element.
 */
const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState(-1);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  // Read once per mount: the prerender snapshot and reduced-motion visitors get a
  // still hero — no autoplay, and the dots cut straight to the slide.
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

      {/* Legibility: darkest where the copy sits, a touch at the top for the navbar. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-t from-ink/80 via-ink/30 to-ink/40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-r from-ink/55 via-ink/10 to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pb-3 pt-24 sm:px-6 lg:pt-28">
        <div>
          {/* .eyebrow is dark gold for ivory pages; over the photo it needs the bright gold.
              From sm up only: on a phone the logo lockup sits directly above and
              already spells the company name out, so the line would read twice. */}
          <Reveal as="p" trigger="enter" from="none" delay={AT.eyebrow} className="eyebrow hidden text-gold sm:block">
            {site.name}
          </Reveal>
          {/* The italic is typographic only: the words are hero.title, untouched. */}
          <SplitReveal
            as="h1"
            id="hero-heading"
            trigger="enter"
            delay={AT.headline}
            stagger={0.09}
            text={hero.title}
            italicWords={['to']}
            className={`${HEADLINE} sm:mt-4`}
          />
          <DrawnRule trigger="enter" delay={AT.rule} className="mt-5 md:mt-7" />
          {/* Lead to the left, the two ways on to the right; the rule ties them together. */}
          <div className="mt-5 grid gap-y-6 md:mt-6 lg:grid-cols-12 lg:items-end lg:gap-x-16">
            <Reveal
              as="p"
              trigger="enter"
              delay={AT.lead}
              className="max-w-xl text-base/relaxed text-ink-foreground/90 md:text-xl/relaxed lg:col-span-6"
            >
              {hero.subtitle}
            </Reveal>
            {/* No backdrop blur on the outline button: inside a wrapper that is fading
                in, a backdrop filter has nothing behind it and pops on at the end. */}
            <Reveal
              trigger="enter"
              delay={AT.actions}
              className="flex flex-col gap-3 sm:flex-row lg:col-span-6 lg:justify-end"
            >
              <Magnetic>
                <Link
                  to="/contact"
                  data-lead="hero-request-quote"
                  data-cursor="enquire"
                  className={`${CTA} bg-accent text-accent-foreground hover:bg-accent/90`}
                >
                  Request a Quote
                </Link>
              </Magnetic>
              <Link
                to="/products"
                className={`${CTA} border border-ink-foreground/50 bg-ink/25 text-ink-foreground hover:border-ink-foreground hover:bg-ink-foreground/10`}
              >
                Explore Products
              </Link>
            </Reveal>
          </div>
        </div>

        <div className="mt-8 md:mt-12">
          <HeroStats delay={AT.stats} />
        </div>

        {slides.length > 1 && (
          <Reveal trigger="enter" from="none" delay={AT.dots} className="mt-2">
            <div role="group" aria-label="Hero photographs" className="flex items-center justify-center">
              {slides.map((slide, i) => (
                <button
                  key={slide.alt}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show photograph ${i + 1} of ${slides.length}`}
                  aria-current={i === current ? 'true' : undefined}
                  className={CONTROL}
                >
                  {/* A hairline that lengthens for the slide on show: scaled, never resized. */}
                  <span
                    aria-hidden="true"
                    className={`block h-0.5 w-8 rounded-full transition-[transform,background-color] duration-700 ease-expo-out ${
                      i === current ? 'bg-gold' : 'scale-x-[0.3] bg-ink-foreground/50'
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
                  aria-label={userPaused ? 'Resume photograph rotation' : 'Pause photograph rotation'}
                  className={`${CONTROL} text-ink-foreground/70 transition-colors duration-300 ease-quart-out hover:text-ink-foreground`}
                >
                  {userPaused ? (
                    <Play aria-hidden="true" className="h-3.5 w-3.5" />
                  ) : (
                    <Pause aria-hidden="true" className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

export default HeroCarousel;
