import { useEffect, useMemo, useState } from 'react';
import type { FocusEvent } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Pause, Play } from 'lucide-react';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import LazyImage from '@/components/LazyImage';
import { prefersReducedMotion } from '@/hooks/useMediaQuery';
import type { SiteImage } from '@/content/images';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: SiteImage[];
  /**
   * Tailwind aspect class(es) for the frame. Default: 4:3 (5:4 from md) for
   * photography; with `contain`, the first image's own ratio.
   */
  aspect?: string;
  /**
   * true for the product cut-outs: shown whole on the light tile, never cropped to
   * the frame the way photography is.
   */
  contain?: boolean;
  /** Rendered width of the frame, for the browser's srcset choice. */
  sizes?: string;
  /** Accessible name of the carousel region. */
  label?: string;
}

const AUTOPLAY_DELAY = 5000;

const ARROW_CLASS =
  'top-1/2 h-11 w-11 -translate-y-1/2 border-border bg-background/80 text-foreground backdrop-blur-sm hover:bg-background hover:text-foreground';

/**
 * Autoplay is decoration: it is skipped for visitors who ask for reduced motion and
 * in the prerender snapshot, which should always capture the first slide.
 */
const autoplayAllowed = () => !window.__PRERENDER__ && !prefersReducedMotion();

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

const Frame = ({ item, aspect, ratio, contain, sizes, priority, eager }: FrameProps) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-lg',
      aspect,
      contain ? 'bg-tile' : 'bg-secondary'
    )}
    style={aspect ? undefined : { aspectRatio: ratio }}
  >
    {/* Absolutely placed so the frame, not the file's own ratio, sets the size. */}
    <LazyImage
      image={item.image}
      alt={item.alt}
      sizes={sizes}
      priority={priority}
      eager={eager}
      className={cn(
        'absolute inset-0 h-full w-full',
        contain && 'product-shot',
        // A cut-out in a frame of a different shape is letterboxed, not cropped.
        contain && aspect ? 'object-contain' : 'object-cover'
      )}
      style={contain ? undefined : { objectPosition: item.position }}
    />
  </div>
);

/**
 * Photo carousel for the detail pages: Embla with a 5 s autoplay that stops while
 * the pointer or keyboard focus is inside it, and can be paused outright.
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
  const aspect = aspectProp ?? (contain ? undefined : 'aspect-[4/3] md:aspect-[5/4]');
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
              // Hovering the arrows or the dots counts as hovering the carousel.
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
    return <Frame item={images[0]} {...frame} priority />;
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
      opts={{ loop: true, align: 'start' }}
      plugins={plugins}
      aria-label={label}
      onFocusCapture={stopForFocus}
      onBlurCapture={resumeAfterFocus}
      className="w-full"
    >
      <div className="relative">
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
        <CarouselPrevious aria-label="Previous image" className={cn('left-3', ARROW_CLASS)} />
        <CarouselNext aria-label="Next image" className={cn('right-3', ARROW_CLASS)} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div role="group" aria-label="Choose image" className="flex flex-wrap items-center">
          {images.map((item, i) => (
            <button
              key={item.image.img.src}
              type="button"
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === selected ? 'true' : undefined}
              onClick={() => api?.scrollTo(i)}
              // A 44px hit area around a hairline; bars start flush with the photo's edge.
              className="group flex h-11 w-11 items-center rounded-sm md:w-10"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'w-7 rounded-full transition-colors duration-300',
                  i === selected
                    ? 'h-0.5 bg-accent'
                    : 'h-px bg-foreground/50 group-hover:bg-foreground'
                )}
              />
            </button>
          ))}
        </div>

        {allowed && (
          <button
            type="button"
            aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
            onClick={() => setPaused((p) => !p)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          >
            {paused ? (
              <Play className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Pause className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </Carousel>
  );
};

export default ImageCarousel;
