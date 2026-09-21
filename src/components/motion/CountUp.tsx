import { useEffect, useRef, useState } from 'react';
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
  className?: string;
}

const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Counts up to a figure the first time it scrolls into view. The running number is
 * aria-hidden and the true value sits in a screen-reader-only span, so assistive
 * tech reads "50,000" once instead of a stream of intermediate numbers. tabular-nums
 * keeps the width steady while the digits turn. Under isStill() it is the final value.
 */
const CountUp = ({ value, format = String, from = 0, duration = 1200, className }: CountUpProps) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { threshold: 0.5, skip: still });
  const go = useReveal(inView);
  const [current, setCurrent] = useState(still ? value : from);

  useEffect(() => {
    if (still || !go) return;
    const length = Math.min(duration, 1200);
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / length, 1);
      setCurrent(progress === 1 ? value : Math.round(from + (value - from) * expoOut(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [still, go, value, from, duration]);

  if (still) return <span className={cn('tabular-nums', className)}>{format(value)}</span>;

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      <span className="sr-only">{format(value)}</span>
      <span aria-hidden="true">{format(current)}</span>
    </span>
  );
};

export default CountUp;
