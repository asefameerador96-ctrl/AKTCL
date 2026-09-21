import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { site } from '@/content/site';
import Reveal from './Reveal';
import Grain from './motion/Grain';
import Magnetic from './motion/Magnetic';
import SplitReveal from './motion/SplitReveal';

export interface EnquiryCtaProps {
  /** Product or category name; links to /contact?product=<name> so the form is pre-filled. */
  product?: string;
  className?: string;
}

// A direct line as a directory row: mono label left, the detail right. On hover the
// label shifts 8px and the detail takes the sage signal — nothing scales, nothing glows.
// The band is bg-ink, so hairlines, labels and focus rings take the ink palette by themselves.
const ROW = 'group flex min-h-12 items-center justify-between gap-6 py-3';
const ROW_LABEL = 'eyebrow shrink-0 transition-transform group-hover:translate-x-2 group-focus-visible:translate-x-2';
const ROW_VALUE =
  'min-w-0 text-right font-mono text-[12px] tracking-[0.06em] text-ink-foreground transition-colors group-hover:text-sage group-focus-visible:text-sage';

// The arrow leaves right as its twin arrives from the left (transform only) — the
// same ruled-off arrow cell as the enquiry form's submit (ui/button CtaButton), written
// out here so the homepage bundle does not take on the button module for one link.
const ARROW = 'h-4 w-4 transition-transform duration-300 ease-expo-out';

/**
 * The closing band on every page: one clear route into the enquiry form.
 *
 * Ink with paper grain, drawn like a title block: a mono header row ruled off edge to
 * edge, then an 8 / 4 split on one vertical hairline — the monumental line on the
 * wide side, the supporting copy and the single solid button on the narrow one.
 */
const EnquiryCta = ({ product, className }: EnquiryCtaProps) => {
  const titleId = useId();
  const { email, phone, whatsapp } = site.contact;
  const to = product ? `/contact?product=${encodeURIComponent(product)}` : '/contact';

  return (
    // data-hide-float: the floating enquiry button steps aside while this band is on screen.
    <section
      aria-labelledby={titleId}
      data-hide-float
      className={cn('relative isolate overflow-hidden border-t border-ink-border bg-ink text-ink-foreground', className)}
    >
      <Grain className="-z-10" />

      <div className="border-b border-ink-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-6">
          <p className="eyebrow flex items-center gap-3">
            {/* The band's one signal: a 6px sage tick. */}
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-sage" />
            Trade Enquiries
          </p>
          <p className="eyebrow hidden sm:block">Business enquiries only</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl px-4 sm:px-6 lg:grid-cols-12">
        {/* Anchored to the foot of its cell, level with the button: a title block reads from the bottom line up. */}
        <div className="flex items-end py-20 md:py-28 lg:col-span-8 lg:py-36 lg:pr-12">
          <SplitReveal
            as="h2"
            id={titleId}
            text={`Partner with ${site.shortName}`}
            italicWords={['with']}
            className="display-xl"
          />
        </div>

        {/* The hairline belongs to the cell, not to the Reveal inside it: a rule must not slide. */}
        <div className="flex border-t border-ink-border py-12 md:py-16 lg:col-span-4 lg:border-l lg:border-t-0 lg:py-36 lg:pl-12">
          <Reveal delay={0.15} className="flex w-full flex-col justify-between gap-12">
            <p className="max-w-[42ch] text-sm leading-relaxed text-ink-muted md:text-base">
              Importers, distributors and manufacturers are invited to share the product, volume and
              destination they have in mind so that we can prepare a quotation.
            </p>

            <div>
              <Magnetic>
                <Link
                  to={to}
                  data-lead="cta-request-quote"
                  data-cursor="enquire"
                  className="btn btn-lg btn-ink group/cta w-full justify-between gap-0 pl-8 pr-0 sm:w-auto md:min-h-14 lg:w-full"
                >
                  Request a Quote
                  <span aria-hidden="true" className="ml-8 w-px shrink-0 self-stretch bg-current opacity-20" />
                  <span
                    aria-hidden="true"
                    className="relative flex w-12 shrink-0 items-center justify-center self-stretch overflow-hidden md:w-14"
                  >
                    <ArrowRight
                      className={cn(ARROW, 'group-hover/cta:translate-x-[260%] group-focus-visible/cta:translate-x-[260%]')}
                    />
                    <ArrowRight
                      className={cn(
                        ARROW,
                        'absolute -translate-x-[260%] group-hover/cta:translate-x-0 group-focus-visible/cta:translate-x-0'
                      )}
                    />
                  </span>
                </Link>
              </Magnetic>

              {product && (
                <p className="mt-5 text-sm text-ink-muted">
                  Your enquiry will reference <span className="text-ink-foreground">{product}</span>.
                </p>
              )}

              {/* Direct lines appear only once site.contact supplies them. */}
              {(phone || whatsapp || email) && (
                <ul className="hairline-rows mt-10">
                  {phone && (
                    <li>
                      <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} data-lead="cta-phone" className={ROW}>
                        <span className={ROW_LABEL}>Telephone</span>
                        <span className={ROW_VALUE}>{phone}</span>
                      </a>
                    </li>
                  )}
                  {whatsapp && (
                    <li>
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-lead="cta-whatsapp"
                        className={ROW}
                      >
                        <span className={ROW_LABEL}>WhatsApp</span>
                        <span className={ROW_VALUE}>
                          Open a chat
                          <span className="sr-only"> (opens in a new tab)</span>
                        </span>
                      </a>
                    </li>
                  )}
                  {email && (
                    <li>
                      <a href={`mailto:${email}`} data-lead="cta-email" className={ROW}>
                        <span className={ROW_LABEL}>Email</span>
                        <span className={cn(ROW_VALUE, 'break-all')}>{email}</span>
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default EnquiryCta;
