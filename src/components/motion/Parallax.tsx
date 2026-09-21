import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { canHover, isStill } from '@/lib/motion';

export interface ParallaxProps {
  children: ReactNode;
  /**
   * Fraction of the scroll the content lags by. 0.08 drifts 8px per 100px scrolled;
   * negative runs ahead instead. Keep it small — this is depth, not a ride.
   */
  speed?: number;
  className?: string;
}

/**
 * Scroll-linked drift for DECORATIVE layers only (a photograph inside its frame, an
 * outlined numeral) — never text someone is reading. The drift is zero when the
 * element is centred in the viewport, so give the content a little bleed (scale it
 * up, or let the parent clip) to cover the travel at the edges.
 *
 * Desktop pointers only: off for touch, reduced motion and the prerenderer. The
 * outer box is measured and the inner one moved, so reading the position never
 * sees the transform it just wrote; work stops while the element is off screen.
 */
const Parallax = ({ children, speed = 0.08, className }: ParallaxProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || isStill() || !canHover() || typeof IntersectionObserver === 'undefined') return;

    let frame = 0;
    let near = false;
    const update = () => {
      frame = 0;
      const rect = outer.getBoundingClientRect();
      const fromCentre = rect.top + rect.height / 2 - window.innerHeight / 2;
      inner.style.transform = `translate3d(0, ${(-fromCentre * speed).toFixed(1)}px, 0)`;
    };
    const schedule = () => {
      if (near && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        inner.style.willChange = near ? 'transform' : 'auto';
        schedule();
      },
      { rootMargin: '25% 0px' }
    );
    observer.observe(outer);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
      inner.style.transform = '';
      inner.style.willChange = '';
    };
  }, [speed]);

  return (
    <div ref={outerRef} className={className}>
      <div ref={innerRef} className="h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default Parallax;
