import { useRef, useState } from 'react';
import Reveal from '@/components/Reveal';
import { DISPLAY_H2 } from '@/components/PageHeader';
import SplitReveal from '@/components/motion/SplitReveal';
import { milestones } from '@/content/about';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';
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
 * From md the years stand at display scale on a horizontal gold rule; on a phone the
 * same thread runs down the left edge. Each entry carries its own length of the
 * thread and they draw one after another, so the line is seen travelling from year
 * to year; the last length fades out instead of ending on a cap, so the list reads
 * as unfinished while more milestones are still to come. Only the thread and its
 * dots move (transform), once, when the track is first seen.
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
  // The whole thread is drawn within ~1.2 s however many lengths it has.
  const lag = (i: number) => i * Math.min(0.3, 0.9 / count);

  const draw = (axis: 'X' | 'Y', i: number) =>
    still
      ? undefined
      : {
          transform: shown ? 'none' : `scale${axis}(0)`,
          transition: `transform 1.1s ${EASE.expoOut} ${lag(i).toFixed(2)}s`,
        };
  const pop = (i: number) =>
    still
      ? undefined
      : {
          transform: shown ? 'none' : 'scale(0)',
          transition: `transform 0.7s ${EASE.expoOut} ${lag(i).toFixed(2)}s`,
        };

  const DOT = 'block h-2.5 w-2.5 rounded-full bg-gold ring-4 ring-background';

  return (
    <section aria-labelledby="heritage-heading" className={cn('py-24 md:py-36', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal as="p" from="none" className="eyebrow">
          Heritage
        </Reveal>
        <SplitReveal as="h2" id="heritage-heading" text="Our Milestones" className={cn('mt-4', DISPLAY_H2)} />

        <div
          ref={trackRef}
          // Focusable only once there is something to scroll to.
          tabIndex={count > FITS ? 0 : undefined}
          className="mt-14 md:mt-24 md:overflow-x-auto md:pb-6 md:pt-2"
        >
          {/* role: Preflight strips the markers, and with them the list role in Safari. */}
          <ol role="list" className="grid md:grid-flow-col md:auto-cols-[minmax(18rem,1fr)]">
            {milestones.map((milestone, i) => {
              const last = i === count - 1;
              return (
                <li key={`${milestone.year}-${i}`} className="relative pb-14 pl-8 last:pb-0 md:pb-0 md:pl-0 md:pr-12">
                  {/* Phone: this entry's length of the thread, and its dot beside the year. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-y-0 left-0 w-px origin-top md:hidden',
                      last ? 'bg-gradient-to-b from-gold/70 to-transparent' : 'bg-gold/70'
                    )}
                    style={draw('Y', i)}
                  />
                  <span aria-hidden="true" className="absolute left-0 top-7 -translate-x-1/2 md:hidden">
                    <span className={DOT} style={pop(i)} />
                  </span>

                  <h3 className="font-display text-[length:clamp(5rem,13vw,11.5rem)] font-normal leading-[0.86] tracking-[-0.045em] text-foreground">
                    <time dateTime={milestone.year}>
                      <SplitReveal as="span" text={milestone.year} delay={lag(i)} />
                    </time>
                  </h3>

                  {/* From md: the rule under the year, run through the column's gutter so
                      the lengths meet, with the year's dot at its head. */}
                  <span aria-hidden="true" className="relative mt-8 hidden h-px md:-mr-12 md:block lg:mt-10">
                    <span
                      className={cn(
                        'absolute inset-0 origin-left',
                        last ? 'bg-gradient-to-r from-gold/70 to-transparent' : 'bg-gold/70'
                      )}
                      style={draw('X', i)}
                    />
                    <span className="absolute left-0 top-1/2 -translate-y-1/2">
                      <span className={DOT} style={pop(i)} />
                    </span>
                  </span>

                  <Reveal
                    as="p"
                    delay={0.2 + lag(i)}
                    className="mt-5 max-w-[34ch] text-lg/relaxed text-muted-foreground md:mt-8"
                  >
                    {milestone.text}
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HeritageTimeline;
