import { useRef, useState } from 'react';
import Reveal from '@/components/Reveal';
import { DrawnRule, SectionHead, WRAP } from '@/components/PageHeader';
import SplitReveal from '@/components/motion/SplitReveal';
import { milestones } from '@/content/about';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface HeritageTimelineProps {
  /** The section's place on the page, as printed in its marker. */
  number?: string;
  className?: string;
}

/** Columns the page shows at once from md; past this the track scrolls sideways. */
const FITS = 4;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Heritage timeline — the "legacy" device from the Sopariwala reference, reduced to
 * what AKTCL has actually supplied: a year and one line per event.
 *
 * From md one hairline is drawn across the whole sheet: above it each event's mono
 * index, on it a small square node, below it the year in the display serif and its
 * line of copy. The rule runs on past the last year to the edge of the sheet, so the
 * list reads as unfinished while more milestones are still to come. On a phone the
 * same thread runs down the left edge. Only the rule and its nodes move (transform),
 * once, when the track is first seen.
 *
 * It renders however many entries `milestones` holds, in the order given: each takes
 * a column of at least 18rem and the track scrolls sideways once they outgrow the
 * page, so the list can grow without touching this file.
 *
 * TODO(Asef): only two dated events have been supplied (1953 and 1997). Add further
 * milestones to `milestones` in src/content/about.ts once AKTCL confirms the years.
 */
const HeritageTimeline = ({ number = '01', className }: HeritageTimelineProps) => {
  const [still] = useState(isStill);
  const trackRef = useRef<HTMLDivElement>(null);
  const shown = useReveal(useInView(trackRef, { skip: still }));

  const count = milestones.length;
  // The nodes follow the rule along: all set within ~0.9 s however many there are.
  const lag = (i: number) => i * Math.min(0.3, 0.9 / count);
  const pop = (i: number) =>
    still
      ? undefined
      : {
          transform: shown ? 'none' : 'scale(0)',
          transition: `transform 0.7s ${EASE.expoOut} ${(0.15 + lag(i)).toFixed(2)}s`,
        };

  return (
    <section aria-labelledby="heritage-heading" className={cn(WRAP, 'py-24 md:py-36', className)}>
      <SectionHead
        number={number}
        label="Heritage"
        // First and last year on record — both from src/content/about.ts.
        meta={count > 1 ? `${milestones[0].year} — ${milestones[count - 1].year}` : undefined}
        title="Our Milestones"
        id="heritage-heading"
      />

      <div
        ref={trackRef}
        // Focusable only once there is something to scroll to.
        tabIndex={count > FITS ? 0 : undefined}
        className="mt-14 md:mt-24 md:overflow-x-auto md:pb-6"
      >
        <div className="relative md:w-max md:min-w-full">
          <DrawnRule className="absolute inset-x-0 top-10 hidden md:block" />

          {/* role: Preflight strips the markers, and with them the list role in Safari. */}
          <ol role="list" className="grid md:grid-flow-col md:auto-cols-[minmax(18rem,26rem)]">
            {milestones.map((milestone, i) => (
              <li
                key={`${milestone.year}-${i}`}
                className="relative border-l border-border pb-14 pl-6 last:pb-0 md:border-l-0 md:pb-0 md:pl-0 md:pr-12"
              >
                {/* The <ol> carries the order; the index is its visual echo. */}
                <p aria-hidden="true" className="index-num md:h-10">
                  {pad(i + 1)}
                </p>
                {/* A square node on the thread: the one place this section spends the accent. */}
                <span
                  aria-hidden="true"
                  className="absolute -left-px top-0.5 -translate-x-1/2 md:left-0 md:top-10 md:-translate-y-1/2 md:translate-x-0"
                >
                  <span className="block h-[7px] w-[7px] bg-accent" style={pop(i)} />
                </span>

                <h3 className="display-lg mt-6 text-foreground md:mt-10">
                  <time dateTime={milestone.year}>
                    <SplitReveal as="span" text={milestone.year} delay={lag(i)} />
                  </time>
                </h3>
                <Reveal
                  as="p"
                  delay={0.2 + lag(i)}
                  className="mt-4 max-w-[34ch] text-base leading-relaxed text-muted-foreground md:mt-6"
                >
                  {milestone.text}
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HeritageTimeline;
