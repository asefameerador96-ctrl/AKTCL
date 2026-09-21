import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import ImageReveal from '@/components/motion/ImageReveal';
import { cn } from '@/lib/utils';
import type { SiteImage } from '@/content/images';

export interface ProductCardProps {
  /** Internal link target; when omitted the card is not a link (no detail page). */
  to?: string;
  image: SiteImage;
  name: string;
  short: string;
  /** Small label beside the number, e.g. "Category 01" or "Leaf Tobacco". */
  eyebrow?: string;
  /** Link text for assistive tech (the arrow stands in for it on screen). Default "Know More". */
  cta?: string;
  /** Position in the grid. Only its column matters: cards reveal left to right, row by row. */
  index?: number;
  /** Catalogue number printed above the name ("01"). Left out, no number is shown. */
  number?: number;
  /** "portrait" 3:4 (default, matches the product cut-outs) or "landscape" 4:3. */
  aspect?: 'portrait' | 'landscape';
}

// `sizes` assumes the grids these cards are used in: portrait cards run 2-up on
// phones and 4-up on desktop, landscape cards 1-up and 3-up.
const FRAME = {
  portrait: {
    ratio: 'aspect-[3/4]',
    sizes: '(max-width: 1024px) 50vw, 320px',
  },
  landscape: {
    ratio: 'aspect-[4/3]',
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 420px',
  },
} as const;

/** The widest grid these cards sit in; the stagger restarts on every row of it. */
const COLUMNS = 4;
const STAGGER_S = 0.07;

/**
 * Catalogue entry: the cut-out on its tile, then number, rule and name — no box. A
 * linked card lifts a few pixels, its rule is swept in gold and the name is
 * underlined; the cursor ring reads "View".
 */
const ProductCard = ({
  to,
  image,
  name,
  short,
  eyebrow,
  cta = 'Know More',
  index = 0,
  number,
  aspect = 'portrait',
}: ProductCardProps) => {
  const id = useId();
  const nameId = `${id}-name`;
  const shortId = `${id}-short`;
  const ctaId = `${id}-cta`;
  const frame = FRAME[aspect];
  const delay = (index % COLUMNS) * STAGGER_S;

  // The cut-outs are shot 3:4 on an off-white sweep, so any letterboxing shows a
  // seam against the tile. A photo whose orientation matches the frame fills it
  // (nothing meaningful is cropped); a mismatched one is shown whole, inset.
  const { w, h } = image.image.img;
  const fillsFrame = (h >= w) === (aspect === 'portrait');

  const body = (
    // The lift is on this inner box, not the link: a link that moves out from under
    // the pointer flickers at its bottom edge.
    <div
      className={cn(
        'flex h-full flex-col',
        to && 'transition-transform duration-700 ease-expo-out motion-safe:group-hover:-translate-y-1.5 motion-safe:group-focus-visible:-translate-y-1.5'
      )}
    >
      {/* The soft shadow is painted once and only faded in — box-shadow itself never animates. */}
      <div
        className={cn(
          'relative after:pointer-events-none after:absolute after:inset-0 after:rounded-sm after:opacity-0 after:shadow-2xl after:shadow-ink/25 after:transition-opacity after:duration-700 after:ease-expo-out',
          to && 'group-hover:after:opacity-100 group-focus-visible:after:opacity-100'
        )}
      >
        <ImageReveal delay={delay} className={cn('rounded-sm', frame.ratio)}>
          {/* The tile rides inside the reveal, so the cut-out keeps multiplying into it while the frame opens. */}
          <div className="absolute inset-0 bg-tile">
            <LazyImage
              image={image.image}
              alt={image.alt}
              sizes={frame.sizes}
              className={cn(
                'product-shot absolute inset-0 h-full w-full transition-transform [transition-duration:1200ms] ease-expo-out',
                fillsFrame ? 'object-cover' : 'object-contain p-4 md:p-6',
                to && 'motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04]'
              )}
              style={{ objectPosition: image.position }}
            />
          </div>
        </ImageReveal>
      </div>

      <Reveal delay={delay + 0.12} className="flex flex-1 flex-col pt-4 sm:pt-5">
        <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
          {number !== undefined && <span className="tabular-nums">{String(number).padStart(2, '0')}</span>}
          {eyebrow && <span className="truncate">{eyebrow}</span>}
          <span aria-hidden="true" className="relative h-px min-w-4 flex-1 bg-border">
            {to && (
              <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-700 ease-expo-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
            )}
          </span>
          {to && (
            <ArrowRight
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 transition-transform duration-500 ease-expo-out group-hover:translate-x-1"
            />
          )}
        </div>
        <h3
          id={nameId}
          className="mt-3 text-lg font-medium leading-snug tracking-[-0.01em] text-foreground sm:text-xl md:text-2xl"
        >
          {to ? (
            <span className="link-underline pb-0.5 group-hover:[background-position:0%_100%] group-hover:[background-size:100%_1px] group-focus-visible:[background-position:0%_100%] group-focus-visible:[background-size:100%_1px]">
              {name}
            </span>
          ) : (
            name
          )}
        </h3>
        {/* Linked cards sit 2-up on phones; the full text is one tap away, so clamp there. */}
        <p
          id={shortId}
          className={cn('mt-2 text-sm leading-relaxed text-muted-foreground', to && 'line-clamp-4 sm:line-clamp-none')}
        >
          {short}
        </p>
        {to && (
          <span id={ctaId} className="sr-only">
            {cta}
          </span>
        )}
      </Reveal>
    </div>
  );

  return (
    <article className="h-full">
      {to ? (
        <Link
          to={to}
          // Name the link by the product and its CTA, not the whole card's text.
          aria-labelledby={`${nameId} ${ctaId}`}
          aria-describedby={shortId}
          data-cursor="view"
          data-lead={to.startsWith('/contact') ? 'product-card-enquiry' : undefined}
          className="group block h-full rounded-sm"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </article>
  );
};

export default ProductCard;
