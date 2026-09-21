import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  /**
   * Controlled: the navbar calls useTheme() once and hands the same state to the
   * toggle in the bar and the one in the mobile menu. Every useTheme() call keeps its
   * own state, so two self-driven toggles would drift out of step with each other.
   */
  isDark: boolean;
  onToggle: () => void;
  /** true over photography and on the ink menu sheet: chalk hairline, sage focus ring. */
  onInk?: boolean;
  /** Layout only (display, size). The surface comes from `onInk`. */
  className?: string;
}

const ICON = 'absolute h-[18px] w-[18px] transition-[transform,opacity] duration-300 ease-expo-out';

/**
 * A square hairline cell, the same outline button as everywhere else (.btn-outline /
 * .btn-outline-ink in index.css): no fill, no glass, and hover only darkens the border.
 */
const ThemeToggle = ({ isDark, onToggle, onInk = false, className }: ThemeToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    // A pressed-state button keeps one fixed name; aria-pressed carries the state.
    aria-label="Dark theme"
    aria-pressed={isDark}
    title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    className={cn('btn btn-icon relative shrink-0', onInk ? 'btn-outline-ink focus-ink' : 'btn-outline', className)}
  >
    {/* Both icons stay mounted and trade places with a quarter turn; the one at rest
        is the theme a press switches to. */}
    <Sun
      aria-hidden="true"
      strokeWidth={1.5}
      className={cn(ICON, isDark ? 'opacity-100' : '-rotate-90 scale-50 opacity-0')}
    />
    <Moon
      aria-hidden="true"
      strokeWidth={1.5}
      className={cn(ICON, isDark ? 'rotate-90 scale-50 opacity-0' : 'opacity-100')}
    />
  </button>
);

export default ThemeToggle;
