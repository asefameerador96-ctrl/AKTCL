import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';

export interface ImageRevealProps {
  children: ReactNode;
  /** Sizing and shape live here (aspect ratio, rounding); the wrapper clips to it. */
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

/**
 * Unmasks a photograph the first time it scrolls into view while the picture inside
 * settles from 1.12 to 1 — the frame opens, the image arrives.
 *
 * The mask is played with the Web Animations API and never left on the element as a
 * resting clip-path: a clipped ancestor hides an <img> from LazyImage's
 * IntersectionObserver, so a resting clip would mean the file is only requested once
 * the frame is already opening. Until the reveal the wrapper is merely
 * visibility:hidden, which observers ignore, so the photograph is loaded and waiting.
 *
 * Not for the hero: an image hidden at first paint cannot be the LCP element.
 */
const ImageReveal = ({ children, className, direction = 'up', delay = 0 }: ImageRevealProps) => {
  const [still] = useState(isStill);
  const frameRef = useRef<HTMLDivElement>(null);
  const pictureRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { skip: still });
  const shown = useReveal(inView);

  // Layout effect: the closed mask has to be on before the frame's first visible paint.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const picture = pictureRef.current;
    if (still || !shown || !frame || !picture || typeof frame.animate !== 'function') return;
    const timing: KeyframeAnimationOptions = {
      duration: DURATION_MS,
      delay: delay * 1000,
      easing: EASE.expoOut,
      // Holds the first keyframe through the delay, then hands back to the stylesheet.
      fill: 'backwards',
    };
    const mask = frame.animate({ clipPath: [CLOSED[direction], OPEN] }, timing);
    const settle = picture.animate({ transform: ['scale(1.12)', 'scale(1)'] }, timing);
    return () => {
      mask.cancel();
      settle.cancel();
    };
  }, [still, shown, direction, delay]);

  return (
    <div
      ref={frameRef}
      // verify-build looks for this mark: a frame captured hidden fails the build.
      data-image-reveal=""
      className={cn('relative overflow-hidden', className)}
      style={still || shown ? undefined : { visibility: 'hidden' }}
    >
      <div ref={pictureRef} className="h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default ImageReveal;
