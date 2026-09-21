import LogoMark from '@/components/LogoMark';

/**
 * The oversized brand sign-off under the footer: the AKT monogram at full container
 * width. Inline vector in currentColor rather than the reference's pair of raster
 * wordmarks — one element serves both themes, stays sharp at any width and costs no
 * image request. Decorative, so hidden from assistive tech; the footer above already
 * names the company.
 */
const BigBrandFooter = () => (
  <div
    aria-hidden="true"
    // Last thing on the page, so it is what has to clear the phone's home indicator.
    className="overflow-hidden bg-background px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-8 text-foreground sm:px-6 md:pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:pt-12"
  >
    {/* Capped like the reference wordmark (~1000px) so it never outgrows the page grid. */}
    <LogoMark className="mx-auto w-full max-w-[62rem] select-none" />
  </div>
);

export default BigBrandFooter;
