import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EASE, isStill, observeIntersection } from '@/lib/motion';

/** The shape vite-imagetools returns for a "?...&as=picture" import. */
export interface ResponsiveImage {
  img: { src: string; w: number; h: number };
  sources: { avif?: string; webp?: string };
}

interface LazyImageProps {
  image: ResponsiveImage;
  alt: string;
  sizes: string;
  className?: string;
  style?: React.CSSProperties;
  /** Set on the hero and anything else above the fold; skips deferral and the fade entirely. */
  priority?: boolean;
  /**
   * Fetch now, but at low priority. For the next slide of a carousel: an ancestor's
   * overflow clip hides it from IntersectionObserver (rootMargin does not reach past
   * a clip), so without this it would only start loading as it slides into view.
   * May turn true later. Ignored by the prerenderer, so the static HTML never
   * front-loads off-screen slides.
   */
  eager?: boolean;
  /** How far outside the viewport to start fetching. Default AHEAD. */
  rootMargin?: string;
}

/**
 * How far ahead of the screen a file is asked for: well over a screen, so at an
 * ordinary scrolling pace a photograph has usually arrived before its frame does.
 */
export const AHEAD = '1200px';
const FADE_MS = 300;

/** In the window right now (not merely near it): the app is replacing a painted page. */
const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect();
  return (
    r.width > 0 &&
    r.height > 0 &&
    r.bottom > 0 &&
    r.right > 0 &&
    r.top < window.innerHeight &&
    r.left < window.innerWidth
  );
};

/**
 * A responsive image that waits until it is near the viewport, then arrives cleanly.
 *
 * native loading="lazy" does nothing useful for this site's layouts: the gallery is
 * a horizontal carousel, so every slide sits at the same vertical offset, and the
 * process panels are stacked in a sticky scroll container. The browser counts them
 * all as near the viewport and fetches all of them, which is why the homepage
 * pulled its entire 3.5 MB of images before the visitor scrolled at all. Gating on
 * IntersectionObserver instead means only what is being approached gets fetched —
 * which is what makes it affordable to serve these at high quality.
 *
 * Arriving cleanly (owner feedback, 2026-09-22: frames that looked "not loaded yet"):
 * the file is asked for AHEAD of the screen, and a picture that is fetched after the
 * page is up stays transparent until it has decoded, then fades in over 300 ms — so a
 * frame shows its own calm surface (every frame has one: bg-tile, bg-secondary), never
 * a half-painted picture. The frame reserves the space from the first paint (width and
 * height are always set), so nothing shifts.
 *
 * Never faded: the priority (LCP) image and eager slides, which are fetched at once;
 * anything already on screen when the app mounts, which is replacing the prerendered
 * paint and must not blink out over it; and everything under isStill() — the
 * prerender snapshot carries no inline opacity, and reduced motion gets no fade.
 *
 * AVIF is offered first and WebP second, so browsers that support AVIF get a
 * noticeably better image, and the rest get exactly what they got before.
 */
export default function LazyImage({
  image,
  alt,
  sizes,
  className,
  style,
  priority = false,
  eager = false,
  rootMargin = AHEAD,
}: LazyImageProps) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [still] = useState(isStill);
  const loadNow = priority || (eager && !window.__PRERENDER__);
  const [visible, setVisible] = useState(loadNow);
  // Decided before the first paint (layout effect), so a fading picture never shows unfaded first.
  const [fades, setFades] = useState(false);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (visible) return;
    if (loadNow) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    // Without IntersectionObserver (very old browsers), load immediately rather
    // than leaving a permanently blank image.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    // Already in the window as the app takes over from the prerendered page: ask for
    // it before this frame paints, and show it the moment it can be shown.
    if (onScreen(el)) {
      setVisible(true);
      return;
    }

    setFades(!still);
    // The reveals' shared observer (lib/motion): one for every image on the page
    // rather than one each.
    const stop = observeIntersection(el, { rootMargin }, (near) => {
      if (!near) return;
      setVisible(true);
      stop();
    });
    return stop;
  }, [loadNow, visible, rootMargin, still]);

  // Shown once decoded, not merely loaded: a large file can take a frame or two more.
  const show = () => {
    const el = ref.current;
    if (el && typeof el.decode === 'function') el.decode().then(() => setReady(true), () => setReady(true));
    else setReady(true);
  };

  // The file may already have been in the cache and complete before React looked.
  useEffect(() => {
    const el = ref.current;
    if (fades && visible && !ready && el?.complete && el.currentSrc) show();
  }, [fades, visible, ready]);

  // The fade only ever runs in: going transparent (before the file is even asked for)
  // is instant, so nothing is ever seen fading out.
  const fading = fades
    ? { ...style, opacity: ready ? 1 : 0, transition: ready ? `opacity ${FADE_MS}ms ${EASE.expoOut}` : 'none' }
    : style;

  return (
    <picture>
      {visible && image.sources.avif && <source type="image/avif" srcSet={image.sources.avif} sizes={sizes} />}
      {visible && image.sources.webp && <source type="image/webp" srcSet={image.sources.webp} sizes={sizes} />}
      <img
        ref={ref}
        // width and height are always set so the box is reserved before the file
        // arrives and nothing shifts when it does.
        width={image.img.w}
        height={image.img.h}
        src={visible ? image.img.src : undefined}
        alt={alt}
        className={className}
        style={fading}
        decoding="async"
        onLoad={fades ? show : undefined}
        // A broken file is not held back: the alt text is better than an empty frame.
        onError={fades ? () => setReady(true) : undefined}
        // Lowercase on purpose: React 18 does not know the camelCase prop and warns
        // on every image; the attribute itself is what the browser reads.
        {...{ fetchpriority: priority ? 'high' : 'low' }}
      />
    </picture>
  );
}
