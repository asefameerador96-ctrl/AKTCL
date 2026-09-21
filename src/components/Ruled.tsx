import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import DrawnRule from '@/components/motion/DrawnRule';
import { cn } from '@/lib/utils';

/*
 * The homepage's ruled kit: structure is drawn with 1px hairlines, never boxed.
 *   SectionHead   the rule and mono header row that open every section.
 *   RowLink       a link set as a directory row: label left, arrow right.
 *   TravelArrow   the arrow those rows (and the catalogue cells) share.
 * Its own small module so the eager homepage bundle and the shared cards can use it
 * without pulling in the inner pages' masthead (PageHeader).
 *
 * One hover language, 300ms expo-out (Tailwind's default here), transform and colour
 * only: a ROW shifts 8px, draws its rule in the accent and sends its arrow through; a
 * CELL darkens its tile, draws the name's underline and brings its arrow in.
 */

interface TravelArrowProps {
  /**
   * 'through' (rows): always visible; leaves right as its twin arrives from the left.
   * 'in' (cells): out of sight until hover or focus. Nothing hovers on a touch screen,
   * so there it simply rests in place.
   */
  mode?: 'through' | 'in';
  /** Size (h-4 w-4 by default) and colour. */
  className?: string;
}

const ARROW = 'h-full w-full transition-transform';
const ARRIVE =
  'absolute inset-0 -translate-x-[140%] group-hover:translate-x-0 group-focus-within:translate-x-0';

/** Arrow for an enclosing `group`: answers its hover and any focus inside it. */
export const TravelArrow = ({ mode = 'through', className }: TravelArrowProps) => (
  <span aria-hidden="true" className={cn('relative inline-flex h-4 w-4 shrink-0 overflow-hidden', className)}>
    {mode === 'through' && (
      <ArrowRight className={cn(ARROW, 'group-hover:translate-x-[140%] group-focus-within:translate-x-[140%]')} />
    )}
    <ArrowRight className={cn(ARROW, ARRIVE, mode === 'in' && '[@media(hover:none)]:translate-x-0')} />
  </span>
);

/**
 * The accent rule a row draws over its own top hairline on hover or focus: 1px of
 * racing green, left to right. The parent is `group relative` with a 1px top border.
 * Paper only — on ink the accent does not read.
 */
export const AccentRule = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-accent transition-transform group-hover:scale-x-100 group-focus-within:scale-x-100"
  />
);

interface SectionHeadProps {
  /** Short label — UI microcopy, or an eyebrow from src/content. */
  label: string;
  /** On the always-dark bands. */
  onInk?: boolean;
  className?: string;
}

/**
 * How a section opens: a hairline drawn across the full measure, then the mono label
 * under it — nothing else in the row, no number, no count. The display headline
 * follows underneath, left-aligned.
 */
export const SectionHead = ({ label, onInk = false, className }: SectionHeadProps) => (
  <div className={className}>
    <DrawnRule />
    {/* Fades in as the rule draws past it. */}
    <Reveal
      as="p"
      from="none"
      delay={0.15}
      className={cn('eyebrow pt-4 md:pt-5', onInk && 'text-ink-muted')}
    >
      {label}
    </Reveal>
  </div>
);

interface RowLinkProps {
  to: string;
  children: ReactNode;
  /** Set the label in the display serif, as the closing row of a directory. */
  display?: boolean;
  /** data-lead value, for enquiry links. */
  lead?: string;
  /** What the cursor ring reads over the row. */
  cursor?: 'open' | 'view' | 'enquire';
  className?: string;
}

/** A link as a ruled row instead of a boxed button. */
export const RowLink = ({ to, children, display = false, lead, cursor = 'open', className }: RowLinkProps) => (
  <Link
    to={to}
    data-lead={lead}
    data-cursor={cursor}
    className={cn(
      'group relative flex items-center justify-between gap-6 border-t border-border text-foreground',
      display ? 'min-h-20 py-5 md:min-h-24' : 'min-h-14 py-4',
      className
    )}
  >
    <AccentRule />
    <span
      className={cn(
        'transition-transform motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2',
        display ? 'display-sm' : 'mono-label'
      )}
    >
      {children}
    </span>
    <TravelArrow className="transition-colors group-hover:text-accent group-focus-visible:text-accent" />
  </Link>
);
