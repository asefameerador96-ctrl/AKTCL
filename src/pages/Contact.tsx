import { useId } from 'react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import EnquiryForm from '@/components/EnquiryForm';
import Reveal from '@/components/Reveal';
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

const CONTACT_LINK =
  'inline-flex min-h-11 items-center gap-3 rounded-sm text-base text-foreground underline-offset-4 transition-colors hover:text-accent hover:underline';

const Contact = () => {
  const formTitleId = useId();
  const { email, phone, whatsapp, addressLines } = site.contact;
  // Direct lines appear only once site.contact supplies them; until then the form
  // is the single route in, and no placeholder details are shown.
  const hasDirectContact = Boolean(email || phone || whatsapp || addressLines?.length);

  return (
    // The page is the enquiry form, so the closing "request a quote" band is dropped.
    <PageLayout showEnquiryCta={false}>
      <PageHeader
        breadcrumbs={route.breadcrumbs}
        eyebrow="Contact"
        title="Trade Enquiries"
        lead={`For importers, distributors and manufacturers. Tell us the product, volume and destination you have in mind and ${site.shortName} will respond to your enquiry.`}
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-24 sm:px-6 md:pb-32 lg:grid-cols-12 lg:gap-16">
        <section
          aria-labelledby={formTitleId}
          className="rounded-lg border border-border bg-card p-6 text-card-foreground sm:p-8 md:p-12 lg:col-span-7 xl:col-span-8"
        >
          <p className="eyebrow">Enquire</p>
          <h2 id={formTitleId} className="mt-4 text-3xl font-medium md:text-4xl">
            Send an enquiry
          </h2>
          <div className="rule mb-10 mt-6" aria-hidden="true" />
          <EnquiryForm />
        </section>

        <aside aria-label="Enquiry guidance" className="space-y-12 lg:col-span-5 lg:pt-12 xl:col-span-4">
          <Reveal as="section" delay={0.1}>
            <h2 className="text-2xl font-medium">What to include</h2>
            <div className="rule mt-5" aria-hidden="true" />
            <dl className="mt-6 divide-y divide-border border-y border-border">
              {INCLUDE.map((item) => (
                <div key={item.term} className="grid grid-cols-3 gap-4 py-4">
                  <dt className="pt-0.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {item.term}
                  </dt>
                  <dd className="col-span-2 text-sm leading-relaxed text-foreground">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {hasDirectContact && (
            <Reveal as="section" delay={0.15}>
              <h2 className="text-2xl font-medium">Direct contact</h2>
              <div className="rule mt-5" aria-hidden="true" />
              <ul className="mt-4">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} data-lead="contact-email" className={`${CONTACT_LINK} break-all`}>
                      <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                      {email}
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} data-lead="contact-phone" className={CONTACT_LINK}>
                      <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
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
                      data-lead="contact-whatsapp"
                      className={CONTACT_LINK}
                    >
                      <MessageCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                      WhatsApp
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                )}
              </ul>
              {addressLines && addressLines.length > 0 && (
                <address className="mt-4 flex gap-3 text-sm not-italic leading-relaxed text-muted-foreground">
                  <MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    {addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </address>
              )}
            </Reveal>
          )}

          <Reveal as="section" delay={0.2} className="rounded-lg bg-secondary p-6 text-secondary-foreground md:p-8">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-accent">Trade only</h2>
            <p className="mt-4 text-sm leading-relaxed">
              This website is intended for tobacco trade professionals of legal age ({site.legalAge}+).{' '}
              {site.shortName} does not sell tobacco products to consumers through this website, and this form is for
              business enquiries only.
            </p>
          </Reveal>
        </aside>
      </div>
    </PageLayout>
  );
};

export default Contact;
