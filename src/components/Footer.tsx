import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { site } from '@/content/site';
import { journey, journeyIntro } from '@/content/journey';
import { categories } from '@/content/products';
import Logo from './Logo';

const COMPANY_LINKS = [
  { to: '/about-us', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy Notice' },
  { to: '/terms', label: 'Terms of Use' },
] as const;

// The footer is always dark, so it carries the bright focus ring in both themes.
const FOCUS = 'rounded-sm focus-visible:ring-gold focus-visible:ring-offset-ink';
// Full 44px rows for thumbs; tightened once there is a pointer-sized layout.
const LINK = cn(
  'inline-flex min-h-11 items-center text-sm text-ink-muted transition-colors hover:text-gold lg:min-h-0 lg:py-1.5',
  FOCUS
);

const ColumnTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.24em] text-ink-foreground lg:mb-4">
    {children}
  </h3>
);

/** "linkedin.com" from a profile URL; the raw string if it is not a URL at all. */
const hostLabel = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const Footer = () => {
  const { email, phone, whatsapp, addressLines } = site.contact;

  return (
    // data-hide-float: FloatingEnquire steps aside here so it never sits on the legal text.
    <footer data-hide-float className="bg-ink text-ink-foreground">
      <h2 className="sr-only">Site footer</h2>

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 md:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12 lg:gap-x-10">
          <div className="col-span-2 lg:col-span-4">
            <Link to="/" aria-label={`${site.name} — home`} className={cn('inline-block', FOCUS)}>
              <Logo variant="onDark" size="md" />
            </Link>
            <p className="mt-6 font-display text-xl text-ink-foreground">{site.tagline}</p>
            <p className="mt-2 text-sm text-ink-muted">Part of {site.parent}</p>
          </div>

          <nav aria-label={journeyIntro.heading} className="lg:col-span-2">
            <ColumnTitle>
              <Link to="/journey" className={cn('transition-colors hover:text-gold', FOCUS)}>
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

          <nav aria-label="Products" className="lg:col-span-3">
            <ColumnTitle>
              <Link to="/products" className={cn('transition-colors hover:text-gold', FOCUS)}>
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
                      <ul className="mb-2 border-l border-ink-border pl-4">
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

          <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-12 lg:col-span-3 lg:grid-cols-1 lg:gap-y-10">
            <nav aria-label="Company">
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

            <div>
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
                  <Link to="/contact" data-lead="footer-enquiry" className={cn(LINK, 'font-medium text-gold hover:text-ink-foreground')}>
                    Send an Enquiry
                  </Link>
                </li>
                {site.sameAs.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {hostLabel(url)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Compliance strip — wording agreed for the B2B positioning; do not soften. */}
        <div className="mt-14 grid gap-6 border-t border-ink-border pt-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
          <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">{site.compliance.tradeNotice}</p>
          <p
            role="note"
            className="border border-ink-foreground/70 px-5 py-4 font-sans text-sm font-semibold uppercase leading-snug tracking-[0.08em] text-ink-foreground lg:max-w-sm"
          >
            {site.compliance.healthWarning}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-ink-border pt-6 text-xs uppercase tracking-[0.18em] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            {/* The legal name ends in "Ltd." — drop its full stop so the sentence has just one. */}
            © {new Date().getFullYear()} {site.legalName.replace(/\.$/, '')}. All rights reserved.
          </p>
          <p>{site.country}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
