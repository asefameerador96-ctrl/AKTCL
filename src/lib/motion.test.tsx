import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SplitReveal from '@/components/motion/SplitReveal';
import Marquee from '@/components/motion/Marquee';
import CountUp from '@/components/motion/CountUp';
import Reveal from '@/components/Reveal';
import { EASE, ENTERED_EVENT, isStill, useEntered } from './motion';

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
        <Marquee items={['Leaf Tobacco', 'Cigarettes']} />
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
