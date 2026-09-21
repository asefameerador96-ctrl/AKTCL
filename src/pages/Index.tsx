import type { ReactNode } from 'react';
import PageLayout from '@/components/PageLayout';
import HeroCarousel from '@/components/HeroCarousel';
import WhoWeAre from '@/components/WhoWeAre';
import ProductShowcase from '@/components/ProductShowcase';
import SizesBand from '@/components/SizesBand';
import FactsFigures from '@/components/FactsFigures';
import ProcessSection from '@/components/ProcessSection';
import PrivateLabelBand from '@/components/PrivateLabelBand';
import Gallery from '@/components/Gallery';
import Marquee, { MarqueeBand } from '@/components/motion/Marquee';
import { site } from '@/content/site';
import { categoryBySlug } from '@/content/products';

const leaf = categoryBySlug('leaf-tobacco');
const cigarettes = categoryBySlug('finished-cigarettes');
const namesOf = (category: typeof leaf) => category?.products.map((product) => product.name) ?? [];

// Between the names: a small mono slash, solid even inside the outlined row (the
// outline is inherited text-fill / text-stroke, so both are handed back here), and
// lifted off the baseline to the middle of the capitals beside it. A quarter of the
// row's size, but never under 13px (the small italic row on a phone): the lift and
// the spacing are set on the outer span, in the row's own em, so they hold either way.
const SLASH = (
  <span className="relative -top-[0.234em] px-[0.026em] font-mono font-normal not-italic tracking-normal text-muted-foreground [-webkit-text-fill-color:currentColor] [-webkit-text-stroke:0]">
    <span className="text-[length:max(0.26em,0.8125rem)]">/</span>
  </span>
);

/**
 * One ruled row of the band: a mono label cell, a vertical hairline, then the running
 * names. The label only — no count beside it, and no control of its own: the band has
 * one, for both rows.
 */
const MarqueeRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-t border-border first:border-t-0 lg:flex">
    <div className="px-4 pt-3 sm:px-6 lg:w-56 lg:shrink-0 lg:border-r lg:border-border lg:px-0 lg:pb-3 lg:pr-6 lg:pt-6">
      <p className="eyebrow">{label}</p>
    </div>
    <div className="min-w-0 flex-1 pb-5 pt-2 md:pb-7 lg:pt-7">{children}</div>
  </div>
);

/**
 * The export range as a running band between two hairlines, names verbatim from
 * src/content/products.ts: leaf in monumental outline, the finished-cigarette lines
 * beneath it, smaller, in italic, travelling the other way — slowly. From lg the band
 * sits inside the page grid like every other ruled region, each row labelled in mono;
 * on a phone it runs edge to edge. Each row is read out once as a list (see Marquee).
 *
 * The two rows move and stop as one (MarqueeBand): a single icon-only pause control in
 * a ruled cell at the band's right end, never over the names, and a hold while the
 * pointer or keyboard focus is on the band. When the band stands still (prerender,
 * reduced motion) there is no control.
 */
const ProductMarquee = () => (
  <section aria-label={`Products exported by ${site.shortName}`} className="lg:mx-auto lg:max-w-7xl lg:px-6">
    <MarqueeBand className="overflow-hidden border-y border-border lg:border-r">
      {leaf && (
        <MarqueeRow label={leaf.label}>
          <Marquee outlined items={namesOf(leaf)} speed={40} separator={SLASH} className="text-foreground" />
        </MarqueeRow>
      )}
      {cigarettes && (
        <MarqueeRow label={cigarettes.label}>
          <Marquee
            items={namesOf(cigarettes)}
            speed={24}
            separator={SLASH}
            className="text-[length:clamp(1.5rem,3.6vw,3.25rem)] font-normal italic tracking-[-0.02em] text-muted-foreground [&_.marquee-track]:[animation-direction:reverse]"
          />
        </MarqueeRow>
      )}
    </MarqueeBand>
  </section>
);

// Shah Agro's homepage order — hero, products, figures, journey, gallery — with the
// two Orchid blocks slotted in: the company blurb after the hero and the private
// label band after the journey. Between the blurb and the catalogue runs the product
// marquee; straight after the catalogue, the cigarette sizes drawn to one scale. The
// rhythm alternates: a breathing section, then a dense one. PageLayout supplies the
// navbar, the closing "Request a Quote" band and the footers.
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
    <SizesBand />
    <FactsFigures />
    <ProcessSection />
    <PrivateLabelBand />
    <Gallery />
  </PageLayout>
);

export default Index;
