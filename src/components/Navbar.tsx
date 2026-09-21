import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isStill } from '@/lib/motion';
import { useTheme } from '@/hooks/useTheme';
import { site } from '@/content/site';
import { normalisePath } from '@/seo/routeMeta';
import Grain from '@/components/motion/Grain';
import Magnetic from '@/components/motion/Magnetic';
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

// The full-screen menu has room for the way back as well, and numbers its rows.
const MENU_LINKS = [{ to: '/', label: 'Home' }, ...LINKS] as const;

// Matches the `lg:` breakpoint the desktop links appear at — five pills plus the
// lockup do not fit below it.
const DESKTOP_QUERY = '(min-width: 1024px)';

/** The bar only steps aside once the page is properly under way. */
const HIDE_AFTER_PX = 320;
/** Lenis comes to rest in sub-pixel steps; anything smaller than this is not a direction. */
const DIRECTION_PX = 6;
const MENU_CLOSE_MS = 500;

/*
 * Hover fill that is drawn, like .link-underline: a wash grows from the left edge and
 * leaves to the right (the origin flips while it has no width). Transform only. It
 * answers keyboard focus too, and only real hover — a tap must not leave it stuck on.
 */
const SWEEP =
  'relative isolate overflow-hidden before:absolute before:inset-0 before:-z-10 before:origin-right before:scale-x-0 before:transition-transform before:duration-500 before:ease-expo-out focus-visible:before:origin-left focus-visible:before:scale-x-100 [@media(hover:hover)]:hover:before:origin-left [@media(hover:hover)]:hover:before:scale-x-100';

// Pill surfaces. The glass set also swaps the focus ring: the default ring colour is
// tuned for ivory and is too dark to see over photography or the ink menu.
const GLASS =
  'border-ink-foreground/20 bg-ink/30 text-ink-foreground before:bg-ink-foreground focus-visible:ring-gold focus-visible:ring-offset-ink focus-visible:text-ink [@media(hover:hover)]:hover:border-ink-foreground [@media(hover:hover)]:hover:text-ink';
const GLASS_ACTIVE = 'border-ink-foreground/50 font-bold';
const SOLID =
  'border-border bg-card/60 text-foreground before:bg-foreground focus-visible:text-background [@media(hover:hover)]:hover:border-foreground [@media(hover:hover)]:hover:text-background';
const SOLID_ACTIVE = 'border-foreground/40 font-bold';

type Menu = 'closed' | 'open' | 'closing';

