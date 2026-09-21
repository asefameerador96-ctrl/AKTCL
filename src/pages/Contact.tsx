import { useId } from 'react';
import type { ReactNode } from 'react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import EnquiryForm from '@/components/EnquiryForm';
import Reveal from '@/components/Reveal';
import SplitReveal from '@/components/motion/SplitReveal';
import { site } from '@/content/site';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';

const route = ROUTE_BY_PATH['/contact'];

/** What lets the export desk answer with a quotation instead of a question. */
const INCLUDE = [
  { term: 'Product', detail: 'The leaf type, processed tobacco or cigarette format you require.' },
  { term: 'Volume', detail: 'Estimated quantity per shipment, per month or per year.' },
  { term: 'Destination', detail: 'Country of import and, if known, the port of discharge.' },
  { term: 'Packing', detail: 'Packing, labelling or specification requirements for your market.' },
];

const SMALL_CAPS = 'font-sans text-xs font-semibold uppercase tracking-[0.24em]';
// bg-origin-content: the drawn underline sits under the words, not under the 44px row.
const CONTACT_LINK =
  'link-underline inline-flex min-h-11 items-center gap-3 rounded-sm bg-origin-content py-2.5 text-base text-foreground transition-colors duration-300 ease-quart-out hover:text-accent';

/** One ruled block of the side panel: small-caps heading over a hairline. */
const PanelSection = ({ title, delay, children }: { title: string; delay: number; children: ReactNode }) => (
  <Reveal as="section" delay={delay}>
    <h2 className={`${SMALL_CAPS} border-b border-foreground pb-4 text-foreground`}>{title}</h2>
    {children}
  </Reveal>
);

const Contact = () => {
  const formTitleId = useId();
  const { email, phone, whatsapp, addressLines } = site.contact;
  // Direct lines appear only once site.contact supplies them; until then the form
  // is the single route in, and no placeholder details are shown.
  const hasDirectContact = Boolean(email || phone || whatsapp || addressLines?.length);

  return (
    // The page is the enquiry form, so the closing "request a quote" band is dropped.
    <PageLayout showEnquiryCta={false}>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 md:pb-36 md:pt-14">
        <Breadcrumbs items={route.breadcrumbs} />

        {/*
          Source order is masthead, form, guidance — what a phone shows, form before
          the fine print. From lg the masthead and guidance share the left column and
          the form runs the full height of the right one, level with the headline.
        */}
        <div className="mt-8 grid gap-x-10 gap-y-16 md:mt-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-y-20">
          <header className="lg:col-span-5">
            <Reveal trigger="enter" from="none">
              <p className="eyebrow">Contact</p>
            </Reveal>
            <SplitReveal
              as="h1"
              trigger="enter"
              delay={0.1}
              text="Trade Enquiries"
              className="mt-6 font-display text-[length:clamp(3rem,7vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.03em] text-foreground"
            />
            <Reveal trigger="enter" delay={0.35}>
              <div className="rule mt-10" aria-hidden="true" />
              <p className="mt-8 max-w-md text-lg/relaxed text-muted-foreground">
                For importers, distributors and manufacturers. Tell us the product, volume and destination you have in
                mind and {site.shortName} will respond to your enquiry.
              </p>
            </Reveal>
          </header>

          <section
            aria-labelledby={formTitleId}
            className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1"
          >
            <Reveal trigger="enter" delay={0.45}>
              <div className="flex items-baseline justify-between gap-6 border-t border-foreground pt-5">
                <p className="eyebrow">Enquire</p>
                <p className={`${SMALL_CAPS} text-muted-foreground`}>Business enquiries only</p>
              </div>
              <h2 id={formTitleId} className="mt-10 text-3xl font-medium tracking-[-0.02em] md:text-4xl">
                Send an enquiry
              </h2>
              <EnquiryForm className="mt-12" />
            </Reveal>
          </section>

          <aside aria-label="Enquiry guidance" className="space-y-14 lg:col-span-4 lg:row-start-2">
            <PanelSection title="What to include" delay={0.05}>
              <dl className="divide-y divide-border border-b border-border">
                {INCLUDE.map((item, index) => (
                  <div key={item.term} className="grid grid-cols-[2.25rem_1fr] gap-x-3 gap-y-1.5 py-5">
                    <span aria-hidden="true" className="row-span-2 font-display text-base italic text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <dt className={`${SMALL_CAPS} pt-1 text-foreground`}>{item.term}</dt>
                    <dd className="text-sm leading-relaxed text-muted-foreground">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </PanelSection>

            {hasDirectContact && (
              <PanelSection title="Direct contact" delay={0.1}>
                <ul className="divide-y divide-border border-b border-border">
                  {email && (
                    <li className="py-1.5">
                      <a href={`mailto:${email}`} data-lead="contact-email" className={`${CONTACT_LINK} break-all`}>
                        <Mail aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 shrink-0 text-accent" />
                        {email}
                      </a>
                    </li>
                  )}
                  {phone && (
                    <li className="py-1.5">
                      <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} data-lead="contact-phone" className={CONTACT_LINK}>
                        <Phone aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 shrink-0 text-accent" />
                        {phone}
                      </a>
                    </li>
                  )}
                  {whatsapp && (
                    <li className="py-1.5">
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-lead="contact-whatsapp"
                        className={CONTACT_LINK}
                      >
                        <MessageCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 shrink-0 text-accent" />
                        WhatsApp
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  )}
                </ul>
                {addressLines && addressLines.length > 0 && (
                  <address className="mt-5 flex gap-3 text-sm not-italic leading-relaxed text-muted-foreground">
                    <MapPin aria-hidden="true" strokeWidth={1.5} className="mt-1 h-4 w-4 shrink-0 text-accent" />
                    <span>
                      {addressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </address>
                )}
              </PanelSection>
            )}

            <PanelSection title="Trade only" delay={0.15}>
              <p className="pt-5 text-sm leading-relaxed text-muted-foreground">
                This website is intended for tobacco trade professionals of legal age ({site.legalAge}+).{' '}
                {site.shortName} does not sell tobacco products to consumers through this website, and this form is for
                business enquiries only.
              </p>
            </PanelSection>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;
