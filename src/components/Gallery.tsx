import { useCallback, useEffect, useRef, useState } from 'react';
import type { FocusEvent, PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { galleryImages } from '@/content/images';

const images = galleryImages;

/**
 * The pinned, scroll-driven track is for viewports with room and visitors who have
 * not asked for less motion. Phones, short windows and reduced-motion get a plain
 * swipe row / grid instead — no scroll-jacking where it would fight the thumb.
 */
const PINNED_QUERY =
  '(min-width: 768px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)';
/** Vertical scroll, in vh, that each image adds to the pinned section. */
const SCROLL_PER_IMAGE_VH = 18;

/**
 * Pinned tiles are sized from the viewport HEIGHT (44vh tall, 4:3), so the sticky
 * screen always has room for the heading and the tiles never letterbox; the plain
 * layout is a swipe row on phones and a 3/4-column grid above that.
 */
const PINNED_ITEM = 'w-[58.67vh] shrink-0';
const PINNED_TILE = 'h-[44vh] w-full';
const PINNED_SIZES = '59vh';
const PLAIN_ITEM = 'w-[80vw] shrink-0 snap-start sm:w-[56vw] md:w-auto';
const PLAIN_TILE = 'aspect-[4/3] w-full';
const PLAIN_SIZES =
  '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 56vw, 80vw';
const LIGHTBOX_SIZES = '(min-width: 768px) 75vw, 92vw';

const LIGHTBOX_BUTTON =
  'absolute z-10 flex h-12 w-12 items-center justify-center rounded-full border border-ink-foreground/20 bg-ink/60 text-ink-foreground backdrop-blur-sm transition-colors hover:bg-ink/85 focus-visible:ring-gold focus-visible:ring-offset-ink';

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Safari < 15.4 throws on the selector; treat that as "yes, keyboard focus". */
const isKeyboardFocus = (el: Element) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

function usePinned() {
  const roomToPin = useMediaQuery(PINNED_QUERY);
  // The prerender snapshot always takes the plain layout: it is what a crawler or
  // a no-JS visitor should get, and it keeps a 300vh spacer out of the static HTML.
  return roomToPin && window.__PRERENDER__ !== true;
}

interface LightboxProps {
  index: number;
  /** The thumbnail that opened the dialog; focus goes back to it on close. */
  opener: HTMLElement | null;
  onClose: () => void;
  onStep: (delta: number) => void;
}

const Lightbox = ({ index, opener, onClose, onStep }: LightboxProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<number | null>(null);
  const image = images[index];

  // Once per open: lock the page, take focus, and hand it back on the way out.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus({ preventScroll: true });
    };
  }, [opener]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
      else if (e.key === 'Tab') {
        // Focus trap: the dialog's only focusable elements are its buttons.
        const dialog = dialogRef.current;
        const buttons = dialog?.querySelectorAll<HTMLButtonElement>('button');
        if (!dialog || !buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        const active = document.activeElement;
        const outside = !dialog.contains(active);
        if (e.shiftKey && (active === first || outside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || outside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, onStep]);

  // Touch swipe only — a mouse drag on an <img> starts a native image drag instead.
  const onPointerDown = (e: PointerEvent) => {
    swipeStart.current = e.pointerType === 'mouse' ? null : e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null) return;
    const dx = e.clientX - start;
    if (Math.abs(dx) > 48) onStep(dx < 0 ? 1 : -1);
  };

  return (
    // touch-none: body overflow:hidden does not stop iOS from panning the page
    // underneath, refusing the gesture here does.
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image viewer"
      className="fixed inset-0 z-[110] flex touch-none flex-col items-center justify-center gap-5 bg-ink/95 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        className={`${LIGHTBOX_BUTTON} right-4 top-4 md:right-6 md:top-6`}
      >
        <X aria-hidden="true" className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onStep(-1);
        }}
        aria-label="Previous image"
        className={`${LIGHTBOX_BUTTON} left-3 top-1/2 -translate-y-1/2 md:left-8`}
      >
        <ChevronLeft aria-hidden="true" className="h-6 w-6" />
      </button>

      <div
        className="relative aspect-[4/3] max-h-[68vh] w-[92vw] md:aspect-auto md:h-[74vh] md:max-h-none md:w-[75vw]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* The viewer fills the screen, so it asks for the largest variant rather
            than reusing the thumbnail-sized one. */}
        <LazyImage
          image={image.image}
          alt={image.alt}
          sizes={LIGHTBOX_SIZES}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onStep(1);
        }}
        aria-label="Next image"
        className={`${LIGHTBOX_BUTTON} right-3 top-1/2 -translate-y-1/2 md:right-8`}
      >
        <ChevronRight aria-hidden="true" className="h-6 w-6" />
      </button>

      {/* Live region: arrow-key navigation announces the new image. */}
      <p
        aria-live="polite"
        className="max-w-2xl px-6 text-center text-sm leading-relaxed text-ink-muted"
        onClick={(e) => e.stopPropagation()}
      >
        <span aria-hidden="true" className="mr-3 tracking-widest text-ink-foreground">
          {index + 1} / {images.length}
        </span>
        <span className="sr-only">
          Image {index + 1} of {images.length}:{' '}
        </span>
        {image.alt}
      </p>
    </div>
  );
};

/**
 * Gallery: a vertical scroll that drives a horizontal track (Shah Agro's pinned
 * gallery), with a lightbox. The section's height grows with the number of images,
 * so adding to `galleryImages` needs no change here.
 */
