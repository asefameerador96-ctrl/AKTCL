import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface RevealProps {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Seconds. Use to stagger siblings. */
  delay?: number;
  /** Where the content travels in from. */
  from?: 'up' | 'left' | 'right' | 'none';
  threshold?: number;
  style?: CSSProperties;
}

const OFFSET: Record<NonNullable<RevealProps['from']>, string> = {
  up: 'translateY(28px)',
  left: 'translateX(-36px)',
  right: 'translateX(36px)',
  none: 'none',
};

/**
 * The site's one scroll-reveal primitive: fades and slides its children in the
 * first time they enter the viewport. Motion is removed globally under
 * prefers-reduced-motion (see index.css), and the prerenderer scrolls every page
 * before snapshotting so revealed content is what ends up in the static HTML.
 */
const Reveal = ({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  from = 'up',
  threshold = 0.15,
  style,
}: RevealProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold });
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : OFFSET[from],
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
