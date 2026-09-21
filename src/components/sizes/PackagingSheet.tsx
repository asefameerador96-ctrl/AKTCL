import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { SectionHead } from '@/components/PageHeader';
import DrawnRule from '@/components/motion/DrawnRule';
import { CtaButton } from '@/components/ui/button';
import {
  SPEC_GROUPS,
  SPEC_LABELS,
  hasAnySpecs,
  type CigaretteSize,
  type SizeSpecs,
  type SpecValue,
} from '@/content/sizes';
import { cn } from '@/lib/utils';

type SpecKey = keyof SizeSpecs;

interface PackagingSheetProps {
  size: CigaretteSize;
  className?: string;
}

const ON_REQUEST = 'On request';

/**
 * The packaging ladder: pack → outer → master carton = the master carton's total. The
 * step names are UI microcopy; each value comes from `specs` (null → "On request").
 */
const LADDER: { key: SpecKey; step: string }[] = [
  { key: 'sticksPerPack', step: 'Pack' },
  { key: 'packsPerOuter', step: 'Outer' },
  { key: 'outersPerMasterCarton', step: 'Master carton' },
  { key: 'sticksPerMasterCarton', step: 'Total' },
];

/**
 * Container loads, each with its box drawn to scale in side elevation. The outlines use
 * the ISO standard external sizes (40' high cube 12.19 × 2.90 m, 20' 6.06 × 2.59 m) as
 * drawing proportions only — no figure is printed from them.
 */
const CONTAINERS: { key: SpecKey; lengthM: number; heightM: number }[] = [
  { key: 'cartons40HC', lengthM: 12.19, heightM: 2.9 },
  { key: 'cartons20ft', lengthM: 6.06, heightM: 2.59 },
];

const LADDER_KEYS = new Set<SpecKey>(LADDER.map((s) => s.key));
const CONTAINER_KEYS = new Set<SpecKey>(CONTAINERS.map((c) => c.key));

/** A real value in the display serif; "(typical)" after a nominal one. */
const Value = ({ spec, variant = 'row' }: { spec: SpecValue; variant?: 'row' | 'step' | 'load' }) => {
  if (!spec) return <span className="eyebrow">{ON_REQUEST}</span>;
  const type =
    variant === 'load'
      ? 'display-md'
      : variant === 'step'
        ? 'display-sm'
        : 'font-display text-[length:clamp(1.25rem,1.1rem_+_0.5vw,1.5rem)] leading-snug tracking-[-0.01em]';
  return (
    <span className="text-foreground">
      <span className={type}>{spec.value}</span>
      {spec.typical && <span className="index-num ml-2 whitespace-nowrap">(typical)</span>}
    </span>
  );
};

/** Labelled rows: the mono label on the left, the value (or "On request") beside it. */
const Rows = ({ keys, specs }: { keys: SpecKey[]; specs: SizeSpecs }) => (
  <dl className="divide-y divide-border">
    {keys.map((key) => (
      <div
        key={key}
        // Even halves on a phone, so a long label keeps to its own column.
        className="grid grid-cols-2 items-baseline gap-6 py-4 lg:grid-cols-9 lg:gap-0 lg:pl-8"
      >
        <dt className="eyebrow lg:col-span-5 lg:pr-8">{SPEC_LABELS[key]}</dt>
        <dd className="text-right lg:col-span-4 lg:text-left">
          <Value spec={specs[key]} />
        </dd>
      </div>
    ))}
  </dl>
);

/** Where one ladder step hands on to the next: over the hairline between the cells. */
const Connector = ({ equals }: { equals: boolean }) => (
  <span
    aria-hidden="true"
    className="absolute -bottom-2.5 left-0 z-10 flex h-5 w-5 items-center justify-center bg-background text-muted-foreground md:-right-2.5 md:bottom-auto md:left-auto md:top-1/2 md:-translate-y-1/2"
  >
    {equals ? (
      <span className="font-mono text-[0.9375rem] leading-none">=</span>
    ) : (
      <>
        <ArrowDown strokeWidth={1.5} className="h-4 w-4 md:hidden" />
        <ArrowRight strokeWidth={1.5} className="hidden h-4 w-4 md:block" />
      </>
    )}
  </span>
);

/**
 * The packaging structure as a ladder: four ruled cells, pack → outer → master carton
 * = cigarettes per master carton, stacked on a phone with the arrows pointing down.
 */
const Ladder = ({ specs }: { specs: SizeSpecs }) => (
  <dl className="grid md:grid-cols-4">
    {LADDER.map(({ key, step }, i) => (
      <div
        key={key}
        className={cn(
          // A labelled row on a phone (value on the right, like the rows below it), a
          // column of the ladder from md.
          'relative flex items-baseline justify-between gap-6 border-t border-border py-6 first:border-t-0 md:flex-col md:items-stretch md:justify-start md:gap-4 md:border-l md:border-t-0 md:px-6 md:first:border-l-0 md:first:pl-0 lg:first:pl-8',
          i === LADDER.length - 1 && 'md:pr-0'
        )}
      >
        <dt>
          <span className="mono-label block text-foreground">{step}</span>
          <span className="text-secondary mt-1 block text-muted-foreground">{SPEC_LABELS[key]}</span>
        </dt>
        <dd className="shrink-0 text-right md:mt-auto md:text-left">
          <Value spec={specs[key]} variant="step" />
          {i < LADDER.length - 1 && <Connector equals={i === LADDER.length - 2} />}
        </dd>
      </div>
    ))}
  </dl>
);