const Gallery = () => {
  const pinned = usePinned();
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  // Pinned mode only: how many tiles, from the left, have been told to load. The
  // track's clip hides the off-screen ones from LazyImage's observer, so the tile
  // about to slide in is asked for one step ahead. Only ever grows.
  const [loadUpTo, setLoadUpTo] = useState(0);

  // Scroll progress through the tall section → horizontal offset of the track.
  // Styles are written straight to the DOM, once per frame, so scrolling never
  // re-renders a dozen images through React.
  useEffect(() => {
    if (!pinned) return;
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const bar = barRef.current;
    if (!section || !viewport || !track) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress =
        scrollable > 0 ? clamp(-section.getBoundingClientRect().top / scrollable, 0, 1) : 0;
      const maxTranslate = Math.max(0, track.offsetWidth - viewport.clientWidth);
      track.style.transform = `translate3d(${-progress * maxTranslate}px, 0, 0)`;
      if (bar) bar.style.transform = `scaleX(${progress})`;

      // Nothing is prefetched until the section is within a screen of the viewport.
      const { top, bottom } = section.getBoundingClientRect();
      if (top < window.innerHeight * 2 && bottom > -window.innerHeight) {
        const tileSpan = track.offsetWidth / images.length;
        const reached = Math.ceil((progress * maxTranslate + viewport.clientWidth) / tileSpan) + 1;
        setLoadUpTo((n) => Math.max(n, Math.min(reached, images.length)));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
      track.style.transform = '';
    };
  }, [pinned]);

  // Pinned mode hides most thumbnails off to the right, and the clipped viewport
  // cannot scroll to them. When the keyboard lands on one, scroll the PAGE to the
  // point where the track brings it to the centre, so focus is never off-screen.
  const revealThumb = (e: FocusEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!pinned || !section || !viewport || !track || !isKeyboardFocus(button)) return;

    const view = viewport.getBoundingClientRect();
    const item = button.getBoundingClientRect();
    if (item.left >= view.left && item.right <= view.right) return;

    const maxTranslate = track.offsetWidth - viewport.clientWidth;
    const scrollable = section.offsetHeight - window.innerHeight;
    if (maxTranslate <= 0 || scrollable <= 0) return;

    // Both rects carry the same transform, so their difference is the item's
    // resting position inside the track.
    const offsetInTrack = item.left - track.getBoundingClientRect().left;
    const translate = clamp(offsetInTrack - (view.width - item.width) / 2, 0, maxTranslate);
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: sectionTop + (translate / maxTranslate) * scrollable });
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const stepLightbox = useCallback(
    (delta: number) =>
      setLightboxIndex((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    []
  );

  const heading = (
    <Reveal className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6">
      <p className="eyebrow">Gallery</p>
      <h2
        id="gallery-heading"
        className="mt-4 text-3xl font-medium leading-tight md:text-4xl lg:text-5xl"
      >
        Inside the Value Chain
      </h2>
      <div className="rule mt-6" aria-hidden="true" />
    </Reveal>
  );

  const thumbs = images.map((img, i) => (
    <li key={img.alt} className={pinned ? PINNED_ITEM : PLAIN_ITEM}>
      <button
        type="button"
        onClick={(e) => {
          setOpener(e.currentTarget);
          setLightboxIndex(i);
        }}
        onFocus={revealThumb}
        aria-label={`Enlarge image ${i + 1} of ${images.length}: ${img.alt}`}
        className={`group relative block overflow-hidden rounded-md bg-secondary ${
          pinned ? PINNED_TILE : PLAIN_TILE
        }`}
      >
        {/* The button's aria-label names the control; the alt stays on the image
            for crawlers and image search. */}
        <LazyImage
          image={img.image}
          alt={img.alt}
          sizes={pinned ? PINNED_SIZES : PLAIN_SIZES}
          eager={pinned && i < loadUpTo}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ objectPosition: img.position }}
        />
        {/* Always shown on touch screens (nothing hovers there); on hover/focus otherwise. */}
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-ink-foreground backdrop-blur-sm transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100"
        >
          <Expand className="h-4 w-4" />
        </span>
      </button>
    </li>
  ));

  return (
    <>
      {pinned ? (
        <section
          ref={sectionRef}
          aria-labelledby="gallery-heading"
          className="relative bg-background"
          style={{ height: `calc(100vh + ${images.length * SCROLL_PER_IMAGE_VH}vh)` }}
        >
          <div className="sticky top-0 flex h-screen-safe flex-col justify-center overflow-hidden pb-8 pt-24">
            {heading}
            {/* overflow-clip (where supported) cannot be scrolled at all, so tabbing
                to an off-screen thumbnail cannot drag the track sideways; the
                handler covers browsers that fall back to overflow-hidden. */}
            <div
              ref={viewportRef}
              className="mt-10 overflow-hidden overflow-clip md:mt-12"
              onScroll={(e) => {
                e.currentTarget.scrollLeft = 0;
              }}
            >
              <ul ref={trackRef} className="flex w-max gap-4 px-4 will-change-transform sm:px-6 md:gap-6">
                {thumbs}
              </ul>
            </div>
            <div aria-hidden="true" className="mx-auto mt-10 h-px w-48 bg-border">
              <span ref={barRef} className="block h-full origin-left scale-x-0 bg-gold" />
            </div>
          </div>
        </section>
      ) : (
        <section aria-labelledby="gallery-heading" className="bg-background py-20 md:py-28">
          {heading}
          <div className="mt-10 md:mx-auto md:mt-14 md:max-w-7xl md:px-6">
            <ul className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:scroll-px-6 sm:px-6 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:p-0 lg:grid-cols-4">
              {thumbs}
            </ul>
          </div>
        </section>
      )}

      {lightboxIndex !== null &&
        createPortal(
          <Lightbox
            index={lightboxIndex}
            opener={opener}
            onClose={closeLightbox}
            onStep={stepLightbox}
          />,
          document.body
        )}
    </>
  );
};

export default Gallery;
