import { useRef, useState } from 'react';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';
import LogoMark from '@/components/LogoMark';

/**
 * The oversized brand sign-off under the footer: the AKT monogram at full container
 * width. Inline vector in currentColor rather than the reference's pair of raster
 * wordmarks — one element serves both themes, stays sharp at any width and costs no
 * image request. Decorative, so hidden from assistive tech; the footer above already
 * names the company.
 *
 * The page's last gesture: the first time the sign-off comes into view the mark rises
 * out of its own baseline, masked, with expo-out. Under isStill() it is simply there.
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
      // Back on paper after the ink footer, in the espresso of the text (chalk in the
      // dark theme) — never the accent. The hairline marks the step where the dark
      // theme's page and the ink band are nearly one tone. Last thing on the page, so
      // it is what has to clear the phone's home indicator.
      className="overflow-hidden border-t border-border bg-background px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-14 text-foreground sm:px-6 md:pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pt-24"
    >
      {/* The mask hugs the mark, so it comes up from its own foot, not the page's. */}
      <div className="mx-auto max-w-[62rem] overflow-hidden">
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
          <LogoMark className="w-full select-none" />
        </div>
      </div>
    </div>
  );
};

export default BigBrandFooter;
