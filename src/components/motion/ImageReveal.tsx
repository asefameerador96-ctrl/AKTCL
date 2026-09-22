import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EASE, OUT_S, isStill, useInView, useReveal } from '@/lib/motion';

export interface ImageRevealProps {
  children: ReactNode;
  /**
   * Sizing, placement and fill (aspect ratio, grid cell, bg-…). Give the frame a
   * surface (bg-tile behind the cut-outs, bg-secondary behind photography): it is what
   * shows, calmly, while the file is still on its way.
   */
  className?: string;
  /** Edge the picture opens from. Default 'up': it wipes in from its own foot. */
  direction?: 'up' | 'left' | 'right';
  /** Seconds. */
  delay?: number;
}

const DURATION_S = 1.1;
/** The wipe itself, a touch quicker than the settle it rides on. */
const WIPE_S = 0.9;
/** How far the picture is enlarged while it waits: a settle, not a zoom. */
export const IMAGE_SETTLE_FROM = 'scale(1.06)';

/** Closed masks, by the edge the picture opens from. clip-path: inset(top right bottom left). */
const CLOSED: Record<NonNullable<ImageRevealProps['direction']>, string> = {
  up: 'inset(100% 0 0 0)',
  left: 'inset(0 100% 0 0)',
  right: 'inset(0 0 0 100%)',
};

/**
 * A photograph that wipes into its frame as it comes on screen and settles at the same
 * time: the mask opens from the frame's foot over 0.9 s while the picture eases from
 * 1.06 to 1 over 1.1 s (expo-out). On the way back up the mask closes again, so the
 * same move plays in reverse; each return plays it afresh.
 *
 * The wipe was removed on 2026-09-22 because the owner read a half-open frame as
 * "images not loaded yet" — but that was the old trigger line, a fifth of a screen
 * BELOW the fold, which left frames sitting part-open on screen with nothing moving.
 * With the line back inside the fold (lib/motion ACTIVE_ZONE) the wipe happens where it
 * can be watched, and he asked for it back (2026-09-23).
 *
 * A frame that is ALREADY on screen when the app starts never wipes: its prerendered
 * picture is simply there and only settles. Masking it at mount would blink the picture
 * out for a frame and put the "not loaded" look straight back.
 *
 * Three layers. The frame takes the caller's size, place and fill and is what the
 * observer watches (it never moves). The mask inside it holds the clip. The picture
 * inside that scales. Off screen, both are put back at once — unseen — so the next
 * arrival plays again.
 *
 * isStill() (prerender, reduced motion): no style at all, the picture at rest.
 */
const ImageReveal = ({ children, className, direction = 'up', delay = 0 }: ImageRevealProps) => {
  const [still] = useState(isStill);
  const frameRef = useRef<HTMLDivElement>(null);
  const shown = useReveal(useInView(frameRef, { skip: still }));
  // Measured before the browser paints the app's first frame, so the picture this
  // visitor is already looking at is never taken away from them.
  const onScreenAtMount = useRef(false);
  const [wipeable, setWipeable] = useState(!still);

  useLayoutEffect(() => {
    if (still) return;
    const box = frameRef.current?.getBoundingClientRect();
    onScreenAtMount.current = !!box && box.top < window.innerHeight && box.bottom > 0;
    if (onScreenAtMount.current) setWipeable(false);
  }, [still]);

  // Such a frame becomes a frame like any other the moment it has been away: it is
  // revealed (nothing to take away any more), then leaves — and wipes on every return.
  const revealedOnce = useRef(false);
  useEffect(() => {
    if (still || wipeable) return;
    if (shown) revealedOnce.current = true;
    else if (revealedOnce.current) setWipeable(true);
  }, [still, wipeable, shown]);

  const masked = wipeable && !shown;
  const seconds = shown ? WIPE_S : OUT_S;

  return (
    <div
      ref={frameRef}
      // verify-build looks for this mark: a frame captured hidden fails the build.
      data-image-reveal=""
      className={cn('relative overflow-hidden', className)}
    >
      <div
        className="h-full w-full"
        style={
          still
            ? undefined
            : {
                clipPath: masked ? CLOSED[direction] : 'inset(0 0 0 0)',
                transition: `clip-path ${seconds}s ${EASE.expoOut} ${+delay.toFixed(3)}s`,
              }
        }
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
    </div>
  );
};

export default ImageReveal;