const ContainerGlyph = ({ lengthM, heightM }: { lengthM: number; heightM: number }) => {
  // One viewBox for both boxes, so the 20' is drawn half the 40' and a little lower.
  const W = 12.4;
  const H = 3.1;
  const y0 = H - heightM;
  let ribs = '';
  for (let x = 0.45; x < lengthM - 0.3; x += 0.3) ribs += `M${x.toFixed(2)} ${(y0 + 0.18).toFixed(2)}V${(H - 0.28).toFixed(2)}`;
  const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, vectorEffect: 'non-scaling-stroke' } as const;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full max-w-[15rem] overflow-visible text-foreground"
      style={{ aspectRatio: `${W} / ${H}` }}
      aria-hidden="true"
      focusable="false"
    >
      <path d={ribs} {...line} strokeOpacity={0.25} />
      <rect x={0} y={y0} width={lengthM} height={heightM} {...line} />
      {/* Bottom rail and the door end. */}
      <path d={`M0 ${H - 0.18}H${lengthM}M${lengthM - 0.2} ${y0}V${H}`} {...line} strokeOpacity={0.6} />
    </svg>
  );
};

/** Container loads side by side: the box, its label, and the figure when AKTCL has one. */
const Loads = ({ specs }: { specs: SizeSpecs }) => (
  <dl className="grid sm:grid-cols-2">
    {CONTAINERS.map(({ key, lengthM, heightM }) => (
      <div
        key={key}
        className="flex flex-col gap-5 border-t border-border py-8 first:border-t-0 sm:border-l sm:border-t-0 sm:px-6 sm:first:border-l-0 sm:first:pl-0 lg:first:pl-8"
      >
        <dt>
          <ContainerGlyph lengthM={lengthM} heightM={heightM} />
          <span className="eyebrow mt-5 block">{SPEC_LABELS[key]}</span>
        </dt>
        <dd className="mt-auto">
          <Value spec={specs[key]} variant="load" />
        </dd>
      </div>
    ))}
  </dl>
);

/**
 * AKTCL's own data sheet for a format — the reason no borrowed infographic is needed.
 * One ruled group per SPEC_GROUPS entry, its title over a narrow column and its
 * values over the wide one: labelled rows, the packaging structure as a ladder, the
 * container loads as two cells with large figures. A real value is set in the display
 * serif; a value AKTCL has not confirmed reads "On request" in the quiet mono, so the
 * two can never be mistaken for each other. With no values at all the sheet says so in
 * one line and offers the enquiry. An infographic AKTCL owns, when attached to the
 * size in src/content/sizes.ts, is shown above the sheet.
 */
const PackagingSheet = ({ size, className }: PackagingSheetProps) => {
  const headingId = useId();
  const { specs } = size;
  const pending = !hasAnySpecs(size);

  return (
    <section aria-labelledby={headingId} className={className}>
      <SectionHead label="Data Sheet" title="Packaging & logistics" id={headingId} />

      {size.infographic && (
        <Reveal className="mt-14 bg-tile md:mt-20">
          <LazyImage
            image={size.infographic.image}
            alt={size.infographic.alt}
            sizes="(min-width: 1280px) 1216px, calc(100vw - 32px)"
            className="block h-auto w-full"
          />
        </Reveal>
      )}

      <div className="mt-14 border-b border-border md:mt-20">
        {SPEC_GROUPS.map((group, i) => {
          const ladder = group.keys.some((key) => LADDER_KEYS.has(key));
          const loads = group.keys.some((key) => CONTAINER_KEYS.has(key));
          const rest = group.keys.filter(
            (key) => !(ladder && LADDER_KEYS.has(key)) && !(loads && CONTAINER_KEYS.has(key))
          );

          return (
            <Reveal key={group.title} delay={Math.min(i, 2) * 0.06} className="grid lg:grid-cols-12">
              <DrawnRule className="lg:col-span-12" />
              <h3 className="mono-label py-5 text-foreground lg:col-span-3 lg:py-6 lg:pr-8">{group.title}</h3>
              {/* Stacked, a rule parts the title from its values; beside it, the vertical one does. */}
              <div className="divide-y divide-border border-t border-border lg:col-span-9 lg:border-l lg:border-t-0">
                {ladder && <Ladder specs={specs} />}
                {loads && <Loads specs={specs} />}
                {rest.length > 0 && <Rows keys={rest} specs={specs} />}
              </div>
            </Reveal>
          );
        })}
      </div>

      {pending && (
        <div className="grid lg:grid-cols-12">
          <div className="pt-8 lg:col-span-9 lg:col-start-4 lg:pl-8">
            <p className="text-secondary max-w-[34rem] text-muted-foreground">
              Full packaging and logistics specifications are shared against a trade enquiry.
            </p>
            <CtaButton asChild className="mt-8 w-full sm:w-auto">
              <Link
                to={`/contact?product=${encodeURIComponent(`${size.name} cigarettes`)}`}
                data-lead="size-request-specs"
                data-cursor="enquire"
              >
                Request Specifications
              </Link>
            </CtaButton>
          </div>
        </div>
      )}
    </section>
  );
};

export default PackagingSheet;
