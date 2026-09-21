import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { isStill, revealTransition, useInView, useReveal } from '@/lib/motion';

export interface DrawnRuleProps {
  /** Layout of the rule's box: margins, width (or height for axis "y"). */
  className?: string;
  /** Colour of the line itself. Default: the neutral hairline (ink hairline inside bg-ink). Over photography pass a chalk tint. */
  lineClassName?: string;
  /** Seconds. */
  delay?: number;
  /** 'view': every time on screen, withdrawn as it leaves. 'enter': page-load choreography (first screen only), once. */
  trigger?: 'view' | 'enter';
  /** 'x' draws left to right, 'y' top to bottom. */
  axis?: 'x' | 'y';
}

/**
 * A hairline that is drawn, not shown: scales out from its origin with expo-out, and
 * back into it as it leaves the screen. The outer box keeps its full size for the
 * observer; only the inner line scales.
 *
 * Its own module (re-exported by PageHeader, where the inner pages pick it up) so the
 * homepage hero can draw one without pulling the masthead into the eager bundle.
 */
const DrawnRule = ({
  className,
  lineClassName = 'hairline',
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
                transition: revealTransition(shown, 'transform', 1.2, delay),
              }
        }
      />
    </span>
  );
};

export default DrawnRule;
