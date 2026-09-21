import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll on navigation, and honours "#section" links across routes.
 *
 * Pages are lazy chunks, so the target of "/#journey" may not exist yet when the
 * location changes. Poll briefly for it instead of guessing a timeout.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // "instant": index.css makes scrolling smooth, and a new page must not arrive
      // by visibly rewinding from wherever the last one was left.
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer: number | undefined;
    const attempt = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
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
