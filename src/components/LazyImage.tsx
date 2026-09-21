import { useEffect, useRef, useState } from 'react';
import { observeIntersection } from '@/lib/motion';

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
  /** Set on the hero and anything else above the fold; skips deferral entirely. */
  priority?: boolean;
  /**
   * Fetch now, but at low priority. For the next slide of a carousel: an ancestor's
   * overflow clip hides it from IntersectionObserver (rootMargin does not reach past
   * a clip), so without this it would only start loading as it slides into view.
   * May turn true later. Ignored by the prerenderer, so the static HTML never
   * front-loads off-screen slides.
   */
  eager?: boolean;
  /** How far outside the viewport to start fetching. */
  rootMargin?: string;
}

/**
 * A responsive image that genuinely waits until it is near the viewport.
 *
 * native loading="lazy" does nothing useful for this site's layouts: the gallery is
 * a horizontal carousel, so every slide sits at the same vertical offset, and the
 * process panels are stacked in a sticky scroll container. The browser counts them
 * all as near the viewport and fetches all of them, which is why the homepage
 * pulled its entire 3.5 MB of images before the visitor scrolled at all.
 *
 * Gating on IntersectionObserver instead means only what is actually being
 * approached gets fetched — which is what makes it affordable to serve these at
 * high quality rather than compressing them to hide the problem.
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
  rootMargin = '600px',
}: LazyImageProps) {
  const ref = useRef<HTMLImageElement | null>(null);
  const loadNow = priority || (eager && !window.__PRERENDER__);
  const [visible, setVisible] = useState(loadNow);

  useEffect(() => {
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

    // The reveals' shared observer (lib/motion): one for every image on the page
    // rather than one each.
    const stop = observeIntersection(el, { rootMargin }, (near) => {
      if (!near) return;
      setVisible(true);
      stop();
    });
    return stop;
  }, [loadNow, visible, rootMargin]);

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
        style={style}
        decoding="async"
        // Lowercase on purpose: React 18 does not know the camelCase prop and warns
        // on every image; the attribute itself is what the browser reads.
        {...{ fetchpriority: priority ? 'high' : 'low' }}
      />
    </picture>
  );
}
