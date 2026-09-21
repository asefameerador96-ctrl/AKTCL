import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { facts, formatFact } from '@/content/about';
import type { Fact } from '@/content/about';
import { entranceHold, isStill, useEntered } from '@/lib/motion';
import CountUp from '@/components/motion/CountUp';
import DrawnRule from '@/components/motion/DrawnRule';
import Reveal from '@/components/Reveal';

interface HeroStatsProps {
  /** Seconds into the hero's load choreography at which the top rule starts to draw. */
  delay?: number;
}

/** The rule is drawn first; the columns follow it, this far apart. */
const COLUMN_LEAD_S = 0.15;
const COLUMN_STAGGER_S = 0.08;

/** Over photography the hairlines are a white tint: the ink hairline would vanish into the scrim. */
const LINE = 'border-ink-foreground/25';

/**
 * The one counted figure. Left to itself CountUp would start the moment it is on
 * screen, a full second before its column has faded in — and an expo-out count is all
 * but over by then. So it is told when: as the column starts to rise. Until then the
 * column is transparent and the figure is simply the final one, a single plain number
 * (no screen-reader twin for copied text to repeat). The count starts from a figure
 * with the target's digit count ("10,000" → "50,000"), so it keeps its width.
 */
const Counted = ({ fact, delay }: { fact: Fact; delay: number }) => {
  const [still] = useState(isStill);
  const entered = useEntered();
  const [counting, setCounting] = useState(false);
  const format = (n: number) => formatFact(fact, n);

  useEffect(() => {
    if (still || !entered) return;
    const timer = window.setTimeout(() => setCounting(true), entranceHold() + delay * 1000);
    return () => window.clearTimeout(timer);
  }, [still, entered, delay]);

  return <CountUp play={counting} value={fact.value} from={10 ** (String(fact.value).length - 1)} format={format} />;
};

/**
 * The figures along the foot of the hero — the "counters under the headline" device
 * from the Orchid reference, drawn as a ruled row rather than a panel: a hairline
 * across the full width of the photograph, columns parted by vertical hairlines, a
 * mono label over a serif numeral. No surface of its own; the hero's bottom scrim
 * carries the legibility. Its columns sit on the same grid as the hero above, so the
 * last divider continues the rule beside the headline.
 *
 * Label and figure are one unit: the mono label directly over its numeral, never
 * pushed apart to the top and foot of a stretched column. From lg every label breaks
 * over two lines, so the three figures still stand on one line. Below lg three columns
 * would break the labels over four lines each, so the row becomes a ruled stack: each
 * pair on one row, the figure right after its label.
 *
 * Figures come from src/content/about.ts only, so the row can never state a number
 * the About copy does not. <dt> leads each pair, so it reads "…industry since: 1953".
 *
 * Part of the hero's load choreography: the rule draws across, then the columns rise
 * one after another. Only the farmer count runs up; a year that counted would pass
 * through years that mean nothing. Under isStill() (the prerenderer, reduced motion)
 * every figure is simply there, and none of this touches the LCP image behind it.
 */
const HeroStats = ({ delay = 0 }: HeroStatsProps) => (
  <div>
    <DrawnRule trigger="enter" delay={delay} lineClassName="bg-ink-foreground/25" />
    <dl
      // The cells stretch to the row, so the dividing hairlines run its full height;
      // what is inside them sits at the top.
      className="mx-auto grid w-full max-w-7xl px-4 sm:px-6 lg:grid-cols-[repeat(var(--stats),minmax(0,1fr))]"
      style={{ '--stats': facts.length } as CSSProperties}
    >
      {facts.map((fact, i) => {
        const columnDelay = delay + COLUMN_LEAD_S + i * COLUMN_STAGGER_S;
        return (
          <Reveal
            key={fact.label}
            trigger="enter"
            delay={columnDelay}
            className={cn(
              // Below lg: one ruled row, the figure straight after its label, standing on
              // the baseline of the label's last line ("…since 1953") — never sent to
              // the far side of a wide row. (Where last-baseline is unknown, the first
              // line's.) From lg: a column, the label directly over its figure.
              'flex items-baseline gap-4 py-3 [align-items:last_baseline] lg:flex-col lg:items-start lg:gap-3 lg:py-6',
              LINE,
              i > 0 && 'border-t lg:border-l lg:border-t-0 lg:pl-8',
              i < facts.length - 1 && 'lg:pr-6'
            )}
          >
            {/* One measure for every label, so the figures beside them start on one
                line. 14rem below lg — narrow enough that each label breaks over two
                lines and its figure follows close behind, and it gives way on a 360px
                phone; 19rem from lg, where every label again takes two lines, so the
                three figures stand on one line. rem, not ch: ch knows nothing of the
                tracking. */}
            <dt className="eyebrow min-w-0 max-w-[14rem] flex-1 leading-snug lg:max-w-[19rem] lg:flex-none">{fact.label}</dt>
            <dd className="shrink-0 font-display text-[length:clamp(1.75rem,1.1rem+2.6vw,4rem)] font-normal lining-nums leading-none tracking-[-0.03em] text-ink-foreground">
              {fact.isYear ? formatFact(fact) : <Counted fact={fact} delay={columnDelay} />}
              {/* The one signal in the row: a sage mark, never a fill. */}
              {fact.suffix && <span className="text-sage">{fact.suffix}</span>}
            </dd>
          </Reveal>
        );
      })}
    </dl>
  </div>
);

export default HeroStats;
