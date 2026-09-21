import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
   * single-column list: from lg up the entry runs across the page — name left, line
   * and specifications in the middle, link right — and stacks below that.
   */
  layout?: 'stack' | 'row';
}

/**
 * Ruled entry for a cigarette format or service: a hairline, the name, one line,
 * then whatever specifications AKTCL has supplied. No box — the rule carries it, and
 * a gold one sweeps across on hover or keyboard focus.
 */
const FormatCard = ({ name, short, rows = [], to, number, layout = 'stack' }: FormatCardProps) => {
  const isEnquiry = to?.startsWith('/contact') ?? false;
  const row = layout === 'row';

  return (
    <article
      data-cursor={to ? (isEnquiry ? 'enquire' : 'open') : undefined}
      className={cn(
        'group relative flex h-full flex-col border-t border-border py-6 md:py-7',
        row && 'lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-x-8 lg:py-9'
      )}
    >
      {to && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-gold transition-transform duration-700 ease-expo-out group-focus-within:scale-x-100 group-hover:scale-x-100"
        />
      )}

      {number !== undefined && (
        <p
          aria-hidden="true"
          className={cn(
            'mb-3 text-[11px] font-medium uppercase tabular-nums tracking-[0.2em] text-accent',
            row && 'lg:col-span-1 lg:mb-0'
          )}
        >
          {String(number).padStart(2, '0')}
        </p>
      )}

      <h3
        className={cn(
          'text-xl font-medium leading-snug tracking-[-0.01em] text-foreground md:text-2xl',
          to && 'transition-transform duration-700 ease-expo-out motion-safe:group-hover:translate-x-2',
          row && (number !== undefined ? 'lg:col-span-4' : 'lg:col-span-5'),
          row && 'lg:text-3xl lg:font-normal lg:tracking-[-0.02em]'
        )}
      >
        {name}
      </h3>

      <div className={cn('mt-2 flex flex-1 flex-col', row && 'lg:col-span-5 lg:mt-0')}>
        <p className="text-sm leading-relaxed text-muted-foreground">{short}</p>

        {/* Pinned to the bottom so spec rows and links line up across a row of entries */}
        <div className={cn('mt-auto pt-5', row && 'lg:pt-4')}>
          {rows.length > 0 ? (
            <dl className="divide-y divide-border border-t border-border">
              {rows.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="text-right text-sm font-medium text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-xs text-muted-foreground">Specifications on request</p>
          )}
        </div>
      </div>

      {to && (
        // The ::after stretches the link over the entry without making its name the whole entry.
        <Link
          to={to}
          data-lead={isEnquiry ? 'format-card-enquiry' : undefined}
          className={cn(
            'mt-2 inline-flex min-h-11 items-center gap-2 self-start text-[11px] font-semibold uppercase tracking-[0.2em] text-accent after:absolute after:inset-0',
            row && 'lg:col-span-2 lg:mt-0 lg:self-auto lg:justify-self-end'
          )}
        >
          {isEnquiry ? 'Enquire' : 'Know More'}
          <span className="sr-only">{isEnquiry ? ` about ${name}` : `: ${name}`}</span>
          <ArrowRight
            aria-hidden="true"
            className="h-3.5 w-3.5 transition-transform duration-500 ease-expo-out group-hover:translate-x-1"
          />
        </Link>
      )}
    </article>
  );
};

export default FormatCard;
