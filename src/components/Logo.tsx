import { cn } from '@/lib/utils';
import { site } from '@/content/site';
import LogoMark from '@/components/LogoMark';

/*
 * The brand lockup: the official AKT monogram (LogoMark) beside the company name.
 * The supplied artwork is the monogram only and is single-colour, so the name is set
 * in the site's own type and the mark takes the surface's text colour. If AKTCL
 * issues a full lockup or brand colours later, change this file and LogoMark — the
 * props and every call site can stay as they are.
 */

export interface LogoProps {
  /**
   * onDark  — always-dark surfaces: bg-ink bands, photography.
   * onLight — always-light surfaces: bg-tile.
   * auto    — themed surfaces (bg-background, bg-card); follows light/dark mode.
   */
  variant?: 'onDark' | 'onLight' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  /** Show the company name beside the mark. Default true. */
  withName?: boolean;
  className?: string;
}

const TONE: Record<NonNullable<LogoProps['variant']>, { mark: string; name: string }> = {
  onDark: { mark: 'text-ink-foreground', name: 'text-ink-muted' },
  onLight: { mark: 'text-tile-foreground', name: 'text-tile-foreground/70' },
  auto: { mark: 'text-foreground', name: 'text-muted-foreground' },
};

const SIZE: Record<
  NonNullable<LogoProps['size']>,
  { gap: string; mark: string; rule: string; name: string }
> = {
  // sm is sized so the full lockup still fits beside the menu controls at 360px.
  sm: { gap: 'gap-2.5', mark: 'w-[46px]', rule: 'h-7', name: 'text-[8.5px] tracking-[0.18em]' },
  md: { gap: 'gap-3', mark: 'w-[60px]', rule: 'h-9', name: 'text-[10px] tracking-[0.22em]' },
  lg: { gap: 'gap-4', mark: 'w-[104px]', rule: 'h-14', name: 'text-xs tracking-[0.26em] sm:text-sm' },
};

/** "Abul Khair" / "Tobacco Co. Ltd." — two even lines that sit the height of the mark. */
function splitName(name: string): [string, string] {
  const words = name.split(' ');
  return [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
}

const Logo = ({ variant = 'auto', size = 'md', withName = true, className }: LogoProps) => {
  const tone = TONE[variant];
  const scale = SIZE[size];
  const [first, second] = splitName(site.name);

  return (
    <span className={cn('inline-flex items-center', scale.gap, className)}>
      <LogoMark
        // Beside the written name the mark is decorative; alone it has to say who it is.
        title={withName ? undefined : site.name}
        className={cn('shrink-0 transition-colors duration-300', scale.mark, tone.mark)}
      />
      {withName && (
        <>
          <span aria-hidden="true" className={cn('w-px shrink-0 bg-gold/70', scale.rule)} />
          <span
            className={cn(
              'flex flex-col gap-[0.45em] whitespace-nowrap font-sans font-semibold uppercase leading-none transition-colors duration-300',
              scale.name,
              tone.name
            )}
          >
            <span>{first}</span>
            <span>{second}</span>
          </span>
        </>
      )}
    </span>
  );
};

export default Logo;
