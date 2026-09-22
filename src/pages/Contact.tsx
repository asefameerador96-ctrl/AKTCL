import { useId } from 'react';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import EnquiryForm from '@/components/EnquiryForm';
import Reveal from '@/components/Reveal';
import DrawnRule from '@/components/motion/DrawnRule';
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

// A direct line as a directory row: mono label, the detail, an arrow that darkens as
// the detail shifts 8px. The whole row is the link (and well over 44px tall).
const CONTACT_ROW = 'group flex min-h-14 items-center gap-4 py-3 text-secondary text-foreground';
// Wide enough for "Telephone" at the label's 13px and tracking.
const CONTACT_LABEL = 'mono-label w-28 shrink-0 text-muted-foreground';
const CONTACT_VALUE = 'min-w-0 flex-1 transition-transform group-hover:translate-x-2 group-focus-visible:translate-x-2';
const CONTACT_ARROW =
  'h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent group-focus-visible:text-accent';

/** One block of the side panel: a mono heading, then ruled rows or a note beneath it. */
const PanelSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section>
    <h2 className="mono-label pb-4 text-foreground">{title}</h2>
    {children}
  </section>
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
      {/*
        Drawn like a plan: the masthead — headline, and the lead straight under it — then
        one horizontal rule edge to edge, and under it one vertical hairline at the
        eighth column running to the foot of the page. The form takes the wide side (8),
        the guidance the narrow one (4). On a phone the same source order reads
        masthead, form, fine print.
      */}
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 md:pt-5">
        <Reveal trigger="enter" from="none">
          <Breadcrumbs items={route.breadcrumbs} />
        </Reveal>

        <header className="mt-8 pb-10 md:mt-12 md:pb-14">
          <Reveal as="p" trigger="enter" from="none" delay={0.05} className="eyebrow">
            Contact
          </Reveal>
          <SplitReveal
            as="h1"
            trigger="enter"
            delay={0.12}
            text="Trade Enquiries"
            italicWords={['enquiries']}
            className="display-xl mt-5 text-foreground md:mt-6"
          />
          <Reveal as="p" trigger="enter" delay={0.3} className="lead mt-6 md:mt-8">
            For importers, distributors and manufacturers. Tell us the product, volume and destination you have in
            mind and {site.shortName} will respond to your enquiry.
          </Reveal>
        </header>
      </div>

      {/* Outside the container: the rule runs the full width of the window. */}
      <DrawnRule trigger="enter" delay={0.35} />

      <div className="mx-auto grid max-w-7xl px-4 sm:px-6 lg:grid-cols-12">
        <section aria-labelledby={formTitleId} className="py-12 md:py-16 lg:col-span-8 lg:pb-24 lg:pr-12">
          <Reveal trigger="enter" delay={0.4}>
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
              <h2 id={formTitleId} className="display-md text-foreground">
                Send an enquiry
              </h2>
              <p className="eyebrow md:pb-2">Business enquiries only</p>
            </div>
            <EnquiryForm className="mt-10 md:mt-12" />
          </Reveal>
        </section>

        <aside
          aria-label="Enquiry guidance"
          className="border-t border-border py-12 md:py-16 lg:col-span-4 lg:border-l lg:border-t-0 lg:pb-24 lg:pl-12"
        >
          {/* The guidance stays beside the form while it is being filled in — only on a
              screen tall enough to hold all of it; top-28 clears the navbar. */}
          <Reveal
            trigger="enter"
            delay={0.45}
            className="space-y-12 lg:top-28 lg:[@media(min-height:880px)]:sticky"
          >
            <PanelSection title="What to include">
              {/* Term over its detail, no index: the four are a checklist, not a sequence. */}
              <dl className="hairline-rows">
                {INCLUDE.map((item) => (
                  <div key={item.term} className="space-y-1.5 py-5">
                    <dt className="mono-label text-foreground">{item.term}</dt>
                    <dd className="text-secondary text-muted-foreground">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </PanelSection>

            {hasDirectContact && (
              <PanelSection title="Direct contact">
                <ul className="hairline-rows">
                  {email && (
                    <li>
                      <a href={`mailto:${email}`} data-lead="contact-email" className={CONTACT_ROW}>
                        <span className={CONTACT_LABEL}>Email</span>
                        <span className={`${CONTACT_VALUE} break-all`}>{email}</span>
                        <ArrowUpRight aria-hidden="true" className={CONTACT_ARROW} />
                      </a>
                    </li>
                  )}
                  {phone && (
                    <li>
                      <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} data-lead="contact-phone" className={CONTACT_ROW}>
                        <span className={CONTACT_LABEL}>Telephone</span>
                        <span className={CONTACT_VALUE}>{phone}</span>
                        <ArrowUpRight aria-hidden="true" className={CONTACT_ARROW} />
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
                        className={CONTACT_ROW}
                      >
                        <span className={CONTACT_LABEL}>WhatsApp</span>
                        <span className={CONTACT_VALUE}>
                          Open a chat
                          <span className="sr-only"> (opens in a new tab)</span>
                        </span>
                        <ArrowUpRight aria-hidden="true" className={CONTACT_ARROW} />
                      </a>
                    </li>
                  )}
                  {addressLines && addressLines.length > 0 && (
                    <li className="flex gap-4 py-5 text-secondary">
                      <span className={CONTACT_LABEL}>Address</span>
                      <address className="not-italic leading-relaxed text-muted-foreground">
                        {addressLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                    </li>
                  )}
                </ul>
              </PanelSection>
            )}

            <PanelSection title="Trade only">
              <p className="border-t border-border pt-5 text-secondary text-muted-foreground">
                This website is intended for tobacco trade professionals of legal age ({site.legalAge}+).{' '}
                {site.shortName} does not sell tobacco products to consumers through this website, and this form is for
                business enquiries only.
              </p>
            </PanelSection>
          </Reveal>
        </aside>
      </div>
    </PageLayout>
  );
};

export default Contact;
