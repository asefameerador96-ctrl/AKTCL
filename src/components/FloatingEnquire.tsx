import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { site } from '@/content/site';
import { normalisePath } from '@/seo/routeMeta';

/**
 * The always-reachable enquiry button (bottom right). WhatsApp when a number is
 * configured in site.contact, otherwise a link to the enquiry form.
 *
 * It appears after ~400px of scroll and steps aside while anything marked
 * [data-hide-float] is on screen — the closing enquiry band, which makes it
 * redundant, and the footer, whose legal text it must never cover.
 *
 * Drawn like every other button on the site, only smaller: square, the mono label,
 * its arrow ruled off in a cell of its own. No circle, no icon badge, no shadow.
 */
const FloatingEnquire = () => {
  const { pathname } = useLocation();
  const [pastFold, setPastFold] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const handleScroll = () => setPastFold(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setDocked(onScreen.size > 0);
    });
    document.querySelectorAll('[data-hide-float]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // Re-collect per route: routes that share a page component keep this mounted.
  }, [pathname]);

  // Not in the static snapshot (it is chrome, not content), and not on the page it links to.
  if (window.__PRERENDER__ || normalisePath(pathname) === '/contact') return null;

  const shown = pastFold && !docked;
  const { whatsapp } = site.contact;

  const className = cn(
    // The solid button (.btn-solid: black on paper, white in the dark theme, racing
    // green on hover). It floats over paper, ink and photography alike, so its hairline
    // is a tint of its own label colour — that keeps an edge on the dark bands where a
    // border in the fill colour would vanish. The transition list is restated because
    // it has to carry the entrance as well as .btn's colours.
    'btn btn-solid fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40 min-h-12 gap-0 border-primary-foreground/25 pl-5 pr-0 transition-[opacity,transform,visibility,background-color,border-color,color] md:bottom-6 md:right-6',
    // A quiet entrance: 8px and a fade. `invisible` also takes the hidden button out of the tab order.
    shown ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0'
  );

  // The arrow's cell, ruled off with a hairline that follows the label's colour.
  const arrow = (
    <>
      <span aria-hidden="true" className="ml-5 w-px shrink-0 self-stretch bg-current opacity-20" />
      <span aria-hidden="true" className="flex w-12 shrink-0 items-center justify-center self-stretch">
        <ArrowRight className="btn-arrow" />
      </span>
    </>
  );

  if (whatsapp) {
    return (
      <a
        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        data-lead="whatsapp-float"
        aria-label={`Message ${site.shortName} on WhatsApp (opens in a new tab)`}
        className={className}
      >
        WhatsApp
        {arrow}
      </a>
    );
  }

  return (
    <Link to="/contact" data-lead="float-enquire" className={className}>
      Enquire
      {arrow}
    </Link>
  );
};

export default FloatingEnquire;
