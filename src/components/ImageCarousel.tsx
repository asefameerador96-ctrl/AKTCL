import { useEffect, useMemo, useState } from 'react';
import type { FocusEvent, ReactNode } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import LazyImage from '@/components/LazyImage';
import ImageReveal from '@/components/motion/ImageReveal';
import { EASE, isStill } from '@/lib/motion';
import type { SiteImage } from '@/content/images';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: SiteImage[];
  /**
   * Tailwind aspect class(es) for the frame. Default: 4:3 for photography; with
   * `contain`, the first image's own ratio.
   */
  aspect?: string;
  /**
   * true for the product cut-outs: set on the light tile (the ground they were shot
   * on), in a frame of the first cut-out's own ratio so each one fills it edge to edge.
   */
  contain?: boolean;
  /** Rendered width of the frame, for the browser's srcset choice. */
  sizes?: string;
  /** Accessible name of the carousel region. */
  label?: string;
  /**
   * Settles the photograph into its frame as it comes into view (ImageReveal). Never
   * hides it: the first slide is the page's LCP image and paints at once.
   */
  reveal?: boolean;
}

const AUTOPLAY_DELAY = 5000;

// The controls are cells of one ruled strip under the photograph, never over it:
// square, 44px, sharing their hairlines. Hover and keyboard focus invert the cell —
// colour only, nothing moves. The ring is lifted above the neighbouring cells.
const CELL =
  'flex h-11 w-11 shrink-0 items-center justify-center border-l border-border text-foreground transition-colors focus-visible:relative focus-visible:z-10 focus-visible:bg-foreground focus-visible:text-background [@media(hover:hover)]:hover:bg-foreground [@media(hover:hover)]:hover:text-background';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Autoplay is decoration: it is skipped for visitors who ask for reduced motion and
 * in the prerender snapshot, which should always capture the first slide.
 */
const autoplayAllowed = () => !isStill();

interface FrameProps {
  item: SiteImage;
  aspect?: string;
  /** width / height, used when no aspect class is given. */
  ratio?: string;
  contain: boolean;
  sizes: string;
  priority: boolean;
  /** The slide that comes next: fetched ahead, at low priority. */
  eager?: boolean;
}

// Square-cornered on purpose: the frame sits flush against the page's hairlines. Its
// surface (the tile for cut-outs, the page's surface for photography) is what shows
// while a slide's file is still on its way — never a strip of a half-drawn picture.
const Frame = ({ item, aspect, ratio, contain, sizes, priority, eager }: FrameProps) => (
  <div
    className={cn('relative overflow-hidden', aspect, contain ? 'bg-tile' : 'bg-secondary')}
    style={aspect ? undefined : { aspectRatio: ratio }}
  >
    {/* Absolutely placed so the frame, not the file's own ratio, sets the size. Always
        cover, centred: a letterboxed cut-out would show a second tone beside its own
        ground, and read as a picture that has not finished loading. */}
    <LazyImage
      image={item.image}
      alt={item.alt}
      sizes={sizes}
      priority={priority}
      eager={eager}
      className={cn('absolute inset-0 h-full w-full object-cover', contain && 'product-shot')}
      style={{ objectPosition: item.position ?? '50% 50%' }}
    />
  </div>
);

/** The frame's settle, when asked for. */
const Settle = ({ on, children }: { on: boolean; children: ReactNode }) =>
  on ? <ImageReveal>{children}</ImageReveal> : <>{children}</>;

/**
 * Photo carousel for the detail pages: Embla with a 5 s autoplay that stops while
 * the pointer or keyboard focus is inside it, and can be paused outright. Under the
 * frame runs one ruled strip: a mono index ("01 / 04"), then the pause and arrow
 * cells. The strip's top rule doubles as the progress line — a 1px fill of accent
 * that lengthens as the set advances.
 *
 * Every slide is in the DOM from the first render (prerender-safe); <LazyImage>
 * defers the files of the slides that are still clipped out of view.
 */
