import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';

interface SectionMarkerProps {
  /** The section's place on the page, as printed: "02". */
  number: string;
  /** Short label — UI microcopy, or an eyebrow from src/content. */
  children: string;
  /** On the always-dark bands (and over photography) the label takes the ink palette. */
  onInk?: boolean;
  className?: string;
}

/**
 * "02 —— What We Export": the small-caps marker that opens a homepage section. The
 * numeral and the label fade in while the hairline between them draws out from
 * the numeral. One <p>, read out as "02 What We Export".
 */
const SectionMarker = ({ number, children, onInk = false, className }: SectionMarkerProps) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { skip: still });
  const shown = useReveal(inView);

  const fade = (delay: number) =>
    still ? undefined : { opacity: shown ? 1 : 0, transition: `opacity 0.9s ${EASE.expoOut} ${delay}s` };

  return (
    <p ref={ref} className={cn('eyebrow flex items-center gap-4', onInk && 'text-ink-muted', className)}>
      <span className="tabular-nums" style={fade(0)}>
        {number}
      </span>
      <span
        aria-hidden="true"
        className="h-px w-10 shrink-0 origin-left bg-current opacity-40 md:w-14"
        style={
          still
            ? undefined
            : { transform: shown ? 'none' : 'scaleX(0)', transition: `transform 1.1s ${EASE.expoOut} 0.1s` }
        }
      />
      <span style={fade(0.25)}>{children}</span>
    </p>
  );
};

export default SectionMarker;
