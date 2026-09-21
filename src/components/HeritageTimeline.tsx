import Reveal from '@/components/Reveal';
import { milestones } from '@/content/about';
import { cn } from '@/lib/utils';

interface HeritageTimelineProps {
  className?: string;
}

/**
 * Heritage timeline — the "legacy" device from the Sopariwala reference, reduced to
 * what AKTCL has actually supplied: a year and one line per event.
 *
 * It renders however many entries `milestones` holds, in the order given, so the
 * list can grow without touching this file.
 *
 * TODO(Asef): only two dated events have been supplied (1953 and 1997). Add further
 * milestones to `milestones` in src/content/about.ts once AKTCL confirms the years.
 */
const HeritageTimeline = ({ className }: HeritageTimelineProps) => (
  <section aria-labelledby="heritage-heading" className={cn('py-20 md:py-28', className)}>
    <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
      <Reveal className="lg:col-span-4">
        <p className="eyebrow">Heritage</p>
        <h2
          id="heritage-heading"
          className="mt-4 text-3xl/tight font-medium md:text-4xl/tight lg:text-5xl/tight"
        >
          Our Milestones
        </h2>
        <div className="rule mt-6" aria-hidden="true" />
      </Reveal>

      <div className="relative lg:col-span-8">
        {/* The thread the dots sit on. It fades out rather than ending on a cap, so
            the list reads as unfinished while more milestones are still to come. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-gradient-to-b from-gold/70 via-gold/40 to-transparent"
        />
        {/* role: Preflight strips the markers, and with them the list role in Safari. */}
        <ol role="list">
          {milestones.map((milestone, i) => (
            <Reveal
              as="li"
              key={`${milestone.year}-${i}`}
              delay={i * 0.12}
              className="pb-12 pl-8 last:pb-0 md:grid md:grid-cols-[10rem_1fr] md:items-baseline md:gap-8 md:pb-16 md:pl-12"
            >
              <h3 className="relative text-5xl font-medium leading-none md:text-6xl">
                {/* Offset by the item's left padding so the dot lands on the thread. */}
                <span
                  aria-hidden="true"
                  className="absolute -left-8 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold ring-4 ring-background md:-left-12"
                />
                <time dateTime={milestone.year}>{milestone.year}</time>
              </h3>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground md:mt-0">
                {milestone.text}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </div>
  </section>
);

export default HeritageTimeline;
