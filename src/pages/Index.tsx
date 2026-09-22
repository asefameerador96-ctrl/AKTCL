import { Suspense, lazy } from 'react';
import PageLayout from '@/components/PageLayout';
import HeroCarousel from '@/components/HeroCarousel';
import WhoWeAre from '@/components/WhoWeAre';
import ProductShowcase from '@/components/ProductShowcase';
import SizesBand from '@/components/SizesBand';
import FactsFigures from '@/components/FactsFigures';
import ProcessSection from '@/components/ProcessSection';
import PrivateLabelBand from '@/components/PrivateLabelBand';
import Gallery from '@/components/Gallery';
import { FEATURES } from '@/content/features';

// The one section behind a boundary: the world map is its own chunk (and the map library
// a second one, fetched by the section itself once it nears the screen), so the eager
// homepage bundle carries only this line.
const GlobalReach = lazy(() => import('@/components/GlobalReach'));

// Shah Agro's homepage order — hero, products, figures, journey, global reach, gallery —
// with the two Orchid blocks slotted in: the company blurb after the hero and the private
// label band after the world map. The rhythm alternates: a breathing section, then a
// dense one. PageLayout supplies the navbar, the closing "Request a Quote" band and the
// footers.
//
// The running product-name band that sat between the blurb and the catalogue was taken
// out at the owner's request (2026-09-22); the Marquee component stays in
// src/components/motion for later use. The "Cigarette Sizes" band after the catalogue is
// parked behind FEATURES.cigaretteSizes (src/content/features.ts): with the flag off it
// is not rendered, and the catalogue runs straight into the figures.
//
// This page is the only one bundled eagerly (see App.tsx), so every section is a
// plain import with no heavy dependency behind it — except Global Reach, the world
// map. It is lazy (above), and its fallback holds roughly the section's own height at
// each breakpoint (padding, headline, the map frame at 960:460 of the column, the
// tags), so the page below it does not jump when it arrives. It is far below the fold,
// and the prerendered HTML carries the whole section, so crawlers never see the fallback.
const Index = () => (
  <PageLayout overHero>
    <HeroCarousel />
    <WhoWeAre />
    <ProductShowcase />
    {FEATURES.cigaretteSizes && <SizesBand />}
    <FactsFigures />
    <ProcessSection />
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="h-[calc(68rem_+_48vw)] md:h-[calc(49.5rem_+_47.9vw_-_23px)] lg:h-[calc(53rem_+_min(100vw,80rem)_*_0.479_-_23px)]"
        />
      }
    >
      <GlobalReach />
    </Suspense>
    <PrivateLabelBand />
    <Gallery />
  </PageLayout>
);

export default Index;
