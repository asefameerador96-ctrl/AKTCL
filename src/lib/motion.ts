import { useEffect, useRef, useState } from 'react';
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

// ---- scroll reveals, both ways -----------------------------------------------------
// A reveal plays every time its element comes on screen and plays back out once it
// has gone, in whichever direction the visitor scrolls (owner feedback, 2026-09: "why
// not every time?").
//
// Nothing that carries content may sit hidden ON screen (owner feedback, 2026-09-22:
// blank frames read as "images not loaded yet"). So a reveal starts the moment ANY
// part of its element comes within the ACTIVE ZONE — the viewport with its lowest
// eighth cut off, so a reveal begins as the element rises past that line and is watched
// on its way in — and plays in 0.9 s at most, after a stagger of 0.12 s at most. It is
// only put back once the element has left that zone altogether, which on the way back
// up is equally visible: the section plays out as it sinks past the same line.
//
// The zone was briefly the viewport PLUS a fifth of a screen below it, to stop anything
// reading as "not loaded yet" (owner feedback, 2026-09-22). That started every reveal
// before its element arrived, so the motion was over by the time it could be seen and
// the site read as static (owner, 2026-09-23). What actually fixed the loading feel was
// ImageReveal never hiding a picture and LazyImage's placeholder surface — both kept —
// so the line can sit inside the viewport again and the motion be seen.

/** The viewport less its lowest eighth: where a scroll reveal counts as on screen. */
export const ACTIVE_ZONE = '0px 0px -12% 0px';

/** The longest a reveal may take to play in, whatever a caller asks for. */
export const IN_S = 0.9;

/** Seconds a reveal takes to play back out. Seen on the way up, so not instant. */
export const OUT_S = 0.45;

/**
 * The longest a scroll reveal may hold before it starts, whatever stagger its caller
 * asks for. A block that arrives at the foot of the screen at the end of a quick scroll
 * has only a few hundred milliseconds before it is read, and a stagger that runs past
 * this (0.18 s, 0.3 s — they add up down a list) left copy still blank on screen when
 * the scrolling stopped. Siblings keep their order: 0, 0.06, 0.12, 0.12 … Page-load
 * choreography (trigger "enter") is not a scroll reveal and keeps its own timing; a
 * SplitReveal's word-to-word stagger is its own and is not capped here either.
 */
export const VIEW_DELAY_MAX_S = 0.12;

/** A scroll reveal's own delay, held to VIEW_DELAY_MAX_S. */
export const viewDelay = (delay: number) => Math.min(Math.max(0, delay), VIEW_DELAY_MAX_S);

/**
 * The CSS transition for a two-way reveal: in over `seconds` (capped at IN_S) after
 * the element's own stagger, out over OUT_S at once (a stagger on the way out only
 * reads as lag). The transition that runs is the one on the new style, so the two
 * never mix.
 */
export function revealTransition(
  shown: boolean,
  properties: string | readonly string[],
  seconds: number,
  delay = 0
): string {
  const length = shown ? Math.min(seconds, IN_S) : Math.min(seconds, OUT_S);
  const wait = shown ? +delay.toFixed(3) : 0;
  return (typeof properties === 'string' ? [properties] : properties)
    .map((property) => `${property} ${length}s ${EASE.expoOut} ${wait}s`)
    .join(', ');
}

type Sighting = (inZone: boolean, entry: IntersectionObserverEntry) => void;

interface Watch {
  observer: IntersectionObserver;
  targets: Map<Element, Set<Sighting>>;
}

/** One IntersectionObserver per (threshold, rootMargin), however many elements use it. */
const watches = new Map<string, Watch>();

/** Float noise in the reported ratio must not make a threshold crossing look short of it. */
const RATIO_SLACK = 1e-3;

/**
 * Low-level: calls `onChange(true)` once `el` shows `threshold` of itself inside the
 * zone and `onChange(false)` once it has left the zone entirely — between the two
 * nothing is reported. That gap is the hysteresis that keeps an element parked on
 * the edge from flickering. Returns the unsubscribe. Needs IntersectionObserver.
 */
