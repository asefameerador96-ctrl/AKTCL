import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import Reveal from '@/components/Reveal';
import { SectionHead as RuledHead } from '@/components/Ruled';
import SplitReveal from '@/components/motion/SplitReveal';
import DrawnRule from '@/components/motion/DrawnRule';
import { cn } from '@/lib/utils';
import type { Crumb } from '@/seo/routeMeta';

/*
 * The inner pages' editorial kit lives here with the masthead that sets its tone:
 * the display type scale, the hairline that draws itself, the travelling arrow, the
 * ruled section opener and the directory-row hover. The sizes themselves are the fluid
 * .display-* classes of index.css — one scale, site-wide. Every inner template imports
 * these, so the pages read as one publication: regions ruled off like a plan drawing,
 * never boxed. The hover language is the homepage's (components/Ruled): a row shifts
 * 8px, draws its rule in the accent and sends its arrow through.
 */

/** Same gutters as the navbar and footer, so page content lines up with the chrome. */
export const WRAP = 'mx-auto max-w-7xl px-4 sm:px-6';
/** Masthead <h1>: monumental, tight, regular weight — the serif does the work. */
export const DISPLAY_H1 = 'display-xl text-foreground';
/** Masthead <h1> of the long-form pages (detail, legal), where titles run to a sentence. */
export const DISPLAY_H1_COMPACT = 'display-lg text-foreground';
/**
 * Running copy: the type scale's .text-body (17px, 16px on a phone; index.css), muted,
 * about 68 characters a line. The measure is in rem because the sans has a wide zero
 * (1ch is 0.73em): "62ch" would be some 95 characters. Scale contrast is still the
 * display type's job.
 */
export const BODY = 'max-w-[38rem] text-body text-muted-foreground';
/**
 * .link-underline (index.css) for a word inside a larger `group` link — label plus
 * arrow, say — so the rule is drawn when any part of the link is hovered or focused.
 */
export const GROUP_UNDERLINE =
  'bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:100%_100%] bg-no-repeat pb-1 transition-[background-size] group-hover:bg-[length:100%_1px] group-hover:bg-[position:0%_100%] group-focus-within:bg-[length:100%_1px] group-focus-within:bg-[position:0%_100%]';
/**
 * Text link with a travelling arrow:
 * <Link className={TEXT_LINK}><span className={GROUP_UNDERLINE}>…</span><ArrowTravel /></Link>.
 * Black at rest; the accent is spent on the hover only.
 */
export const TEXT_LINK =
  'mono-label group inline-flex min-h-11 items-center gap-3 rounded-sm text-foreground transition-colors hover:text-accent focus-visible:text-accent';
/**
 * Directory rows. Put `group relative` and a 1px top border on the row — the link
 * itself, or an element whose link is stretched over it — and ROW_LINE on an empty
 * aria-hidden <span> inside. On hover or focus 1px of accent is drawn over the row's
 * resting hairline, left to right; the row's title takes ROW_SHIFT (8px) and its
 * ArrowTravel travels. Nothing scales, nothing lifts. Paper only: on ink the accent
 * does not read. (focus-within also matches the group itself.)
 */
export const ROW_LINE =
  'pointer-events-none absolute inset-x-0 -top-px z-10 h-px origin-left scale-x-0 bg-accent transition-transform group-focus-within:scale-x-100 group-hover:scale-x-100';
export const ROW_SHIFT =
  'transition-transform motion-safe:group-focus-within:translate-x-2 motion-safe:group-hover:translate-x-2';

// The drawn hairline lives with the other motion primitives; the inner pages keep
// importing it from here with the rest of the kit.
export { DrawnRule };

const ARROWS = { left: ArrowLeft, right: ArrowRight, 'up-right': ArrowUpRight } as const;
// The arrow leaves in the direction it points and its twin arrives from behind it.
// focus-within, not focus-visible: it matches the `group` when the group is the link
// and when the link sits inside it (a directory row with a stretched link).
const TRAVEL = {
  left: [
    'group-hover:-translate-x-[140%] group-focus-within:-translate-x-[140%]',
    'translate-x-[140%] group-hover:translate-x-0 group-focus-within:translate-x-0',
  ],
  right: [
    'group-hover:translate-x-[140%] group-focus-within:translate-x-[140%]',
    '-translate-x-[140%] group-hover:translate-x-0 group-focus-within:translate-x-0',
  ],
  'up-right': [
    'group-hover:-translate-y-[140%] group-hover:translate-x-[140%] group-focus-within:-translate-y-[140%] group-focus-within:translate-x-[140%]',
    '-translate-x-[140%] translate-y-[140%] group-hover:translate-x-0 group-hover:translate-y-0 group-focus-within:translate-x-0 group-focus-within:translate-y-0',
  ],
} as const;

interface ArrowTravelProps {
  direction?: keyof typeof ARROWS;
  /** Size (h-4 w-4 by default) and colour. */
  className?: string;
  /** Lighter for the large arrows of the previous / next rows, so the stroke stays a hairline. */
  strokeWidth?: number;
}

/** Arrow for links: on hover or focus of the enclosing `group` it travels out and back in. */
export const ArrowTravel = ({ direction = 'right', className, strokeWidth }: ArrowTravelProps) => {
  const Icon = ARROWS[direction];
  const [leaving, arriving] = TRAVEL[direction];
  const moving = 'h-full w-full transition-transform';
  return (
    <span aria-hidden="true" className={cn('relative inline-flex h-4 w-4 shrink-0 overflow-hidden', className)}>
      <Icon strokeWidth={strokeWidth} className={cn(moving, leaving)} />
      <Icon strokeWidth={strokeWidth} className={cn('absolute inset-0', moving, arriving)} />
    </span>
  );
};

