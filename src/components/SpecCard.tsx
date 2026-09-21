import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpecRow {
  label: string;
  value: string;
}

interface SpecCardProps {
  /** Real values from src/content/products.ts. Empty until AKTCL supplies them. */
  rows: SpecRow[];
  /** Row labels to show, each as "On request", while `rows` is empty. */
  templateLabels?: string[];
  /** Product name: shown above the heading and pre-selected on the enquiry form. */
  product: string;
}

const ON_REQUEST = 'On request';

/**
 * The product data card: a labelled <dl>, always in the DOM (nothing to expand).
 *
 * The workbook holds no technical values yet, so with empty `rows` the same card
 * is drawn from `templateLabels` with every value reading "On request", plus a
 * route to ask for the data sheet. A figure that AKTCL has not supplied is never
 * shown here.
 */
const SpecCard = ({ rows, templateLabels = [], product }: SpecCardProps) => {
  const headingId = useId();
  const pending = rows.length === 0;
  const display: SpecRow[] = pending
    ? templateLabels.map((label) => ({ label, value: ON_REQUEST }))
    : rows;

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground"
    >
      <div className="grid md:grid-cols-12">
        <div
          className={cn(
            'p-6 md:p-8 lg:p-10',
            display.length > 0
              ? 'border-b border-border md:col-span-5 md:border-b-0 md:border-r lg:col-span-4'
              : 'md:col-span-12'
          )}
        >
          <p className="eyebrow mb-3">{product}</p>
          <h2 id={headingId} className="font-display text-2xl font-medium md:text-3xl">
            Specifications
          </h2>
          <div className="rule mt-5" aria-hidden="true" />
          {pending && (
            <>
              <p className="mt-6 max-w-md text-sm/relaxed text-muted-foreground md:text-base/relaxed">
                Full specifications, grades and packing details are shared against a trade enquiry.
              </p>
              {/* Outlined, so it stays secondary to the page's filled enquiry button. */}
              <Link
                to={`/contact?product=${encodeURIComponent(product)}`}
                data-lead="request-specs"
                className="group mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-accent px-6 py-2 font-sans text-[13px] font-semibold uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Request Specifications
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </>
          )}
        </div>

        {display.length > 0 && (
          <dl className="divide-y divide-border md:col-span-7 lg:col-span-8">
            {display.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-5 items-baseline gap-4 px-6 py-4 md:px-8 md:py-5 lg:px-10"
              >
                <dt className="col-span-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {row.label}
                </dt>
                <dd
                  className={cn(
                    'col-span-3 text-sm md:text-base',
                    row.value === ON_REQUEST ? 'text-muted-foreground' : 'font-medium'
                  )}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
};

export default SpecCard;
