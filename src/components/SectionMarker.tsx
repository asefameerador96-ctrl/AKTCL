import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { isStill, revealTransition, useInView, useReveal } from '@/lib/motion';

interface SectionMarkerProps {
  /** Short label — UI microcopy, or an eyebrow from src/content. */
  children: string;
  /** On the always-dark bands (and over photography) the label takes the ink palette. */
  onInk?: boolean;
  className?: string;
}

/**
 * "—— What We Export": the small-caps marker that opens a section — a short hairline
 * drawn out from the left, then the label fading in after it, each time the marker
 * comes on screen (and back as it leaves). One <p>, read out as its label alone: no
 * section number (owner feedback, 2026-09: "numbers everywhere").
 */
const SectionMarker = ({ children, onInk = false, className }: SectionMarkerProps) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLParagraphElement>(null);
  const shown = useReveal(useInView(ref, { skip: still }));

  return (
    <p ref={ref} className={cn('eyebrow flex items-center gap-4', onInk && 'text-ink-muted', className)}>
      <span
        aria-hidden="true"
        className="h-px w-10 shrink-0 origin-left bg-current opacity-40 md:w-14"
        style={
          still
            ? undefined
            : { transform: shown ? 'none' : 'scaleX(0)', transition: revealTransition(shown, 'transform', 1.1) }
        }
      />
      <span
        style={
          still ? undefined : { opacity: shown ? 1 : 0, transition: revealTransition(shown, 'opacity', 0.9, 0.15) }
        }
      >
        {children}
      </span>
    </p>
  );
};

export default SectionMarker;