interface SectionHeadProps {
  /** Mono label — an eyebrow from src/content, or UI microcopy. */
  label: string;
  /** Rendered as the section's <h2>. */
  title: string;
  /** For aria-labelledby on the enclosing <section>. */
  id?: string;
  /** Words of the title set in the display italic — typographic emphasis only. */
  italicWords?: string[];
  /** 'lg' where the section is the page's main act. */
  size?: 'md' | 'lg';
  /** Set over the narrow right-hand cell, foot-aligned with the headline: a lead, a link. */
  children?: ReactNode;
  className?: string;
}

/**
 * How a section of an inner page opens — the same way the homepage's do, and with the
 * same piece (Ruled's SectionHead): a hairline drawn across the full measure and the
 * mono label under it. No section number and no count beside it: they were decoration
 * the visitor had to read past. Then the fluid display <h2> over the wide seven columns
 * with whatever goes with it over the narrow five. Left-aligned; never centred.
 */
export const SectionHead = ({ label, title, id, italicWords, size = 'md', children, className }: SectionHeadProps) => (
  <div className={className}>
    {/* The rule and the mono row are the homepage's own (components/Ruled): one drawing. */}
    <RuledHead label={label} />
    <div className="mt-12 grid gap-y-8 md:mt-16 lg:mt-20 lg:grid-cols-12 lg:items-end">
      <SplitReveal
        as="h2"
        id={id}
        text={title}
        italicWords={italicWords}
        className={cn('text-foreground lg:col-span-7 lg:pr-8', size === 'lg' ? 'display-lg' : 'display-md')}
      />
      {children && (
        <Reveal delay={0.15} className="lg:col-span-5 lg:pb-2 lg:pl-8">
          {children}
        </Reveal>
      )}
    </div>
  </div>
);

interface PageHeaderProps {
  /** Chain after "Home", ending with this page (RouteMeta.breadcrumbs). */
  breadcrumbs: Crumb[];
  eyebrow?: string;
  /** Rendered as the page's single <h1>. */
  title: string;
  /** Words of the title set in the display italic — typographic emphasis only. */
  italicWords?: string[];
  /** Offset into the right-hand columns on desktop. */
  lead?: string;
  /**
   * Mono note opposite the eyebrow: a stage's place in a sequence whose order means
   * something ("03 / 07" on the journey). Never a decorative index or a count.
   */
  meta?: string;
  /** 'compact' for titles that run long (detail and legal pages). */
  size?: 'display' | 'compact';
  className?: string;
}

/**
 * Editorial masthead shared by every inner page, set like the head of a printed
 * sheet: the breadcrumb trail as a running head, a hairline drawn across the measure,
 * a mono label row (eyebrow left, a journey stage's position right), then a monumental fluid <h1> that
 * rises word by word, the lead set off in the right-hand columns, and a second
 * hairline that closes the region — so whatever follows hangs from it and draws no
 * top rule of its own. Left-aligned throughout.
 *
 * Everything here is first-screen, so it all plays as page-load choreography
 * (trigger "enter"): trail, rule, labels, headline, lead, rule — in that order.
 *
 * PageLayout already clears the fixed navbar; the top padding is breathing room.
 * A <header> inside <main> is not a banner landmark.
 */
const PageHeader = ({
  breadcrumbs,
  eyebrow,
  title,
  italicWords,
  lead,
  meta,
  size = 'display',
  className,
}: PageHeaderProps) => (
  <header className={cn(WRAP, className)}>
    <Reveal trigger="enter" from="none" className="pt-3 md:pt-5">
      <Breadcrumbs items={breadcrumbs} />
    </Reveal>
    <DrawnRule trigger="enter" delay={0.1} />

    {(eyebrow || meta) && (
      <div className="flex items-baseline justify-between gap-6 pt-4 md:pt-5">
        {eyebrow && (
          <Reveal as="p" trigger="enter" from="none" delay={0.15} className="eyebrow">
            {eyebrow}
          </Reveal>
        )}
        {meta && (
          <Reveal
            as="p"
            trigger="enter"
            from="none"
            delay={0.2}
            className="index-num ml-auto shrink-0 uppercase leading-normal"
          >
            {meta}
          </Reveal>
        )}
      </div>
    )}

    <SplitReveal
      as="h1"
      trigger="enter"
      delay={0.2}
      text={title}
      italicWords={italicWords}
      className={cn('mt-14 max-w-[18ch] md:mt-24', size === 'display' ? DISPLAY_H1 : DISPLAY_H1_COMPACT)}
    />

    {lead ? (
      <div className="grid pb-14 pt-10 md:pb-20 md:pt-14 lg:grid-cols-12">
        <Reveal as="p" trigger="enter" delay={0.5} className="lead max-w-[52ch] lg:col-span-5 lg:col-start-8 lg:pl-8">
          {lead}
        </Reveal>
      </div>
    ) : (
      <div aria-hidden="true" className="pb-12 md:pb-20" />
    )}

    <DrawnRule trigger="enter" delay={0.55} />
  </header>
);

export default PageHeader;