const ImageCarousel = ({
  images,
  aspect: aspectProp,
  contain = false,
  sizes = '(min-width: 1280px) 576px, (min-width: 768px) 50vw, calc(100vw - 32px)',
  label = 'Image gallery',
  reveal = false,
}: ImageCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [allowed] = useState(autoplayAllowed);
  const [paused, setPaused] = useState(false);

  const playing = allowed && !paused && images.length > 1;

  // The cut-outs sit on an off-white sweep, so any letterboxing shows as a hairline
  // of tile beside the picture. Left to itself the frame therefore takes the first
  // image's exact ratio and every slide meets it edge to edge.
  const first = images[0]?.image.img;
  const aspect = aspectProp ?? (contain ? undefined : 'aspect-[4/3]');
  const ratio = first ? `${first.w} / ${first.h}` : undefined;
  const frame = { aspect, ratio, contain, sizes };

  // With stopOnInteraction off the plugin restarts itself on mouseleave, so a
  // visitor's explicit pause is honoured by removing the plugin altogether
  // (Embla re-initialises on the current slide).
  const plugins = useMemo(
    () =>
      playing
        ? [
            Autoplay({
              delay: AUTOPLAY_DELAY,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
              // Hovering the controls counts as hovering the carousel.
              rootNode: (emblaRoot) =>
                emblaRoot.closest<HTMLElement>('[aria-roledescription="carousel"]'),
            }),
          ]
        : [],
    [playing]
  );

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <Settle on={reveal}>
        <Frame item={images[0]} {...frame} priority />
      </Settle>
    );
  }

  // The plugin's own focus handling only watches the slides, which hold nothing
  // focusable — the controls do, so focus is tracked on the whole region.
  const stopForFocus = () => api?.plugins().autoplay?.stop();
  const resumeAfterFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) api?.plugins().autoplay?.play();
  };

  return (
    <Carousel
      setApi={setApi}
      // duration: Embla's scroll is a spring, not a curve; 32 gives it the same
      // unhurried settle as the site's expo-out.
      opts={{ loop: true, align: 'start', duration: 32 }}
      plugins={plugins}
      aria-label={label}
      onFocusCapture={stopForFocus}
      onBlurCapture={resumeAfterFocus}
      className="w-full"
    >
      <Settle on={reveal}>
        <div data-cursor="drag" className="cursor-grab active:cursor-grabbing">
          <CarouselContent>
            {images.map((item, i) => (
              <CarouselItem key={item.image.img.src} aria-label={`${i + 1} of ${images.length}`}>
                {/* Embla's viewport clips the waiting slides out of LazyImage's sight,
                    so the one after the current slide is asked for ahead of time. */}
                <Frame
                  item={item}
                  {...frame}
                  priority={i === 0}
                  eager={i === (selected + 1) % images.length}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Settle>

      <div className="relative flex items-stretch border-b border-border">
        {/* Progress through the set, drawn on the strip's top rule. Decorative: the
            index beside it says the same. */}
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border">
          <span
            className="absolute inset-0 origin-left bg-accent"
            style={{
              transform: `scaleX(${(selected + 1) / images.length})`,
              transition: `transform 0.9s ${EASE.expoOut}`,
            }}
          />
        </span>

        {/* The position is information (which photograph, of how many), so it stays.
            Seen only: each slide already says "2 of 4" to a screen reader, and a hidden
            twin here would turn up in copied text as "Image 2 of 4 02 / 04". */}
        <p aria-hidden="true" className="index-num flex items-center pr-4 leading-normal">
          <span className="text-foreground">{pad(selected + 1)}</span> / {pad(images.length)}
        </p>

        <div className="ml-auto flex">
          {allowed && (
            <button
              type="button"
              // A toggle like the hero's and the marquee's: one name, the state in aria-pressed.
              aria-label="Pause slideshow"
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
              className={CELL}
            >
              {paused ? (
                <Play strokeWidth={1.5} className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Pause strokeWidth={1.5} className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          )}
          <button type="button" aria-label="Previous image" onClick={() => api?.scrollPrev()} className={CELL}>
            <ArrowLeft strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next image" onClick={() => api?.scrollNext()} className={CELL}>
            <ArrowRight strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Carousel>
  );
};

export default ImageCarousel;
