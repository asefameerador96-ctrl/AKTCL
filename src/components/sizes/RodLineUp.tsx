import { Link } from 'react-router-dom';
import { AccentRule, TravelArrow } from '@/components/Ruled';
import DrawnRule from '@/components/motion/DrawnRule';
import { cigaretteSizes, type CigaretteSize } from '@/content/sizes';
import { cn } from '@/lib/utils';
import RodDiagram from './RodDiagram';
import { GUIDES_MM, toPercent } from './geometry';

interface RodLineUpProps {
  /** Default: every format, in the content's order. */
  sizes?: CigaretteSize[];
  /** The homepage band: a narrower label column and tighter rows. */
  compact?: boolean;
  /** Each row links to its size page (the homepage). The index lists them separately. */
  linked?: boolean;
  /** Each format's tagline under its name and length (the homepage band). */
  taglines?: boolean;
  className?: string;
}

/** A dashed hairline in a quiet tint of the text colour: a guide, never a row rule. */
const GUIDE_LINE =
  'text-foreground/30 bg-[linear-gradient(to_bottom,currentColor_60%,transparent_60%)] bg-[length:1px_5px]';

/** Seconds between one row starting to draw and the next. */
const ROW_STAGGER = 0.08;

/**
 * The reference guides at the fixed format lengths, as full-height dashed hairlines of
 * one drawing cell. Every cell draws its own, so on a desktop, where the cells touch,
 * they read as one line down the whole line-up; on a phone they cross each rod only,
 * never the labels above it. The header cell also names them: the last guide's label
 * to its right, the others' to their left, so neighbours never collide at 360px.
 */
const Guides = ({ delay, labelled = false }: { delay: number; labelled?: boolean }) => (
  <>
    {GUIDES_MM.map((mm, i) => (
      <span key={mm} aria-hidden="true" className="absolute inset-y-0" style={{ left: toPercent(mm) }}>
        <DrawnRule axis="y" delay={delay} lineClassName={GUIDE_LINE} />
        {labelled && (
          <span
            className={cn(
              'index-num absolute top-1 whitespace-nowrap',
              i === GUIDES_MM.length - 1 ? 'left-2' : 'right-2'
            )}
          >
            {mm} mm
          </span>
        )}
      </span>
    ))}
  </>
);

/**
 * The formats side by side on one scale — the segment's signature drawing. A ruled
 * table of rods: a header row naming the reference guides, then one row per format
 * with its name and length label (and, with `taglines`, its tagline) on the left and
 * its rod drawn from a common datum
 * (the vertical hairline) on the right. Every rod shares one mm-to-px scale, so the
 * lengths compare truthfully; the drawn diameters are indicative, and the caption
 * says so.
 *
 * Rows draw in one after another, each time the line-up comes on screen. With
 * `linked` each row is a directory row: the house hover (accent rule, 8px shift,
 * travelling arrow) and a link to the size page.
 */
const RodLineUp = ({
  sizes = cigaretteSizes,
  compact = false,
  linked = false,
  taglines = false,
  className,
}: RodLineUpProps) => {
  const cols = compact
    ? { label: 'md:col-span-4', drawing: 'md:col-span-8' }
    : { label: 'md:col-span-3', drawing: 'md:col-span-9' };

  const rowGrid = 'grid md:grid-cols-12';
  const labelCell = cn(
    'relative flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-4 md:flex-col md:flex-nowrap md:justify-center md:pr-12',
    compact ? 'md:py-4' : 'md:py-6',
    cols.label
  );
  const drawingCell = cn(
    'relative flex items-center pb-5 pt-3 md:border-l md:border-border',
    compact ? 'md:py-4' : 'md:py-6',
    cols.drawing
  );
  // The display serif even when compact: the mono's small caps would print "100s" as "100S".
  const name = 'display-xs text-foreground';
  const shift =
    linked &&
    'transition-transform motion-safe:group-hover:translate-x-2 motion-safe:group-focus-visible:translate-x-2';

  return (
    <figure className={cn('text-foreground', className)}>
      {/* Column heads, like a table's: read out through the caption instead. */}
      <div aria-hidden="true" className={rowGrid}>
        <p className={cn('eyebrow hidden pb-3 md:block', cols.label)}>Format</p>
        <div className={cn('relative h-9 md:border-l md:border-border', cols.drawing)}>
          <Guides delay={0} labelled />
        </div>
      </div>

      {/* role: Preflight strips the markers, and with them the list role in Safari. */}
      <ul role="list" className="border-b border-border">
        {sizes.map((size, i) => {
          const delay = (i + 1) * ROW_STAGGER;
          const cells = (
            <>
              <div className={labelCell}>
                <span className={cn(name, shift)}>{size.name}</span>
                <span className={cn('index-num', shift)}>{size.lengthLabel}</span>
                {linked && (
                  <TravelArrow className="ml-auto self-center text-foreground transition-colors group-hover:text-accent group-focus-visible:text-accent md:absolute md:right-6 md:top-1/2 md:ml-0 md:-translate-y-1/2" />
                )}
                {taglines && (
                  // Its own line on a phone, under the name and length; the column's foot from md.
                  <span className={cn('text-secondary basis-full text-muted-foreground md:mt-1 md:basis-auto', shift)}>
                    {size.tagline}
                  </span>
                )}
              </div>
              <div className={drawingCell}>
                <Guides delay={delay} />
                <RodDiagram size={size} delay={delay} decorative={linked} className="relative w-full" />
              </div>
            </>
          );

          return (
            <li key={size.slug}>
              {linked ? (
                <Link
                  to={`/cigarette-sizes/${size.slug}`}
                  aria-label={`${size.name}, ${size.lengthLabel}${taglines ? `. ${size.tagline}` : ''}`}
                  data-cursor="open"
                  className={cn('group relative border-t border-border', rowGrid)}
                >
                  <AccentRule />
                  {cells}
                </Link>
              ) : (
                <div className={cn('border-t border-border', rowGrid)}>{cells}</div>
              )}
            </li>
          );
        })}
      </ul>

      <figcaption className="text-secondary mt-4 max-w-[38rem] text-muted-foreground">
        Nominal rod length of each format, drawn to one scale. Drawn diameters are indicative.
      </figcaption>
    </figure>
  );
};

export default RodLineUp;
