import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isStill } from '@/lib/motion';

export interface MarqueeProps {
  /** Verbatim names from src/content (product categories, formats). */
  items: string[];
  /** Pixels per second at rest. */
  speed?: number;
  /** Colour and spacing. The outline is drawn in the text colour, so "text-ink-foreground" is all an ink band needs. */
  className?: string;
  /** Transparent letters with a hairline stroke (see .text-outline in index.css). */
  outlined?: boolean;
  /** Sits after every item. Defaults to a short gold rule. */
  separator?: ReactNode;
}

const TYPE = 'font-display text-[length:clamp(3rem,9vw,8rem)] font-medium leading-none tracking-[-0.03em]';
/** How much faster the band may run while the page is being scrolled hard. */
const MAX_BOOST = 2.5;

const DEFAULT_SEPARATOR = <span className="inline-block h-px w-[0.5em] bg-gold/70 align-middle" />;

/**
 * Oversized running band of names. One CSS animation on the compositor moves a track
 * holding two identical halves by exactly one half, so the loop has no seam; scroll
 * velocity only nudges that animation's playbackRate, never the transform itself.
 *
 * Read out once: the first run of items is a real list, every repeat is aria-hidden.
 * Pauses on hover, on focus inside the band, off screen, and with its own button
 * (WCAG 2.2.2 — hover is no use to a keyboard or a thumb). Under isStill() it is a
 * plain wrapped list.
 */
const Marquee = ({ items, speed = 60, className, outlined = false, separator = DEFAULT_SEPARATOR }: MarqueeProps) => {
  const [still] = useState(isStill);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLUListElement>(null);
  // Runs of `items` per half: enough that one half always out-spans the container.
  const [runs, setRuns] = useState(1);
  const [paused, setPaused] = useState(false);

  // Before first paint: fill the width, and turn px/s into the animation's duration.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const run = runRef.current;
    if (still || !root || !track || !run) return;
    const measure = () => {
      const runWidth = run.offsetWidth / runs;
      if (runWidth <= 0) return;
      const needed = Math.max(1, Math.ceil(root.clientWidth / runWidth));
      if (needed !== runs) {
        setRuns(needed);
        return;
      }
      track.style.setProperty('--marquee-duration', `${(run.offsetWidth / Math.max(speed, 1)).toFixed(2)}s`);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    // The run re-measures when the webfont lands; the root when the window changes.
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(run);
    return () => observer.disconnect();
  }, [still, runs, speed, items]);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (still || !root || !track) return;

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => root.toggleAttribute('data-offscreen', !entry.isIntersecting));
    observer?.observe(root);

    let frame = 0;
    let rate = 1;
    let lastY = window.scrollY;
    const apply = () => {
      const [animation] = typeof track.getAnimations === 'function' ? track.getAnimations() : [];
      // updatePlaybackRate keeps the compositor's position; assigning playbackRate can hitch.
      animation?.updatePlaybackRate(rate);
    };
    const settle = () => {
      rate += (1 - rate) * 0.06;
      if (rate - 1 < 0.01) rate = 1;
      apply();
      frame = rate === 1 ? 0 : requestAnimationFrame(settle);
    };
    const onScroll = () => {
      const y = window.scrollY;
      rate = Math.min(MAX_BOOST, Math.max(rate, 1 + Math.abs(y - lastY) / 40));
      lastY = y;
      if (!frame && !root.hasAttribute('data-offscreen')) frame = requestAnimationFrame(settle);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [still]);

  if (still) {
    return (
      <ul className={cn('flex flex-wrap items-baseline gap-x-[0.4em] gap-y-2 px-4 sm:px-6', TYPE, className)}>
        {items.map((item) => (
          // Not merged into the <ul>'s cn(): tailwind-merge reads "text-outline" as a
          // text colour and would drop it in favour of the caller's.
          <li key={item} className={cn('flex items-center gap-[0.4em]', outlined && 'text-outline')}>
            {item}
            <span aria-hidden="true">{separator}</span>
          </li>
        ))}
      </ul>
    );
  }

  const run = (hidden: boolean, ref?: typeof runRef) => (
    <ul ref={ref} aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {Array.from({ length: runs }, (_, r) =>
        items.map((item) => (
          <li
            key={`${r}-${item}`}
            aria-hidden={!hidden && r > 0 ? true : undefined}
            className="flex shrink-0 items-center gap-[0.4em] whitespace-nowrap pr-[0.4em]"
          >
            {item}
            <span aria-hidden="true">{separator}</span>
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div ref={rootRef} className={cn('marquee relative overflow-hidden', TYPE, className)} data-paused={paused ? '' : undefined}>
      {/* The outline sits on the track, not the root, so the pause button keeps a solid icon. */}
      <div ref={trackRef} className={cn('marquee-track flex w-max', outlined && 'text-outline')}>
        {run(false, runRef)}
        {run(true)}
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? 'Resume the moving text' : 'Pause the moving text'}
        className="absolute bottom-0 right-2 flex h-11 w-11 items-center justify-center rounded-full font-sans opacity-50 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 sm:right-4"
      >
        {paused ? <Play aria-hidden="true" className="h-3.5 w-3.5" /> : <Pause aria-hidden="true" className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
};

export default Marquee;
