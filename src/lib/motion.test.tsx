import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SplitReveal from '@/components/motion/SplitReveal';
import Marquee, { MarqueeBand } from '@/components/motion/Marquee';
import CountUp from '@/components/motion/CountUp';
import ImageReveal from '@/components/motion/ImageReveal';
import Reveal from '@/components/Reveal';
import LazyImage, { AHEAD } from '@/components/LazyImage';
import {
  ACTIVE_ZONE,
  EASE,
  ENTERED_EVENT,
  IN_S,
  OUT_S,
  isStill,
  revealTransition,
  useEntered,
  useReveal,
  VIEW_DELAY_MAX_S,
  viewDelay,
} from './motion';

// src/test/setup.ts stubs matchMedia with matches:false, i.e. "motion allowed".
afterEach(() => {
  delete window.__PRERENDER__;
  delete window.__aktclEntered;
});

describe('motion vocabulary', () => {
  it('exposes exactly the three agreed curves', () => {
    expect(EASE).toEqual({
      expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      quartOut: 'cubic-bezier(0.25, 1, 0.5, 1)',
      expoInOut: 'cubic-bezier(0.87, 0, 0.13, 1)',
    });
  });

  it('is still for the prerenderer, moving otherwise', () => {
    expect(isStill()).toBe(false);
    window.__PRERENDER__ = true;
    expect(isStill()).toBe(true);
  });

  it('useEntered waits for the age gate, and not at all for returning visitors', () => {
    const waiting = renderHook(() => useEntered());
    expect(waiting.result.current).toBe(false);
    act(() => {
      window.__aktclEntered = true;
      window.dispatchEvent(new Event(ENTERED_EVENT));
    });
    expect(waiting.result.current).toBe(true);

    const returning = renderHook(() => useEntered());
    expect(returning.result.current).toBe(true);
  });

  it('plays a reveal in after its stagger and out at once, quicker', () => {
    expect(revealTransition(true, ['opacity', 'transform'], 0.5, 0.12)).toBe(
      `opacity 0.5s ${EASE.expoOut} 0.12s, transform 0.5s ${EASE.expoOut} 0.12s`
    );
    expect(revealTransition(false, 'transform', 1.2, 0.3)).toBe(`transform ${OUT_S}s ${EASE.expoOut} 0s`);
    expect(OUT_S).toBeLessThan(IN_S);
  });

  it('caps how long a reveal may take to play in, whatever it asks for', () => {
    // Long enough to be watched on the way in, short enough to be over by the time the
    // block is read. The cap itself is the contract; IN_S is where it is set.
    expect(IN_S).toBeGreaterThanOrEqual(0.6);
    expect(IN_S).toBeLessThanOrEqual(1);
    expect(revealTransition(true, 'transform', 1.2)).toBe(`transform ${IN_S}s ${EASE.expoOut} 0s`);
  });

  it('starts a reveal inside the fold, so the motion is seen', () => {
    // A zone reaching BELOW the fold (a positive bottom margin) would finish the reveal
    // before its element arrived — the site then reads as static (owner, 2026-09-23).
    const bottom = ACTIVE_ZONE.split(' ')[2];
    expect(bottom.startsWith('-')).toBe(true);
    expect(Number.parseFloat(bottom)).toBeGreaterThanOrEqual(-25);
  });

  it('holds a scroll reveal’s stagger short, so nothing is still blank when the scrolling stops', () => {
    expect(VIEW_DELAY_MAX_S).toBe(0.12);
    expect(viewDelay(0.06)).toBe(0.06);
    expect(viewDelay(0.3)).toBe(VIEW_DELAY_MAX_S);
    expect(viewDelay(-1)).toBe(0);
  });
});

