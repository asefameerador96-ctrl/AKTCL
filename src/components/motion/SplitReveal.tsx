import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { isStill, revealTransition, useInView, useReveal, viewDelay } from '@/lib/motion';

export interface SplitRevealProps {
  /** Verbatim copy from src/content — this component never alters the words. */
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  /** 'word': each word follows the last. 'line': words rise together, line after line. */
  by?: 'word' | 'line';
  className?: string;
  /** Seconds before the first piece moves. */
  delay?: number;
  /** Seconds between pieces (40–60 ms reads best). Long text is compressed to fit 0.3 s. */
  stagger?: number;
  /** 'view': every time it scrolls on screen, back down as it leaves. 'enter': page-load choreography, once. */
  trigger?: 'view' | 'enter';
  /** Words set in the display italic — typographic emphasis only, e.g. ['to']. */
  italicWords?: string[];
  id?: string;
}

const DURATION_S = 0.6;
/** However many pieces there are, the last one starts within this many seconds. */
const MAX_SPREAD_S = 0.3;

/** A headline's word waits a full line down, under its mask. */
const MASKED = 'translate3d(0, calc(100% + 0.3em), 0)';
/** Running text is never masked: its pieces fade up this far (16px at most). */
const LIFTED = 'translate3d(0, min(0.3em, 16px), 0)';

const stripPunctuation = (word: string) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();

/**
 * Word-by-word reveal, each time the line comes on screen and back once it has gone
 * (lib/motion). A headline (h1–h3) is masked: every word sits in its own clipped
 * inline-block and rises into place with expo-out. Anything else — a pull-quote, a
 * figure — is never clipped: its words fade up 16px at most, so a paragraph on screen
 * is never a blank. The whole line has landed within about 0.9 s. Words stay ordinary
 * inline boxes with real spaces between them, so the text wraps, balances and tracks
 * exactly as plain text would — which is also why swapping the prerendered plain
 * heading for this one shifts nothing.
 *
 * Read out once: headings carry the full string as aria-label; a <p>/<span> (where
 * aria-label is not allowed) gets a screen-reader-only copy. The animated pieces are
 * aria-hidden either way. Under isStill() it is simply the text.
 */
const SplitReveal = ({
  text,
  as: Tag = 'span',
  by = 'word',
  className,
  delay = 0,
  stagger = 0.05,
  trigger = 'view',
  italicWords,
  id,
}: SplitRevealProps) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLElement>(null);
  // Which line each word fell on, for by="line". Until measured, a word is its own line.
  const [lines, setLines] = useState<number[] | null>(null);
  const [settled, setSettled] = useState(false);

  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const italics = useMemo(() => new Set((italicWords ?? []).map((w) => w.toLowerCase())), [italicWords]);

  const inView = useInView(ref, { skip: still || trigger === 'enter' });
  const shown = useReveal(trigger === 'enter' || inView);
  // Unmasked only at rest: the moment the words start back down, the masks are on again.
  const masked = !shown || !settled;
  useEffect(() => {
    if (!shown) setSettled(false);
  }, [shown]);

  // Line breaks are only known after layout. Measured before the first paint, and
  // again if the column changes width while the text is still waiting to appear.
  useLayoutEffect(() => {
    const el = ref.current;
    if (still || by !== 'line' || shown || !el) return;
    const measure = () => {
      const pieces = el.querySelectorAll<HTMLElement>('[data-split-word]');
      let line = -1;
      let lastTop: number | null = null;
      const next = Array.from(pieces, (piece) => {
        if (lastTop === null || Math.abs(piece.offsetTop - lastTop) > 2) line += 1;
        lastTop = piece.offsetTop;
        return line;
      });
      // Same breaks as before (the observer's first call, a height-only resize): no render.
      setLines((prev) => (prev && prev.length === next.length && prev.every((n, i) => n === next[i]) ? prev : next));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [still, by, shown, words]);

  const renderWord = (word: string) =>
    italics.has(stripPunctuation(word)) ? <em className="italic">{word}</em> : word;

  if (still) {
    return (
      <Tag id={id} className={className} data-enter={trigger === 'enter' ? '' : undefined}>
        {italics.size === 0
          ? text
          : words.map((word, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                {renderWord(word)}
              </Fragment>
            ))}
      </Tag>
    );
  }

  const order = (i: number) => (by === 'line' ? (lines?.[i] ?? i) : i);
  const steps = Math.max(1, order(words.length - 1));
  const step = Math.min(stagger, MAX_SPREAD_S / steps);
  const isHeading = Tag === 'h1' || Tag === 'h2' || Tag === 'h3';
  // On scroll the first piece waits no longer than VIEW_DELAY_MAX_S (lib/motion); the
  // word-to-word stagger after it is untouched.
  const start = trigger === 'view' ? viewDelay(delay) : delay;

  const pieces = words.map((word, i) => (
    <span key={i} aria-hidden={isHeading ? true : undefined}>
      {i > 0 && ' '}
      <span data-split-word="" className={cn('inline-block', isHeading && masked && 'split-mask')}>
        <span
          className="inline-block will-change-transform"
          style={{
            transform: shown ? 'none' : isHeading ? MASKED : LIFTED,
            opacity: isHeading ? undefined : shown ? 1 : 0,
            transition: revealTransition(
              shown,
              isHeading ? 'transform' : ['opacity', 'transform'],
              DURATION_S,
              start + order(i) * step
            ),
            willChange: masked ? undefined : 'auto',
          }}
          // The mask would shave a swash or an italic overhang at rest; once the
          // last word has landed it has done its job. (Not on the way out.)
          onTransitionEnd={shown && i === words.length - 1 ? () => setSettled(true) : undefined}
        >
          {renderWord(word)}
        </span>
      </span>
    </span>
  ));

  return (
    <Tag
      ref={ref as never}
      id={id}
      className={className}
      aria-label={isHeading ? text : undefined}
      data-enter={trigger === 'enter' ? '' : undefined}
    >
      {isHeading ? (
        pieces
      ) : (
        <>
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">{pieces}</span>
        </>
      )}
    </Tag>
  );
};

export default SplitReveal;
