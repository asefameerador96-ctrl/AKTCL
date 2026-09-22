import { useRef, useState } from 'react';
import Reveal from '@/components/Reveal';
import { DrawnRule, SECTION_Y, SectionHead, WRAP } from '@/components/PageHeader';
import SplitReveal from '@/components/motion/SplitReveal';
import { milestones } from '@/content/about';
import { isStill, revealTransition, useInView, useReveal } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface HeritageTimelineProps {
  className?: string;
}

/** Columns the page shows at once from md; past this the track scrolls sideways. */
const FITS = 4;

/**
 * Heritage timeline — the "legacy" device from the Sopariwala reference, reduced to
 * what AKTCL has actually supplied: a year and one line per event.
 *
 * From md one hairline is drawn across the whole sheet: on it a small square node
 * for each event, below it the year in the display serif and its line of copy. The
 * year is the event's marker; no index numeral beside it. The rule runs on past the
 * last year to the edge of the sheet, so the list reads as unfinished while more
 * milestones are still to come. On a phone the same thread runs down the left edge.
 * Only the rule and its nodes move (transform): in each time the track comes on
 * screen, and back out, at once, as it leaves.
 *
 * It renders however many entries `milestones` holds, in the order given: each takes
 * a column of at least 18rem and the track scrolls sideways once they outgrow the
 * page, so the list can grow without touching this file.
 *
 * TODO(Asef): only two dated events have been supplied (1953 and 1997). Add further
 * milestones to `milestones` in src/content/about.ts once AKTCL confirms the years.
 */
const HeritageTimeline = ({ className }: HeritageTimelineProps) => {
  const [still] = useState(isStill);
  const trackRef = useRef<HTMLDivElement>(null);
  const shown = useReveal(useInView(trackRef, { skip: still }));

  const count = milestones.length;
  // The nodes follow the rule along: all set within ~0.5 s however many there are.
  const lag = (i: number) => i * Math.min(0.2, 0.5 / count);
  const pop = (i: number) =>
    still
      ? undefined
      : {
          transform: shown ? 'none' : 'scale(0)',
          transition: revealTransition(shown, 'transform', 0.6, 0.1 + lag(i)),
        };

  return (
    <section aria-labelledby="heritage-heading" className={cn(WRAP, SECTION_Y, className)}>
      <SectionHead label="Heritage" title="Our Milestones" id="heritage-heading" />

      <div
        ref={trackRef}
        // Focusable only once there is something to scroll to.
        tabIndex={count > FITS ? 0 : undefined}
        className="mt-10 md:mt-14 md:overflow-x-auto md:pb-6"
      >
        <div className="relative md:w-max md:min-w-full">
          <DrawnRule className="absolute inset-x-0 top-1 hidden md:block" />

          {/* role: Preflight strips the markers, and with them the list role in Safari. */}
          <ol role="list" className="grid md:grid-flow-col md:auto-cols-[minmax(18rem,26rem)]">
            {milestones.map((milestone, i) => (
              <li
                key={`${milestone.year}-${i}`}
                className="relative border-l border-border pb-14 pl-6 last:pb-0 md:border-l-0 md:pb-0 md:pl-0 md:pr-12"
              >
                {/* A square node on the thread: the one place this section spends the accent.
                    On a phone it sits level with the year's numerals; from md, on the rule. */}
                <span
                  aria-hidden="true"
                  className="absolute -left-px top-5 -translate-x-1/2 -translate-y-1/2 md:left-0 md:top-1 md:translate-x-0"
                >
                  <span className="block h-[7px] w-[7px] bg-accent" style={pop(i)} />
                </span>

                <h3 className="display-lg text-foreground md:mt-10">
                  <time dateTime={milestone.year}>
                    <SplitReveal as="span" text={milestone.year} delay={lag(i)} />
                  </time>
                </h3>
                <Reveal as="p" delay={0.1 + lag(i)} className="text-body mt-4 max-w-[34ch] text-muted-foreground md:mt-6">
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
