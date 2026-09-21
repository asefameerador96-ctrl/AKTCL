import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ScrollToTop from '@/components/ScrollToTop';
import RouteSeo from '@/components/RouteSeo';
import AgeGate from '@/components/AgeGate';
import Index from './pages/Index.tsx';

// Only the homepage is bundled eagerly. Every other route is its own chunk, so a
// visitor landing on / never downloads the inner pages, and editing one page does
// not invalidate the others' cached chunks.
//
// Every indexable URL must also exist in src/seo/routeMeta.ts (ROUTES) — that list
// drives metadata, the sitemap and prerendering. routeMeta.test.ts checks the two
// stay in step.
const AboutUs = lazy(() => import('./pages/AboutUs.tsx'));
const JourneyIndex = lazy(() => import('./pages/JourneyIndex.tsx'));
const JourneyStage = lazy(() => import('./pages/JourneyStage.tsx'));
const ProductsIndex = lazy(() => import('./pages/ProductsIndex.tsx'));
const CategoryPage = lazy(() => import('./pages/CategoryPage.tsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.tsx'));
const Contact = lazy(() => import('./pages/Contact.tsx'));
const Privacy = lazy(() => import('./pages/Privacy.tsx'));
const Terms = lazy(() => import('./pages/Terms.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));

// Opting in to the v7 behaviours now: navigation runs in a transition, so the page
// being left stays on screen while the next page's chunk loads (no blank flash from
// the Suspense fallback), and the dev console stays free of upgrade warnings.
const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

const App = () => (
  <BrowserRouter future={ROUTER_FUTURE}>
    <ScrollToTop />
    <RouteSeo />
    <AgeGate />
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/journey" element={<JourneyIndex />} />
        <Route path="/journey/:slug" element={<JourneyStage />} />
        <Route path="/products" element={<ProductsIndex />} />
        <Route path="/products/:category" element={<CategoryPage />} />
        <Route path="/products/:category/:slug" element={<ProductPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
