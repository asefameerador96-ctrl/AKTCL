import { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowTravel, LABEL } from '@/components/PageHeader';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';
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
/** Seconds between one hairline starting to draw and the next. */
const LINE_STAGGER = 0.07;

/**
 * The product data card, set like a printed specification sheet: a heavy rule, then
 * ruled rows with the label in small caps on the left and the value in the display
 * serif on the right. Always in the DOM (nothing to expand); only the hairlines
 * move, drawing in one after another the first time the sheet is seen.
 *
 * The workbook holds no technical values yet, so with empty `rows` the same sheet
 * is drawn from `templateLabels` with every value reading "On request" in a quiet
 * italic, plus a route to ask for the data sheet. A figure that AKTCL has not
 * supplied is never shown here.
 */
const SpecCard = ({ rows, templateLabels = [], product }: SpecCardProps) => {
  const headingId = useId();
  const [still] = useState(isStill);
  const sheetRef = useRef<HTMLDivElement>(null);
  const shown = useReveal(useInView(sheetRef, { skip: still }));

  const pending = rows.length === 0;
  const display: SpecRow[] = pending
    ? templateLabels.map((label) => ({ label, value: ON_REQUEST }))
    : rows;

  const hairline = (i: number) => (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-px origin-left bg-border"
      style={
        still
          ? undefined
          : {
              transform: shown ? 'none' : 'scaleX(0)',
              transition: `transform 1.1s ${EASE.expoOut} ${(i * LINE_STAGGER).toFixed(2)}s`,
            }
      }
    />
  );

  return (
    <section aria-labelledby={headingId} className="border-t-2 border-foreground pt-6 text-foreground md:pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h2
          id={headingId}
          className="font-display text-3xl font-normal leading-none tracking-[-0.02em] md:text-4xl"
        >
          Specifications
        </h2>
        <p className={LABEL}>{product}</p>
      </div>

      <div ref={sheetRef} className="mt-8 md:mt-10">
        {display.length > 0 && (
          <dl>
            {display.map((row, i) => (
              <div
                key={row.label}
                className="relative grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-6 py-4 md:py-5"
              >
                {hairline(i)}
                <dt className={LABEL}>{row.label}</dt>
                <dd
                  className={cn(
                    'text-right font-display leading-snug',
                    row.value === ON_REQUEST
                      ? 'text-lg italic text-muted-foreground'
                      : 'text-xl tracking-[-0.01em] md:text-2xl'
                  )}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {pending && (
          <>
            <p className="relative max-w-[52ch] pt-6 text-sm/relaxed text-muted-foreground md:text-base/relaxed">
              {hairline(display.length)}
              Full specifications, grades and packing details are shared against a trade enquiry.
            </p>
            {/* A ruled band, not a second pill: as large as the page's "Enquire Now",
                but a different object, so the two never compete. */}
            <Link
              to={`/contact?product=${encodeURIComponent(product)}`}
              data-lead="request-specs"
              data-cursor="enquire"
              className={cn(
                'group relative isolate mt-8 flex min-h-16 items-center justify-between gap-6 overflow-hidden border-y border-foreground py-4',
                'transition-colors duration-500 ease-expo-out hover:text-background focus-visible:text-background',
                'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-foreground',
                'before:transition-transform before:duration-500 before:ease-expo-out hover:before:scale-y-100 focus-visible:before:scale-y-100'
              )}
            >
              {/* The words and the arrow step in from the edges as the fill rises under them. */}
              <span className="font-display text-2xl font-normal leading-tight tracking-[-0.02em] transition-transform duration-500 ease-expo-out group-hover:translate-x-5 group-focus-visible:translate-x-5 md:text-3xl">
                Request Specifications
              </span>
              <span className="flex shrink-0 transition-transform duration-500 ease-expo-out group-hover:-translate-x-5 group-focus-visible:-translate-x-5">
                <ArrowTravel className="h-5 w-5 md:h-6 md:w-6" />
              </span>
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default SpecCard;
