import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { site } from '@/content/site';
import { normalisePath } from '@/seo/routeMeta';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export interface NavbarProps {
  /**
   * true on pages that open with full-bleed photography: the bar starts transparent
   * with ink-glass pills and turns solid after 60px of scroll. Everywhere else it is
   * solid from the start, so it stays readable over any page in either theme.
   */
  overHero?: boolean;
}

const LINKS = [
  { to: '/journey', label: 'Our Journey' },
  { to: '/products', label: 'Products' },
  { to: '/about-us', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
] as const;

// Matches the `lg:` breakpoint the desktop links appear at — five pills plus the
// lockup do not fit below it.
const DESKTOP_QUERY = '(min-width: 1024px)';

// Pill surfaces. The glass set also swaps the focus ring: the default ring colour is
// tuned for ivory and is too dark to see over photography.
const GLASS =
  'border-ink-foreground/20 bg-ink/30 text-ink-foreground hover:border-ink-foreground/40 hover:bg-ink-foreground/15 hover:text-ink-foreground focus-visible:ring-gold focus-visible:ring-offset-ink';
const GLASS_ACTIVE = 'border-ink-foreground/60 bg-ink-foreground/15';
const SOLID = 'border-border bg-card/60 text-foreground hover:border-accent/50 hover:text-accent';
const SOLID_ACTIVE = 'border-accent/60 text-accent';

const Navbar = ({ overHero = false }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const path = normalisePath(useLocation().pathname);

  // An open menu needs a solid bar behind it, even over the hero.
  const glass = overHero && !scrolled && !menuOpen;

  useEffect(() => {
    // The prerenderer scrolls each page before its snapshot; keep the static HTML in
    // the top-of-page state, which is what a visitor's first paint shows.
    if (window.__PRERENDER__) return;
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pages that share a component (/journey/seed -> /journey/cure) keep this navbar
  // mounted, so the menu has to be closed by the route change itself.
  useEffect(() => setMenuOpen(false), [path]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    desktop.addEventListener('change', onBreakpoint);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [menuOpen]);

  // "page" for the exact URL, "true" for its section (Products on a product page).
  const currentFor = (to: string): 'page' | 'true' | undefined =>
    path === to ? 'page' : path.startsWith(`${to}/`) ? 'true' : undefined;

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
        glass && 'border-transparent bg-transparent',
        !glass && (menuOpen ? 'border-border bg-background' : 'border-border bg-background/85 backdrop-blur-xl')
      )}
    >
      {/* Scrim so the wordmark and pills stay legible over bright photography. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-ink/60 to-transparent transition-opacity duration-300',
          glass ? 'opacity-100' : 'opacity-0'
        )}
      />

      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20"
      >
        <Link
          to="/"
          aria-label={`${site.name} — home`}
          // Already home: the router has nothing to do, so take the visitor back up.
          // No explicit behaviour, so the reduced-motion rule in index.css decides.
          onClick={() => path === '/' && window.scrollTo({ top: 0 })}
          className={cn('inline-flex rounded-sm', glass && 'focus-visible:ring-gold focus-visible:ring-offset-ink')}
        >
          <Logo variant={glass ? 'onDark' : 'auto'} size="sm" />
        </Link>

        <div className="flex items-center gap-2">
          <ul className="hidden items-center gap-2 lg:flex">
            {LINKS.map(({ to, label }) => {
              const current = currentFor(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    aria-current={current}
                    className={cn(
                      'nav-pill min-h-11',
                      glass ? GLASS : SOLID,
                      current && (glass ? GLASS_ACTIVE : SOLID_ACTIVE)
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                to="/contact"
                data-lead="nav-enquire"
                className={cn(
                  'nav-pill min-h-11 border-accent bg-accent text-accent-foreground hover:bg-accent/90',
                  glass && 'focus-visible:ring-gold focus-visible:ring-offset-ink'
                )}
              >
                Enquire
              </Link>
            </li>
          </ul>

          <ThemeToggle className={glass ? GLASS : undefined} />

          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              'inline-flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-md border backdrop-blur-xl transition-colors duration-300 lg:hidden',
              glass ? GLASS : SOLID
            )}
          >
            <span
              aria-hidden="true"
              className={cn('h-0.5 w-5 bg-current transition-transform duration-300', menuOpen && 'translate-y-2 rotate-45')}
            />
            <span
              aria-hidden="true"
              className={cn('h-0.5 w-5 bg-current transition-opacity duration-300', menuOpen && 'opacity-0')}
            />
            <span
              aria-hidden="true"
              className={cn('h-0.5 w-5 bg-current transition-transform duration-300', menuOpen && '-translate-y-2 -rotate-45')}
            />
          </button>
        </div>
      </nav>

      {/*
       * Mobile disclosure. `hidden` (not max-height: 0) takes the closed links out of
       * the tab order and the accessibility tree, and lets the panel size to its
       * content. No display utility on this element — it would override [hidden].
       * The page behind stays scrollable; the panel only scrolls itself when a short
       * landscape viewport cannot fit it.
       */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="absolute inset-x-0 top-full max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain border-b border-border bg-background shadow-lg shadow-ink/10 animate-in fade-in slide-in-from-top-2 duration-300 lg:hidden"
      >
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-2 sm:px-6">
          <ul>
            {LINKS.map(({ to, label }) => {
              const current = currentFor(to);
              return (
                <li key={to} className="border-b border-border">
                  <Link
                    to={to}
                    aria-current={current}
                    // A tap on the page already open changes no route, so close here too.
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex min-h-14 items-center justify-between font-sans text-sm font-semibold uppercase tracking-[0.18em] transition-colors hover:text-accent',
                      current ? 'text-accent' : 'text-foreground'
                    )}
                  >
                    {label}
                    {current && <span aria-hidden="true" className="h-px w-8 bg-gold" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            to="/contact"
            data-lead="nav-enquire"
            onClick={() => setMenuOpen(false)}
            className="mt-6 flex min-h-12 items-center justify-center rounded-md bg-accent px-6 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Enquire
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
