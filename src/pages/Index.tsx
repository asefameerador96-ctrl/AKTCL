import { useState } from 'react';
import type { ReactNode } from 'react';
import PageLayout from '@/components/PageLayout';
import HeroCarousel from '@/components/HeroCarousel';
import WhoWeAre from '@/components/WhoWeAre';
import ProductShowcase from '@/components/ProductShowcase';
import FactsFigures from '@/components/FactsFigures';
import ProcessSection from '@/components/ProcessSection';
import PrivateLabelBand from '@/components/PrivateLabelBand';
import Gallery from '@/components/Gallery';
import Marquee, { MarqueePause } from '@/components/motion/Marquee';
import { isStill } from '@/lib/motion';
import { site } from '@/content/site';
import { categoryBySlug } from '@/content/products';

const leaf = categoryBySlug('leaf-tobacco');
const cigarettes = categoryBySlug('finished-cigarettes');
const namesOf = (category: typeof leaf) => category?.products.map((product) => product.name) ?? [];

const two = (n: number) => String(n).padStart(2, '0');

// Between the names: a small mono slash, solid even inside the outlined row (the
// outline is inherited text-fill / text-stroke, so both are handed back here), and
// lifted off the baseline to the middle of the capitals beside it.
const SLASH = (
  <span className="relative -top-[0.9em] px-[0.1em] font-mono text-[0.26em] font-normal not-italic tracking-normal text-muted-foreground [-webkit-text-fill-color:currentColor] [-webkit-text-stroke:0]">
    /
  </span>
);

interface MarqueeRowProps {
  label: string;
  count: number;
  /** The band, handed this row's pause state. */
  children: (paused: boolean) => ReactNode;
}

/**
 * One ruled row of the band: a mono annotation cell, a vertical hairline, then the
 * running names. The cell also holds the row's pause control, so it never sits on the
 * type; there is none when the band stands still (prerender, reduced motion).
 */
const MarqueeRow = ({ label, count, children }: MarqueeRowProps) => {
  const [still] = useState(isStill);
  const [paused, setPaused] = useState(false);

  return (
    <div className="border-t border-border first:border-t-0 lg:flex">
      <div className="flex items-center justify-between gap-4 px-4 pt-3 sm:px-6 lg:w-56 lg:shrink-0 lg:flex-col lg:items-stretch lg:border-r lg:border-border lg:px-0 lg:pb-3 lg:pr-6 lg:pt-6">
        <p className="eyebrow">{label}</p>
        <div className="flex items-center justify-between gap-5">
          <p className="eyebrow tabular-nums">
            <span aria-hidden="true">({two(count)})</span>
            <span className="sr-only">{count} products</span>
          </p>
          {!still && <MarqueePause paused={paused} onToggle={() => setPaused((p) => !p)} of={label} />}
        </div>
      </div>
      <div className="min-w-0 flex-1 pb-5 pt-2 md:pb-7 lg:pt-7">{children(paused)}</div>
    </div>
  );
};

/**
 * The export range as a running band between two hairlines, names verbatim from
 * src/content/products.ts: leaf in monumental outline, the finished-cigarette lines
 * beneath it, smaller, in italic, travelling the other way — slowly. From lg the band
 * sits inside the page grid like every other ruled region, each row annotated in mono;
 * on a phone it runs edge to edge. Each row is read out once as a list and has its own
 * pause control in its label cell (see Marquee).
 */
const ProductMarquee = () => (
  <section aria-label={`Products exported by ${site.shortName}`} className="lg:mx-auto lg:max-w-7xl lg:px-6">
    <div className="overflow-hidden border-y border-border lg:border-r">
      {leaf && (
        <MarqueeRow label={leaf.label} count={leaf.products.length}>
          {(paused) => (
            <Marquee
              outlined
              paused={paused}
              items={namesOf(leaf)}
              speed={40}
              separator={SLASH}
              className="text-foreground"
            />
          )}
        </MarqueeRow>
      )}
      {cigarettes && (
        <MarqueeRow label={cigarettes.label} count={cigarettes.products.length}>
          {(paused) => (
            <Marquee
              paused={paused}
              items={namesOf(cigarettes)}
              speed={24}
              separator={SLASH}
              className="text-[length:clamp(1.5rem,3.6vw,3.25rem)] font-normal italic tracking-[-0.02em] text-muted-foreground [&_.marquee-track]:[animation-direction:reverse]"
            />
          )}
        </MarqueeRow>
      )}
    </div>
  </section>
);

// Shah Agro's homepage order — hero, products, figures, journey, gallery — with the
// two Orchid blocks slotted in: the company blurb after the hero and the private
// label band after the journey. Between the blurb and the catalogue runs the product
// marquee. The rhythm alternates: a breathing section, then a dense one. PageLayout
// supplies the navbar, the closing "Request a Quote" band and the footers.
//
// This page is the only one bundled eagerly (see App.tsx), so every section is a
// plain import with no heavy dependency behind it; nothing here is worth a Suspense
// boundary and the layout shift that comes with one.
const Index = () => (
  <PageLayout overHero>
    <HeroCarousel />
    <WhoWeAre />
    <ProductMarquee />
    <ProductShowcase />
    <FactsFigures />
    <ProcessSection />
    <PrivateLabelBand />
    <Gallery />
  </PageLayout>
);

export default Index;
