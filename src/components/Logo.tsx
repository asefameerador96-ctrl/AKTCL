import { cn } from '@/lib/utils';
import { site } from '@/content/site';

/*
 * TODO(Asef): AKTCL supplied no logo file. This typographic lockup is a stand-in.
 * When the official logo arrives (SVG preferred, one version for light surfaces and
 * one for dark), replace the markup below — the props and every call site can stay
 * as they are. public/favicon.svg is a placeholder for the same reason, and the
 * "mark" variant here redraws it.
 */

export interface LogoProps {
  /**
   * onDark  — always-dark surfaces: bg-ink bands, photography.
   * onLight — always-light surfaces: bg-tile.
   * auto    — themed surfaces (bg-background, bg-card); follows light/dark mode.
   * mark    — the A-monogram alone, for the age gate and the route curtain. Drawn in
   *           currentColor, so the caller sets the colour (className="text-gold").
   */
  variant?: 'onDark' | 'onLight' | 'auto' | 'mark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type Tone = Exclude<NonNullable<LogoProps['variant']>, 'mark'>;

const TONE: Record<Tone, { mark: string; name: string }> = {
  onDark: { mark: 'text-ink-foreground', name: 'text-ink-muted' },
  onLight: { mark: 'text-tile-foreground', name: 'text-tile-foreground/70' },
  auto: { mark: 'text-foreground', name: 'text-muted-foreground' },
};

// Each tracking value comes with the same negative right margin: letter-spacing also
// follows the last letter, and that stray gap would push the gold rule past the type.
const SIZE: Record<NonNullable<LogoProps['size']>, { gap: string; mark: string; name: string; monogram: string }> = {
  // sm is sized so the full lockup still fits beside the menu button at 360px.
  sm: {
    gap: 'gap-[5px]',
    mark: 'text-[1.625rem]',
    name: 'text-[9px] tracking-[0.22em] -mr-[0.22em]',
    monogram: 'h-7 w-7',
  },
  md: {
    gap: 'gap-[7px]',
    mark: 'text-[2.5rem]',
    name: 'text-[11px] tracking-[0.26em] -mr-[0.26em]',
    monogram: 'h-11 w-11',
  },
  lg: {
    gap: 'gap-2.5',
    mark: 'text-6xl',
    name: 'text-xs tracking-[0.3em] -mr-[0.3em] sm:text-sm',
    monogram: 'h-16 w-16',
  },
};

const Logo = ({ variant = 'auto', size = 'md', className }: LogoProps) => {
  const scale = SIZE[size];

  if (variant === 'mark') {
    return (
      // Decorative wherever it is used: the name is in text beside it, or the whole
      // surface (the curtain) is hidden from assistive tech.
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
        focusable="false"
        className={cn('shrink-0', scale.monogram, className)}
      >
        <circle cx="32" cy="32" r="30.5" strokeWidth="1" opacity="0.45" />
        {/* The favicon's strokes, a little lighter: they no longer have to survive 16px. */}
        <g strokeWidth="3.5" strokeLinecap="square" strokeMiterlimit="8">
          <path d="M19.5 47 32 18.5 44.5 47" />
          <path d="M25 37.5h14" />
        </g>
      </svg>
    );
  }

  const tone = TONE[variant];

  return (
    <span className={cn('inline-flex flex-col items-start', scale.gap, className)}>
      <span
        className={cn(
          '-mr-[0.06em] font-display font-medium leading-none tracking-[0.06em] transition-colors duration-300',
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
