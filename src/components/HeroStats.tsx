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

/** Over photography the hairlines are a chalk tint: the ink hairline would vanish into the scrim. */
const LINE = 'border-ink-foreground/25';

/**
 * The one counted figure. CountUp starts the moment it is on screen, which here is a
 * full second before its column has faded in — and an expo-out count is all but over
 * by then. So it is only mounted when the column starts to rise; until then the
 * starting figure holds the space. The start keeps the digit count of the target
 * ("10,000" → "50,000"), so the figure keeps its width while it runs.
 */
const Counted = ({ fact, delay }: { fact: Fact; delay: number }) => {
  const [still] = useState(isStill);
  const entered = useEntered();
  const [counting, setCounting] = useState(false);
  const from = 10 ** (String(fact.value).length - 1);
  const format = (n: number) => formatFact(fact, n);

  useEffect(() => {
    if (still || !entered) return;
    const timer = window.setTimeout(() => setCounting(true), entranceHold() + delay * 1000);
    return () => window.clearTimeout(timer);
  }, [still, entered, delay]);

  if (still || counting) return <CountUp value={fact.value} from={from} format={format} />;

  return (
    <span className="tabular-nums">
      <span className="sr-only">{format(fact.value)}</span>
      <span aria-hidden="true">{format(from)}</span>
    </span>
  );
};

/**
 * The figures along the foot of the hero — the "counters under the headline" device
 * from the Orchid reference, drawn as a ruled row rather than a panel: a hairline
 * across the full width of the photograph, columns parted by vertical hairlines, a
 * mono label over a serif numeral. No surface of its own; the hero's bottom scrim
 * carries the legibility. Its columns sit on the same grid as the hero above, so the
 * last divider continues the rule beside the headline.
 *
 * On a phone three columns would break these labels over five lines each, so the row
 * becomes a ruled stack: label left, figure right.
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
      className="mx-auto grid w-full max-w-7xl px-4 sm:grid-cols-[repeat(var(--stats),minmax(0,1fr))] sm:px-6"
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
              // Phone: one ruled row, label left and figure right on a shared baseline.
              // From sm: a column, its figure pushed to the foot so all three stand on
              // one line however the labels above them happen to break.
              'flex items-baseline justify-between gap-6 py-2.5 sm:flex-col sm:items-start sm:gap-4 sm:py-5 lg:py-6',
              LINE,
              i > 0 && 'border-t sm:border-l sm:border-t-0 sm:pl-6 lg:pl-8',
              i < facts.length - 1 && 'sm:pr-6'
            )}
          >
            {/* Measures in rem, not ch: ch knows nothing of the tracking. Two lines at most. */}
            <dt className="eyebrow max-w-[13rem] leading-snug tracking-[0.16em] sm:max-w-[19rem] sm:leading-normal sm:tracking-[0.22em]">
              {fact.label}
            </dt>
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
