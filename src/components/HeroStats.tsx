import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { facts, formatFact } from '@/content/about';
import type { Fact } from '@/content/about';
import { entranceHold, isStill, useEntered } from '@/lib/motion';
import CountUp from '@/components/motion/CountUp';
import Reveal from '@/components/Reveal';

interface HeroStatsProps {
  /** Seconds into the hero's load choreography at which the strip arrives. */
  delay?: number;
}

/** The strip fades up first; its columns follow, this far apart. */
const COLUMN_LEAD_S = 0.1;
const COLUMN_STAGGER_S = 0.08;

/**
 * The one counted figure. CountUp starts the moment it is on screen, which here is a
 * full second before its column has faded in — and an expo-out count is all but over
 * by then. So it is only mounted when the column starts to rise; until then the
 * starting figure holds the space. The start keeps the digit count of the target
 * ("10,000" → "50,000"), so with tabular figures nothing beside it moves.
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
 * Glass stat strip along the foot of the hero — the "counters under the headline"
 * device from the Orchid reference. Figures come from src/content/about.ts only, so
 * the strip can never state a number the About copy does not.
 *
 * Part of the hero's load choreography: the strip fades in, then the columns rise one
 * after another. Only the farmer count runs up; a year that counted would pass
 * through years that mean nothing. Under isStill() (the prerenderer, reduced motion)
 * every figure is simply there, and none of this touches the LCP image behind it.
 */
const HeroStats = ({ delay = 0 }: HeroStatsProps) => (
  <Reveal
    as="dl"
    trigger="enter"
    from="none"
    delay={delay}
    className="grid grid-cols-[repeat(var(--stats),minmax(0,1fr))] border border-ink-foreground/15 bg-ink/40 backdrop-blur-md"
    style={{ '--stats': facts.length } as CSSProperties}
  >
    {facts.map((fact, i) => {
      const columnDelay = delay + COLUMN_LEAD_S + i * COLUMN_STAGGER_S;
      return (
        // <dt> leads in the DOM so each pair reads "label: value" to a screen reader
        // ("…industry since: 1953"); column-reverse puts the figure on top visually.
        <Reveal
          key={fact.label}
          trigger="enter"
          delay={columnDelay}
          className="flex flex-col-reverse justify-end gap-2 border-l border-ink-foreground/15 px-3 py-4 first:border-l-0 sm:gap-3 sm:px-6 sm:py-5 lg:px-8 lg:py-6"
        >
          <dt className="text-[11px] leading-snug text-ink-muted sm:text-xs lg:text-[13px]">{fact.label}</dt>
          {/* text-xl first: "50,000+" has to fit a third of a 360px screen. */}
          <dd className="font-display text-xl font-normal tabular-nums lining-nums leading-none tracking-[-0.02em] text-ink-foreground min-[420px]:text-2xl sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
            {fact.isYear ? formatFact(fact) : <Counted fact={fact} delay={columnDelay} />}
            {fact.suffix && <span className="text-gold">{fact.suffix}</span>}
          </dd>
        </Reveal>
      );
    })}
  </Reveal>
);

export default HeroStats;
