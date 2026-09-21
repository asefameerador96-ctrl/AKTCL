import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FocusEvent, PointerEvent, ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isStill, observeIntersection } from '@/lib/motion';

export interface MarqueeProps {
  /** Verbatim names from src/content (product categories, formats). */
  items: string[];
  /** Pixels per second at rest. */
  speed?: number;
  /** Colour and spacing. The outline is drawn in the text colour, so "text-ink-foreground" is all an ink band needs. */
  className?: string;
  /** Transparent letters with a hairline stroke (see .text-outline in index.css). */
  outlined?: boolean;
  /** Sits after every item. Defaults to a short hairline in the text colour. */
  separator?: ReactNode;
  /**
   * Controlled pause, for a layout that sets its own <MarqueeToggle>; the row then
   * draws no control. Inside a <MarqueeBand> leave it out: the band pauses its rows.
   */
  paused?: boolean;
  /**
   * A lone marquee sets its own small pause/play button under its right end. false
   * leaves it out — only where something else on the page already stops the motion.
   */
  control?: boolean;
}

const TYPE = 'font-display text-[length:clamp(3rem,9vw,8rem)] font-normal leading-none tracking-[-0.03em]';
/** How much faster the band may run while the page is being scrolled hard. */
const MAX_BOOST = 2.5;

const DEFAULT_SEPARATOR = <span className="inline-block h-px w-[0.5em] bg-current align-middle" />;

/** A band's rows read their pause from here; null outside a band. */
const BandPaused = createContext<boolean | null>(null);

interface MarqueeToggleProps {
  paused: boolean;
  onToggle: () => void;
  /** What is moving, when a page has more than one control: "Leaf Tobacco". */
  of?: string;
  className?: string;
}

/**
 * The pause control WCAG 2.2.2 asks for: a square 44px cell with a Pause or Play icon
 * and no visible word. A toggle button with one fixed name, "Pause moving text", and
 * aria-pressed for its state; the icon shows what a press will do. (A name that turned
 * into "Play" as well would be announced "Play moving text, pressed", which reads as
 * playing.) Like the photo carousel's controls it inverts on hover and keyboard focus —
 * colour only, nothing moves. Render it only where the text actually moves (not under
 * isStill()).
 */
