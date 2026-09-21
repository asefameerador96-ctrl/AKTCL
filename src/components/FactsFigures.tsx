import { useState } from 'react';
import type { CSSProperties } from 'react';
import Reveal from '@/components/Reveal';
import { useCountUp } from '@/hooks/useCountUp';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { prefersReducedMotion } from '@/hooks/useMediaQuery';
import { facts, formatFact, type Fact } from '@/content/about';

const COUNT_MS = 2000;
/** A year sweeping up from 0 reads as nonsense, so years run through their last few decades only. */
const YEAR_RUN = 40;

interface StatItemProps {
  fact: Fact;
  /** Seconds; staggers the fade-in across the row. */
  delay: number;
  /** Skip the count-up and show the final figure straight away. */
  instant: boolean;
}

const StatItem = ({ fact, delay, instant }: StatItemProps) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });
  const run = fact.isYear ? Math.min(YEAR_RUN, fact.value) : fact.value;
  const counted = useCountUp(run, COUNT_MS, isVisible && !instant);
  const shown = instant ? fact.value : fact.value - run + counted;

  return (
    // <dt> leads in the DOM so the pair reads "label: value"; column-reverse puts
    // the figure on top visually.
    <div
      ref={ref}
      className="flex flex-col-reverse items-center justify-end gap-5 px-6 text-center transition-all duration-1000 ease-out md:gap-6 md:px-10"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : 'translateY(24px)',
        transitionDelay: `${delay}s`,
      }}
    >
      <dt className="max-w-xs text-sm uppercase leading-relaxed tracking-[0.15em] text-ink-muted">
        {fact.label}
      </dt>
      <dd className="font-display text-[length:clamp(3rem,6vw,5rem)] font-medium tabular-nums lining-nums leading-none text-ink-foreground">
        {/* The final figure is always in the DOM for screen readers and crawlers;
            the animated one is presentation only. */}
        <span className="sr-only">
          {formatFact(fact)}
          {fact.suffix}
        </span>
        <span aria-hidden="true">
          {formatFact(fact, shown)}
          {fact.suffix && <span className="text-gold">{fact.suffix}</span>}
        </span>
      </dd>
    </div>
  );
};

/**
 * Facts & figures band (the Shah Agro count-up, on the always-dark ink band).
 *
 * Shows ONLY the figures in src/content/about.ts, each of which is stated in the
 * About copy. TODO(Asef): add capacity, markets served, certifications etc. to
 * `facts` once AKTCL confirms real numbers — the row lays itself out for any count.
 */
const FactsFigures = () => {
  // Read once per mount: the prerender snapshot must hold the final numbers, and
  // reduced-motion visitors should not watch digits spin.
  const [instant] = useState(() => window.__PRERENDER__ === true || prefersReducedMotion());

  return (
    <section aria-labelledby="facts-heading" className="bg-ink py-20 text-ink-foreground md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-col items-center text-center">
          <p className="eyebrow text-gold">At a Glance</p>
          <h2
            id="facts-heading"
            className="mt-4 text-3xl font-medium leading-tight md:text-4xl lg:text-5xl"
          >
            Facts &amp; Figures
          </h2>
          <div className="rule mt-6" aria-hidden="true" />
        </Reveal>

        <dl
          className="mt-14 grid gap-y-14 md:mt-20 md:grid-cols-[repeat(var(--facts),minmax(0,1fr))] md:divide-x md:divide-ink-border"
          style={{ '--facts': facts.length } as CSSProperties}
        >
          {facts.map((fact, i) => (
            <StatItem key={fact.label} fact={fact} delay={i * 0.15} instant={instant} />
          ))}
        </dl>
      </div>
    </section>
  );
};

export default FactsFigures;