// What the prerenderer captures is what crawlers and no-JS readers get: it has to be
// the plain, complete text, with nothing hidden and nothing said twice.
describe('primitives under the prerenderer', () => {
  it('SplitReveal is plain text with a typographic italic', () => {
    window.__PRERENDER__ = true;
    const { container } = render(
      <SplitReveal as="h1" trigger="enter" text="From Seed to Smoke" italicWords={['to']} />
    );
    const h1 = container.querySelector('h1')!;
    expect(h1.innerHTML).toBe('From Seed <em class="italic">to</em> Smoke');
    expect(h1).toHaveAttribute('data-enter');
    expect(h1).not.toHaveAttribute('aria-label');
  });

  it('Reveal, CountUp and Marquee render their final state with no inline opacity', () => {
    window.__PRERENDER__ = true;
    const { container } = render(
      <>
        <Reveal trigger="enter">
          <p>Subtitle</p>
        </Reveal>
        <CountUp value={50000} format={(n) => n.toLocaleString('en-US')} />
        <MarqueeBand>
          <Marquee items={['Leaf Tobacco', 'Cigarettes']} />
        </MarqueeBand>
        <Marquee items={['Cut Rag']} />
      </>
    );
    expect(container.innerHTML).not.toMatch(/opacity|visibility|clip-path/);
    expect(screen.getByText('50,000')).toBeInTheDocument();
    expect(screen.getAllByText('Leaf Tobacco')).toHaveLength(1);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('SplitReveal, animated', () => {
  it('reads out once: label on the heading, pieces hidden', () => {
    const { container } = render(<SplitReveal as="h2" text="Inside the Value Chain" />);
    const h2 = container.querySelector('h2')!;
    expect(h2).toHaveAttribute('aria-label', 'Inside the Value Chain');
    expect(h2.querySelectorAll('[data-split-word]')).toHaveLength(4);
    expect([...h2.children].every((piece) => piece.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(h2.textContent).toBe('Inside the Value Chain');
  });

  it('gives a paragraph a screen-reader copy instead of an aria-label', () => {
    const { container } = render(<SplitReveal as="p" text="Verbatim copy." />);
    const p = container.querySelector('p')!;
    expect(p).not.toHaveAttribute('aria-label');
    expect(p.querySelector('.sr-only')?.textContent).toBe('Verbatim copy.');
    expect(p.querySelector('[aria-hidden="true"]')?.textContent).toBe('Verbatim copy.');
  });
});

// ---- two-way scroll reveals ----------------------------------------------------------
// jsdom has no IntersectionObserver. This one is driven by hand: sight(el, ratio)
// reports `el` as having `ratio` of itself inside the active zone (0 = left it).

class MockObserver {
  static all = new Set<MockObserver>();
  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[];
  readonly targets = new Set<Element>();

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ) {
    this.rootMargin = options.rootMargin ?? '0px';
    this.thresholds = ([] as number[]).concat(options.threshold ?? 0);
    MockObserver.all.add(this);
  }
  observe(el: Element) {
    this.targets.add(el);
  }
  unobserve(el: Element) {
    this.targets.delete(el);
  }
  disconnect() {
    this.targets.clear();
    MockObserver.all.delete(this);
  }
  takeRecords() {
    return [];
  }
  report(target: Element, ratio: number, side: 'above' | 'below') {
    const rootBounds = { top: 0, bottom: 920 } as DOMRectReadOnly;
    const boundingClientRect = (side === 'above' ? { top: -80, bottom: -40 } : { top: 940, bottom: 980 }) as DOMRectReadOnly;
    const entry = { target, isIntersecting: ratio > 0, intersectionRatio: ratio, rootBounds, boundingClientRect };
    this.callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

const sight = (el: Element, ratio: number, side: 'above' | 'below' = 'below') =>
  act(() => {
    MockObserver.all.forEach((observer) => observer.targets.has(el) && observer.report(el, ratio, side));
  });

const pass = () =>
  act(() => {
    window.__aktclEntered = true;
    window.dispatchEvent(new Event(ENTERED_EVENT));
  });

describe('scroll reveals play both ways, every time', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('holds the first reveal for the age gate, then follows the scroll in, out and in again', async () => {
    const { container } = render(
      <Reveal>
        <p>Body copy</p>
      </Reveal>
    );
    const block = container.firstElementChild as HTMLElement;
    expect(block.style.opacity).toBe('0');

    sight(block, 1);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(block.style.opacity).toBe('0');

    pass();
    await waitFor(() => expect(block.style.opacity).toBe('1'));
    expect(block.style.transform).toBe('none');

    // Out through the foot of the screen: back down 16px at most, quicker, no stagger.
    sight(block, 0);
    expect(block.style.opacity).toBe('0');
    expect(block.style.transform).toBe('translateY(16px)');
    expect(block.style.transition).toContain(`${OUT_S}s`);

    // A return is immediate: no gate, no frame to wait for — and quick.
    sight(block, 1);
    expect(block.style.opacity).toBe('1');
    // Whatever the component asks for, in is longer than out and inside the cap.
    const seconds = Number.parseFloat(/opacity ([\d.]+)s/.exec(block.style.transition)![1]);
    expect(seconds).toBeGreaterThan(OUT_S);
    expect(seconds).toBeLessThanOrEqual(IN_S);

    // Out over the top: it waits above its place, so its offset cannot carry it back in.
    sight(block, 0, 'above');
    expect(block.style.transform).toBe('translateY(-16px)');
    sight(block, 1);
    expect(block.style.opacity).toBe('1');
  });

  it('shows as soon as any part is in the zone, and hides only once all of it has gone', async () => {
    window.__aktclEntered = true;
    const { container } = render(<Reveal>Body copy</Reveal>);
    const block = container.firstElementChild as HTMLElement;

    // A sliver is enough.
    sight(block, 0.01);
    await waitFor(() => expect(block.style.opacity).toBe('1'));

    // Still partly there: it stays.
    sight(block, 0.01);
    expect(block.style.opacity).toBe('1');
    sight(block, 0);
    expect(block.style.opacity).toBe('0');
  });

  it('keeps its hysteresis where a threshold is asked for', async () => {
    window.__aktclEntered = true;
    const { container } = render(<Reveal threshold={0.3}>Body copy</Reveal>);
    const block = container.firstElementChild as HTMLElement;

    sight(block, 0.05);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(block.style.opacity).toBe('0');

    sight(block, 0.5);
    await waitFor(() => expect(block.style.opacity).toBe('1'));

    sight(block, 0.05);
    expect(block.style.opacity).toBe('1');
    sight(block, 0);
    expect(block.style.opacity).toBe('0');
    sight(block, 0.05);
    expect(block.style.opacity).toBe('0');
  });

  it('shares one observer per threshold and zone, and lets it go with the last element', () => {
    window.__aktclEntered = true;
    const { unmount } = render(
      <>
        <Reveal>One</Reveal>
        <Reveal>Two</Reveal>
        <SplitReveal as="h2" text="Three" />
        <ImageReveal>
          <img alt="Four" />
        </ImageReveal>
        <CountUp value={12} />
      </>
    );
    const observers = [...MockObserver.all];
    expect(observers).toHaveLength(2);
    const shared = observers.find((observer) => observer.thresholds.length === 1 && observer.thresholds[0] === 0)!;
    expect(shared.targets.size).toBe(4);
    expect(shared.rootMargin).toBe(ACTIVE_ZONE);
    unmount();
    expect(MockObserver.all.size).toBe(0);
  });

  it('page-load choreography plays once and is never observed', async () => {
    window.__aktclEntered = true;
    const { getByText } = render(
      <div data-enter="">
        <Reveal trigger="enter">Headline</Reveal>
        <Reveal>Inside the sequence</Reveal>
      </div>
    );
    const inside = getByText('Inside the sequence');
    // Only the view-triggered one is watched, and only until it has been seen.
    expect([...MockObserver.all].reduce((n, observer) => n + observer.targets.size, 0)).toBe(1);
    sight(inside, 1);
    await waitFor(() => expect(inside.style.opacity).toBe('1'));
    expect(MockObserver.all.size).toBe(0);
    await waitFor(() => expect(getByText('Headline').style.opacity).toBe('1'));
  });

  it('SplitReveal sinks back into its masks on the way out', async () => {
    window.__aktclEntered = true;
    const { container } = render(<SplitReveal as="h2" text="Facts & Figures" />);
    const h2 = container.querySelector('h2')!;
    const words = () => [...h2.querySelectorAll<HTMLElement>('[data-split-word] > span')];

    sight(h2, 1);
    await waitFor(() => expect(words().every((word) => word.style.transform === 'none')).toBe(true));
    sight(h2, 0);
    expect(words().every((word) => word.style.transform.startsWith('translate3d'))).toBe(true);
    expect([...h2.querySelectorAll('[data-split-word]')].every((mask) => mask.classList.contains('split-mask'))).toBe(
      true
    );
    // Still one heading with one name while hidden.
    expect(screen.getByRole('heading', { name: 'Facts & Figures' })).toBeInTheDocument();
  });

  it('SplitReveal never masks running text: a paragraph fades up 16px at most', async () => {
    window.__aktclEntered = true;
    const { container } = render(<SplitReveal as="p" text="Verbatim copy." />);
    const p = container.querySelector('p')!;
    const words = () => [...p.querySelectorAll<HTMLElement>('[data-split-word] > span')];
    expect(p.querySelector('.split-mask')).toBeNull();
    expect(words().every((word) => word.style.opacity === '0')).toBe(true);
    expect(words().every((word) => word.style.transform === 'translate3d(0, min(0.3em, 16px), 0)')).toBe(true);
    sight(p, 1);
    await waitFor(() => expect(words().every((word) => word.style.opacity === '1')).toBe(true));
  });

  it('ImageReveal wipes its picture in and out, and never hides it by opacity', async () => {
    window.__aktclEntered = true;
    const { container } = render(
      <ImageReveal className="aspect-[4/3] bg-secondary">
        <img alt="Leaf in the barn" />
      </ImageReveal>
    );
    const frame = container.querySelector<HTMLElement>('[data-image-reveal]')!;
    const mask = frame.firstElementChild as HTMLElement;
    const picture = mask.firstElementChild as HTMLElement;
    // The frame carries the caller's size and surface, and is never styled.
    expect(frame).toHaveClass('aspect-[4/3]', 'bg-secondary');
    expect(frame.getAttribute('style')).toBeNull();
    // A clip, never opacity or visibility: the picture is in the page the whole time.
    expect(container.innerHTML).not.toMatch(/opacity|visibility/);
    expect(screen.getByRole('img', { name: 'Leaf in the barn' })).toBeVisible();

    // Waiting below the fold: masked at its foot and a little enlarged.
    expect(mask.style.clipPath).toBe('inset(100% 0 0 0)');
    expect(picture.style.transform).toBe('scale(1.06)');

    sight(frame, 1);
    await waitFor(() => expect(mask.style.clipPath).toBe('inset(0 0 0 0)'));
    expect(picture.style.transform).toBe('none');
    expect(picture.style.transition).toBe(`transform 1.1s ${EASE.expoOut} 0s`);

    // Gone: the mask closes again, so the next arrival plays the wipe afresh.
    sight(frame, 0);
    expect(mask.style.clipPath).toBe('inset(100% 0 0 0)');
    expect(picture.style.transform).toBe('scale(1.06)');
    sight(frame, 1);
    expect(mask.style.clipPath).toBe('inset(0 0 0 0)');
    expect(container.innerHTML).not.toMatch(/opacity|visibility/);
  });

  it('ImageReveal leaves a picture that is already on screen alone: no wipe at mount', () => {
    window.__aktclEntered = true;
    // jsdom measures everything as a zero box, which counts as off screen. Give this
    // frame a real one, in view, so the mount test the component makes has something
    // to read: masking it here would blink away a picture the visitor is looking at.
    const box = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ top: 120, bottom: 520, left: 0, right: 900, width: 900, height: 400, x: 0, y: 120, toJSON: () => ({}) } as DOMRect);
    try {
      const { container } = render(
        <ImageReveal className="aspect-[4/3]">
          <img alt="Already in view" />
        </ImageReveal>
      );
      const mask = container.querySelector<HTMLElement>('[data-image-reveal]')!
        .firstElementChild as HTMLElement;
      expect(mask.style.clipPath).toBe('inset(0 0 0 0)');
    } finally {
      box.mockRestore();
    }
  });

  it('CountUp starts again from its first figure on every return', async () => {
    window.__aktclEntered = true;
    const { container } = render(<CountUp value={50} from={10} duration={60} />);
    const figure = container.firstElementChild as HTMLElement;

    sight(figure, 1);
    await waitFor(() => expect(figure.textContent).toBe('50'));
    // At rest it is one plain number: nothing for copied text to repeat.
    expect(figure.querySelector('.sr-only')).toBeNull();

    sight(figure, 0);
    expect(figure.textContent).toBe('50');
    sight(figure, 1);
    expect(figure.querySelector('[aria-hidden="true"]')?.textContent).toBe('10');
    expect(figure.querySelector('.sr-only')?.textContent).toBe('50');
    await waitFor(() => expect(figure.textContent).toBe('50'));
  });

  it('a controlled CountUp watches nothing and is one plain number until it plays', async () => {
    window.__aktclEntered = true;
    const { container, rerender } = render(<CountUp play={false} value={50} from={10} duration={60} />);
    const figure = container.firstElementChild as HTMLElement;
    expect(MockObserver.all.size).toBe(0);
    expect(figure.textContent).toBe('50');
    expect(figure.querySelector('.sr-only')).toBeNull();

    rerender(<CountUp play value={50} from={10} duration={60} />);
    expect(figure.querySelector('[aria-hidden="true"]')?.textContent).toBe('10');
    await waitFor(() => expect(figure.textContent).toBe('50'));
  });

  it('under isStill() nothing is observed and nothing is ever hidden', () => {
    window.__PRERENDER__ = true;
    const { container } = render(
      <>
        <Reveal>Body copy</Reveal>
        <SplitReveal as="h2" text="Heading" />
        <ImageReveal>
          <img alt="Leaf" />
        </ImageReveal>
        <CountUp value={1953} />
      </>
    );
    expect(MockObserver.all.size).toBe(0);
    expect(container.innerHTML).not.toMatch(/opacity|visibility|clip-path|transform/);
    expect(renderHook(() => useReveal(false)).result.current).toBe(true);
  });
});

// ---- LazyImage ------------------------------------------------------------------------

const picture = {
  img: { src: '/leaf.webp', w: 1434, h: 1920 },
  sources: { avif: '/leaf.avif 480w', webp: '/leaf.webp 480w' },
};

describe('LazyImage', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('asks for its file well ahead of the screen, on one shared observer', () => {
    render(
      <>
        <LazyImage image={picture} alt="Leaf one" sizes="320px" />
        <LazyImage image={picture} alt="Leaf two" sizes="320px" />
      </>
    );
    const observers = [...MockObserver.all];
    expect(observers).toHaveLength(1);
    expect(observers[0].rootMargin).toBe(AHEAD);
    expect(parseInt(AHEAD, 10)).toBeGreaterThanOrEqual(1200);
    expect(screen.getByRole('img', { name: 'Leaf one' })).not.toHaveAttribute('src');
  });

  it('waits transparent over its frame until decoded, then fades in over 300 ms', async () => {
    render(<LazyImage image={picture} alt="Leaf" sizes="320px" />);
    const img = screen.getByRole('img', { name: 'Leaf' }) as HTMLImageElement;
    expect(img.style.opacity).toBe('0');
    // Going transparent is instant: nothing is ever seen fading out.
    expect(img.style.transition).toBe('none');

    sight(img, 1);
    expect(img).toHaveAttribute('src', '/leaf.webp');
    expect(img.style.opacity).toBe('0');
    fireEvent.load(img);
    await waitFor(() => expect(img.style.opacity).toBe('1'));
    expect(img.style.transition).toBe(`opacity 300ms ${EASE.expoOut}`);
  });

  it('never holds back the priority image', () => {
    render(<LazyImage image={picture} alt="Hero" sizes="100vw" priority />);
    const img = screen.getByRole('img', { name: 'Hero' });
    expect(img).toHaveAttribute('src', '/leaf.webp');
    expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(img.getAttribute('style')).toBeNull();
    expect(MockObserver.all.size).toBe(0);
  });

  it('under isStill() carries no inline opacity for the snapshot', () => {
    window.__PRERENDER__ = true;
    render(<LazyImage image={picture} alt="Leaf" sizes="320px" />);
    expect(screen.getByRole('img', { name: 'Leaf' }).getAttribute('style')).toBeNull();
  });
});

describe('Marquee controls', () => {
  it('a band has ONE icon-only control that pauses every row', () => {
    const { container } = render(
      <MarqueeBand>
        <Marquee items={['Leaf Tobacco', 'Cut Rag']} />
        <Marquee items={['King Size']} />
      </MarqueeBand>
    );
    const rows = () => [...container.querySelectorAll('.marquee')];
    const [toggle, ...others] = screen.getAllByRole('button');
    expect(others).toHaveLength(0);
    expect(toggle).toHaveAccessibleName('Pause moving text');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle.textContent).toBe('');
    expect(container.textContent).not.toMatch(/Pause|Play|products/);
    expect(rows().some((row) => row.hasAttribute('data-paused'))).toBe(false);

    // One fixed name; the state is aria-pressed, never a second name.
    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName('Pause moving text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(rows().every((row) => row.hasAttribute('data-paused'))).toBe(true);

    fireEvent.click(toggle);
    expect(rows().some((row) => row.hasAttribute('data-paused'))).toBe(false);
  });

  it('keyboard focus inside the band holds it still until focus leaves', () => {
    const { container } = render(
      <MarqueeBand>
        <Marquee items={['Leaf Tobacco']} />
      </MarqueeBand>
    );
    const row = container.querySelector('.marquee')!;
    const toggle = screen.getByRole('button');
    act(() => toggle.focus());
    expect(row).toHaveAttribute('data-paused');
    act(() => toggle.blur());
    expect(row).not.toHaveAttribute('data-paused');
  });

  it('a lone marquee keeps its own control unless told otherwise', () => {
    const { rerender } = render(<Marquee items={['Leaf Tobacco']} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    rerender(<Marquee items={['Leaf Tobacco']} paused={false} />);
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<Marquee items={['Leaf Tobacco']} control={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
