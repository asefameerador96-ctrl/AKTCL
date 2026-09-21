import { site } from '@/content/site';

/**
 * The oversized brand sign-off under the footer. Live text in currentColor rather
 * than the reference's pair of raster wordmarks: one element serves both themes,
 * stays sharp at any width and costs no image request. Decorative, so hidden from
 * assistive tech — the footer above already names the company.
 */
const BigBrandFooter = () => (
  <div
    aria-hidden="true"
    // Last thing on the page, so it is what has to clear the phone's home indicator.
    className="overflow-hidden bg-background px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 text-foreground md:pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:pt-10"
  >
    <p
      className="select-none whitespace-nowrap text-center font-display font-semibold leading-none tracking-[0.04em]"
      style={{
        // 20vw keeps the five letters inside a 360px screen; the cap matches the
        // reference wordmark's ~1000px maximum width.
        fontSize: 'clamp(4rem, 20vw, 19rem)',
        fontVariationSettings: "'SOFT' 0, 'WONK' 0",
      }}
    >
      {site.shortName}
    </p>
  </div>
);

export default BigBrandFooter;