export const MarqueeToggle = ({ paused, onToggle, of, className }: MarqueeToggleProps) => {
  const Icon = paused ? Play : Pause;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Pause moving text${of ? `: ${of}` : ''}`}
      aria-pressed={paused}
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors focus-visible:relative focus-visible:z-10 focus-visible:bg-foreground focus-visible:text-background [@media(hover:hover)]:hover:bg-foreground [@media(hover:hover)]:hover:text-background',
        className
      )}
    >
      <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
    </button>
  );
};

interface MarqueeBandProps {
  /** The rows: <Marquee>s, with whatever the layout sets beside them. */
  children: ReactNode;
  /** The band's own box: its rules, its width. */
  className?: string;
  /** The control's cell at the right end (a hairline on its left, the button at its foot). */
  controlClassName?: string;
}

/**
 * Several running rows as one band with ONE pause control, in a narrow ruled cell at
 * the band's right end, never over the type. The band also holds still while a mouse
 * is over it or keyboard focus is inside it; pressing the control is an explicit
 * choice and outranks that hold until the pointer and focus have left. Under
 * isStill() the rows are plain lists and there is no control.
 */
export const MarqueeBand = ({ children, className, controlClassName }: MarqueeBandProps) => {
  const [still] = useState(isStill);
  const [chosen, setChosen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [released, setReleased] = useState(false);
  const paused = chosen || ((hovered || focused) && !released);

  if (still) return <div className={className}>{children}</div>;

  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') setHovered(true);
  };
  const onPointerLeave = () => {
    setHovered(false);
    if (!focused) setReleased(false);
  };
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setFocused(false);
    if (!hovered) setReleased(false);
  };

  return (
    <div
      className={cn('flex', className)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
    >
      <div className="min-w-0 flex-1">
        <BandPaused.Provider value={paused}>{children}</BandPaused.Provider>
      </div>
      <div className={cn('flex shrink-0 items-end border-l border-border', controlClassName)}>
        <MarqueeToggle
          paused={chosen}
          onToggle={() => {
            setChosen((p) => !p);
            setReleased(true);
          }}
        />
      </div>
    </div>
  );
};

/**
 * Oversized running band of names. One CSS animation on the compositor moves a track
 * holding two identical halves by exactly one half, so the loop has no seam; scroll
 * velocity only nudges that animation's playbackRate, never the transform itself.
 *
 * Read out once: the first run of items is a real list, every repeat is aria-hidden.
 * Pauses on hover, off screen, and with a control (WCAG 2.2.2 — hover is no use to a
 * keyboard or a thumb): the band's, inside a <MarqueeBand>, else its own. Under
 * isStill() it is a plain wrapped list and there is nothing to pause.
 */
const Marquee = ({
  items,
  speed = 60,
  className,
  outlined = false,
  separator = DEFAULT_SEPARATOR,
  paused: pausedProp,
  control = true,
}: MarqueeProps) => {
  const [still] = useState(isStill);
  const band = useContext(BandPaused);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLUListElement>(null);
  // Runs of `items` per half: enough that one half always out-spans the container.
  const [runs, setRuns] = useState(1);
  const [ownPaused, setOwnPaused] = useState(false);
  const ownControl = control && band === null && pausedProp === undefined;
  const paused = Boolean(band) || Boolean(pausedProp) || (ownControl && ownPaused);

  // Before first paint: fill the width, and turn px/s into the animation's duration.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const run = runRef.current;
    if (still || !root || !track || !run) return;
    const measure = () => {
      const runWidth = run.offsetWidth / runs;
      if (runWidth <= 0) return;
      const needed = Math.max(1, Math.ceil(root.clientWidth / runWidth));
      if (needed !== runs) {
        setRuns(needed);
        return;
      }
      track.style.setProperty('--marquee-duration', `${(run.offsetWidth / Math.max(speed, 1)).toFixed(2)}s`);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    // The run re-measures when the webfont lands; the root when the window changes.
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(run);
    return () => observer.disconnect();
  }, [still, runs, speed, items]);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (still || !root || !track) return;

    // Off screen it stops; the shared observer the reveals use carries this too.
    const unobserve =
      typeof IntersectionObserver === 'undefined'
        ? undefined
        : observeIntersection(root, {}, (inZone) => root.toggleAttribute('data-offscreen', !inZone));

    let frame = 0;
    let rate = 1;
    let lastY = window.scrollY;
    const apply = () => {
      const [animation] = typeof track.getAnimations === 'function' ? track.getAnimations() : [];
      // updatePlaybackRate keeps the compositor's position; assigning playbackRate can hitch.
      animation?.updatePlaybackRate(rate);
    };
    const settle = () => {
      rate += (1 - rate) * 0.06;
      if (rate - 1 < 0.01) rate = 1;
      apply();
      frame = rate === 1 ? 0 : requestAnimationFrame(settle);
    };
    const onScroll = () => {
      const y = window.scrollY;
      rate = Math.min(MAX_BOOST, Math.max(rate, 1 + Math.abs(y - lastY) / 40));
      lastY = y;
      if (!frame && !root.hasAttribute('data-offscreen')) frame = requestAnimationFrame(settle);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      unobserve?.();
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [still]);

  if (still) {
    return (
      <ul className={cn('flex flex-wrap items-baseline gap-x-[0.4em] gap-y-2 px-4 sm:px-6', TYPE, className)}>
        {items.map((item) => (
          // Not merged into the <ul>'s cn(): tailwind-merge reads "text-outline" as a
          // text colour and would drop it in favour of the caller's.
          <li key={item} className={cn('flex items-center gap-[0.4em]', outlined && 'text-outline')}>
            {item}
            <span aria-hidden="true">{separator}</span>
          </li>
        ))}
      </ul>
    );
  }

  const run = (hidden: boolean, ref?: typeof runRef) => (
    <ul ref={ref} aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {Array.from({ length: runs }, (_, r) =>
        items.map((item) => (
          <li
            key={`${r}-${item}`}
            aria-hidden={!hidden && r > 0 ? true : undefined}
            className="flex shrink-0 items-center gap-[0.4em] whitespace-nowrap pr-[0.4em]"
          >
            {item}
            <span aria-hidden="true">{separator}</span>
          </li>
        ))
      )}
    </ul>
  );

  return (
    // The clip is the root's padding box, and leading-none puts the descenders ("g" in
    // Virginia) below the line box: the padding gives them room, the margin takes the
    // space back so the row keeps its height.
    <div
      ref={rootRef}
      className={cn('marquee relative -mb-[0.2em] overflow-hidden pb-[0.2em]', TYPE, className)}
      data-paused={paused ? '' : undefined}
      data-in-band={band === null ? undefined : ''}
    >
      {/* The outline sits on the track, not the root, so nothing else inherits the stroke. */}
      <div ref={trackRef} className={cn('marquee-track flex w-max', outlined && 'text-outline')}>
        {run(false, runRef)}
        {run(true)}
      </div>
      {/* Its own row under the type: the control never sits on the running names. */}
      {ownControl && (
        <div className="flex justify-end px-4 sm:px-6">
          <MarqueeToggle paused={ownPaused} onToggle={() => setOwnPaused((p) => !p)} />
        </div>
      )}
    </div>
  );
};

export default Marquee;
