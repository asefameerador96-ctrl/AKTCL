/**
 * Feature flags: parts of the site that are built and kept in the code but not live.
 *
 * cigaretteSizes — the /cigarette-sizes segment (index + five format pages), its nav and
 * footer links and the homepage "Cigarette Sizes" band. Parked at the owner's request
 * (Asef, 2026-09-22), to be made live again later. While false: the routes are not in
 * ROUTES (src/seo/routeMeta.ts), so they are not prerendered and not in the sitemap;
 * App.tsx does not register them, so the URLs return the 404 page; and every link to them
 * is hidden. The pages, components and src/content/sizes.ts stay in the repo unchanged.
 *
 * Turning a segment back on: docs/feature-flags.md.
 *
 * Text only (no imports), so tests and tooling can load it.
 */
export const FEATURES = { cigaretteSizes: false } as const;
