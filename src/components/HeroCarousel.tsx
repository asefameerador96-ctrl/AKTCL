import { useState } from 'react';
import LazyImage from '@/components/LazyImage';
import SplitReveal from '@/components/motion/SplitReveal';
import { EASE, isStill, useReveal } from '@/lib/motion';
import { heroImages } from '@/content/images';
import { hero } from '@/content/site';

/**
 * The one hero photograph (H1, the growers in the field). The five-panel seed-to-smoke
 * collage that used to alternate with it now stands in "Who We Are" instead, so the
 * hero no longer rotates — and with nothing moving on its own, it needs no pause
 * control (WCAG 2.2.2).
 */
const photo = heroImages[0];

/**
 * A full-screen cover crop scales the photo to the viewport HEIGHT on portrait
 * screens, so it is drawn ~1.79 × the viewport height wide there (the masters are
 * 1920×1072), not 100vw. Saying so stops phones from picking a file that looks soft.
 */
const HERO_SIZES = '(max-aspect-ratio: 1/1) 179vh, 100vw';

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
 * Full-screen hero: one photograph and the headline, nothing else. No subtitle, no
 * buttons, no figures, no counter — the navbar over it carries the way on.
 *
 * The headline stands at the foot of the sheet on the page's left edge, the way a
 * title block reads from its bottom line, with the photograph open above it.
 *
 * min-h (not h) so a short landscape phone grows the hero instead of clipping the
 * headline; on every ordinary viewport it is exactly one screen (100svh).
 *
 * Load choreography (once, after the age gate): the photograph settles from 1.06 while
 * the headline rises word by word. The headline is data-enter, so the prerendered copy
 * waits unpainted for the app instead of showing and replaying (index.css). The
 * photograph is never hidden — it is the LCP element, loaded at high priority.
 */
const HeroCarousel = () => {
  // Read once per mount: the prerender snapshot and reduced-motion visitors get the
  // photograph at rest.
  const [still] = useState(isStill);
  // The photograph eases back as the words arrive. Scale only: see above.
  const settled = useReveal(true);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-screen-safe w-full flex-col overflow-hidden bg-ink"
    >
      <div
        // index.css holds the prerendered copy at the same 1.06 until the app is live,
        // so the hand-over is not a jump.
        data-hero-settle=""
        className="absolute inset-0"
        style={
          still
            ? undefined
            : { transform: settled ? 'none' : 'scale(1.06)', transition: `transform 1.2s ${EASE.expoOut}` }
        }
      >
        <LazyImage
          image={photo.image}
          alt={photo.alt}
          sizes={HERO_SIZES}
          priority
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: photo.position }}
        />
      </div>

      {/* Legibility, in washes rather than panels, and always in Black (scrim): the Slate
          ink of the light theme greys a photograph instead of darkening it. An even
          veil; a lean to the left, where the headline stands; and a foot that deepens
          under it. The upper photograph is left open — the navbar brings its own scrim. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-t from-scrim/50 via-scrim/30 to-scrim/35"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-r from-scrim/50 via-scrim/10 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[60%] bg-gradient-to-t from-scrim/80 via-scrim/45 to-transparent"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-end pt-24 lg:pt-28">
        <div className="mx-auto w-full max-w-7xl px-4 pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-20 lg:pb-24">
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
      </div>
    </section>
  );
};

export default HeroCarousel;
