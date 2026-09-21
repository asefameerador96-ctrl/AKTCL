import { useEffect, useMemo, useState } from 'react';
import type { FocusEvent, ReactNode } from 'react';
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
import ImageReveal from '@/components/motion/ImageReveal';
import { EASE, isStill } from '@/lib/motion';
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
  /**
   * Unmasks the frame the first time it is seen (ImageReveal). For a carousel in the
   * first screen: the frame is marked data-enter, so the prerendered photograph is
   * not painted, dropped and then revealed — it arrives once.
   */
  reveal?: boolean;
}

const AUTOPLAY_DELAY = 5000;

// Round controls under the photograph, never over it. The fill rises from the foot of
// the button on hover; the icon and border turn with it. `relative` also overrides the
// absolute placement CarouselPrevious/Next carry for the over-the-image layout.
const CONTROL = [
  'relative isolate left-auto right-auto top-auto h-11 w-11 shrink-0 translate-y-0 overflow-hidden rounded-full',
  'border border-foreground/25 bg-transparent text-foreground transition-colors duration-500 ease-expo-out',
  'hover:border-foreground hover:bg-transparent hover:text-background disabled:opacity-30',
  'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-full before:bg-foreground',
  'before:transition-transform before:duration-500 before:ease-expo-out hover:before:scale-y-100',
].join(' ');

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

const Frame = ({ item, aspect, ratio, contain, sizes, priority, eager }: FrameProps) => (
  <div
    className={cn('relative overflow-hidden rounded-lg', aspect, contain ? 'bg-tile' : 'bg-secondary')}
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

/** The frame's entrance, when asked for. The mask takes the frame's own rounding. */
const Unmask = ({ on, children }: { on: boolean; children: ReactNode }) =>
  on ? (
    <div data-enter="">
      <ImageReveal className="rounded-lg">{children}</ImageReveal>
    </div>
  ) : (
    <>{children}</>
  );

/**
 * Photo carousel for the detail pages: Embla with a 5 s autoplay that stops while
 * the pointer or keyboard focus is inside it, and can be paused outright. Under the
 * frame sit a numbered index ("01 / 04"), a hairline that fills as the set advances,
 * and the controls.
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
      <Unmask on={reveal}>
        <Frame item={images[0]} {...frame} priority />
      </Unmask>
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
      <Unmask on={reveal}>
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
      </Unmask>

      <div className="mt-4 flex items-center gap-3 sm:gap-5">
        <p className="shrink-0 font-display text-base tabular-nums text-foreground">
          <span className="sr-only">
            Image {selected + 1} of {images.length}
          </span>
          <span aria-hidden="true">
            {pad(selected + 1)}
            <span className="text-muted-foreground"> / {pad(images.length)}</span>
          </span>
        </p>

        {/* Progress through the set. Decorative: the index beside it says the same. */}
        <span aria-hidden="true" className="relative h-px min-w-0 flex-1 bg-foreground/15">
          <span
            className="absolute inset-0 origin-left bg-accent"
            style={{
              transform: `scaleX(${(selected + 1) / images.length})`,
              transition: `transform 0.9s ${EASE.expoOut}`,
            }}
          />
        </span>

        <div className="flex shrink-0 items-center gap-2">
          {allowed && (
            <button
              type="button"
              aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
              onClick={() => setPaused((p) => !p)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors duration-300 ease-expo-out hover:text-foreground"
            >
              {paused ? (
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          )}
          <CarouselPrevious aria-label="Previous image" className={CONTROL} />
          <CarouselNext aria-label="Next image" className={CONTROL} />
        </div>
      </div>
    </Carousel>
  );
};

export default ImageCarousel;
