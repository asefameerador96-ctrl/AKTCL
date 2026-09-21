import { cigaretteSizes, type CigaretteSize } from '@/content/sizes';

/*
 * Drawing geometry for the rod diagrams (RodDiagram, RodLineUp). Everything here is a
 * DRAWING PROPORTION derived from the format definitions in src/content/sizes.ts, never
 * AKTCL production data, and none of it is ever printed as a figure: the only numbers
 * the drawings show are the formats' own length labels and the two reference guides.
 */

export type RodFormat = CigaretteSize['rod'];

/**
 * Drawn thickness of each girth class as a share of the regular rod: a rank order for
 * the drawing (regular > slim > super slim > nano), deliberately not any diameter
 * figure. Real diameters are AKTCL data and go in sizes.ts → specs.
 */
const GIRTH_SHARE: Record<RodFormat['relativeGirth'], number> = {
  regular: 1,
  slim: 0.76,
  superslim: 0.64,
  nano: 0.54,
};

/** The regular rod's drawn thickness, in the drawing's units (its x axis is mm). */
const REGULAR_GIRTH = 8;

/** Drawn thickness per girth class, in drawing units. Proportions for the drawing only. */
export const GIRTH_MM = Object.fromEntries(
  Object.entries(GIRTH_SHARE).map(([girth, share]) => [girth, REGULAR_GIRTH * share])
) as Record<RodFormat['relativeGirth'], number>;

/** The thickest drawn rod: every diagram reserves this band, so rows line up. */
export const BAND_MM = Math.max(...Object.values(GIRTH_MM));

/** Share of the (shortest) rod drawn as the filter segment. Drawing proportion only. */
export const FILTER_SHARE = 0.27;

/** The furthest a format's rod reaches: its upper length where it is defined as a range. */
export const rodExtentMm = (rod: RodFormat) => rod.lengthMaxMm ?? rod.lengthMm;

/**
 * The shared mm span every diagram is drawn across, so that shown together (and page
 * to page) their lengths compare truthfully: the longest format, plus room past it
 * for the reference guides' labels at a 360px phone width.
 */
export const LINEUP_SPAN_MM = Math.max(...cigaretteSizes.map((size) => rodExtentMm(size.rod))) + 10;

/**
 * Reference guides of the line-up: the fixed lengths of the formats that are not
 * ranges (King Size, 100s, Super Slim → 84 mm and 100 mm). Derived, not typed, so the
 * guides follow the format definitions.
 */
export const GUIDES_MM: number[] = Array.from(
  new Set(cigaretteSizes.filter((size) => size.rod.lengthMaxMm === undefined).map((size) => size.rod.lengthMm))
).sort((a, b) => a - b);

/** A length as a CSS percentage of the span: positions HTML over the drawing's x axis. */
export const toPercent = (mm: number, spanMm = LINEUP_SPAN_MM) => `${+((mm / spanMm) * 100).toFixed(4)}%`;
