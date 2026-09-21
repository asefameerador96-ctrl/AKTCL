import { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionMarker from '@/components/SectionMarker';
import { CtaButton } from '@/components/ui/button';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';

export interface SpecRow {
  label: string;
  value: string;
}

interface SpecCardProps {
  /** Real values from src/content/products.ts. Empty until AKTCL supplies them. */
  rows: SpecRow[];
  /** Row labels to show, each as "On request", while `rows` is empty. */
  templateLabels?: string[];
  /** Product name: shown opposite the marker and pre-selected on the enquiry form. */
  product: string;
  /** The sheet's place among the page's numbered sections, as printed. */
  number?: string;
}

const ON_REQUEST = 'On request';
/** Seconds between one hairline starting to draw and the next. */
const LINE_STAGGER = 0.06;

/**
 * The product data sheet — ruled rows, not a card: a rule in the text colour opens it,
 * then one hairline per row with the label in the mono small caps on the left and the
 * value on the right. A real value is set in the display serif; a value AKTCL has not
 * supplied reads "On request" in the quiet mono, so the two can never be mistaken for
 * each other. Always in the DOM (nothing to expand); only the hairlines move, drawing
 * in one after another the first time the sheet is seen.
 *
 * The workbook holds no technical values yet, so with empty `rows` the same sheet is
 * drawn from `templateLabels`, plus a route to ask for the data sheet. A figure that
 * AKTCL has not supplied is never shown here.
 */
const SpecCard = ({ rows, templateLabels = [], product, number = '01' }: SpecCardProps) => {
  const headingId = useId();
  const [still] = useState(isStill);
  const sheetRef = useRef<HTMLDivElement>(null);
  const shown = useReveal(useInView(sheetRef, { skip: still }));

  const pending = rows.length === 0;
  const display: SpecRow[] = pending
    ? templateLabels.map((label) => ({ label, value: ON_REQUEST }))
    : rows;

  const hairline = (i: number, edge: 'top' | 'bottom' = 'top') => (
    <span
      aria-hidden="true"
      className={`absolute inset-x-0 h-px origin-left bg-border ${edge === 'top' ? 'top-0' : 'bottom-0'}`}
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
    <section aria-labelledby={headingId} className="border-t border-foreground pt-5 text-foreground">
      <div className="flex items-baseline justify-between gap-6">
        <SectionMarker number={number}>Data Sheet</SectionMarker>
        {/* A phone has room for the marker only; the <h1> above names the product. */}
        <p className="index-num hidden text-right uppercase leading-normal sm:block">{product}</p>
      </div>
      <h2 id={headingId} className="display-sm mt-8 md:mt-10">
        Specifications
      </h2>

      <div ref={sheetRef} className="mt-8 md:mt-10">
        {display.length > 0 && (
          <dl>
            {display.map((row, i) => (
              <div
                key={row.label}
                className="relative grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-6 py-4"
              >
                {hairline(i)}
                {i === display.length - 1 && hairline(i + 1, 'bottom')}
                <dt className="eyebrow">{row.label}</dt>
                {row.value === ON_REQUEST ? (
                  <dd className="eyebrow text-right">{row.value}</dd>
                ) : (
                  <dd className="text-right font-display text-[length:clamp(1.25rem,1.1rem_+_0.5vw,1.5rem)] leading-snug tracking-[-0.01em]">
                    {row.value}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        )}

        {pending && (
          <>
            <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
              Full specifications, grades and packing details are shared against a trade enquiry.
            </p>
            {/* The primary button, full measure, with its arrow in a ruled-off cell: it
                closes the sheet like a last row. */}
            <CtaButton asChild className="mt-8 w-full sm:w-auto">
              <Link
                to={`/contact?product=${encodeURIComponent(product)}`}
                data-lead="request-specs"
                data-cursor="enquire"
              >
                Request Specifications
              </Link>
            </CtaButton>
          </>
        )}
      </div>
    </section>
  );
};

export default SpecCard;
