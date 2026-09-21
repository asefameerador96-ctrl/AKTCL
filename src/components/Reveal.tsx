import { useRef, useState } from 'react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { isStill, revealTransition, useReveal, useViewPlace } from '@/lib/motion';

interface RevealProps {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Seconds. Use to stagger siblings (60–90 ms apart reads best). */
  delay?: number;
  /** Where the content travels in from. */
  from?: 'up' | 'left' | 'right' | 'none';
  threshold?: number;
  /**
   * 'view' (default): every time it scrolls on screen, and back out as it leaves.
   * 'enter': part of the page-load choreography, once — for what sits in the first
   * screen beside a SplitReveal headline (subtitle, buttons). Marks the element
   * data-enter; see index.css.
   */
  trigger?: 'view' | 'enter';
  style?: CSSProperties;
}

const OFFSET: Record<NonNullable<RevealProps['from']>, string> = {
  up: 'translateY(28px)',
  left: 'translateX(-36px)',
  right: 'translateX(36px)',
  none: 'none',
};

// The block itself is what the observer measures, so its hidden offset must point
// away from the screen: gone over the top, it waits above its place, not below it —
// an offset back towards the screen would carry it into view again and it would
// flicker there. Coming back down the page, it then settles downwards into place.
const OFFSET_ABOVE = 'translateY(-28px)';

/**
 * The site's fade-and-slide reveal (SplitReveal and ImageReveal in components/motion
 * are its masked siblings). The first time, it waits for the age gate and the route
 * curtain like they do; after that it simply follows the scroll both ways. Under
 * isStill() — the prerenderer, reduced motion — it renders its children visible
 * from the start, with no inline opacity for the build's checks to trip on.
 */
const Reveal = ({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  from = 'up',
  threshold = 0.15,
  trigger = 'view',
  style,
}: RevealProps) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLElement>(null);
  const place = useViewPlace(ref, { threshold, skip: still || trigger === 'enter' });
  const shown = useReveal(trigger === 'enter' || place === 'in');
  const enter = trigger === 'enter' ? '' : undefined;

  if (still) {
    return (
      <Tag className={className} style={style} data-enter={enter}>
        {children}
      </Tag>
    );
  }

  const hidden = from === 'up' && place === 'above' ? OFFSET_ABOVE : OFFSET[from];

  return (
    <Tag
      ref={ref}
      className={className}
      data-enter={enter}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : hidden,
        transition: revealTransition(shown, ['opacity', 'transform'], 0.9, delay),
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
