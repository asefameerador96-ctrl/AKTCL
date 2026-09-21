import { useRef, useState } from 'react';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';
import { site } from '@/content/site';

/**
 * The oversized brand sign-off under the footer. Live text in currentColor rather
 * than the reference's pair of raster wordmarks: one element serves both themes,
 * stays sharp at any width and costs no image request. Decorative, so hidden from
 * assistive tech — the footer above already names the company.
 *
 * The page's last gesture: the first time the sign-off comes into view it rises out
 * of its own baseline, masked, with expo-out. The mask and the lift are on wrappers,
 * so whatever stands inside them (these letters today, a drawn mark tomorrow) rises
 * the same way. Under isStill() it is simply there.
 */
const BigBrandFooter = () => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.35, skip: still });
  const shown = useReveal(inView);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      // Last thing on the page, so it is what has to clear the phone's home indicator.
      className="overflow-hidden bg-background px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 text-foreground md:pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:pt-10"
    >
      {/* The mask hugs the letters, so they come up from their own foot, not the page's. */}
      <div className="overflow-hidden">
        <div
          style={
            still
              ? undefined
              : {
                  transform: shown ? 'none' : 'translate3d(0, 102%, 0)',
                  transition: `transform 1.2s ${EASE.expoOut}`,
                }
          }
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
      </div>
    </div>
  );
};

export default BigBrandFooter;
