import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { isStill, useInView, useReveal } from '@/lib/motion';

export interface CountUpProps {
  /** The figure, exactly as src/content states it. */
  value: number;
  /** e.g. formatFact-style grouping. Called for every frame and for the final value. */
  format?: (n: number) => string;
  from?: number;
  /** Milliseconds; capped at 1200 like every other motion on the site. */
  duration?: number;
  /**
   * Controlled start, for a figure inside a reveal of its own: it counts from `from`
   * each time this turns true, and watches nothing itself. Until then it is simply
   * the final figure — the reveal is what keeps it out of sight.
   */
  play?: boolean;
  className?: string;
}

const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Counts up to a figure each time it scrolls on screen (or each time `play` turns
 * true), starting again from `from` on every return. Inside the page-load
 * choreography (a [data-enter] parent) it counts once, like the rest of that
 * sequence. While it runs, the turning number is aria-hidden and the true value sits
 * in a screen-reader-only span, so assistive tech reads "50,000" once instead of a
 * stream of intermediate numbers. tabular-nums keeps the width steady while the
 * digits turn. Under isStill() it is the final value.
 */
const CountUp = ({ value, format = String, from = 0, duration = 1200, play, className }: CountUpProps) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLSpanElement>(null);
  const controlled = play !== undefined;
  const seen = useReveal(useInView(ref, { threshold: 0.5, skip: still || controlled }));
  const go = controlled ? play : seen;
  const [current, setCurrent] = useState(still || controlled ? value : from);
  const frame = useRef(0);

  // A layout effect, so on a return (or a controlled start) the final figure is
  // swapped for `from` before it can paint. Leaving does not stop a count: frozen half-way it would
  // read as a wrong number on its way off the screen.
  useLayoutEffect(() => {
    if (still || !go) return;
    cancelAnimationFrame(frame.current);
    setCurrent(from);
    const length = Math.min(duration, 1200);
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / length, 1);
      setCurrent(progress === 1 ? value : Math.round(from + (value - from) * expoOut(progress)));
      frame.current = progress < 1 ? requestAnimationFrame(tick) : 0;
    };
    frame.current = requestAnimationFrame(tick);
  }, [still, go, value, from, duration]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  if (still) return <span className={cn('tabular-nums', className)}>{format(value)}</span>;

  // Only while the digits are turning (or waiting to) is the true figure a separate
  // screen-reader copy; at rest it is one plain number, so copied or reader-mode
  // text never says it twice.
  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {current === value ? (
        format(value)
      ) : (
        <>
          <span className="sr-only">{format(value)}</span>
          <span aria-hidden="true">{format(current)}</span>
        </>
      )}
    </span>
  );
};

export default CountUp;
