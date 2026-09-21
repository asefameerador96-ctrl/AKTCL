import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  /** Surface styling (glass over the hero, solid elsewhere) comes from the navbar. */
  className?: string;
}

/**
 * Mount this once per page: every useTheme() call keeps its own state, so two
 * toggles on screen would drift out of step with each other.
 */
const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { isDark, toggle } = useTheme();
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      // A pressed-state button keeps one fixed name; aria-pressed carries the state.
      aria-label="Dark theme"
      aria-pressed={isDark}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border backdrop-blur-xl transition-colors duration-300',
        'border-border bg-card/60 text-foreground hover:border-accent/50 hover:text-accent',
        className
      )}
    >
      <Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </button>
  );
};

export default ThemeToggle;
