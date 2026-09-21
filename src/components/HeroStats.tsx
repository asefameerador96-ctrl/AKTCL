import type { CSSProperties } from 'react';
import { facts, formatFact } from '@/content/about';

/**
 * Glass stat strip along the foot of the hero — the "counters under the headline"
 * device from the Orchid reference. Figures come from src/content/about.ts only, so
 * the strip can never state a number the About copy does not.
 *
 * Static on purpose: it sits over the LCP image, and the count-up lives further
 * down the page in <FactsFigures>.
 */
const HeroStats = () => (
  <dl
    className="grid grid-cols-[repeat(var(--stats),minmax(0,1fr))] divide-x divide-ink-foreground/15 rounded-md border border-ink-foreground/15 bg-ink/45 backdrop-blur-md"
    style={{ '--stats': facts.length } as CSSProperties}
  >
    {facts.map((fact) => (
      // <dt> leads in the DOM so each pair reads "label: value" to a screen reader
      // ("…industry since: 1953"); column-reverse puts the figure on top visually.
      <div
        key={fact.label}
        className="flex flex-col-reverse justify-end gap-1.5 px-3 py-4 sm:gap-2 sm:px-6 sm:py-5 lg:px-8 lg:py-6"
      >
        <dt className="text-[11px] leading-snug text-ink-muted sm:text-xs lg:text-sm">
          {fact.label}
        </dt>
        {/* text-xl first: "50,000+" has to fit a third of a 360px screen. */}
        <dd className="font-display text-xl font-medium lining-nums leading-none text-ink-foreground min-[420px]:text-2xl sm:text-3xl lg:text-4xl">
          {formatFact(fact)}
          {fact.suffix && <span className="text-gold">{fact.suffix}</span>}
        </dd>
      </div>
    ))}
  </dl>
);

export default HeroStats;
