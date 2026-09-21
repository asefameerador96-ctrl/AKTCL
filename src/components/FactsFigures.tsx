import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import SectionMarker from '@/components/SectionMarker';
import CountUp from '@/components/motion/CountUp';
import Grain from '@/components/motion/Grain';
import SplitReveal from '@/components/motion/SplitReveal';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';
import { facts, formatFact, type Fact } from '@/content/about';

/** A year sweeping up from 0 reads as nonsense, so years run through their last few decades only. */
const YEAR_RUN = 30;
const STAGGER_S = 0.12;

const Stat = ({ fact, index }: { fact: Fact; index: number }) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3, skip: still });
  const shown = useReveal(inView);
  const delay = index * STAGGER_S;

  const move = (hidden: string, seconds: number, after = 0): CSSProperties | undefined =>
    still
      ? undefined
      : { transform: shown ? 'none' : hidden, transition: `transform ${seconds}s ${EASE.expoOut} ${delay + after}s` };

  return (
    // <dt> leads in the DOM so the pair reads "label: value"; column-reverse puts
    // the figure on top visually.
    <div ref={ref} className="relative flex flex-col-reverse justify-end gap-5 pt-8 md:gap-7 md:pl-8 md:pt-0 lg:pl-10">
      {/* Gold rule, drawn from its origin: across the top on phones, down the left side from md. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-px w-full origin-left bg-gold/50 md:h-full md:w-px md:origin-top"
        style={move('scale(0)', 1.1)}
      />
      <dt
        className="max-w-[17rem] text-xs font-medium uppercase leading-relaxed tracking-[0.2em] text-ink-muted"
        style={
          still ? undefined : { opacity: shown ? 1 : 0, transition: `opacity 0.9s ${EASE.expoOut} ${delay + 0.35}s` }
        }
      >
        {fact.label}
      </dt>
      {/* split-mask (index.css) is SplitReveal's window: the figure rises into it from below. */}
      <dd className="split-mask font-display text-[length:clamp(4rem,9vw,8.5rem)] font-normal lining-nums leading-none tracking-[-0.04em] text-ink-foreground">
        <span className="block whitespace-nowrap" style={move('translate3d(0, calc(100% + 0.3em), 0)', 1.1, 0.1)}>
          <CountUp
            value={fact.value}
            from={fact.isYear ? fact.value - Math.min(YEAR_RUN, fact.value) : 0}
            duration={fact.isYear ? 900 : 1200}
            format={(n) => formatFact(fact, n)}
          />
          {fact.suffix && <span className="text-gold">{fact.suffix}</span>}
        </span>
      </dd>
    </div>
  );
};

// One row while there are three figures or fewer, each column as wide as its figure
// is long (plus one for the gutter) so "50,000+" gets more room than "1953" and no
// column's width depends on the digits turning inside it. More than that: two columns.
const ROW_COLUMNS =
  facts.length <= 3
    ? facts.map((fact) => `minmax(0, ${(formatFact(fact) + (fact.suffix ?? '')).length + 1}fr)`).join(' ')
    : 'repeat(2, minmax(0, 1fr))';

/**
 * Facts & figures band, on the always-dark ink band with paper grain: monumental
 * numerals that count up as they rise into view, quiet small-caps labels beneath.
 *
 * Shows ONLY the figures in src/content/about.ts, each of which is stated in the
 * About copy. TODO(Asef): add capacity, markets served, certifications etc. to
 * `facts` once AKTCL confirms real numbers. Under isStill() (prerender, reduced
 * motion) every figure is its final value from the first paint.
 */
const FactsFigures = () => (
  <section
    aria-labelledby="facts-heading"
    className="relative isolate overflow-hidden bg-ink py-24 text-ink-foreground md:py-32 lg:py-40"
  >
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-gold/[0.07] via-transparent to-transparent" />
    <Grain className="-z-10" />

    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12 lg:items-baseline">
        <SectionMarker number="03" onInk className="lg:col-span-4">
          At a Glance
        </SectionMarker>
        <SplitReveal
          as="h2"
          id="facts-heading"
          text="Facts & Figures"
          className="text-[length:clamp(2.5rem,5vw,4.5rem)] font-normal leading-none tracking-[-0.03em] lg:col-span-8"
        />
      </div>

      <dl
        className="mt-16 grid gap-y-14 md:mt-24 md:gap-y-20 md:[grid-template-columns:var(--facts-columns)] lg:mt-28"
        style={{ '--facts-columns': ROW_COLUMNS } as CSSProperties}
      >
        {facts.map((fact, i) => (
          <Stat key={fact.label} fact={fact} index={i} />
        ))}
      </dl>
    </div>
  </section>
);

export default FactsFigures;
