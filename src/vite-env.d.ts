/// <reference types="vite/client" />

// vite-imagetools "?w=...&format=avif;webp&quality=..&as=picture" imports.
declare module '*&as=picture' {
  const picture: {
    img: { src: string; w: number; h: number };
    sources: { avif?: string; webp?: string };
  };
  export default picture;
}

interface Window {
  /** Set by scripts/prerender.mjs and scripts/verify-build.mjs before any app code runs. */
  __PRERENDER__?: boolean;
  /** Route manifest exposed to the prerenderer only (see src/main.tsx). */
  __AKTCL_ROUTES__?: unknown;
  /** Cookieless analytics tracker (site-analytics t.js), when loaded. */
  sa?: (type: 'lead' | 'event', name: string) => void;
}
