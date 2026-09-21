import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MessageCircle, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { site } from '@/content/site';
import Reveal from './Reveal';

export interface EnquiryCtaProps {
  /** Product or category name; links to /contact?product=<name> so the form is pre-filled. */
  product?: string;
  className?: string;
}

// Always-dark band, so it carries the bright focus ring in both themes.
const FOCUS = 'focus-visible:ring-gold focus-visible:ring-offset-ink';
const CONTACT_LINK = cn(
  'inline-flex min-h-11 items-center gap-2.5 rounded-sm text-sm text-ink-muted transition-colors hover:text-gold',
  FOCUS
);

/** The closing band on every page: one clear route into the enquiry form. */
const EnquiryCta = ({ product, className }: EnquiryCtaProps) => {
  const titleId = useId();
  const { email, phone, whatsapp } = site.contact;
  const to = product ? `/contact?product=${encodeURIComponent(product)}` : '/contact';

  return (
    // data-hide-float: the floating enquiry button steps aside while this band is on screen.
    <section
      aria-labelledby={titleId}
      data-hide-float
      className={cn('border-t border-gold/30 bg-ink text-ink-foreground', className)}
    >
      <Reveal className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-16">
        <div>
          {/* .eyebrow is dark gold for ivory pages; on ink it needs the bright gold. */}
          <p className="eyebrow text-gold">Trade Enquiries</p>
          <h2 id={titleId} className="mt-5 text-4xl font-medium leading-tight md:text-5xl lg:text-6xl">
            Partner with {site.shortName}
          </h2>
          <div aria-hidden="true" className="rule mt-8" />
          <p className="mt-8 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
            Importers, distributors and manufacturers are invited to share the product, volume and
            destination they have in mind so that we can prepare a quotation.
          </p>
        </div>

        <div className="flex flex-col items-start gap-6 lg:items-end">
          <Link
            to={to}
            data-lead="cta-request-quote"
            className={cn(
              'group inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-gold px-8 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-gold/90',
              FOCUS
            )}
          >
            Request a Quote
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {product && (
            <p className="text-sm text-ink-muted lg:text-right">
              Your enquiry will reference <span className="text-ink-foreground">{product}</span>.
            </p>
          )}

          {/* Direct lines appear only once site.contact supplies them. */}
          {(phone || whatsapp || email) && (
            <ul className="flex flex-col gap-x-8 sm:flex-row sm:flex-wrap lg:justify-end">
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} data-lead="cta-phone" className={CONTACT_LINK}>
                    <Phone aria-hidden="true" className="h-4 w-4" />
                    {phone}
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
                    className={CONTACT_LINK}
                  >
                    <MessageCircle aria-hidden="true" className="h-4 w-4" />
                    WhatsApp
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} data-lead="cta-email" className={cn(CONTACT_LINK, 'break-all')}>
                    <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {email}
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </Reveal>
    </section>
  );
};

export default EnquiryCta;
