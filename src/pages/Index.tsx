import PageLayout from '@/components/PageLayout';
import HeroCarousel from '@/components/HeroCarousel';
import WhoWeAre from '@/components/WhoWeAre';
import ProductShowcase from '@/components/ProductShowcase';
import FactsFigures from '@/components/FactsFigures';
import ProcessSection from '@/components/ProcessSection';
import PrivateLabelBand from '@/components/PrivateLabelBand';
import Gallery from '@/components/Gallery';

// Shah Agro's homepage order — hero, products, figures, journey, gallery — with the
// two Orchid blocks slotted in: the company blurb after the hero and the private
// label band after the journey. PageLayout supplies the navbar, the closing
// "Request a Quote" band and the footers.
//
// This page is the only one bundled eagerly (see App.tsx), so every section is a
// plain import with no heavy dependency behind it; nothing here is worth a Suspense
// boundary and the layout shift that comes with one.
const Index = () => (
  <PageLayout overHero>
    <HeroCarousel />
    <WhoWeAre />
    <ProductShowcase />
    <FactsFigures />
    <ProcessSection />
    <PrivateLabelBand />
    <Gallery />
  </PageLayout>
);

export default Index;
