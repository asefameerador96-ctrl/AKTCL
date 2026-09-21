import { useId } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { SectionHead } from '@/components/PageHeader';
import DrawnRule from '@/components/motion/DrawnRule';
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

/**
 * The packaging ladder: pack → outer → master carton = the master carton's total. The
 * step names are UI microcopy; each value comes from `specs`. It is drawn only when all
 * four steps are known; otherwise the known ones fall back to labelled rows. Packs per
 * master carton is not a step of it: it stays a labelled row underneath.
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

const TYPE = {
  row: 'font-display text-[length:clamp(1.25rem,1.1rem_+_0.5vw,1.5rem)] leading-snug tracking-[-0.01em]',
  step: 'display-sm',
  load: 'display-md',
} as const;

type KnownSpec = NonNullable<SpecValue>;
/** A field with a value, ready to print. */
interface Known {
  key: SpecKey;
  spec: KnownSpec;
}

/** The field as a printable entry, or null when the sheets do not give it. */
const known = (specs: SizeSpecs, key: SpecKey): Known | null => {
  const spec = specs[key];
  return spec ? { key, spec } : null;
};
const isKnown = <T,>(entry: T | null): entry is T => entry !== null;

/**
 * A value in the display serif; its unit after it in the quiet mono — under a
 * container load's big figure, beside anything else — and "(typical)" after a
 * nominal one. Only known values reach it: a field the sheets do not give is left off.
 */
const Value = ({ spec, variant = 'row' }: { spec: KnownSpec; variant?: keyof typeof TYPE }) => {
  const stacked = variant === 'load';
  return (
    <span className="text-foreground">
      <span className={cn(TYPE[variant], stacked && 'block tabular-nums')}>{spec.value}</span>
      {spec.unit && (
        <span className={cn('index-num whitespace-nowrap', stacked ? 'mt-3 block uppercase' : 'ml-2')}>
          {spec.unit}
        </span>
      )}
      {spec.typical && <span className="index-num ml-2 whitespace-nowrap">(typical)</span>}
    </span>
  );
};

/**
 * Labelled rows: the mono label, then the value. Stacked on a phone,
 * so a dimension or the MOQ gets the full measure and wraps instead of running out;
 * even halves from sm; label and value columns over the sheet's nine from lg.
 */
const Rows = ({ entries }: { entries: Known[] }) => (
  <dl className="divide-y divide-border">
    {entries.map(({ key, spec }) => (
      <div
        key={key}
        className="grid items-baseline gap-2 py-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-9 lg:gap-0 lg:pl-8"
      >
        <dt className="eyebrow lg:col-span-4 lg:pr-8">{SPEC_LABELS[key]}</dt>
        <dd className="min-w-0 break-words sm:text-right lg:col-span-5 lg:text-left">
          <Value spec={spec} />
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
const Ladder = ({ steps }: { steps: (Known & { step: string })[] }) => (
  <dl className="grid md:grid-cols-4">
    {steps.map(({ key, spec, step }, i) => (
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
        <dd className="shrink-0 text-right tabular-nums md:mt-auto md:text-left">
          <Value spec={spec} variant="step" />
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

/** Container loads side by side: the box, its label, the load as a big figure. */
const Loads = ({ loads }: { loads: (Known & { lengthM: number; heightM: number })[] }) => (
  <dl className="grid sm:grid-cols-2">
    {loads.map(({ key, spec, lengthM, heightM }) => (
      <div
        key={key}
        className="flex flex-col gap-5 border-t border-border py-8 first:border-t-0 sm:border-l sm:border-t-0 sm:px-6 sm:first:border-l-0 sm:first:pl-0 lg:first:pl-8"
      >
        <dt>
          <ContainerGlyph lengthM={lengthM} heightM={heightM} />
          <span className="eyebrow mt-5 block">{SPEC_LABELS[key]}</span>
        </dt>
        <dd className="mt-auto">
          <Value spec={spec} variant="load" />
        </dd>
      </div>
    ))}
  </dl>
);

/**
 * AKTCL's data sheet for a format, drawn in the site's own hand — no borrowed
 * infographic. One ruled group per SPEC_GROUPS entry, its title over a narrow column
 * and its values over the wide one: labelled rows, the packaging structure as a
 * ladder, the container loads as two cells with large figures, each value in the
 * display serif. Only what the sheets give is printed: a field they leave out is not
 * shown, and a group with nothing in it is left off, so every row on the sheet is a
 * real figure. With no values at all the sheet says so in one line (the page carries
 * the enquiry). An infographic AKTCL owns, when attached to the size in
 * src/content/sizes.ts, is shown above the sheet.
 */
const PackagingSheet = ({ size, className }: PackagingSheetProps) => {
  const headingId = useId();
  const { specs } = size;
  const pending = !hasAnySpecs(size);

  const groups = SPEC_GROUPS.map((group) => {
    const inGroup = (key: SpecKey) => group.keys.includes(key);
    // The ladder is drawn whole or not at all; a partial one reads as rows instead.
    const ladderSteps = LADDER.filter(({ key }) => inGroup(key));
    const steps = ladderSteps
      .map(({ key, step }) => {
        const entry = known(specs, key);
        return entry && { ...entry, step };
      })
      .filter(isKnown);
    const ladder = ladderSteps.length === LADDER.length && steps.length === LADDER.length ? steps : [];
    const loads = CONTAINERS.filter(({ key }) => inGroup(key))
      .map(({ key, lengthM, heightM }) => {
        const entry = known(specs, key);
        return entry && { ...entry, lengthM, heightM };
      })
      .filter(isKnown);
    const rows = group.keys
      .filter((key) => !(ladder.length > 0 && LADDER_KEYS.has(key)) && !CONTAINER_KEYS.has(key))
      .map((key) => known(specs, key))
      .filter(isKnown);
    return { title: group.title, ladder, loads, rows };
  }).filter((group) => group.ladder.length + group.loads.length + group.rows.length > 0);

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

      {groups.length > 0 && (
        <div className="mt-14 border-b border-border md:mt-20">
          {groups.map((group, i) => (
            <Reveal key={group.title} delay={Math.min(i, 2) * 0.06} className="grid lg:grid-cols-12">
              <DrawnRule className="lg:col-span-12" />
              <h3 className="mono-label py-5 text-foreground lg:col-span-3 lg:py-6 lg:pr-8">{group.title}</h3>
              {/* Stacked, a rule parts the title from its values; beside it, the vertical one does. */}
              <div className="min-w-0 divide-y divide-border border-t border-border lg:col-span-9 lg:border-l lg:border-t-0">
                {group.ladder.length > 0 && <Ladder steps={group.ladder} />}
                {group.loads.length > 0 && <Loads loads={group.loads} />}
                {group.rows.length > 0 && <Rows entries={group.rows} />}
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {pending && (
        <div className="grid lg:grid-cols-12">
          <p className="text-secondary max-w-[34rem] pt-8 text-muted-foreground lg:col-span-9 lg:col-start-4 lg:pl-8">
            Full packaging and logistics specifications are shared against a trade enquiry.
          </p>
        </div>
      )}
    </section>
  );
};

export default PackagingSheet;
