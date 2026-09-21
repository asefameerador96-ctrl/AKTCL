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
  /** Surface styling (glass over the hero and on the ink menu, solid elsewhere). */
  className?: string;
}

const ICON = 'absolute h-[18px] w-[18px] transition-[transform,opacity] duration-500 ease-expo-out';

const ThemeToggle = ({ isDark, onToggle, className }: ThemeToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    // A pressed-state button keeps one fixed name; aria-pressed carries the state.
    aria-label="Dark theme"
    aria-pressed={isDark}
    title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    className={cn(
      'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border backdrop-blur-xl transition-colors duration-300',
      'border-border bg-card/60 text-foreground hover:border-accent/50 hover:text-accent',
      className
    )}
  >
    {/* Both icons stay mounted and trade places with a quarter turn; the one at rest
        is the theme a press switches to. */}
    <Sun
      aria-hidden="true"
      strokeWidth={1.75}
      className={cn(ICON, isDark ? 'opacity-100' : '-rotate-90 scale-50 opacity-0')}
    />
    <Moon
      aria-hidden="true"
      strokeWidth={1.75}
      className={cn(ICON, isDark ? 'rotate-90 scale-50 opacity-0' : 'opacity-100')}
    />
  </button>
);

export default ThemeToggle;
