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
  /**
   * 'stack' (default) suits a cell of a multi-column grid. 'row' is for a
   * single-column list: from md up the entry runs across the page — name, line and
   * specifications, link — and stacks below that.
   */
  layout?: 'stack' | 'row';
}

/**
 * Directory ROW for a cigarette format or service: the name in the display serif, one
 * line, then whatever specifications AKTCL has supplied — or the honest "on request"
 * tag. No box: the entry draws its own top hairline (close a list of them with one
 * border-b, or a RowLink, after the last), and on hover or keyboard focus that rule is
 * redrawn in the accent, the name and line shift 8px and the arrow travels through.
 */
const FormatCard = ({ name, short, rows = [], to, layout = 'stack' }: FormatCardProps) => {
  const isEnquiry = to?.startsWith('/contact') ?? false;
  const row = layout === 'row';
  // Transform only, and only for visitors who have not asked for less motion.
  const shift =
    to && 'transition-transform motion-safe:group-hover:translate-x-2 motion-safe:group-focus-within:translate-x-2';

  return (
    <article
      data-cursor={to ? (isEnquiry ? 'enquire' : 'open') : undefined}
      className={cn(
        'group relative flex h-full flex-col border-t border-border py-6 md:py-8',
        row && 'md:grid md:grid-cols-12 md:items-baseline md:gap-x-6 lg:gap-x-8 lg:py-10'
      )}
    >
      {to && <AccentRule />}

      <h3
        className={cn(
          // Fluid, like every headline: a full-width row has room for the larger step.
          row ? 'display-sm' : 'display-xs',
          'text-foreground',
          shift,
          row && 'md:col-span-5'
        )}
      >
        {name}
      </h3>

      <div className={cn('mt-3 flex flex-1 flex-col', shift, row && 'md:col-span-5 md:mt-0')}>
        <p className="max-w-[52ch] text-base leading-relaxed text-muted-foreground">{short}</p>

        {/* Pinned to the bottom so spec rows and links line up across a row of entries */}
        <div className={cn('mt-auto pt-5', row && 'md:pt-4')}>
          {rows.length > 0 ? (
            <dl className="divide-y divide-border border-y border-border">
              {rows.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="mono-label text-muted-foreground">{spec.label}</dt>
                  <dd className="text-right text-base font-medium text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mono-label text-muted-foreground">Specifications on request</p>
          )}
        </div>
      </div>

      {to && (
        // The ::after stretches the link over the entry without making its name the whole entry.
        <Link
          to={to}
          data-lead={isEnquiry ? 'format-card-enquiry' : undefined}
          className={cn(
            'mono-label mt-2 inline-flex min-h-11 items-center gap-3 self-start text-foreground transition-colors after:absolute after:inset-0 group-hover:text-accent group-focus-within:text-accent',
            row && 'md:col-span-2 md:mt-0 md:self-auto md:justify-self-end'
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