const Navbar = ({ overHero = false }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [barHidden, setBarHidden] = useState(false);
  const [menu, setMenu] = useState<Menu>('closed');
  const [still] = useState(isStill);
  // One theme state for both toggles (bar and menu) — see ThemeToggle.
  const { isDark, toggle } = useTheme();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef(menu);
  menuRef.current = menu;
  const closeTimer = useRef<number>();
  const path = normalisePath(useLocation().pathname);

  const menuOpen = menu === 'open';
  // Open or still lifting away: the bar sits on the ink sheet, not on the page.
  const menuUp = menu !== 'closed';
  const glass = overHero && !scrolled && !menuUp;
  const onInk = glass || menuUp;

  const closeMenu = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    if (still) {
      setMenu('closed');
      return;
    }
    // The sheet lifts away first; `hidden` follows once it has gone.
    setMenu((now) => (now === 'open' ? 'closing' : now));
    closeTimer.current = window.setTimeout(() => setMenu('closed'), MENU_CLOSE_MS);
  }, [still]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    // The prerenderer scrolls each page before its snapshot; keep the static HTML in
    // the top-of-page state, which is what a visitor's first paint shows.
    if (window.__PRERENDER__) return;
    let frame = 0;
    let lastY = window.scrollY;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 60);
      // Reduced motion: the bar simply stays put.
      if (still) return;
      const delta = y - lastY;
      if (Math.abs(delta) < DIRECTION_PX) return;
      lastY = y;
      // Never from under someone: not while the menu is up, not while focus is in the bar.
      const inUse = menuRef.current !== 'closed' || headerRef.current?.contains(document.activeElement);
      setBarHidden(delta > 0 && y > HIDE_AFTER_PX && !inUse);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [still]);

  // Pages that share a component (/journey/seed -> /journey/cure) keep this navbar
  // mounted, so the menu has to be closed by the route change itself. No lift here:
  // the route curtain is already covering the screen.
  useEffect(() => {
    window.clearTimeout(closeTimer.current);
    setMenu('closed');
    setBarHidden(false);
  }, [path]);

  useEffect(() => {
    if (!menuOpen) return;
    // The sheet covers the page, so the page must not scroll behind it. SmoothScroll
    // watches this same lock and stops Lenis with it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
        menuButtonRef.current?.focus();
        return;
      }
      // Nothing behind the sheet can be seen, so Tab stays in the bar and the menu.
      const header = headerRef.current;
      if (e.key !== 'Tab' || !header) return;
      const stops = Array.from(header.querySelectorAll<HTMLElement>('a[href], button')).filter(
        (el) => el.getClientRects().length > 0
      );
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;
      if (!first || !last) return;
      if (!header.contains(active) || active === (e.shiftKey ? first : last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      if (desktop.matches) setMenu('closed');
    };
    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onBreakpoint);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [menuOpen, closeMenu]);

  // "page" for the exact URL, "true" for its section (Products on a product page).
  const currentFor = (to: string): 'page' | 'true' | undefined =>
    path === to ? 'page' : to !== '/' && path.startsWith(`${to}/`) ? 'true' : undefined;

  const surface = onInk ? GLASS : SOLID;

  return (
    // The header itself is not positioned: the bar and the menu sheet are two fixed
    // siblings inside it. The bar is moved with a transform (and blurred), either of
    // which would turn it into the containing block of a fixed child — the sheet
    // would be as tall as the bar.
    <header ref={headerRef}>
      <nav aria-label="Primary">
        <div
          onFocus={() => setBarHidden(false)}
          className={cn(
            'fixed inset-x-0 top-0 z-50 border-b transition-[transform,background-color,border-color] duration-500 ease-expo-out',
            onInk ? 'border-transparent bg-transparent' : 'border-border bg-background/85 backdrop-blur-xl',
            barHidden && '-translate-y-full'
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

          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20">
            <Link
              to="/"
              aria-label={`${site.name} — home`}
              // Already home: the router has nothing to do, so take the visitor back up.
              // No explicit behaviour, so the reduced-motion rule in index.css decides.
              onClick={() => {
                if (path !== '/') return;
                window.scrollTo({ top: 0 });
                if (menuOpen) closeMenu();
              }}
              className={cn(
                // The lockup draws in a little once the page is moving under the bar.
                'inline-flex origin-left rounded-sm transition-transform duration-500 ease-expo-out',
                scrolled && !menuUp && 'scale-90',
                onInk && 'focus-visible:ring-gold focus-visible:ring-offset-ink'
              )}
            >
              <Logo variant={onInk ? 'onDark' : 'auto'} size="sm" />
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
                          SWEEP,
                          surface,
                          current && (onInk ? GLASS_ACTIVE : SOLID_ACTIVE)
                        )}
                      >
                        {current && <span aria-hidden="true" className="mr-2.5 h-1.5 w-1.5 rounded-full bg-gold" />}
                        {label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Magnetic>
                    <Link
                      to="/contact"
                      data-lead="nav-enquire"
                      className={cn(
                        'nav-pill min-h-11 border-accent bg-accent text-accent-foreground before:bg-ink/20',
                        SWEEP,
                        onInk && 'focus-visible:ring-gold focus-visible:ring-offset-ink'
                      )}
                    >
                      Enquire
                    </Link>
                  </Magnetic>
                </li>
              </ul>

              {/* Below lg the toggle lives at the foot of the menu sheet instead. */}
              <ThemeToggle isDark={isDark} onToggle={toggle} className={cn('hidden lg:inline-flex', SWEEP, surface)} />

              <button
                ref={menuButtonRef}
                type="button"
                aria-label="Menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => (menuOpen ? closeMenu() : setMenu('open'))}
                className={cn(
                  'inline-flex h-11 w-11 flex-col items-center justify-center gap-[7px] rounded-md border backdrop-blur-xl transition-colors duration-300 lg:hidden',
                  SWEEP,
                  surface
                )}
              >
                {/* Two hairlines that cross into the close mark. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px w-5 bg-current transition-transform duration-500 ease-expo-out',
                    menuOpen && 'translate-y-1 rotate-45'
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px w-5 bg-current transition-transform duration-500 ease-expo-out',
                    menuOpen && '-translate-y-1 -rotate-45'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/*
         * Mobile menu: a full-screen ink sheet that drops from under the bar and lifts
         * away again, the same curtain the age gate and the route change use.
         * `hidden` (not opacity) takes the closed links out of the tab order and the
         * accessibility tree. No display utility on this element — it would override
         * [hidden]. CSS animations, not transitions: they are what runs when an
         * element comes back from display:none.
         */}
        <div
          id="mobile-menu"
          hidden={!menuUp}
          // Lifting away: still painted, no longer there to be tabbed into or tapped.
          {...(menu === 'closing' ? { inert: '' } : {})}
          className={cn(
            'fixed inset-0 z-[45] overflow-y-auto overscroll-contain bg-ink text-ink-foreground lg:hidden',
            !still &&
              (menu === 'closing'
                ? 'duration-500 ease-expo-in-out animate-out fill-mode-forwards slide-out-to-top-full'
                : 'duration-700 ease-expo-out animate-in slide-in-from-top-full')
          )}
        >
          <Grain />
          <div className="relative mx-auto flex min-h-full max-w-7xl flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-24 sm:px-6">
            <ul className="border-t border-ink-border">
              {MENU_LINKS.map(({ to, label }, i) => {
                const current = currentFor(to);
                return (
                  <li key={to} className="border-b border-ink-border">
                    <Link
                      to={to}
                      aria-current={current}
                      // A tap on the page already open changes no route, so close here.
                      // Any other tap is closed by the route change, behind the curtain.
                      onClick={() => path === to && closeMenu()}
                      className="focus-ink group flex min-h-[4.5rem] items-baseline gap-5 py-3"
                    >
                      <span
                        aria-hidden="true"
                        className="w-6 shrink-0 font-sans text-[11px] font-medium tabular-nums tracking-[0.2em] text-gold"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {/* Mask for the rising label; the padding keeps descenders inside it. */}
                      <span
                        className={cn(
                          '-my-[0.12em] block overflow-hidden py-[0.12em] font-display text-[length:clamp(2.25rem,10.5vw,3.75rem)] font-normal leading-[1.08] tracking-[-0.02em] transition-colors duration-300 group-hover:text-gold',
                          current && 'italic text-gold'
                        )}
                      >
                        <span
                          className={cn(
                            'block',
                            !still && 'duration-1000 ease-expo-out animate-in fill-mode-both slide-in-from-bottom-full'
                          )}
                          style={still ? undefined : { animationDelay: `${180 + i * 70}ms` }}
                        >
                          {label}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div
              className={cn(
                'mt-auto flex items-center gap-3 pt-10',
                !still && 'duration-1000 ease-expo-out animate-in fade-in fill-mode-both slide-in-from-bottom-4'
              )}
              style={still ? undefined : { animationDelay: `${180 + MENU_LINKS.length * 70 + 60}ms` }}
            >
              <Link
                to="/contact"
                data-lead="nav-enquire"
                onClick={() => path === '/contact' && closeMenu()}
                className={cn(
                  'focus-ink flex min-h-12 flex-1 items-center justify-center rounded-md bg-gold px-6 font-sans text-[13px] font-semibold uppercase tracking-[0.18em] text-ink before:bg-ink/15',
                  SWEEP
                )}
              >
                Enquire
              </Link>
              <ThemeToggle isDark={isDark} onToggle={toggle} className={cn('h-12 w-12', SWEEP, GLASS)} />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
