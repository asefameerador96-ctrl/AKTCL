import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { EASE, canHover, isStill } from '@/lib/motion';

/** data-cursor="…" on any element: the ring gives way to a tag carrying this word. */
const LABELS = { view: 'View', drag: 'Drag', open: 'Open', enquire: 'Enquire' } as const;
type Label = keyof typeof LABELS;
type Mode = 'ring' | 'dot' | 'badge';

const INTERACTIVE = 'a[href], button, [role="button"], input, select, textarea, label, summary';
const FOLLOW = 0.2;

// The site's one UI tempo: 300ms, expo-out. Opacity and scale only.
const layer = (active: boolean, restScale: number) => ({
  opacity: active ? 1 : 0,
  transform: `scale(${active ? 1 : restScale})`,
  transition: `opacity 0.3s ${EASE.expoOut}, transform 0.3s ${EASE.expoOut}`,
});

/**
 * A hairline ring that trails the pointer, mounted once in App. It closes to a dot
 * over links and buttons and gives way to a small mono tag over [data-cursor]. It is
 * an accent, not a replacement: the native cursor stays, nothing here takes pointer
 * events, and it is aria-hidden. One pixel of line, no fill, no glow.
 *
 * The ring and the dot are chalk blended with `difference`, so they read espresso on
 * paper, chalk on ink and hold against any photograph without knowing which they are
 * over. The tag carries a word, so it is solid ink with a chalk hairline instead (a
 * blended label would lose its contrast over mid-tone photography) — hence two movers:
 * a blend only reaches the page from an element that is not inside another fixed layer.
 * It is a square-cornered caption hung below and to the right of the pointer, like a
 * dimension note on a drawing, so it never covers the label of the thing it points at.
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
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mover = moverRef.current;
    const badge = badgeRef.current;
    if (!enabled || !mover || !badge) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let placed = false;

    const follow = () => {
      x += (targetX - x) * FOLLOW;
      y += (targetY - y) * FOLLOW;
      const at = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      mover.style.transform = at;
      badge.style.transform = at;
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

  const MOVER = 'pointer-events-none fixed left-0 top-0 z-[300] will-change-transform';
  const presence = { opacity: visible ? 1 : 0, transition: `opacity 0.3s ${EASE.expoOut}` };

  return (
    <>
      {/* The ring and the dot are centred on the pointer and only ever scale or fade. A
          pointer ring is a circle by nature: one of the few rounded-full shapes on the site. */}
      <div ref={moverRef} aria-hidden="true" data-cursor-ring="" className={cn(MOVER, 'mix-blend-difference')} style={presence}>
        <span
          className="absolute -left-3.5 -top-3.5 h-7 w-7 rounded-full border border-ink-foreground"
          style={layer(mode === 'ring', 0.4)}
        />
        <span
          className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-ink-foreground"
          style={layer(mode === 'dot', 0)}
        />
      </div>
      <div ref={badgeRef} aria-hidden="true" className={MOVER} style={presence}>
        <span
          className={cn(
            'absolute left-4 top-5 flex origin-top-left items-center whitespace-nowrap rounded-sm border border-ink-foreground/30 bg-ink px-2.5 py-2',
            // pl makes up for the tracking, which otherwise hangs off the last letter and un-centres the word.
            'pl-[calc(0.625rem+0.18em)] font-mono text-[11px] font-medium uppercase leading-none tracking-[0.18em] text-ink-foreground'
          )}
          style={layer(mode === 'badge', 0.9)}
        >
          {LABELS[label]}
        </span>
      </div>
    </>
  );
};

export default CursorRing;
