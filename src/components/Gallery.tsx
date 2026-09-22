import { useCallback, useEffect, useRef, useState } from 'react';
import type { FocusEvent, MouseEvent, PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import { SectionHead } from '@/components/Ruled';
import SplitReveal from '@/components/motion/SplitReveal';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { galleryImages } from '@/content/images';

const images = galleryImages;
const two = (n: number) => String(n).padStart(2, '0');
const TOTAL = two(images.length);

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
 * Pinned tiles are sized from the viewport HEIGHT (--tile: 46vh tall, 4:3 — less on a
 * short window, where the navbar's clearance, the section head and the cells under the
 * tiles take 23rem of the screen between them), so the sticky screen always has room
 * for its heading and the tiles never letterbox; the plain layout is a swipe row on
 * phones and a 3/4-column contact sheet above that.
 *
 * Either way it is a ruled strip, not a row of cards: square frames that share their
 * 1px hairlines, each with a ruled "View" cell underneath — no "01 / 12" on every
 * tile; the viewer and the pinned track's progress say where you are.
 */
const PINNED_FRAME = '[--tile:min(46vh,calc(100vh_-_23rem))]';
const PINNED_ITEM = 'w-[calc(var(--tile)*4/3)] shrink-0 border-l last:border-r';
const PINNED_TILE = 'h-[var(--tile)]';
const PINNED_SIZES = '62vh';
const PLAIN_ITEM = 'w-[80vw] shrink-0 snap-start border-l last:border-r sm:w-[56vw] md:w-auto md:border-t md:last:border-r-0';
const PLAIN_TILE = 'aspect-[4/3]';
const PLAIN_SIZES =
  '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 56vw, 80vw';
const LIGHTBOX_SIZES = '(min-width: 768px) 85vw, 92vw';

// The tiles sit edge to edge inside clipped strips, where the usual offset ring would
// be cut off. Theirs is drawn inside the frame instead: the same 2px ring, with its
// 2px of page colour on the inner side so it holds against any photograph.
const TILE_FOCUS =
  'pointer-events-none absolute inset-0 z-10 opacity-0 outline outline-2 -outline-offset-4 outline-background ring-2 ring-inset ring-ring group-focus-visible:opacity-100';
const ON_TILE = 'group-hover:scale-x-100 group-focus-visible:scale-x-100';

// The viewer's controls are cells of its frame, ruled off like the rest — not floating
// discs. White fill on hover; the focus ring is inset so the screen edge cannot crop it.
const VIEWER_BUTTON =
  'flex h-14 w-14 shrink-0 items-center justify-center border-l text-ink-foreground transition-colors focus-visible:ring-inset focus-visible:ring-offset-0 md:h-16 md:w-16 [@media(hover:hover)]:hover:bg-ink-foreground [@media(hover:hover)]:hover:text-ink';

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

  const stay = (e: MouseEvent) => e.stopPropagation();

  // The photograph is letterboxed inside its box (object-contain). A click on the
  // picture stays; a click on the dark beside it is a click on the backdrop and closes.
  const onFrameClick = (e: MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = image.image.img.w / image.image.img.h;
    const width = Math.min(box.width, box.height * ratio);
    const height = width / ratio;
    const onPicture =
      Math.abs(e.clientX - (box.left + box.width / 2)) <= width / 2 &&
      Math.abs(e.clientY - (box.top + box.height / 2)) <= height / 2;
    if (onPicture) e.stopPropagation();
  };

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
    // A ruled frame on solid ink: label and close above, the photograph, then index,
    // caption and the two arrows below. bg-ink also switches hairlines and focus rings
    // to their ink values for everything inside.
    // touch-none: body overflow:hidden does not stop iOS from panning the page
    // underneath, refusing the gesture here does.
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image viewer"
      className="fixed inset-0 z-[110] flex touch-none flex-col bg-ink pb-[env(safe-area-inset-bottom)] text-ink-foreground duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div className="flex shrink-0 items-stretch justify-between border-b" onClick={stay}>
        <p className="eyebrow flex items-center px-4 sm:px-6">Gallery</p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className={VIEWER_BUTTON}
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        {/* Keyed, so each photograph fades in as it takes the frame. The viewer fills the
            screen: it asks for the largest variant, not the thumbnail's, and at once. */}
        <div
          key={index}
          className="absolute inset-x-4 inset-y-5 duration-300 animate-in fade-in md:inset-x-16 md:inset-y-10"
          onClick={onFrameClick}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <LazyImage
            image={image.image}
            alt={image.alt}
            sizes={LIGHTBOX_SIZES}
            priority
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>

      {/* Phones: the caption takes its own row above index and arrows. From md: one row. */}
      <div
        className="grid shrink-0 grid-cols-[1fr_auto_auto] border-t md:grid-cols-[auto_1fr_auto_auto]"
        onClick={stay}
      >
        <p aria-hidden="true" className="index-num flex items-center gap-2 px-4 sm:px-6 md:border-r">
          <span className="text-ink-foreground">{two(index + 1)}</span>/<span>{TOTAL}</span>
        </p>
        {/* Live region: arrow-key navigation announces the new image. */}
        <p
          aria-live="polite"
          className="order-first col-span-3 border-b px-4 py-3 text-base leading-relaxed text-ink-muted sm:px-6 md:order-none md:col-span-1 md:flex md:items-center md:border-b-0 md:py-2"
        >
          <span className="sr-only">
            Image {index + 1} of {images.length}:{' '}
          </span>
          {image.alt}
        </p>
        <button type="button" onClick={() => onStep(-1)} aria-label="Previous image" className={VIEWER_BUTTON}>
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => onStep(1)} aria-label="Next image" className={VIEWER_BUTTON}>
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
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
  const countRef = useRef<HTMLSpanElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  // Pinned mode only: how many tiles, from the left, have been told to load. The
  // strip's clip hides the off-screen ones from LazyImage's observer, so the tile
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
    if (!section || !viewport || !track) return;

    let frame = 0;
    const update = () => {
      const { top, bottom } = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress = scrollable > 0 ? clamp(-top / scrollable, 0, 1) : 0;
      // The track starts on the page margin and ends on it: `viewport` is the
      // container's content box, the strip around it is what clips.
      const maxTranslate = Math.max(0, track.offsetWidth - viewport.clientWidth);
      track.style.transform = `translate3d(${(-progress * maxTranslate).toFixed(1)}px, 0, 0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
      if (countRef.current) countRef.current.textContent = two(Math.round(progress * (images.length - 1)) + 1);

      // Nothing is prefetched until the section is within a screen of the viewport.
      if (top < window.innerHeight * 2 && bottom > -window.innerHeight) {
        const tileSpan = track.offsetWidth / images.length;
        const reached = Math.ceil((progress * maxTranslate + window.innerWidth) / tileSpan) + 1;
        setLoadUpTo((n) => Math.max(n, Math.min(reached, images.length)));
      }
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      }
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Lenis moves the page inside its own animation frame; painting from its event
    // keeps the track on the same frame as the scroll instead of one behind it.
    const offLenis = window.__lenis?.on('scroll', update);
    update();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      offLenis?.();
      if (frame) cancelAnimationFrame(frame);
      track.style.transform = '';
    };
  }, [pinned]);

  // Pinned mode hides most thumbnails off to the right, and the clipped strip
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

  // Opens as every homepage section does: the drawn rule, one mono row, then the
  // headline, left-aligned. Closer together inside the pinned screen, which has to
  // hold the head, the strip and the progress rule at once.
  const heading = (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <SectionHead label="Gallery" />
      <div className={cn('flex items-end justify-between gap-10', pinned ? 'mt-6 lg:mt-8' : 'mt-12 md:mt-16')}>
        <SplitReveal
          as="h2"
          id="gallery-heading"
          text="Inside the Value Chain"
          italicWords={['Value']}
          className="display-md text-foreground"
        />
        {/* Where the track is: current frame, a hairline that fills in accent, the total.
            Opposite the headline, on its baseline — the foot of the pinned screen stays
            clear for the floating enquiry button. */}
        {pinned && (
          <div aria-hidden="true" className="flex w-[30%] max-w-sm shrink-0 items-center gap-5 pb-[0.6em]">
            <span ref={countRef} className="index-num text-foreground">
              01
            </span>
            <span className="relative h-px flex-1 bg-border">
              <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-accent" />
            </span>
            <span className="index-num">{TOTAL}</span>
          </div>
        )}
      </div>
    </div>
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
        data-cursor="view"
        className="group relative block w-full text-left focus-visible:ring-0 focus-visible:ring-offset-0"
      >
        <span className={cn('relative block overflow-hidden bg-secondary', pinned ? PINNED_TILE : PLAIN_TILE)}>
          {/* The button's aria-label names the control; the alt stays on the image
              for crawlers and image search. */}
          <LazyImage
            image={img.image}
            alt={img.alt}
            sizes={pinned ? PINNED_SIZES : PLAIN_SIZES}
            eager={pinned && i < loadUpTo}
            className="absolute inset-0 h-full w-full object-cover transition-transform motion-safe:group-hover:scale-[1.02]"
            style={{ objectPosition: img.position }}
          />
        </span>
        {/* The cell under the frame, ruled off and unnumbered. On hover or focus its rule
            darkens from the left and the word arrives; the plus is always there for touch. */}
        <span className="relative flex h-11 items-center justify-end gap-4 border-t px-3 md:px-4">
          <span
            aria-hidden="true"
            className={cn('absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-foreground transition-transform', ON_TILE)}
          />
          <span className="mono-label flex items-center gap-2.5 text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:text-foreground">
            <span className="hidden translate-x-2 opacity-0 transition-[opacity,transform] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:inline">
              View
            </span>
            <Plus className="h-3.5 w-3.5" />
          </span>
        </span>
        <span aria-hidden="true" className={TILE_FOCUS} />
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
          <div
            className={cn(
              'sticky top-0 flex h-screen-safe flex-col justify-center overflow-hidden pb-8 pt-20 lg:pt-24',
              PINNED_FRAME
            )}
          >
            {heading}
            {/* The strip is ruled off edge to edge and is what clips the track.
                overflow-clip (where supported) cannot be scrolled at all, so tabbing
                to an off-screen thumbnail cannot drag the track sideways; the
                handler covers browsers that fall back to overflow-hidden. */}
            <div
              className="mt-8 overflow-hidden overflow-clip border-y lg:mt-10"
              onScroll={(e) => {
                e.currentTarget.scrollLeft = 0;
              }}
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div ref={viewportRef}>
                  <ul ref={trackRef} className="flex w-max will-change-transform">
                    {thumbs}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section aria-labelledby="gallery-heading" className="bg-background py-20 md:py-24 lg:py-28">
          {heading}
          <div className="mt-10 md:mx-auto md:mt-14 md:max-w-7xl md:px-6">
            <ul className="flex snap-x snap-mandatory scroll-px-4 overflow-x-auto border-y px-4 sm:scroll-px-6 sm:px-6 md:grid md:grid-cols-3 md:overflow-visible md:border-r md:border-t-0 md:p-0 lg:grid-cols-4">
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