export function observeIntersection(
  el: Element,
  { threshold = 0, rootMargin = '0px' }: { threshold?: number; rootMargin?: string },
  onChange: Sighting
): () => void {
  const key = `${threshold}|${rootMargin}`;
  let watch = watches.get(key);
  if (!watch) {
    const targets = new Map<Element, Set<Sighting>>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const inZone = entry.isIntersecting && entry.intersectionRatio + RATIO_SLACK >= threshold;
          // Partly in but short of the threshold: whatever it was, it stays.
          if (!inZone && entry.isIntersecting) continue;
          targets.get(entry.target)?.forEach((sighting) => sighting(inZone, entry));
        }
      },
      // 0 as well as the threshold, so leaving the zone altogether is reported too.
      { threshold: threshold > 0 ? [0, threshold] : [0], rootMargin }
    );
    watch = { observer, targets };
    watches.set(key, watch);
  }

  const { observer, targets } = watch;
  let sightings = targets.get(el);
  if (!sightings) {
    sightings = new Set();
    targets.set(el, sightings);
    observer.observe(el);
  }
  sightings.add(onChange);

  let active = true;
  return () => {
    if (!active) return;
    active = false;
    const current = targets.get(el);
    current?.delete(onChange);
    if (current && current.size === 0) {
      targets.delete(el);
      observer.unobserve(el);
    }
    if (targets.size === 0) {
      observer.disconnect();
      watches.delete(key);
    }
  };
}

/**
 * Where an element stands against the active zone. 'above' means it left (or waits)
 * over the top of the screen: a reveal that slides in uses it to wait on that side,
 * since an offset towards the screen would carry its hidden self back into the zone.
 */
export type ViewPlace = 'in' | 'above' | 'below';

export interface InViewOptions {
  /**
   * Share of the element inside the zone that counts as on screen. Default 0: any
   * part of it. Only for effects that need the element well in view (a count-up).
   */
  threshold?: number;
  /** The zone. Default ACTIVE_ZONE. */
  rootMargin?: string;
  /** Do not observe at all (isStill(), or a load-triggered element). */
  skip?: boolean;
  /**
   * Stay 'in' after the first sighting. Implied inside a [data-enter] element: that
   * belongs to the page-load choreography, which plays once and never on scroll —
   * except data-enter="view", a first-screen block that only borrows the pre-app hold.
   */
  once?: boolean;
}

/**
 * Tracks `ref` in and out of the active zone, every time, on one shared observer.
 * Without IntersectionObserver it is simply 'in'.
 */
export function useViewPlace<T extends Element>(
  ref: RefObject<T>,
  { threshold = 0, rootMargin = ACTIVE_ZONE, skip = false, once = false }: InViewOptions = {}
): ViewPlace {
  const [place, setPlace] = useState<ViewPlace>('below');

  useEffect(() => {
    const el = ref.current;
    if (skip || !el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setPlace('in');
      return;
    }
    const oneShot = once || el.parentElement?.closest('[data-enter]:not([data-enter="view"])') != null;
    // With a threshold: a block taller than the screen can never show half of itself
    // on a phone; a third of a screen of it is on screen enough. Rounded down to a 0.05
    // step, so tall blocks still share a handful of observers rather than one each.
    const height = el.getBoundingClientRect().height;
    const reachable = height > 0 ? (window.innerHeight * 0.35) / height : threshold;
    const level =
      threshold > 0 && reachable < threshold ? Math.max(0.01, Math.floor(reachable * 20) / 20) : threshold;

    const stop = observeIntersection(el, { threshold: level, rootMargin }, (inZone, entry) => {
      if (inZone) {
        setPlace('in');
        if (oneShot) stop();
        return;
      }
      const above = entry.rootBounds !== null && entry.boundingClientRect.bottom <= entry.rootBounds.top;
      setPlace(above ? 'above' : 'below');
    });
    return stop;
  }, [ref, threshold, rootMargin, skip, once]);

  return place;
}

/** True while `ref` is on screen (see useViewPlace), again each time it comes back. */
export function useInView<T extends Element>(ref: RefObject<T>, options: InViewOptions = {}): boolean {
  return useViewPlace(ref, options) === 'in';
}

/**
 * The one "go" signal the reveal primitives share. `ready` is the component's own
 * condition (on screen, or simply mounted for page-load choreography) and the result
 * follows it both ways. The FIRST time only, it also waits for the age gate and a
 * lifting route curtain, and leaves one frame between mount and go so the hidden
 * state has painted and the transition has something to run from. After that a
 * return is immediate: the element has been painted hidden on its way out.
 * Under isStill() it is always true.
 */
export function useReveal(ready: boolean): boolean {
  const [still] = useState(isStill);
  const entered = useEntered();
  const [shown, setShown] = useState(still);
  const played = useRef(false);

  useEffect(() => {
    if (still) return;
    if (!ready) {
      setShown(false);
      return;
    }
    if (played.current) {
      setShown(true);
      return;
    }
    if (!entered) return;
    let frame = 0;
    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(() => {
        played.current = true;
        setShown(true);
      });
    }, entranceHold());
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [still, ready, entered]);

  return still || shown;
}
