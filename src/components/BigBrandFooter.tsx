import { useRef, useState } from 'react';
import { isStill, revealTransition, useInView, useReveal } from '@/lib/motion';
import LogoMark from '@/components/LogoMark';

/**
 * The brand sign-off under the footer: the AKT monogram, centred. Inline vector in
 * currentColor rather than the reference's pair of raster wordmarks — one element
 * serves both themes, stays sharp at any width and costs no image request.
 * Decorative, so hidden from assistive tech; the footer above already names the company.
 *
 * A signature, not a billboard: at most 31rem wide (it ran the full 62rem container
 * until the owner asked for half), three fifths of the screen's width on a phone.
 *
 * The page's last gesture: each time the sign-off comes into view the mark rises out
 * of its own baseline, masked, with expo-out, and sinks back as it leaves (lib/motion's
 * two-way reveal). Under isStill() it is simply there.
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
      // Back on paper after the ink footer, in the black of the text (white in the
      // dark theme) — never the accent. The hairline marks the step where the dark
      // theme's page and the ink band are nearly one tone. Last thing on the page, so
      // it is what has to clear the phone's home indicator. Its padding was halved with
      // the mark, so the band keeps its proportions.
      className="overflow-hidden border-t border-border bg-background px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-8 text-foreground sm:px-6 md:pb-[calc(2rem+env(safe-area-inset-bottom))] md:pt-12"
    >
      {/* The mask hugs the mark, so it comes up from its own foot, not the page's. */}
      <div className="mx-auto w-[60vw] max-w-[31rem] overflow-hidden">
        <div
          style={
            still
              ? undefined
              : {
                  transform: shown ? 'none' : 'translate3d(0, 102%, 0)',
                  transition: revealTransition(shown, 'transform', 1.2),
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
