import { Link } from 'react-router-dom';
import { AccentRule, TravelArrow } from '@/components/Ruled';
import { cn } from '@/lib/utils';

export interface FormatCardProps {
  name: string;
  short: string;
  /** Labelled spec rows. Pass real values only — with none, the entry says so. */
  rows?: { label: string; value: string }[];
  /** Optional link; a /contact target is treated (and tracked) as an enquiry. */
  to?: string;
  /** Printed before the name ("01"). Left out, no number is shown. */
  number?: number;
  /**
   * 'stack' (default) suits a cell of a multi-column grid. 'row' is for a
   * single-column list: from md up the entry runs across the page — number, name,
   * line and specifications, link — and stacks below that.
   */
  layout?: 'stack' | 'row';
}

/**
 * Directory ROW for a cigarette format or service: mono number, the name in the
 * display serif, one line, then whatever specifications AKTCL has supplied — or the
 * honest "on request" tag. No box: the entry draws its own top hairline (close a list
 * of them with one border-b, or a RowLink, after the last), and on hover or keyboard
 * focus that rule is redrawn in the accent, the name and line shift 8px and the arrow
 * travels through.
 */
const FormatCard = ({ name, short, rows = [], to, number, layout = 'stack' }: FormatCardProps) => {
  const isEnquiry = to?.startsWith('/contact') ?? false;
  const row = layout === 'row';
  const numbered = number !== undefined;
  // Transform only, and only for visitors who have not asked for less motion.
  const shift =
    to && 'transition-transform motion-safe:group-hover:translate-x-2 motion-safe:group-focus-within:translate-x-2';
  // A numbered entry keeps its number in a gutter of its own, so the stacked entry
  // reads like the desktop row: number left, everything else in one column beside it.
  const beside = numbered && 'col-start-2';

  return (
    <article
      data-cursor={to ? (isEnquiry ? 'enquire' : 'open') : undefined}
      className={cn(
        'group relative h-full border-t border-border py-6 md:py-8',
        numbered ? 'grid grid-cols-[2.75rem_minmax(0,1fr)] content-start items-baseline' : 'flex flex-col',
        row && 'md:grid md:grid-cols-12 md:items-baseline md:gap-x-6 lg:gap-x-8 lg:py-10'
      )}
    >
      {to && <AccentRule />}

      {numbered && (
        <p aria-hidden="true" className={cn('index-num', row && 'md:col-span-1')}>
          {String(number).padStart(2, '0')}
        </p>
      )}

      <h3
        className={cn(
          // Fluid, like every headline: a full-width row has room for the larger step.
          row ? 'display-sm' : 'display-xs',
          'text-foreground',
          shift,
          beside,
          row && (numbered ? 'md:col-span-4 md:col-start-auto' : 'md:col-span-5')
        )}
      >
        {name}
      </h3>

      <div
        className={cn('mt-3 flex flex-1 flex-col', shift, beside, row && 'md:col-span-5 md:col-start-auto md:mt-0')}
      >
        <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">{short}</p>

        {/* Pinned to the bottom so spec rows and links line up across a row of entries */}
        <div className={cn('mt-auto pt-5', row && 'md:pt-4')}>
          {rows.length > 0 ? (
            <dl className="divide-y divide-border border-y border-border">
              {rows.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="text-right text-sm font-medium text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="font-mono text-[11px] font-medium uppercase leading-normal tracking-[0.18em] text-muted-foreground">
              Specifications on request
            </p>
          )}
        </div>
      </div>

      {to && (
        // The ::after stretches the link over the entry without making its name the whole entry.
        <Link
          to={to}
          data-lead={isEnquiry ? 'format-card-enquiry' : undefined}
          className={cn(
            'mt-2 inline-flex min-h-11 items-center gap-3 self-start justify-self-start font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-foreground transition-colors after:absolute after:inset-0 group-hover:text-accent group-focus-within:text-accent',
            beside,
            row && 'md:col-span-2 md:col-start-auto md:mt-0 md:self-auto md:justify-self-end'
          )}
        >
          {isEnquiry ? 'Enquire' : 'Know More'}
          <span className="sr-only">{isEnquiry ? ` about ${name}` : `: ${name}`}</span>
          <TravelArrow />
        </Link>
      )}
    </article>
  );
};

export default FormatCard;
