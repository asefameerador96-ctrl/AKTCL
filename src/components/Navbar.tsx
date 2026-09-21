import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
   * true on pages that open with full-bleed photography: the bar starts transparent,
   * its links set straight on the photograph's scrim, and turns solid after 60px of
   * scroll. Everywhere else it is solid from the start, so it stays readable over any
   * page in either theme.
   */
  overHero?: boolean;
}

const LINKS = [
  { to: '/journey', label: 'Our Journey' },
  { to: '/products', label: 'Products' },
  { to: '/cigarette-sizes', label: 'Cigarette Sizes' },
  { to: '/about-us', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
] as const;

// The full-screen menu has room for the way back as well.
const MENU_LINKS = [{ to: '/', label: 'Home' }, ...LINKS] as const;

// Matches the `xl:` breakpoint the desktop links appear at. The mono label runs ~9.75px
// a character (0.6em advance + 0.15em tracking at 13px), so the five links come to
// ~520px, ~630px with their gaps; with the toggle, Enquire and the ~205px lockup that is
// ~1060px — more than the ~960px a 1024px window leaves inside the gutters, and well
// inside the ~1215px at 1280px. Below xl the menu sheet carries them.
const DESKTOP_QUERY = '(min-width: 1280px)';

/** The bar only steps aside once the page is properly under way. */
const HIDE_AFTER_PX = 320;
/** Lenis comes to rest in sub-pixel steps; anything smaller than this is not a direction. */
const DIRECTION_PX = 6;
const MENU_CLOSE_MS = 500;

/*
 * Desktop links are type, not boxes: the mono label, and under it a hairline that is
 * drawn from the left on hover or keyboard focus and leaves to the right (the origin
 * flips while the line has no width, so the flip is never seen). Transform only. The
 * page you are on keeps its line, in the accent — sage over the photograph.
 */
const NAV_LINK = 'mono-label group inline-flex min-h-11 items-center rounded-sm px-1 transition-colors';
const NAV_LINE =
  'relative py-1.5 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-expo-out group-focus-visible:after:origin-left group-focus-visible:after:scale-x-100 [@media(hover:hover)]:group-hover:after:origin-left [@media(hover:hover)]:group-hover:after:scale-x-100';
const NAV_LINE_CURRENT = 'after:origin-left after:scale-x-100';

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
  const onInk = (overHero && !scrolled) || menuUp;

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
            // One hairline under the bar is all the chrome it has. Over the photograph
            // even that goes: the links are set straight on the scrim.
            'fixed inset-x-0 top-0 z-50 border-b transition-[transform,background-color,border-color] duration-500 ease-expo-out',
            onInk ? 'border-transparent bg-transparent' : 'border-border bg-background/90 backdrop-blur',
            barHidden && '-translate-y-full'
          )}
        >
          {/* Scrim so the lockup and the links stay legible over bright photography. */}
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-scrim/70 to-transparent transition-opacity duration-300',
              onInk && !menuUp ? 'opacity-100' : 'opacity-0'
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
                // min-h-11: the artwork is 31px tall, the target is not.
                'inline-flex min-h-11 origin-left items-center rounded-sm transition-transform duration-500 ease-expo-out',
                scrolled && !menuUp && 'scale-90',
                onInk && 'focus-ink'
              )}
            >
              <Logo variant={onInk ? 'onDark' : 'auto'} size="sm" />
            </Link>

            <div className="flex items-center gap-3">
              <ul className="hidden items-center gap-9 xl:flex">
                {LINKS.map(({ to, label }) => {
                  const current = currentFor(to);
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        aria-current={current}
                        className={cn(
                          NAV_LINK,
                          onInk ? 'focus-ink text-ink-foreground' : 'text-foreground',
                          // On paper the links are quiet until asked for, and the page you are
                          // on is already at full strength. Over the photograph they all stay
                          // full white: measured against its brightest sky, a dimmed label
                          // drops under 4.5:1.
                          !current &&
                            !onInk &&
                            'text-muted-foreground hover:text-foreground focus-visible:text-foreground'
                        )}
                      >
                        <span
                          className={cn(
                            NAV_LINE,
                            current && NAV_LINE_CURRENT,
                            current && (onInk ? 'after:bg-sage' : 'after:bg-accent')
                          )}
                        >
                          {label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Below xl the toggle lives at the foot of the menu sheet instead. */}
              <ThemeToggle isDark={isDark} onToggle={toggle} onInk={onInk} className="hidden xl:ml-5 xl:inline-flex" />

              <Magnetic>
                <Link
                  to="/contact"
                  data-lead="nav-enquire"
                  // The one filled control in the bar: white over the photograph, black on paper.
                  className={cn('btn hidden xl:inline-flex', onInk ? 'btn-ink focus-ink' : 'btn-solid')}
                >
                  Enquire
                </Link>
              </Magnetic>

              <button
                ref={menuButtonRef}
                type="button"
                aria-label="Menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => (menuOpen ? closeMenu() : setMenu('open'))}
                className={cn(
                  'btn btn-icon flex-col gap-[7px] xl:hidden',
                  onInk ? 'btn-outline-ink focus-ink' : 'btn-outline'
                )}
              >
                {/* Two hairlines that cross into the close mark. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px w-5 bg-current transition-transform duration-300 ease-expo-out',
                    menuOpen && 'translate-y-1 rotate-45'
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px w-5 bg-current transition-transform duration-300 ease-expo-out',
                    menuOpen && '-translate-y-1 -rotate-45'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/*
         * Mobile menu: a full-screen ink sheet that drops from under the bar and lifts
         * away again, the same curtain the age gate and the route change use. Inside it
         * is a directory: ruled rows, the page names in the display serif, an arrow.
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
            'fixed inset-0 z-[45] overflow-y-auto overscroll-contain bg-ink text-ink-foreground xl:hidden',
            !still &&
              (menu === 'closing'
                ? 'duration-500 ease-expo-in-out animate-out fill-mode-forwards slide-out-to-top-full'
                : 'duration-700 ease-expo-out animate-in slide-in-from-top-full')
          )}
        >
          <div className="relative isolate flex min-h-full flex-col pt-16">
            <Grain className="-z-10" />
            {/* Rules run edge to edge; the first sits where the bar's own hairline would be. */}
            <ul className="hairline-rows">
              {MENU_LINKS.map(({ to, label }, i) => {
                const current = currentFor(to);
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      aria-current={current}
                      // A tap on the page already open changes no route, so close here.
                      // Any other tap is closed by the route change, behind the curtain.
                      onClick={() => path === to && closeMenu()}
                      // Inset ring: the row is as wide as the screen, an outer one would be cut off.
                      className="group mx-auto flex min-h-[4.75rem] max-w-7xl items-center gap-5 px-4 py-3 ring-inset sm:px-6"
                    >
                      {/* Mask for the rising label; the padding keeps descenders inside it. */}
                      <span className="-my-[0.12em] block min-w-0 flex-1 overflow-hidden py-[0.12em]">
                        <span
                          className={cn(
                            'block',
                            !still && 'duration-1000 ease-expo-out animate-in fill-mode-both slide-in-from-bottom-full'
                          )}
                          style={still ? undefined : { animationDelay: `${180 + i * 70}ms` }}
                        >
                          {/* The row answers by moving its name 8px along the rule — nothing scales. */}
                          <span
                            className={cn(
                              'display-lg block transition-transform group-focus-visible:translate-x-2 [@media(hover:hover)]:group-hover:translate-x-2',
                              current && 'italic'
                            )}
                          >
                            {label}
                          </span>
                        </span>
                      </span>
                      {/* Waiting just off its mark; the page you are on keeps its arrow. */}
                      <ArrowRight
                        aria-hidden="true"
                        strokeWidth={1.5}
                        className={cn(
                          'h-5 w-5 shrink-0 transition-[transform,opacity] group-focus-visible:translate-x-0 group-focus-visible:opacity-100 [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:opacity-100',
                          current ? 'text-sage' : '-translate-x-2 opacity-0'
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div
              className={cn(
                'mx-auto mt-auto flex w-full max-w-7xl items-center gap-3 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-10 sm:px-6',
                !still && 'duration-1000 ease-expo-out animate-in fade-in fill-mode-both slide-in-from-bottom-4'
              )}
              style={still ? undefined : { animationDelay: `${180 + MENU_LINKS.length * 70 + 60}ms` }}
            >
              <Link
                to="/contact"
                data-lead="nav-enquire"
                onClick={() => path === '/contact' && closeMenu()}
                className="btn btn-lg btn-ink flex-1 justify-between sm:w-80 sm:flex-none"
              >
                Enquire
                <ArrowRight aria-hidden="true" className="btn-arrow" />
              </Link>
              <ThemeToggle isDark={isDark} onToggle={toggle} onInk className="h-12 w-12" />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
