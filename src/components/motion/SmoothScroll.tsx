import { useEffect } from 'react';
import Lenis from 'lenis';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

declare global {
  interface Window {
    /** The live Lenis instance, for ScrollToTop, AgeGate and anything that scrolls the page. */
    __lenis?: Lenis;
  }
}

/** Scroll is locked by whoever owns an overlay: the age gate, the gallery lightbox. */
const scrollLocked = () =>
  document.documentElement.classList.contains('age-pending') || document.body.style.overflow === 'hidden';

/**
 * Weighted wheel scrolling, mounted once in App.
 *
 * Lenis scrolls the real window, so sticky sections, IntersectionObservers and every
 * window "scroll" listener (journey scroller, gallery track, progress bar) keep
 * working untouched. Touch scrolling stays native — no scroll-jacking under a thumb.
 * Not created at all for the prerenderer or under reduced motion.
 */
const SmoothScroll = () => {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || window.__PRERENDER__) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
      // Overlays that scroll themselves (age gate on a short screen, the mobile
      // menu, a textarea) take the wheel natively instead of having it swallowed.
      allowNestedScroll: true,
    });
    window.__lenis = lenis;

    // A stopped Lenis discards wheel input, which is what a modal wants. Watching
    // the two lock signals here means no overlay has to know Lenis exists.
    const sync = () => (scrollLocked() ? lenis.stop() : lenis.start());
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    sync();

    return () => {
      observer.disconnect();
      lenis.destroy();
      delete window.__lenis;
    };
  }, [reduced]);

  return null;
};

export default SmoothScroll;
