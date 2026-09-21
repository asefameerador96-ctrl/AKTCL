import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormatCardProps {
  name: string;
  short: string;
  /** Labelled spec rows. Pass real values only — with none, the card says so. */
  rows?: { label: string; value: string }[];
  /** Optional link; a /contact target is treated (and tracked) as an enquiry. */
  to?: string;
}

/**
 * Spec-led card for a cigarette format or service: name, one line, then a
 * definition list of whatever specifications AKTCL has supplied.
 */
const FormatCard = ({ name, short, rows = [], to }: FormatCardProps) => {
  const isEnquiry = to?.startsWith('/contact') ?? false;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-lg border border-border bg-card p-6 md:p-7',
        to && 'transition-colors duration-500 hover:border-accent/40'
      )}
    >
      <span
        aria-hidden="true"
        className={cn('rule block transition-[width] duration-500 ease-out', to && 'group-hover:w-24')}
      />
      <h3 className="mt-5 font-display text-xl font-medium leading-snug text-foreground md:text-2xl">
        {name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{short}</p>

      {/* Pinned to the bottom so spec rows and links line up across a row of cards */}
      <div className="mt-auto pt-5">
        {rows.length > 0 ? (
          <dl className="divide-y divide-border border-t border-border">
            {rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="text-right text-sm font-medium text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="border-t border-border pt-4 text-xs text-muted-foreground">
            Specifications on request
          </p>
        )}

        {to && (
          // The ::after stretches the link over the card without making its name the whole card.
          <Link
            to={to}
            data-lead={isEnquiry ? 'format-card-enquiry' : undefined}
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-accent after:absolute after:inset-0 after:rounded-lg"
          >
            {isEnquiry ? 'Enquire' : 'Know More'}
            <span className="sr-only">{isEnquiry ? ` about ${name}` : `: ${name}`}</span>
            <ArrowRight
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        )}
      </div>
    </article>
  );
};

export default FormatCard;
