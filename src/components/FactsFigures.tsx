import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { SectionHead } from '@/components/Ruled';
import CountUp from '@/components/motion/CountUp';
import Grain from '@/components/motion/Grain';
import SplitReveal from '@/components/motion/SplitReveal';
import { cn } from '@/lib/utils';
import { isStill, revealTransition, useInView, useReveal } from '@/lib/motion';
import { facts, formatFact, type Fact } from '@/content/about';

/** A year sweeping up from 0 reads as nonsense, so years run through their last few decades only. */
const YEAR_RUN = 30;
const STAGGER_S = 0.12;

// One row while there are three figures or fewer; more than that, two columns.
const COLUMNS = facts.length <= 3 ? facts.length : 2;

const Stat = ({ fact, index }: { fact: Fact; index: number }) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3, skip: still });
  const shown = useReveal(inView);
  const delay = index * STAGGER_S;
  // Where the cell sits from lg up. The list's own border-y rules the outside; a cell
  // only draws what divides it from its neighbours.
  const firstInRow = index % COLUMNS === 0;
  const firstRow = index < COLUMNS;

  // Every time the cell comes on screen, and back out as it leaves (lib/motion): in on
  // its stagger, out at once and quicker.
  const move = (hidden: string, seconds: number, after = 0): CSSProperties | undefined =>
    still
      ? undefined
      : { transform: shown ? 'none' : hidden, transition: revealTransition(shown, 'transform', seconds, delay + after) };

  return (
    // A column of a ruled table, not a box: the mono label and its figure are one
    // unit, the label directly over the numeral and the pair at the top of the cell.
    // (They used to be pushed to the cell's top and foot, which left a gap the height
    // of a figure between "…since" and "1953".) The first column sits on the page's
    // left edge, so it takes no left padding; the others stand 32–40px off the
    // hairline that divides them.
    <div
      ref={ref}
      className={cn(
        'relative flex flex-col gap-3 py-8 md:py-10 lg:px-8 lg:pt-8 xl:px-10',
        firstInRow && 'lg:pl-0 xl:pl-0'
      )}
    >
      {/* The dividing hairlines, drawn from their origin: across the top between
          stacked cells (every cell below lg, every row from lg), down the left side
          between columns. */}
      {index > 0 && (
        <span
          aria-hidden="true"
          className={cn('absolute left-0 top-0 h-px w-full origin-left bg-ink-border', firstRow && 'lg:hidden')}
          style={move('scaleX(0)', 1.1)}
        />
      )}
      {!firstInRow && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 hidden h-full w-px origin-top bg-ink-border lg:block"
          style={move('scaleY(0)', 1.1)}
        />
      )}
      {/* A rem measure, not ch (ch knows nothing of the tracking): 16rem breaks every
          label over two lines on the desktop row, so the three figures still line up. */}
      <dt
        className="eyebrow max-w-[16rem] leading-relaxed"
        style={
          still ? undefined : { opacity: shown ? 1 : 0, transition: revealTransition(shown, 'opacity', 0.9, delay + 0.35) }
        }
      >
        {fact.label}
      </dt>
      {/* split-mask (index.css) is SplitReveal's window: the figure rises into it from below.
          -mt: the serif's digits stand some 0.14em under the top of their line box, so
          without it the label would read as floating a figure's shoulder above them. */}
      <dd className="display-xl split-mask -mt-[0.1em] text-[length:clamp(4.5rem,9.5vw,9rem)] lining-nums leading-none text-ink-foreground">
        <span className="block whitespace-nowrap" style={move('translate3d(0, calc(100% + 0.3em), 0)', 1.1, 0.1)}>
          {/* Counts as the cell reveals, from the same signal: never before, so the
              figure can wait as one plain number behind its mask. */}
          <CountUp
            play={shown}
            value={fact.value}
            from={fact.isYear ? fact.value - Math.min(YEAR_RUN, fact.value) : 0}
            duration={fact.isYear ? 900 : 1200}
            format={(n) => formatFact(fact, n)}
          />
          {/* The one signal in the band: sage, a tint of the accent, on a single glyph. */}
          {fact.suffix && <span className="text-sage">{fact.suffix}</span>}
        </span>
      </dd>
    </div>
  );
};

// In the single row each column is as wide as its figure is long (plus one for the
// gutter), so "50,000+" gets more room than "1953" and no column's width depends on
// the digits turning inside it.
const ROW_COLUMNS =
  facts.length <= 3
    ? facts.map((fact) => `minmax(0, ${(formatFact(fact) + (fact.suffix ?? '')).length + 1}fr)`).join(' ')
    : 'repeat(2, minmax(0, 1fr))';

/**
 * Facts & figures, on the always-dark ink band with paper grain: a ruled table of
 * monumental numerals that count up as they rise into view — mono label directly over
 * each, vertical hairlines between them, no boxes. Stacked below lg: at tablet width
 * three columns would break the labels over four lines each and leave the figures on
 * three different lines.
 *
 * Shows ONLY the figures in src/content/about.ts, each of which is stated in the
 * About copy. TODO(Asef): add capacity, markets served, certifications etc. to
 * `facts` once AKTCL confirms real numbers. Under isStill() (prerender, reduced
 * motion) every figure is its final value from the first paint.
 */
const FactsFigures = () => (
  <section
    aria-labelledby="facts-heading"
    className="relative isolate overflow-hidden bg-ink py-24 text-ink-foreground md:py-32 lg:py-36"
  >
    <Grain className="-z-10" />

    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHead label="At a Glance" onInk />
      <SplitReveal
        as="h2"
        id="facts-heading"
        text="Facts & Figures"
        italicWords={['Figures']}
        className="display-lg mt-12 md:mt-16 lg:mt-20"
      />

      <dl
        className="mt-14 grid border-y border-ink-border md:mt-20 lg:mt-24 lg:[grid-template-columns:var(--facts-columns)]"
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
