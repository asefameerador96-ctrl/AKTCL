import { cn } from '@/lib/utils';
import { site } from '@/content/site';

/*
 * TODO(Asef): AKTCL supplied no logo file. This typographic lockup is a stand-in.
 * When the official logo arrives (SVG preferred, one version for light surfaces and
 * one for dark), replace the markup below — the props and every call site can stay
 * as they are. public/favicon.svg is a placeholder for the same reason.
 */

export interface LogoProps {
  /**
   * onDark  — always-dark surfaces: bg-ink bands, photography.
   * onLight — always-light surfaces: bg-tile.
   * auto    — themed surfaces (bg-background, bg-card); follows light/dark mode.
   */
  variant?: 'onDark' | 'onLight' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TONE: Record<NonNullable<LogoProps['variant']>, { mark: string; name: string }> = {
  onDark: { mark: 'text-ink-foreground', name: 'text-ink-muted' },
  onLight: { mark: 'text-tile-foreground', name: 'text-tile-foreground/70' },
  auto: { mark: 'text-foreground', name: 'text-muted-foreground' },
};

const SIZE: Record<NonNullable<LogoProps['size']>, { gap: string; mark: string; name: string }> = {
  // sm is sized so the full lockup still fits beside the menu controls at 360px.
  sm: { gap: 'gap-1', mark: 'text-2xl', name: 'text-[9px] tracking-[0.2em]' },
  md: { gap: 'gap-1.5', mark: 'text-4xl', name: 'text-[11px] tracking-[0.24em]' },
  lg: { gap: 'gap-2', mark: 'text-6xl', name: 'text-xs tracking-[0.3em] sm:text-sm' },
};

const Logo = ({ variant = 'auto', size = 'md', className }: LogoProps) => {
  const tone = TONE[variant];
  const scale = SIZE[size];

  return (
    <span className={cn('inline-flex flex-col items-start', scale.gap, className)}>
      <span
        className={cn(
          'font-display font-semibold leading-none tracking-[0.08em] transition-colors duration-300',
          scale.mark,
          tone.mark
        )}
        // Same sober Fraunces settings the headings get in index.css.
        style={{ fontVariationSettings: "'SOFT' 0, 'WONK' 0" }}
      >
        {site.shortName}
      </span>
      <span aria-hidden="true" className="h-px w-full bg-gold/70" />
      <span
        className={cn(
          'whitespace-nowrap font-sans font-medium uppercase leading-none transition-colors duration-300',
          scale.name,
          tone.name
        )}
      >
        {site.name}
      </span>
    </span>
  );
};

export default Logo;
