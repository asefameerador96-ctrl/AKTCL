import { useRef, useState } from 'react';
import { isStill, revealTransition, useInView, useReveal } from '@/lib/motion';
import LogoMark from '@/components/LogoMark';

/**
 * The brand sign-off under the footer: the AKT monogram, centred. Inline vector in
 * currentColor rather than the reference's pair of raster wordmarks — one element
 * serves both themes, stays sharp at any width and costs no image request.
 * Decorative, so hidden from assistive tech; the footer above already names the company.
 *
 * A signature, not a billboard: at most 18rem wide, two fifths of the screen's width on
 * a phone. It ran the full 62rem container at first, then 31rem (three fifths on a
 * phone), until the owner asked for it smaller again (2026-09-22).
 *
 * The page's last gesture: each time the sign-off comes into view the mark rises out
 * of its own baseline, masked, with expo-out, and sinks back as it leaves (lib/motion's
 * two-way reveal). Under isStill() it is simply there.
 */
const BigBrandFooter = () => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLDivElement>(null);
  // The last thing on the page, so it is watched on its own terms: any part of it in
  // the viewport counts, and the zone keeps its full depth. The house zone cuts the
  // screen's lowest eighth, and at the foot of the page this mark never clears that
  // line on a phone — it stayed masked and the footer looked logo-less (owner, Android,
  // 2026-09-23).
  const inView = useInView(ref, { threshold: 0, rootMargin: '0px', skip: still });
  const shown = useReveal(inView);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      // Back on paper after the ink footer, in the black of the text (white in the
      // dark theme) — never the accent. The hairline marks the step where the dark
      // theme's page and the ink band are nearly one tone. Last thing on the page, so
      // it is what has to clear the phone's home indicator. Its padding shrinks with the
      // mark (by the same ~0.6), so the band keeps its proportions.
      className="overflow-hidden border-t border-border bg-background px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-5 text-foreground sm:px-6 md:pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pt-7"
    >
      {/* The mask hugs the mark, so it comes up from its own foot, not the page's. */}
      <div className="mx-auto w-[40vw] max-w-[18rem] overflow-hidden">
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
