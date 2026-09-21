import PageLayout from '@/components/PageLayout';
import HeroCarousel from '@/components/HeroCarousel';
import WhoWeAre from '@/components/WhoWeAre';
import ProductShowcase from '@/components/ProductShowcase';
import FactsFigures from '@/components/FactsFigures';
import ProcessSection from '@/components/ProcessSection';
import PrivateLabelBand from '@/components/PrivateLabelBand';
import Gallery from '@/components/Gallery';
import Marquee from '@/components/motion/Marquee';
import { site } from '@/content/site';
import { categoryBySlug } from '@/content/products';

const namesOf = (slug: string) => categoryBySlug(slug)?.products.map((product) => product.name) ?? [];
const leafNames = namesOf('leaf-tobacco');
const cigaretteNames = namesOf('finished-cigarettes');

/**
 * The export range as one oversized running band, names verbatim from
 * src/content/products.ts: leaf in monumental outline, the finished-cigarette lines
 * beneath it, smaller, in italic, travelling the other way. Each row is read out once
 * as a list and carries its own pause button (see Marquee).
 */
const ProductMarquee = () => (
  <section
    aria-label={`Products exported by ${site.shortName}`}
    className="overflow-hidden border-y border-border py-8 md:py-12"
  >
    <Marquee outlined items={leafNames} className="text-foreground" />
    <Marquee
      items={cigaretteNames}
      speed={36}
      className="mt-2 text-[length:clamp(1.5rem,3.6vw,3.25rem)] font-normal italic tracking-[-0.02em] text-muted-foreground md:mt-4 [&_.marquee-track]:[animation-direction:reverse]"
    />
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
