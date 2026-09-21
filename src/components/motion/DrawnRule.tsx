import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';

export interface DrawnRuleProps {
  /** Layout of the rule's box: margins, width (or height for axis "y"). */
  className?: string;
  /** Colour of the line itself. */
  lineClassName?: string;
  /** Seconds. */
  delay?: number;
  /** 'view': first time on screen. 'enter': page-load choreography (first screen only). */
  trigger?: 'view' | 'enter';
  /** 'x' draws left to right, 'y' top to bottom. */
  axis?: 'x' | 'y';
}

/**
 * A hairline that is drawn, not shown: scales out from its origin with expo-out.
 * The outer box keeps its full size for the observer; only the inner line scales.
 *
 * Its own module (re-exported by PageHeader, where the inner pages pick it up) so the
 * homepage hero can draw one without pulling the masthead into the eager bundle.
 */
const DrawnRule = ({
  className,
  lineClassName = 'bg-gold/70',
  delay = 0,
  trigger = 'view',
  axis = 'x',
}: DrawnRuleProps) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { skip: still || trigger === 'enter' });
  const shown = useReveal(trigger === 'enter' || inView);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-enter={trigger === 'enter' ? '' : undefined}
      className={cn('relative block', axis === 'x' ? 'h-px w-full' : 'h-full w-px', className)}
    >
      <span
        className={cn('absolute inset-0', axis === 'x' ? 'origin-left' : 'origin-top', lineClassName)}
        style={
          still
            ? undefined
            : {
                transform: shown ? 'none' : axis === 'x' ? 'scaleX(0)' : 'scaleY(0)',
                transition: `transform 1.2s ${EASE.expoOut} ${delay}s`,
              }
        }
      />
    </span>
  );
};

export default DrawnRule;
