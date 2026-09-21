import { useId } from 'react';
import { Link } from 'react-router-dom';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { TravelArrow } from '@/components/Ruled';
import ImageReveal from '@/components/motion/ImageReveal';
import { cn } from '@/lib/utils';
import type { SiteImage } from '@/content/images';

export interface ProductCardProps {
  /** Internal link target; when omitted the card is not a link (no detail page). */
  to?: string;
  image: SiteImage;
  name: string;
  short: string;
  /** Small mono label above the name, e.g. "Leaf Tobacco". */
  eyebrow?: string;
  /** Link text for assistive tech (the arrow stands in for it on screen). Default "Know More". */
  cta?: string;
  /** Position in the grid. Only its column matters: cards reveal left to right, row by row. */
  index?: number;
  /** "portrait" 3:4 (default, matches the product cut-outs) or "landscape" 4:3. */
  aspect?: 'portrait' | 'landscape';
}

// `sizes` assumes the grids these cells are used in: portrait cells run 2-up on
// phones and 4-up on desktop, landscape cells 1-up and 3-up.
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

/** The widest grid these cells sit in; the stagger restarts on every row of it. */
const COLUMNS = 4;
const STAGGER_S = 0.07;

/**
 * Catalogue CELL. It draws no border, radius or shadow of its own: it is made to sit
 * in a gap-less `.hairline-grid` (index.css), whose cells share their 1px rules. The
 * cut-out's tile runs flush to those rules; one hairline rules the caption off, and
 * the caption carries the cell's only padding.
 *
 * Linked cells answer hover and keyboard focus the same way: the tile darkens a few
 * per cent, the arrow comes in and the name's underline is drawn. Nothing lifts or
 * scales. The cursor ring reads "View".
 */
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
  const delay = (index % COLUMNS) * STAGGER_S;

  // The cut-outs are shot 3:4 on an off-white sweep, so any letterboxing shows a
  // seam against the tile. A photo whose orientation matches the frame fills it
  // (nothing meaningful is cropped); a mismatched one is shown whole, inset.
  const { w, h } = image.image.img;
  const fillsFrame = (h >= w) === (aspect === 'portrait');

  const body = (
    <div className="flex h-full flex-col">
      <ImageReveal delay={delay} className={frame.ratio}>
        {/* The tile rides inside the reveal, so the cut-out keeps multiplying into it while the frame opens. */}
        <div className="absolute inset-0 bg-tile">
          <LazyImage
            image={image.image}
            alt={image.alt}
            sizes={frame.sizes}
            className={cn(
              'product-shot absolute inset-0 h-full w-full',
              fillsFrame ? 'object-cover' : 'object-contain p-4 md:p-6'
            )}
            style={{ objectPosition: image.position }}
          />
          {to && (
            // The hover: the tile's own ink at 4%, over the cut-out. Opacity only.
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-tile-foreground opacity-0 transition-opacity group-hover:opacity-[0.04] group-focus-visible:opacity-[0.04]"
            />
          )}
        </div>
      </ImageReveal>

      <Reveal
        delay={delay + 0.12}
        className="relative flex flex-1 flex-col border-t border-border px-3.5 pb-6 pt-4 sm:px-5 sm:pb-7 sm:pt-5"
      >
        {to && <TravelArrow mode="in" className="absolute right-3.5 top-4 text-foreground sm:right-5 sm:top-5" />}
        {eyebrow && <p className="eyebrow truncate pr-8">{eyebrow}</p>}
        <h3 id={nameId} className={cn('display-xs text-foreground', eyebrow ? 'mt-4 sm:mt-5' : to && 'pr-8')}>
          {to ? (
            <span className="link-underline pb-0.5 group-hover:[background-position:0%_100%] group-hover:[background-size:100%_1px] group-focus-visible:[background-position:0%_100%] group-focus-visible:[background-size:100%_1px]">
              {name}
            </span>
          ) : (
            name
          )}
        </h3>
        {/* A linked cell keeps its grid even: three lines, the full text being one step away on
            the product's page. Two-up on a phone the measure is ~130px — too narrow to read
            a sentence in — so there the cell is image and name (the line stays in the DOM,
            and still describes the link to assistive tech). */}
        <p
          id={shortId}
          className={cn(
            'mt-3 text-base leading-relaxed text-muted-foreground',
            to && 'line-clamp-3',
            to && aspect === 'portrait' && 'max-sm:hidden'
          )}
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
          // Raised while focused: the ring is drawn outside the cell, over its neighbours' tiles.
          className="group relative block h-full focus-visible:z-10"
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
