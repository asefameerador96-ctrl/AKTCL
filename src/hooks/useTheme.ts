import { useState, useEffect } from 'react';

const STORAGE_KEY = 'theme';

// Storage can throw, not just return null: Chrome with "block all cookies" and some
// in-app webviews raise a SecurityError on any localStorage access. The toggle sits
// in the navbar, so an uncaught throw here would take every page down with it.
const readSaved = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    // index.html applies the saved theme before first paint; trust that first.
    return document.documentElement.classList.contains('dark') || readSaved() === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      window.localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Not remembered; the choice still holds for this visit.
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((d) => !d) };
};
