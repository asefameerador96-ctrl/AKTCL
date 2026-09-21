import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { EASE, holdEntrancesUntil, isStill } from '@/lib/motion';
import { normalisePath } from '@/seo/routeMeta';
import LogoMark from '@/components/LogoMark';

const COVER_MS = 300;
const LIFT_MS = 300;
/** Whatever happens — slow chunk, interrupted render — the curtain is gone by now. */
const LIMIT_MS = 650;
/** Entrances on the new page start this far into the lift, as the curtain clears them. */
const ENTRANCE_LEAD_MS = 110;

const CLOSED_BELOW = 'inset(100% 0% 0% 0%)';
const COVERING = 'inset(0% 0% 0% 0%)';
const CLOSED_ABOVE = 'inset(0% 0% 100% 0%)';

type Phase = 'idle' | 'cover' | 'lift';

// While the curtain is closing, the navigation's own render waits on this promise.
// The router navigates inside startTransition, and a transition that suspends keeps
// the old page on screen — so the page swap happens behind a closed curtain without
// <Routes>, ScrollToTop or RouteSeo having to know a curtain exists.
let closing: Promise<void> | null = null;
let release: (() => void) | null = null;
const letThrough = () => {
  closing = null;
  release?.();
  release = null;
};

/**
 * Ink curtain between pages, mounted once in App (inside the Router, inside its own
 * Suspense boundary): rises from the foot of the screen over the page being left,
 * the new page swaps in behind it at the top of its scroll, and it lifts away.
 * 300 ms each way with expo-in-out; a clip-path rather than scaleY so the monogram
 * riding on it is uncovered, not squashed.
 *
 * Never on first load, never under isStill(), and never in the way for long: it
 * lifts by 350 ms even if the next page's chunk has not arrived, and a hard stop
 * removes it at 650 ms.
 *
 * Also moves focus to <main> after every navigation (motion or not), so keyboard
 * and screen-reader users start at the new page rather than at a link that is gone.
 */
const RouteTransition = () => {
  const pathname = normalisePath(useLocation().pathname);
  const [phase, setPhase] = useState<Phase>('idle');
  const phaseRef = useRef<Phase>('idle');
  const shownPath = useRef(pathname);
  const focusedPath = useRef(pathname);
  // True from the click until the new page commits: that navigation has had its curtain.
  const played = useRef(false);
  const curtainRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const go = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const lift = useCallback(() => {
    if (phaseRef.current === 'lift') return;
    holdEntrancesUntil(performance.now() + ENTRANCE_LEAD_MS);
    go('lift');
    timers.current.push(window.setTimeout(() => go('idle'), LIFT_MS));
  }, [go]);

  const begin = useCallback(() => {
    if (phaseRef.current !== 'idle' || isStill()) return;
    played.current = true;
    closing = new Promise((resolve) => {
      release = resolve;
    });
    go('cover');
    timers.current.push(
      window.setTimeout(letThrough, COVER_MS),
      // The new page normally commits right after the cover and lifts it there (below).
      window.setTimeout(lift, LIMIT_MS - LIFT_MS),
      window.setTimeout(() => go('idle'), LIMIT_MS)
    );
  }, [go, lift]);

  useEffect(() => {
    // Bubble phase on window, i.e. after React has run <Link>'s handler: a click the
    // router took is defaultPrevented. location already holds the new URL by now
    // (pushState is synchronous), hence the comparison with the path still on screen.
    const onClick = (e: MouseEvent) => {
      if (!e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || link.origin !== window.location.origin) return;
      if (normalisePath(link.pathname) !== shownPath.current) begin();
    };
    const onPopState = () => {
      if (normalisePath(window.location.pathname) !== shownPath.current) begin();
    };
    window.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    };
  }, [begin]);

  // Back to rest, or unmounting: no stale timer may touch the next curtain, and no
  // render may be left waiting.
  const settle = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    letThrough();
  }, []);
  useEffect(() => {
    if (phase === 'idle') settle();
  }, [phase, settle]);
  useEffect(() => settle, [settle]);

  // The new page has just committed. Layout effect: when no curtain was closing (a
  // programmatic navigate()), it still has to be fully down before this page paints.
  useLayoutEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;
    const alreadyPlayed = played.current && phaseRef.current === 'idle';
    played.current = false;
    // A chunk slow enough to outlast the curtain: it has been and gone, once is enough.
    if (!alreadyPlayed && !isStill()) lift();
  }, [pathname, lift]);

  useEffect(() => {
    if (focusedPath.current === pathname) return;
    focusedPath.current = pathname;
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);

  useLayoutEffect(() => {
    const curtain = curtainRef.current;
    if (phase === 'idle' || !curtain || typeof curtain.animate !== 'function') return;
    const animation = curtain.animate(
      { clipPath: phase === 'cover' ? [CLOSED_BELOW, COVERING] : [COVERING, CLOSED_ABOVE] },
      { duration: phase === 'cover' ? COVER_MS : LIFT_MS, easing: EASE.expoInOut, fill: 'both' }
    );
    return () => animation.cancel();
  }, [phase]);

  // Only a render for a NEW path waits; the urgent render that puts the curtain up
  // still sees the old location and passes straight through.
  if (closing && pathname !== shownPath.current) throw closing;

  if (phase === 'idle') return null;

  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      data-route-curtain={phase}
      // Flat ink and the monogram in chalk — nothing else. It is on screen for well under
      // a second, so there is no lockup to read, no grain to repaint and no rule to draw.
      className="fixed inset-0 z-[150] flex items-center justify-center bg-ink text-ink-foreground"
    >
      <LogoMark className="w-16 md:w-20" />
    </div>
  );
};

export default RouteTransition;
