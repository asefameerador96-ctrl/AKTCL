import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';

export interface SplitRevealProps {
  /** Verbatim copy from src/content — this component never alters the words. */
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  /** 'word': each word follows the last. 'line': words rise together, line after line. */
  by?: 'word' | 'line';
  className?: string;
  /** Seconds before the first piece moves. */
  delay?: number;
  /** Seconds between pieces (60–90 ms reads best). Long text is compressed to fit 0.6 s. */
  stagger?: number;
  /** 'view': the first time it scrolls into view. 'enter': page-load choreography. */
  trigger?: 'view' | 'enter';
  /** Words set in the display italic — typographic emphasis only, e.g. ['to']. */
  italicWords?: string[];
  id?: string;
}

const DURATION_S = 1;
/** However many pieces there are, the last one starts within this many seconds. */
const MAX_SPREAD_S = 0.6;

const stripPunctuation = (word: string) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();

/**
 * Masked slide-up reveal: every word sits in its own clipped inline-block and rises
 * into place with expo-out. Words stay ordinary inline boxes with real spaces between
 * them, so the text wraps, balances and tracks exactly as plain text would — which is
 * also why swapping the prerendered plain heading for this one shifts nothing.
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
  stagger = 0.08,
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

  const pieces = words.map((word, i) => (
    <span key={i} aria-hidden={isHeading ? true : undefined}>
      {i > 0 && ' '}
      <span data-split-word="" className={cn('inline-block', !settled && 'split-mask')}>
        <span
          className="inline-block will-change-transform"
          style={{
            transform: shown ? 'none' : 'translate3d(0, calc(100% + 0.3em), 0)',
            transition: `transform ${DURATION_S}s ${EASE.expoOut} ${(delay + order(i) * step).toFixed(3)}s`,
            willChange: settled ? 'auto' : undefined,
          }}
          // The mask would shave a swash or an italic overhang at rest; once the
          // last word has landed it has done its job.
          onTransitionEnd={i === words.length - 1 ? () => setSettled(true) : undefined}
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
