import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { cn } from '@/lib/utils';
import type { SiteImage } from '@/content/images';

export interface ProductCardProps {
  /** Internal link target; when omitted the card is not a link (no detail page). */
  to?: string;
  image: SiteImage;
  name: string;
  short: string;
  /** Small label above the name, e.g. "Category 01" or "Leaf Tobacco". */
  eyebrow?: string;
  /** Link text. Default "Know More". */
  cta?: string;
  /** Stagger index for the reveal animation. */
  index?: number;
  /** "portrait" 3:4 (default, matches the product cut-outs) or "landscape" 4:3. */
  aspect?: 'portrait' | 'landscape';
}

// `sizes` assumes the grids these cards are used in: portrait cards run 2-up on
// phones and 4-up on desktop, landscape cards 1-up and 3-up.
const FRAME = {
  portrait: {
    ratio: 'aspect-[3/4]',
    sizes: '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 320px',
  },
  landscape: {
    ratio: 'aspect-[4/3]',
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 420px',
  },
} as const;

const ProductCard = ({
  to,
  image,
  name,
  short,
  eyebrow,
  cta = 'Know More',
  index = 0,
  aspect = 'portrait',
}: ProductCardProps) => {
  const id = useId();
  const nameId = `${id}-name`;
  const shortId = `${id}-short`;
  const ctaId = `${id}-cta`;
  const frame = FRAME[aspect];

  // The cut-outs are shot 3:4 on an off-white sweep, so any letterboxing shows a
  // seam against the tile. A photo whose orientation matches the frame fills it
  // (nothing meaningful is cropped); a mismatched one is shown whole, inset.
  const { w, h } = image.image.img;
  const fillsFrame = (h >= w) === (aspect === 'portrait');

  const body = (
    <>
      <div className={cn('relative overflow-hidden bg-tile', frame.ratio)}>
        <LazyImage
          image={image.image}
          alt={image.alt}
          sizes={frame.sizes}
          className={cn(
            'product-shot absolute inset-0 h-full w-full transition-transform duration-700 ease-out',
            fillsFrame ? 'object-cover' : 'object-contain p-4 md:p-6',
            to && 'motion-safe:group-hover:scale-105 motion-safe:group-focus-within:scale-105'
          )}
          style={{ objectPosition: image.position }}
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5 md:p-6">
        {eyebrow && <p className="eyebrow text-[10px] sm:text-[11px]">{eyebrow}</p>}
        <h3
          id={nameId}
          className="mt-2 font-display text-lg font-medium leading-snug text-foreground sm:text-xl md:text-2xl"
        >
          {name}
        </h3>
        {/* Linked cards sit 2-up on phones; the full text is one tap away, so clamp there. */}
        <p
          id={shortId}
          className={cn(
            'mt-2 text-sm leading-relaxed text-muted-foreground',
            to && 'line-clamp-4 sm:line-clamp-none'
          )}
        >
          {short}
        </p>
        {to && (
          <span
            id={ctaId}
            className={cn(
              'mt-auto inline-flex items-center gap-2 pt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-accent transition-all duration-500',
              // Revealed on hover or keyboard focus; always shown where there is no hover.
              '[@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0',
              'group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'
            )}
          >
            {cta}
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </>
  );

  return (
    <Reveal as="article" delay={index * 0.08} className="h-full">
      {to ? (
        <Link
          to={to}
          // Name the link by the product and its CTA, not the whole card's text.
          aria-labelledby={`${nameId} ${ctaId}`}
          aria-describedby={shortId}
          data-lead={to.startsWith('/contact') ? 'product-card-enquiry' : undefined}
          className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 motion-safe:hover:-translate-y-1"
        >
          {body}
        </Link>
      ) : (
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
          {body}
        </div>
      )}
    </Reveal>
  );
};

export default ProductCard;
