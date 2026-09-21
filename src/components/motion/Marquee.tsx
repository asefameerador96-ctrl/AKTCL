import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
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
  /** Sits after every item. Defaults to a short hairline in the text colour. */
  separator?: ReactNode;
  /**
   * Controlled pause. Pass it (with a <MarqueePause> of your own, wherever the layout
   * has a cell for one) and the band draws no button. Left out, the band keeps its own
   * state and sets the button in a row under the type — never on top of it.
   */
  paused?: boolean;
}

const TYPE = 'font-display text-[length:clamp(3rem,9vw,8rem)] font-normal leading-none tracking-[-0.03em]';
/** How much faster the band may run while the page is being scrolled hard. */
const MAX_BOOST = 2.5;

const DEFAULT_SEPARATOR = <span className="inline-block h-px w-[0.5em] bg-current align-middle" />;

interface MarqueePauseProps {
  paused: boolean;
  onToggle: () => void;
  /** What is moving, for the accessible name: "Leaf Tobacco". */
  of?: string;
  className?: string;
}

/**
 * The band's pause control (WCAG 2.2.2), set like the hero's: the mono word, no box, no
 * icon — a 44px target whose label darkens on hover. Render it only where the band
 * actually moves (not under isStill()).
 */
export const MarqueePause = ({ paused, onToggle, of, className }: MarqueePauseProps) => (
  <button
    type="button"
    onClick={onToggle}
    // The name starts with the visible word (WCAG 2.5.3), so it changes with the state.
    aria-label={`${paused ? 'Play' : 'Pause'} the moving text${of ? `: ${of}` : ''}`}
    className={cn(
      'inline-flex min-h-11 items-center rounded-sm font-mono text-[11px] font-medium uppercase not-italic leading-none tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground',
      className
    )}
  >
    {paused ? 'Play' : 'Pause'}
  </button>
);

/**
 * Oversized running band of names. One CSS animation on the compositor moves a track
 * holding two identical halves by exactly one half, so the loop has no seam; scroll
 * velocity only nudges that animation's playbackRate, never the transform itself.
 *
 * Read out once: the first run of items is a real list, every repeat is aria-hidden.
 * Pauses on hover, on focus inside the band, off screen, and with a button
 * (MarqueePause; WCAG 2.2.2 — hover is no use to a keyboard or a thumb). Under
 * isStill() it is a plain wrapped list and there is nothing to pause.
 */
const Marquee = ({
  items,
  speed = 60,
  className,
  outlined = false,
  separator = DEFAULT_SEPARATOR,
  paused: pausedProp,
}: MarqueeProps) => {
  const [still] = useState(isStill);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLUListElement>(null);
  // Runs of `items` per half: enough that one half always out-spans the container.
  const [runs, setRuns] = useState(1);
  const [ownPaused, setOwnPaused] = useState(false);
  const controlled = pausedProp !== undefined;
  const paused = controlled ? pausedProp : ownPaused;

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
      {/* The outline sits on the track, not the root, so nothing else inherits the stroke. */}
      <div ref={trackRef} className={cn('marquee-track flex w-max', outlined && 'text-outline')}>
        {run(false, runRef)}
        {run(true)}
      </div>
      {/* Its own row under the type: the control never sits on the running names. */}
      {!controlled && (
        <div className="flex justify-end px-4 sm:px-6">
          <MarqueePause paused={paused} onToggle={() => setOwnPaused((p) => !p)} />
        </div>
      )}
    </div>
  );
};

export default Marquee;
