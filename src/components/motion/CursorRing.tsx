import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { EASE, canHover, isStill } from '@/lib/motion';

/** data-cursor="…" on any element: the ring opens into a badge carrying this word. */
const LABELS = { view: 'View', drag: 'Drag', open: 'Open', enquire: 'Enquire' } as const;
type Label = keyof typeof LABELS;
type Mode = 'ring' | 'dot' | 'badge';

const INTERACTIVE = 'a[href], button, [role="button"], input, select, textarea, label, summary';
const FOLLOW = 0.2;

const layer = (active: boolean, restScale: number) => ({
  opacity: active ? 1 : 0,
  transform: `scale(${active ? 1 : restScale})`,
  transition: `opacity 0.35s ${EASE.quartOut}, transform 0.5s ${EASE.expoOut}`,
});

/**
 * A gold ring that trails the pointer, mounted once in App. It closes to a dot over
 * links and buttons and opens into a small labelled badge over [data-cursor]. It is
 * an accent, not a replacement: the native cursor stays, nothing here takes pointer
 * events, and it is aria-hidden.
 *
 * Only for a real mouse — never rendered for touch, reduced motion or the
 * prerenderer. Position goes straight to the DOM from one rAF loop that sleeps when
 * the ring has caught up; React only re-renders when the mode changes.
 */
const CursorRing = () => {
  const [enabled] = useState(() => !isStill() && canHover());
  const [mode, setMode] = useState<Mode>('ring');
  // Kept after the badge closes, so the word fades out with it instead of vanishing first.
  const [label, setLabel] = useState<Label>('view');
  const [visible, setVisible] = useState(false);
  const moverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mover = moverRef.current;
    if (!enabled || !mover) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let placed = false;

    const follow = () => {
      x += (targetX - x) * FOLLOW;
      y += (targetY - y) * FOLLOW;
      mover.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.2 ? requestAnimationFrame(follow) : 0;
    };

    const onMove = (e: PointerEvent) => {
      // A finger on a touch laptop: stand down until the mouse is back.
      if (e.pointerType !== 'mouse') {
        setVisible(false);
        return;
      }
      targetX = e.clientX;
      targetY = e.clientY;
      if (!placed) {
        // First sighting: appear under the pointer instead of flying in from the corner.
        placed = true;
        x = targetX;
        y = targetY;
      }
      setVisible(true);
      if (!frame) frame = requestAnimationFrame(follow);
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const wanted = target?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor;
      if (wanted && wanted in LABELS) {
        setLabel(wanted as Label);
        setMode('badge');
      } else {
        setMode(target?.closest(INTERACTIVE) ? 'dot' : 'ring');
      }
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={moverRef}
      aria-hidden="true"
      data-cursor-ring=""
      className="pointer-events-none fixed left-0 top-0 z-[300] will-change-transform"
      style={{ opacity: visible ? 1 : 0, transition: `opacity 0.3s ${EASE.quartOut}` }}
    >
      {/* Each layer is centred on the pointer and only ever scales or fades. */}
      <span
        className="absolute -left-3.5 -top-3.5 h-7 w-7 rounded-full border border-gold"
        style={layer(mode === 'ring', 0.4)}
      />
      <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-gold" style={layer(mode === 'dot', 0)} />
      <span
        className={cn(
          'absolute -left-10 -top-10 flex h-20 w-20 items-center justify-center rounded-full border border-gold bg-ink/85',
          // pl matches the tracking, which otherwise hangs off the last letter and un-centres the word.
          'pl-[0.16em] font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-gold'
        )}
        style={layer(mode === 'badge', 0.4)}
      >
        {LABELS[label]}
      </span>
    </div>
  );
};

export default CursorRing;
