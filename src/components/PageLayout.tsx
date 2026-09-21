import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import ScrollProgress from './ScrollProgress';
import Navbar from './Navbar';
import EnquiryCta from './EnquiryCta';
import Footer from './Footer';
import BigBrandFooter from './BigBrandFooter';
import FloatingEnquire from './FloatingEnquire';

export interface PageLayoutProps {
  children: ReactNode;
  /**
   * true on pages that open with full-bleed photography (the homepage): the navbar
   * starts transparent over the image and turns solid on scroll. Everywhere else the
   * navbar is solid from the start and <main> is padded to clear it.
   */
  overHero?: boolean;
  /** Enquiry call-to-action band above the footer. Default true; false on /contact. */
  showEnquiryCta?: boolean;
  /** Pre-selects the product on the enquiry form the CTA links to. */
  enquiryProduct?: string;
}

/** The chrome every page shares. Pages render only their own content as children. */
const PageLayout = ({
  children,
  overHero = false,
  showEnquiryCta = true,
  enquiryProduct,
}: PageLayoutProps) => (
  <>
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-sm focus:bg-primary focus:px-5 focus:py-3 focus:font-mono focus:text-[12px] focus:font-medium focus:uppercase focus:tracking-[0.18em] focus:text-primary-foreground"
    >
      Skip to content
    </a>
    <ScrollProgress />
    <Navbar overHero={overHero} />
    <main
      id="main"
      // Focusable so the skip link actually moves focus, but never ringed: an
      // outline around the whole page body helps nobody.
      tabIndex={-1}
      // pt matches the navbar's h-16 / lg:h-20.
      className={cn('focus-visible:ring-0 focus-visible:ring-offset-0', !overHero && 'pt-16 lg:pt-20')}
    >
      {children}
    </main>
    {showEnquiryCta && <EnquiryCta product={enquiryProduct} />}
    <Footer />
    <BigBrandFooter />
    <FloatingEnquire />
  </>
);

export default PageLayout;
