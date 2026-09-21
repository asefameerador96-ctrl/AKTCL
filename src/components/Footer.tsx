import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { site } from '@/content/site';
import { journey, journeyIntro } from '@/content/journey';
import { categories } from '@/content/products';
import Logo from './Logo';
import Grain from './motion/Grain';

const COMPANY_LINKS = [
  { to: '/about-us', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy Notice' },
  { to: '/terms', label: 'Terms of Use' },
] as const;

/*
 * The footer is a plan drawing: horizontal hairlines run the full width of the window,
 * vertical ones divide the columns inside the container, and every cell carries its
 * own padding so the lines meet. The last vertical sits on the eighth column all the
 * way down — the same line the enquiry band above is split on — so the two closing
 * bands read as one sheet. It is bg-ink, so bare borders take the ink hairline and
 * focus rings the sage one by themselves (the ink context in index.css).
 */
const CONTAINER = 'mx-auto max-w-7xl px-4 sm:px-6';

// The drawn underline sits under the words (bg-origin-content), not at the foot of the
// 44px row the padding makes for thumbs. Tightened only where the layout is wide AND the
// pointer is fine: a tablet in landscape is lg too, and keeps its 44px rows.
const LINK =
  'link-underline inline-block bg-origin-content py-3 text-sm leading-5 text-ink-muted transition-[background-size,color] hover:text-ink-foreground focus-visible:text-ink-foreground lg:[@media(pointer:fine)]:py-1.5';
const MONO_LINK = 'font-mono text-[12px] font-medium uppercase tracking-[0.18em]';

const ColumnTitle = ({ children }: { children: ReactNode }) => <h3 className="eyebrow mb-4 lg:mb-6">{children}</h3>;
// A column heading that is itself a link: the label's own muted colour at rest, the same
// drawn underline, and a 44px target that the negative margin keeps out of the layout.
const TITLE_LINK =
  'link-underline -my-3 inline-block bg-origin-content py-3 transition-[background-size,color] hover:text-ink-foreground focus-visible:text-ink-foreground';

/** "linkedin.com" from a profile URL; the raw string if it is not a URL at all. */
const hostLabel = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/** Back to the top, through Lenis when it is running so it is not left easing to a stale target. */
const toTop = () => {
  if (window.__lenis) window.__lenis.scrollTo(0);
  // No explicit behaviour: the reduced-motion rule in index.css decides.
  else window.scrollTo({ top: 0 });
  // The keyboard goes with the page: focus lands on <main>, which is never ringed.
  document.getElementById('main')?.focus({ preventScroll: true });
};

const Footer = () => {
  const { email, phone, whatsapp, addressLines } = site.contact;

  return (
    // data-hide-float: FloatingEnquire steps aside here so it never sits on the legal text.
    <footer data-hide-float className="relative isolate overflow-hidden border-t border-ink-border bg-ink text-ink-foreground">
      <Grain className="-z-10" />
      <h2 className="sr-only">Site footer</h2>

      {/* Lockup (3) · journey (2) · products (3) | company over trade enquiries (4). */}
      <div className={cn(CONTAINER, 'grid grid-cols-2 lg:grid-cols-12')}>
        <div className="col-span-2 py-14 lg:col-span-3 lg:py-20 lg:pr-8">
          <Link to="/" aria-label={`${site.name} — home`} className="inline-block rounded-sm">
            <Logo variant="onDark" size="md" />
          </Link>
          <p className="display-sm mt-10 text-ink-foreground">{site.tagline}</p>
          <p className="eyebrow mt-4">Part of {site.parent}</p>
        </div>

        <nav aria-label={journeyIntro.heading} className="border-t py-10 pr-4 lg:col-span-2 lg:border-l lg:border-t-0 lg:px-8 lg:py-20">
          <ColumnTitle>
            <Link to="/journey" className={TITLE_LINK}>
              {journeyIntro.heading}
            </Link>
          </ColumnTitle>
          <ul>
            {journey.map((stage) => (
              <li key={stage.slug}>
                <Link to={`/journey/${stage.slug}`} className={LINK}>
                  {stage.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Products" className="border-l border-t py-10 pl-4 lg:col-span-3 lg:border-t-0 lg:px-8 lg:py-20">
          <ColumnTitle>
            <Link to="/products" className={TITLE_LINK}>
              Products
            </Link>
          </ColumnTitle>
          <ul>
            {categories.map((category) => {
              // Only products with a page of their own; the rest live on the category page.
              const pages = category.products.filter((p) => p.hasDetailPage);
              return (
                <li key={category.slug}>
                  <Link to={`/products/${category.slug}`} className={cn(LINK, 'text-ink-foreground')}>
                    {category.label}
                  </Link>
                  {pages.length > 0 && (
                    <ul className="mb-3 border-l pl-4">
                      {pages.map((product) => (
                        <li key={product.slug}>
                          <Link to={`/products/${category.slug}/${product.slug}`} className={LINK}>
                            {product.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="col-span-2 grid grid-cols-2 border-t lg:col-span-4 lg:grid-cols-1 lg:border-l lg:border-t-0">
          <nav aria-label="Company" className="py-10 pr-4 lg:pb-10 lg:pl-12 lg:pr-0 lg:pt-20">
            <ColumnTitle>Company</ColumnTitle>
            <ul>
              {COMPANY_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className={LINK}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-l py-10 pl-4 lg:border-l-0 lg:border-t lg:pb-20 lg:pl-12 lg:pt-10">
            <ColumnTitle>Trade Enquiries</ColumnTitle>
            {/* Every row below is hidden until site.contact supplies it; the form link always shows. */}
            {addressLines && (
              <address className="mb-3 text-sm not-italic leading-relaxed text-ink-muted">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            )}
            <ul>
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} data-lead="footer-phone" className={LINK}>
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
                    data-lead="footer-whatsapp"
                    className={LINK}
                  >
                    WhatsApp
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} data-lead="footer-email" className={cn(LINK, 'break-all')}>
                    {email}
                  </a>
                </li>
              )}
              <li>
                {/* The footer's one signal: the way into the form, in sage. */}
                <Link
                  to="/contact"
                  data-lead="footer-enquiry"
                  className={cn(LINK, MONO_LINK, 'text-sage hover:text-ink-foreground focus-visible:text-ink-foreground')}
                >
                  Send an Enquiry
                </Link>
              </li>
              {site.sameAs.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {hostLabel(url)}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Compliance strip — wording agreed for the B2B positioning; do not soften, shrink or fade. */}
      <div className="border-t">
        <div className={cn(CONTAINER, 'grid lg:grid-cols-12')}>
          <div className="py-10 lg:col-span-8 lg:py-14 lg:pr-12">
            <p className="eyebrow">Trade notice</p>
            <p className="mt-4 max-w-[64ch] text-sm leading-relaxed text-ink-foreground/80">{site.compliance.tradeNotice}</p>
          </div>
          <div className="flex items-center border-t py-10 lg:col-span-4 lg:border-l lg:border-t-0 lg:py-14 lg:pl-12">
            <p
              role="note"
              className="w-full border border-ink-foreground/70 px-5 py-4 font-sans text-sm font-semibold uppercase leading-snug tracking-[0.08em] text-ink-foreground"
            >
              {site.compliance.healthWarning}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className={cn(CONTAINER, 'flex items-center justify-between gap-6 py-5')}>
          <div className="flex flex-col gap-x-10 gap-y-1.5 font-mono text-[11px] uppercase leading-normal tracking-[0.18em] text-ink-muted sm:flex-row sm:items-center">
            <p>
              {/* The legal name ends in "Ltd." — drop its full stop so the sentence has just one. */}
              © {new Date().getFullYear()} {site.legalName.replace(/\.$/, '')}. All rights reserved.
            </p>
            <p>{site.country}</p>
          </div>
          <button type="button" onClick={toTop} aria-label="Back to top" className="btn btn-icon btn-outline-ink shrink-0">
            <ArrowUp aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
