import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ROUTES } from './seo/routeMeta';
import './index.css';

const container = document.getElementById('root')!;

// The prerenderer asks the running app which URLs exist instead of parsing source
// files, so the route list has exactly one definition (src/seo/routeMeta.ts).
if (window.__PRERENDER__) window.__AKTCL_ROUTES__ = ROUTES;

// The build prerenders each route into static HTML (scripts/prerender.mjs). That
// markup exists for crawlers that do not execute JavaScript — Bing, WhatsApp,
// Facebook, LinkedIn, GPTBot — and it gives real visitors something painted while
// the bundle loads.
//
// We deliberately do NOT hydrate it. Pages animate on scroll and on mount, so the
// snapshot is taken in a state React's first render cannot reproduce, and
// hydrateRoot would fail with React errors 418/423/425. Replacing the markup
// outright is correct and costs one extra render.
container.replaceChildren();
createRoot(container).render(<App />);
