import { useRef, useState } from 'react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';

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
   * 'view' (default): the first time it scrolls into view. 'enter': part of the
   * page-load choreography — for what sits in the first screen beside a SplitReveal
   * headline (subtitle, buttons). Marks the element data-enter; see index.css.
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

/**
 * The site's fade-and-slide reveal (SplitReveal and ImageReveal in components/motion
 * are its masked siblings). Waits for the age gate and the route curtain like they
 * do. Under isStill() — the prerenderer, reduced motion — it renders its children
 * visible from the start, with no inline opacity for the build's checks to trip on.
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
  const inView = useInView(ref, { threshold, skip: still || trigger === 'enter' });
  const shown = useReveal(trigger === 'enter' || inView);
  const enter = trigger === 'enter' ? '' : undefined;

  if (still) {
    return (
      <Tag className={className} style={style} data-enter={enter}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={className}
      data-enter={enter}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : OFFSET[from],
        transition: `opacity 0.9s ${EASE.expoOut} ${delay}s, transform 0.9s ${EASE.expoOut} ${delay}s`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
