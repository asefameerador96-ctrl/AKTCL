import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
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
    // `invisible` also takes the hidden button out of the tab order.
    'fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40 inline-flex h-14 items-center justify-center gap-2.5 rounded-full shadow-lg shadow-ink/30 transition-[opacity,transform,visibility] duration-300 md:bottom-6 md:right-6',
    shown ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-3 opacity-0'
  );

  if (whatsapp) {
    return (
      <a
        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        data-lead="whatsapp-float"
        aria-label={`Message ${site.shortName} on WhatsApp`}
        className={cn(className, 'w-14 bg-leaf text-leaf-foreground hover:bg-leaf/90')}
      >
        <MessageCircle aria-hidden="true" className="h-6 w-6" />
      </a>
    );
  }

  return (
    <Link
      to="/contact"
      data-lead="float-enquire"
      className={cn(
        className,
        'bg-accent px-6 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-accent-foreground hover:bg-accent/90'
      )}
    >
      <Mail aria-hidden="true" className="h-4 w-4" />
      Enquire
    </Link>
  );
};

export default FloatingEnquire;
