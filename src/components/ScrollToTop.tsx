import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll on navigation, and honours "#section" links across routes.
 *
 * Pages are lazy chunks, so the target of "/#journey" may not exist yet when the
 * location changes. Poll briefly for it instead of guessing a timeout.
 *
 * When Lenis is running (see motion/SmoothScroll) every jump goes through it:
 * scrolling the window behind its back leaves it easing towards a stale target.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const lastPathname = useRef<string | null>(null);

  // Every navigation lands at the top (below), Back included. Left on "auto" the
  // browser also restores the old offset on Back — onto the page being LEFT, since
  // the route curtain holds the swap for a moment — and index.css makes that a
  // visible smooth scroll which then fights the reset.
  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    // A "#section" link on the page already open glides; anything that arrives with
    // a new page is simply there.
    const samePage = lastPathname.current === pathname;
    lastPathname.current = pathname;
    const lenis = window.__lenis;

    if (!hash) {
      // "instant": index.css makes scrolling smooth, and a new page must not arrive
      // by visibly rewinding from wherever the last one was left. `force` because
      // Lenis is stopped while the age gate is up; the native call after it is a
      // no-op whenever Lenis has already put the page at the top.
      lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer: number | undefined;
    const attempt = () => {
      const el = document.getElementById(id);
      if (el) {
        if (lenis) lenis.scrollTo(el, { immediate: !samePage, force: true });
        else el.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else if (tries++ < 40) {
        timer = window.setTimeout(attempt, 50);
      }
    };
    attempt();
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
