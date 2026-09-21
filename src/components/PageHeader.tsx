import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import Reveal from '@/components/Reveal';
import SplitReveal from '@/components/motion/SplitReveal';
import DrawnRule from '@/components/motion/DrawnRule';
import { cn } from '@/lib/utils';
import type { Crumb } from '@/seo/routeMeta';

/*
 * The inner pages' editorial kit lives here with the masthead that sets its tone:
 * the display type scale, the gold rule that draws itself and the travelling arrow.
 * Every inner template imports these, so the pages read as one publication.
 */

/** Masthead <h1>: monumental, tight, regular weight — the serif does the work. */
export const DISPLAY_H1 =
  'font-display text-[length:clamp(2.75rem,7vw,6.5rem)] font-normal leading-[0.98] tracking-[-0.03em] text-foreground';
/** Masthead <h1> of the long-form pages (detail, legal), where titles run to a sentence. */
export const DISPLAY_H1_COMPACT =
  'font-display text-[length:clamp(2.5rem,6vw,5.5rem)] font-normal leading-[1] tracking-[-0.03em] text-foreground';
/** Section <h2>. */
export const DISPLAY_H2 =
  'font-display text-[length:clamp(2.125rem,4.6vw,4rem)] font-normal leading-[1.04] tracking-[-0.025em] text-foreground';
/** Quiet small-caps label: the counterweight to the display type. */
export const LABEL = 'font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground';
/**
 * .link-underline (index.css) for a word inside a larger `group` link — label plus
 * arrow, say — so the rule is drawn when any part of the link is hovered or focused.
 */
export const GROUP_UNDERLINE =
  'bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:100%_100%] bg-no-repeat pb-1 transition-[background-size] duration-500 ease-expo-out group-hover:bg-[length:100%_1px] group-hover:bg-[position:0%_100%] group-focus-visible:bg-[length:100%_1px] group-focus-visible:bg-[position:0%_100%]';
/** Text link with a travelling arrow: <Link className={TEXT_LINK}><span className={GROUP_UNDERLINE}>…</span><ArrowTravel /></Link>. */
export const TEXT_LINK =
  'group inline-flex min-h-11 items-center gap-3 rounded-sm font-sans text-[13px] font-semibold uppercase tracking-[0.18em] text-accent';

// The drawn hairline lives with the other motion primitives; the inner pages keep
// importing it from here with the rest of the kit.
export { DrawnRule };

const ARROWS = { left: ArrowLeft, right: ArrowRight, 'up-right': ArrowUpRight } as const;
// The arrow leaves in the direction it points and its twin arrives from behind it.
const TRAVEL = {
  left: [
    'group-hover:-translate-x-[140%] group-focus-visible:-translate-x-[140%]',
    'translate-x-[140%] group-hover:translate-x-0 group-focus-visible:translate-x-0',
  ],
  right: [
    'group-hover:translate-x-[140%] group-focus-visible:translate-x-[140%]',
    '-translate-x-[140%] group-hover:translate-x-0 group-focus-visible:translate-x-0',
  ],
  'up-right': [
    'group-hover:-translate-y-[140%] group-hover:translate-x-[140%] group-focus-visible:-translate-y-[140%] group-focus-visible:translate-x-[140%]',
    '-translate-x-[140%] translate-y-[140%] group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0',
  ],
} as const;

interface ArrowTravelProps {
  direction?: keyof typeof ARROWS;
  /** Size (h-4 w-4 by default). */
  className?: string;
}

/** Arrow for links: on hover or focus of the enclosing `group` it travels out and back in. */
export const ArrowTravel = ({ direction = 'right', className }: ArrowTravelProps) => {
  const Icon = ARROWS[direction];
  const [leaving, arriving] = TRAVEL[direction];
  const moving = 'h-full w-full transition-transform duration-500 ease-expo-out';
  return (
    <span aria-hidden="true" className={cn('relative inline-flex h-4 w-4 shrink-0 overflow-hidden', className)}>
      <Icon className={cn(moving, leaving)} />
      <Icon className={cn('absolute inset-0', moving, arriving)} />
    </span>
  );
};

interface PageHeaderProps {
  /** Chain after "Home", ending with this page (RouteMeta.breadcrumbs). */
  breadcrumbs: Crumb[];
  eyebrow?: string;
  /** Rendered as the page's single <h1>. */
  title: string;
  /** Words of the title set in Fraunces italic — typographic emphasis only. */
  italicWords?: string[];
  /** Offset to the right-hand column on desktop. */
  lead?: string;
  /** Small label under the rule, opposite the lead: a position ("01 / 02") or a date. */
  meta?: string;
  /** 'compact' for titles that run long (legal pages). */
  size?: 'display' | 'compact';
  className?: string;
}

/**
 * Editorial masthead shared by the index, category, about and legal pages: a small
 * breadcrumb trail, the eyebrow, a monumental <h1> that rises word by word, a gold
 * rule drawn across the full measure and the lead set off in the right-hand column.
 *
 * Everything here is first-screen, so it all plays as page-load choreography
 * (trigger "enter"): trail, eyebrow, headline, rule, lead — in that order.
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
  <header className={cn('mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 md:pb-20 md:pt-12', className)}>
    <Reveal trigger="enter" from="none">
      <Breadcrumbs items={breadcrumbs} />
    </Reveal>

    <div className="mt-12 md:mt-20 lg:mt-24">
      {eyebrow && (
        <Reveal as="p" trigger="enter" from="none" delay={0.05} className="eyebrow">
          {eyebrow}
        </Reveal>
      )}
      <SplitReveal
        as="h1"
        trigger="enter"
        delay={0.12}
        text={title}
        italicWords={italicWords}
        className={cn('mt-5 max-w-[18ch] md:mt-6', size === 'display' ? DISPLAY_H1 : DISPLAY_H1_COMPACT)}
      />
    </div>

    <DrawnRule trigger="enter" delay={0.45} className="mt-10 md:mt-14" />

    {(meta || lead) && (
      <div className="mt-6 grid gap-x-16 gap-y-6 md:mt-8 lg:grid-cols-12">
        {meta && (
          <Reveal
            as="p"
            trigger="enter"
            from="none"
            delay={0.55}
            className={cn(LABEL, 'tabular-nums lg:col-span-5')}
          >
            {meta}
          </Reveal>
        )}
        {lead && (
          <Reveal
            as="p"
            trigger="enter"
            delay={0.55}
            className="max-w-2xl text-lg/relaxed text-muted-foreground md:text-xl/relaxed lg:col-span-6 lg:col-start-7"
          >
            {lead}
          </Reveal>
        )}
      </div>
    )}
  </header>
);

export default PageHeader;
