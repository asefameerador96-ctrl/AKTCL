import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';

export interface ImageRevealProps {
  children: ReactNode;
  /**
   * Sizing, placement and fill (aspect ratio, grid cell, bg-…). Give the frame a
   * surface (bg-tile behind the cut-outs, bg-secondary behind photography): it is what
   * shows, calmly, while the file is still on its way.
   */
  className?: string;
  /**
   * @deprecated Ignored. The frame no longer opens from an edge: nothing is ever
   * clipped. Kept so existing callers still type-check.
   */
  direction?: 'up' | 'left' | 'right';
  /** Seconds. */
  delay?: number;
}

const DURATION_S = 1.1;
/** How far the picture is enlarged while it waits: a settle, not a zoom. */
export const IMAGE_SETTLE_FROM = 'scale(1.06)';

/**
 * A photograph that settles into its frame each time it comes on screen: the picture
 * eases from 1.06 to 1 over 1.1 s (expo-out), again on every return.
 *
 * It is never hidden. There is no mask, no clip and no opacity: an image frame that is
 * on screen always shows its picture (or, while the file is still loading, its own
 * surface, which LazyImage fades the picture onto). The owner read the old wipe — a
 * frame opening from one edge — as "images not loaded yet" (feedback, 2026-09-22).
 *
 * Two layers. The frame takes the caller's size, place and fill, clips the enlarged
 * picture to itself and is what the observer watches (it never transforms). The layer
 * inside it scales. Once the frame has gone off screen the picture is put back to
 * 1.06 at once — unseen — so the next arrival settles again. Before the app is live,
 * index.css holds the prerendered picture at the same 1.06, so the hand-over is not a
 * jump.
 *
 * isStill() (prerender, reduced motion): no style at all, the picture at rest.
 */
const ImageReveal = ({ children, className, delay = 0 }: ImageRevealProps) => {
  const [still] = useState(isStill);
  const frameRef = useRef<HTMLDivElement>(null);
  const shown = useReveal(useInView(frameRef, { skip: still }));

  return (
    <div
      ref={frameRef}
      // verify-build looks for this mark: a frame captured hidden fails the build.
      data-image-reveal=""
      className={cn('relative overflow-hidden', className)}
    >
      <div
        className="relative h-full w-full"
        style={
          still
            ? undefined
            : {
                transform: shown ? 'none' : IMAGE_SETTLE_FROM,
                // In: the settle. Out: none — it is off screen, so it simply resets.
                transition: shown ? `transform ${DURATION_S}s ${EASE.expoOut} ${+delay.toFixed(3)}s` : 'none',
              }
        }
      >
        {children}
      </div>
    </div>
  );
};

export default ImageReveal;
