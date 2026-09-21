import { useEffect, useState } from 'react';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

const matches = (query: string) =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(query).matches;

/**
 * One-off read, for decisions taken once per mount (autoplay, count-ups). Motion that
 * has to follow a change of the setting while the page is open uses the hook below.
 */
export const prefersReducedMotion = () => matches(REDUCED_MOTION);

/** Live media query: re-renders when the answer changes (rotation, resize, OS setting). */
export function useMediaQuery(query: string) {
  const [value, setValue] = useState(() => matches(query));

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const onChange = () => setValue(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return value;
}

export const usePrefersReducedMotion = () => useMediaQuery(REDUCED_MOTION);
