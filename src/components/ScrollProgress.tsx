import { useEffect, useRef } from 'react';

/**
 * How far down the page the visitor is: a 1px hairline along the top edge, the one
 * place the page chrome spends the accent. Drawn with a transform written straight to
 * the DOM, once per frame, from a passive scroll listener — no React state, no layout,
 * and no easing of its own: it follows the scroll (Lenis already eases that).
 */
const ScrollProgress = () => {
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    // The static snapshot keeps the bar at rest: the prerenderer scrolls every page.
    if (!bar || window.__PRERENDER__) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-px">
      <span ref={barRef} className="block h-full w-full origin-left scale-x-0 bg-accent" />
    </div>
  );
};

export default ScrollProgress;
