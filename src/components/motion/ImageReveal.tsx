import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EASE, OUT_S, isStill, useInView, useReveal } from '@/lib/motion';

export interface ImageRevealProps {
  children: ReactNode;
  /**
   * Sizing, placement and fill (aspect ratio, grid cell, bg-…). The wrapper clips to
   * it; the fill is carried by the mask, so it opens with the picture.
   */
  className?: string;
  /** The way the opening edge travels. */
  direction?: 'up' | 'left' | 'right';
  /** Seconds. */
  delay?: number;
}

const DURATION_MS = 1100;
const OPEN = 'inset(0% 0% 0% 0%)';
const CLOSED: Record<NonNullable<ImageRevealProps['direction']>, string> = {
  up: 'inset(100% 0% 0% 0%)',
  left: 'inset(0% 0% 0% 100%)',
  right: 'inset(0% 100% 0% 0%)',
};
const SETTLED = 'scale(1)';
const ENLARGED = 'scale(1.12)';

/** Background utilities, with or without a variant: "bg-tile", "md:bg-secondary". */
const FILL = /^(?:\S*:)?bg-/;

/**
 * Unmasks a photograph each time it scrolls on screen while the picture inside
 * settles from 1.12 to 1 — the frame opens, the image arrives — and closes it again,
 * quicker, as it leaves.
 *
 * Three layers. The outer frame takes the caller's size and place and is what the
 * observer watches; it is never clipped, because Chromium measures an element
 * through its own clip-path and a closed mask would read as "off screen" the moment
 * it started to open. The mask inside it carries the fill and the clip, played with
 * the Web Animations API; the picture inside that scales.
 *
 * Until the first reveal the frame is merely transparent, never clipped: a clipped
 * ancestor hides an <img> from LazyImage's IntersectionObserver, so a resting clip
 * would mean the file is only requested once the frame is already opening. Opacity
 * keeps the photograph loading and waiting, and keeps it (and its alt text) in the
 * accessibility tree. After a reveal the closed mask may rest — the file has loaded.
 *
 * Not for the hero: an image hidden at first paint cannot be the LCP element.
 */
const ImageReveal = ({ children, className, direction = 'up', delay = 0 }: ImageRevealProps) => {
  const [still] = useState(isStill);
  const frameRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const pictureRef = useRef<HTMLDivElement>(null);
  const shown = useReveal(useInView(frameRef, { skip: still }));
  // Adjusted during render, so the frame never paints transparent after its first opening.
  const [opened, setOpened] = useState(false);
  if (shown && !opened) setOpened(true);
  const playing = useRef<Animation[]>([]);

  const classes = (className ?? '').split(/\s+/).filter(Boolean);
  const fill = classes.filter((name) => FILL.test(name)).join(' ');
  const frame = classes.filter((name) => !FILL.test(name)).join(' ');

  // Layout effect: the closed mask has to be on before the frame's first visible paint.
  useLayoutEffect(() => {
    const mask = maskRef.current;
    const picture = pictureRef.current;
    if (still || !opened || !mask || !picture || typeof mask.animate !== 'function') return;
    // Turned back half-way (scrolled in and straight out again): carry on from where
    // the mask is now instead of snapping to the far end first.
    const midway = playing.current.some((animation) => animation.playState === 'running');
    const maskFrom = midway ? getComputedStyle(mask).clipPath : shown ? CLOSED[direction] : OPEN;
    const scaleFrom = midway ? getComputedStyle(picture).transform : shown ? ENLARGED : SETTLED;
    playing.current.forEach((animation) => animation.cancel());

    const timing: KeyframeAnimationOptions = shown
      ? // Holds the first keyframe through the delay, then hands back to the stylesheet.
        { duration: DURATION_MS, delay: delay * 1000, easing: EASE.expoOut, fill: 'backwards' }
      : // Stays shut once it has closed, until the next opening replaces it.
        { duration: OUT_S * 1000, easing: EASE.expoOut, fill: 'forwards' };
    playing.current = [
      mask.animate({ clipPath: [maskFrom, shown ? OPEN : CLOSED[direction]] }, timing),
      picture.animate({ transform: [scaleFrom, shown ? SETTLED : ENLARGED] }, timing),
    ];
  }, [still, opened, shown, direction, delay]);

  // Leaving the page altogether: nothing may keep running on a detached frame.
  useLayoutEffect(() => () => playing.current.forEach((animation) => animation.cancel()), []);

  return (
    <div
      ref={frameRef}
      // verify-build looks for this mark: a frame captured hidden fails the build.
      data-image-reveal=""
      className={cn('relative overflow-hidden', frame)}
      style={still || opened ? undefined : { opacity: 0 }}
    >
      <div ref={maskRef} className={cn('h-full w-full', fill)}>
        <div ref={pictureRef} className="h-full w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ImageReveal;
