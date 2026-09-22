/**
 * Global Reach — the homepage world map and its row of country tags
 * (src/components/GlobalReach.tsx, a port of Shah Agro's section).
 *
 * DATA PROVENANCE — read before editing:
 *
 * These are NOT AKTCL's export markets. AKTCL has not yet confirmed its own list
 * (docs/content-inventory.md, gap 12), so at the owner's request (Asef, 2026-09-22) the
 * map shows a stand-in set of key import markets for leaf tobacco and cigarettes from
 * Bangladesh and India, and the section says exactly that in its note line
 * (`reachIntro.note`, the owner-approved wording). Nothing on the page may claim AKTCL
 * exports to these countries, and the tooltip names a region only, never a product.
 * China is left out of the list at the owner's request (Asef, 2026-09-22): 20 markets.
 *
 * TODO(Asef): replace `markets` with AKTCL's confirmed export markets. Then the note can
 * become "Where we export" (and the heading can stay).
 *
 * `name` is the country's `properties.name` in world-atlas 2 countries-110m
 * (public/geo/countries-110m.json), which is how the map finds it; `label` is what the
 * tag and the tooltip show. A market too small for the 110m map (Singapore) has
 * `onMap: false`: it is a tag, and the map marks it with a point instead of a shape.
 * Bangladesh is the origin, drawn solid on the map; it is not a market.
 *
 * Text only (no imports), so tests and tooling can load it without the map library.
 */

export type MarketRegion = 'Europe' | 'Middle East' | 'Africa' | 'Asia' | 'Americas';

export interface Market {
  /** world-atlas `properties.name`: how the map matches the country. */
  name: string;
  /** Display name, on the tag and in the tooltip. */
  label: string;
  region: MarketRegion;
  /** False where the 110m map has no shape for the country. */
  onMap: boolean;
}

export const reachIntro = {
  eyebrow: 'Global Reach',
  heading: 'From Bangladesh to the world',
  /** Set in the display italic. */
  italic: ['world'],
  note: 'Key import markets for leaf tobacco and cigarettes from Bangladesh and India.',
} as const;

/** The origin, drawn solid on the map. world-atlas `properties.name`. */
export const ORIGIN = { name: 'Bangladesh', label: 'Bangladesh' } as const;

// TODO(Asef): AKTCL's confirmed export markets go here (see the note at the top).
export const markets: Market[] = [
  { name: 'Belgium', label: 'Belgium', region: 'Europe', onMap: true },
  { name: 'Germany', label: 'Germany', region: 'Europe', onMap: true },
  { name: 'Netherlands', label: 'Netherlands', region: 'Europe', onMap: true },
  { name: 'Poland', label: 'Poland', region: 'Europe', onMap: true },
  { name: 'United Kingdom', label: 'United Kingdom', region: 'Europe', onMap: true },
  { name: 'Russia', label: 'Russia', region: 'Europe', onMap: true },
  { name: 'Turkey', label: 'Türkiye', region: 'Europe', onMap: true },
  { name: 'Egypt', label: 'Egypt', region: 'Africa', onMap: true },
  { name: 'South Africa', label: 'South Africa', region: 'Africa', onMap: true },
  { name: 'United Arab Emirates', label: 'United Arab Emirates', region: 'Middle East', onMap: true },
  { name: 'Saudi Arabia', label: 'Saudi Arabia', region: 'Middle East', onMap: true },
  { name: 'Indonesia', label: 'Indonesia', region: 'Asia', onMap: true },
  { name: 'Malaysia', label: 'Malaysia', region: 'Asia', onMap: true },
  { name: 'Singapore', label: 'Singapore', region: 'Asia', onMap: false },
  { name: 'Philippines', label: 'Philippines', region: 'Asia', onMap: true },
  { name: 'Vietnam', label: 'Vietnam', region: 'Asia', onMap: true },
  { name: 'Nepal', label: 'Nepal', region: 'Asia', onMap: true },
  { name: 'Sri Lanka', label: 'Sri Lanka', region: 'Asia', onMap: true },
  { name: 'Japan', label: 'Japan', region: 'Asia', onMap: true },
  { name: 'United States of America', label: 'United States', region: 'Americas', onMap: true },
];
