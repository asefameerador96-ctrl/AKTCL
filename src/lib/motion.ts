import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * The shared motion vocabulary. Every animated thing on the site takes its curve,
 * its "should I move at all" answer and its "may I start yet" answer from here, so
 * the whole site moves like one hand drew it.
 */

/** The only curves UI motion may use — never `ease` or `linear`. Durations stay ≤ 1.2s. */
export const EASE = {
  expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  quartOut: 'cubic-bezier(0.25, 1, 0.5, 1)',
  expoInOut: 'cubic-bezier(0.87, 0, 0.13, 1)',
} as const;

declare global {
  interface Window {
    /** Set by AgeGate once the visitor is through (or was already confirmed). */
    __aktclEntered?: boolean;
  }
}

/** Fired on window by AgeGate the moment a first-time visitor confirms their age. */
export const ENTERED_EVENT = 'aktcl:entered';

const matches = (query: string) =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(query).matches;

/**
 * True when nothing may animate: the prerender snapshot (the build fails if any text
 * is captured hidden) and visitors who asked for reduced motion. Components render
 * their final, fully visible state when this is true. Also true where there is no
 * window or no matchMedia (SSR, old test environments): still is the safe answer.
 */
export function isStill(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.__PRERENDER__ === true || matches('(prefers-reduced-motion: reduce)');
}

/** A real mouse or trackpad: gates the cursor ring, magnetic pull and parallax. */
export function canHover(): boolean {
  return matches('(hover: hover) and (pointer: fine)');
}

const hasEntered = () =>
  typeof window === 'undefined' || window.__PRERENDER__ === true || window.__aktclEntered === true;

/**
 * True once the legal-age gate is out of the way: straight away for the prerenderer
 * and for returning visitors, otherwise when AgeGate fires "aktcl:entered". Entrance
 * choreography waits on this, so it never plays unseen behind the gate.
 */
export function useEntered(): boolean {
  const [entered, setEntered] = useState(hasEntered);

  useEffect(() => {
    if (entered) return;
    // AgeGate may have settled between this component's render and its effect.
    if (hasEntered()) {
      setEntered(true);
      return;
    }
    const onEntered = () => setEntered(true);
    window.addEventListener(ENTERED_EVENT, onEntered, { once: true });
    return () => window.removeEventListener(ENTERED_EVENT, onEntered);
  }, [entered]);

  return entered;
}

// ---- curtain hand-off ------------------------------------------------------------
// RouteTransition covers the screen for a moment after a navigation, and the age
// gate lifts away the same way on "Yes". Entrances on the page underneath hold until
// the sheet starts to clear, so they are seen, not spent beneath it. Zero on a
// returning visitor's first load and whenever nothing is covering the page.

let curtainLiftsAt = 0;

/** RouteTransition and AgeGate only: the performance.now() time at which their sheet clears. */
export function holdEntrancesUntil(time: number) {
  curtainLiftsAt = time;
}

/** Milliseconds an entrance should still wait for the route curtain (0 = go now). */
export function entranceHold(): number {
  if (typeof performance === 'undefined') return 0;
  return Math.max(0, curtainLiftsAt - performance.now());
}

/** True from the first time `ref` comes into view. Without IntersectionObserver: at once. */
export function useInView<T extends Element>(
  ref: RefObject<T>,
  { threshold = 0.15, rootMargin = '0px', skip = false } = {}
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (skip || inView || !el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    // A block taller than the screen can never show 15% of itself on a phone; a
    // third of a screen of it is "in view" enough.
    const height = el.getBoundingClientRect().height;
    const reachable = height > 0 ? Math.min(threshold, (window.innerHeight * 0.35) / height) : threshold;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setInView(true);
      },
      { threshold: reachable, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, skip, inView]);

  return inView;
}

/**
 * The one "go" signal the reveal primitives share. `ready` is the component's own
 * condition (in view, or simply mounted for page-load choreography); the result turns
 * true once that holds, the age gate is passed and any route curtain is lifting.
 * One frame is always left between mount and go, so the hidden state has painted and
 * the transition has something to run from.
 */
export function useReveal(ready: boolean): boolean {
  const entered = useEntered();
  const [shown, setShown] = useState(isStill);

  useEffect(() => {
    if (shown || !ready || !entered) return;
    let frame = 0;
    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(() => setShown(true));
    }, entranceHold());
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [shown, ready, entered]);

  return shown;
}
