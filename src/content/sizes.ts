/**
 * Cigarette sizes — the /cigarette-sizes segment (owner request, 2026-09-22).
 *
 * DATA PROVENANCE — read before editing:
 *
 * 1. The figures are AKTCL's. Every `specs` value was supplied by the owner (Asef, AKTCL)
 *    as five "Packaging & Logistics Specifications" sheets with the size-page references,
 *    and confirmed by him on 2026-09-22 as AKTCL's own specification. Typed as supplied:
 *    en dashes for ranges, × for dimensions, ′ for feet. `typical: true` marks what the
 *    sheets call a typical (nominal) value; it renders "(typical)", so no "~". A field the
 *    sheets do not give stays null and is left off the size's data sheet (never guessed).
 *
 * 2. The format descriptions — `tagline`, `paragraphs`, `whyChoose`, `bestFor` — are
 *    AKTCL's, supplied and confirmed by the owner the same day and reworded by us for the
 *    trade (no consumer, lifestyle or health-appeal lines). The reference site's artwork
 *    and prose are not used: do not add its images to the repo or its text in here.
 *
 * 3. `name`, `lengthLabel` and `rod` are each format's nominal rod length (they agree with
 *    the supplied rod lengths) and drive the drawn rod diagram only.
 *
 * 4. `aktclLines` takes the product names from ./products.ts (workbook rows 22–26) by slug
 *    rather than retyping them. `sizesIntro` is UI microcopy; its lead is the owner's line.
 *    ("Premium King Size" left the workbook on 2026-09-22, so King Size lists King Size
 *    Filter only.)
 *
 * PARKED: the segment is off the live site while FEATURES.cigaretteSizes is false
 * (./features.ts, docs/feature-flags.md). This file is kept, and tested, as it is.
 *
 * Super Slim and Nano: the master carton size, outer carton size and pallet configuration
 * are published as supplied, at the owner's instruction, although they do not add up
 * physically — see docs/content-inventory.md, gap 7. To be verified with AKTCL logistics.
 *
 * Changing a figure is a data edit here only: pass it to `specs({ … })` for that size;
 * every key left out stays null and off the sheet. An infographic AKTCL owns can be attached per
 * size through `infographic` (registered in ./images.ts); it renders only when present.
 */
import type { SiteImage } from '@/content/images';
import { categories } from '@/content/products';

/**
 * null => not given; the data sheet leaves the field out. `typical` marks a nominal value, shown with
 * "(typical)" after it. `unit` is set small after the figure ("1,050" + "master cartons").
 */
export type SpecValue = { value: string; unit?: string; typical?: boolean } | null;

export interface SizeSpecs {
  // rod
  rodLength: SpecValue;
  circumference: SpecValue;
  diameter: SpecValue;
  filterLength: SpecValue;
  tobaccoWeight: SpecValue;
  tobaccoType: SpecValue;
  moisture: SpecValue;
  filterOptions: SpecValue;
  packFormats: SpecValue;
  // packaging structure
  sticksPerPack: SpecValue;
  packsPerOuter: SpecValue;
  outersPerMasterCarton: SpecValue;
  packsPerMasterCarton: SpecValue;
  sticksPerMasterCarton: SpecValue;
  // dimensions & weights
  packDimensions: SpecValue;
  outerDimensions: SpecValue;
  masterCartonDimensions: SpecValue;
  masterCartonGrossWeight: SpecValue;
  palletConfiguration: SpecValue;
  // logistics / MOQ
  cartons40HC: SpecValue;
  cartons20ft: SpecValue;
  moq: SpecValue;
}

export interface CigaretteSize {
  slug: 'king-size' | '100s' | 'slim' | 'super-slim' | 'nano';
  /** Format name: "King Size", "100s", "Slim", "Super Slim", "Nano". */
  name: string;
  /** The format's nominal rod length, as a label. */
  lengthLabel: string;
  /** Drives the drawn rod diagram only. */
  rod: {
    lengthMm: number;
    /** Upper end where the format is defined as a range (Slim, Nano). */
    lengthMaxMm?: number;
    relativeGirth: 'regular' | 'slim' | 'superslim' | 'nano';
  };
  /** One line under the name: the masthead's lead, the directory rows. Owner-approved copy. */
  tagline: string;
  /** The format described, for the trade. Owner-approved copy. */
  paragraphs: string[];
  /** "Why brands choose it". Owner-approved copy. */
  whyChoose: string[];
  /** "Best for". Owner-approved copy. */
  bestFor: string[];
  /** AKTCL product names (from ./products.ts) made in this format. May be empty. */
  aktclLines: string[];
  /** AKTCL's figures (see the header); null is not given and not shown. */
  specs: SizeSpecs;
  /** Optional per-size infographic AKTCL owns the rights to. Absent for now. */
  infographic?: SiteImage;
}

/** Every field, in display order, null unless given. See the header comment. */
const specs = (known: Partial<SizeSpecs> = {}): SizeSpecs => ({
  rodLength: null,
  circumference: null,
  diameter: null,
  filterLength: null,
  tobaccoWeight: null,
  tobaccoType: null,
  moisture: null,
  filterOptions: null,
  packFormats: null,
  sticksPerPack: null,
  packsPerOuter: null,
  outersPerMasterCarton: null,
  packsPerMasterCarton: null,
  sticksPerMasterCarton: null,
  packDimensions: null,
  outerDimensions: null,
  masterCartonDimensions: null,
  masterCartonGrossWeight: null,
  palletConfiguration: null,
  cartons40HC: null,
  cartons20ft: null,
  moq: null,
  ...known,
});

/**
 * Packaging structure and container loads: the same on all five sheets. packsPerOuter
 * is the sheets' own arithmetic (500 packs over 50 outers per master carton).
 */
const COMMON: Partial<SizeSpecs> = {
  sticksPerPack: { value: '20' },
  packsPerOuter: { value: '10' },
  outersPerMasterCarton: { value: '50' },
  packsPerMasterCarton: { value: '500' },
  sticksPerMasterCarton: { value: '10,000' },
  cartons40HC: { value: '1,050', unit: 'master cartons' },
  cartons20ft: { value: '450', unit: 'master cartons' },
  moq: { value: 'One full container load — 450 master cartons (20′) or 1,050 (40′ HC)' },
};

const finishedCigarettes = categories.find((c) => c.slug === 'finished-cigarettes');

/**
 * The product name exactly as products.ts has it. Throws on a missing slug so a rename
 * there fails the tests and the prerender instead of silently dropping a line here.
 */
const lineName = (slug: string): string => {
  const product = finishedCigarettes?.products.find((p) => p.slug === slug);
  if (!product) throw new Error(`sizes.ts: no finished-cigarettes product "${slug}" in products.ts`);
  return product.name;
};

/** UI microcopy; the lead is the owner-approved line (2026-09-22). */
export const sizesIntro: { eyebrow: string; heading: string; lead?: string } = {
  eyebrow: 'Cigarette Sizes',
  heading: 'Formats & specifications',
  lead: 'Five cigarette formats, each run on dedicated lines to its own specification.',
};

export const cigaretteSizes: CigaretteSize[] = [
  {
    slug: 'king-size',
    name: 'King Size',
    lengthLabel: '84 mm',
    rod: { lengthMm: 84, relativeGirth: 'regular' },
    tagline: 'The international standard format.',
    paragraphs: [
      'King Size is the reference format in cigarette manufacturing: an 84 mm rod on a regular 24.0–24.8 mm circumference, recognised by distributors and retail buyers in almost every market.',
      'On our lines King Size runs to tight tolerances. Rod firmness, ventilation and paper porosity are held consistent from the first stick of a production run to the last, so every master carton ships to the same specification.',
    ],
    whyChoose: [
      'Accepted in virtually every export market',
      'Compatible with the widest range of blends',
      'Soft cup, hinge-lid and slide pack options',
      'A dependable base for retail and private label lines',
    ],
    bestFor: ['National retail brands', 'Contract and volume programmes', 'First private label launches'],
    aktclLines: [lineName('king-size-filter')],
    specs: specs({
      ...COMMON,
      rodLength: { value: '84 mm' },
      circumference: { value: '24.0–24.8 mm' },
      filterOptions: { value: 'Regular, charcoal, recessed' },
      packFormats: { value: 'Soft cup, hinge-lid (HLP), slide' },
    }),
  },
  {
    slug: '100s',
    name: '100s',
    lengthLabel: '100 mm',
    rod: { lengthMm: 100, relativeGirth: 'regular' },
    tagline: 'King Size girth, with added length.',
    paragraphs: [
      'The 100s keeps the regular 24.0–24.8 mm circumference of King Size and extends the rod to 100 mm.',
      'Because the extra length changes how the rod burns, ventilation and filtration are re-balanced for each 100s programme rather than carried over from a King Size specification, so the stick stays consistent down to the tipping.',
    ],
    whyChoose: [
      'Regular circumference on a longer rod',
      'Ventilation and filtration tuned to the length',
      'Hinge-lid, king box and slide packs',
      'Established in premium ranges in many markets',
    ],
    bestFor: [
      'Premium and super-premium ranges',
      'Markets with established 100s demand',
      'Line extensions of King Size brands',
    ],
    aktclLines: [],
    specs: specs({
      ...COMMON,
      rodLength: { value: '100 mm' },
      circumference: { value: '24.0–24.8 mm' },
      filterOptions: { value: 'Regular, charcoal, firm-tip' },
      packFormats: { value: 'Hinge-lid (HLP), king box, slide' },
    }),
  },
  {
    slug: 'slim',
    name: 'Slim',
    lengthLabel: '100–120 mm',
    rod: { lengthMm: 100, lengthMaxMm: 120, relativeGirth: 'slim' },
    tagline: 'A narrower rod for modern pack formats.',
    paragraphs: [
      'Slim sits between the regular and super slim formats: a 16.5–17.5 mm circumference on a 100–120 mm rod, using less tobacco per stick than a regular format.',
      'Narrow rods are less forgiving of density variation, so our slim lines are set up for this width specifically, keeping density and burn consistent from the first stick of a run to the last.',
    ],
    whyChoose: [
      'Efficient tobacco usage per stick',
      'Consistent density on a narrow rod',
      'Slim hinge-lid and shoulder box packs',
      'Virginia or American blends, customisable',
    ],
    bestFor: [
      'Premium slim pack designs',
      'Portfolio extensions of regular brands',
      'Markets moving to slimmer formats',
    ],
    aktclLines: [],
    specs: specs({
      ...COMMON,
      rodLength: { value: '100–120 mm', typical: true },
      circumference: { value: '16.5–17.5 mm' },
      diameter: { value: '5.4–6.0 mm', typical: true },
      filterLength: { value: '20–25 mm', typical: true },
      tobaccoWeight: { value: '0.45–0.60 g', typical: true },
      tobaccoType: { value: 'Virginia / American blend (customisable)' },
      filterOptions: { value: 'Regular, firm-tip, recessed' },
      packFormats: { value: 'Slim hinge-lid, shoulder box' },
    }),
  },
  {
    slug: 'super-slim',
    name: 'Super Slim',
    lengthLabel: '100 mm',
    rod: { lengthMm: 100, relativeGirth: 'superslim' },
    tagline: 'Premium positioning on a narrow rod.',
    paragraphs: [
      'Super Slim pairs a 100 mm rod with a 16.0–17.0 mm circumference and firm-tip, recessed or carbon filters.',
      'The format is well established across the GCC, Eastern Europe and much of Asia, and it is where packaging and print carry the brand, so we match the fine rod with super slim hinge-lid and lipstick box packs.',
    ],
    whyChoose: [
      'Narrow 16.0–17.0 mm circumference',
      'Firm-tip, recessed and carbon filters',
      'Super slim hinge-lid and lipstick box packs',
      'Established in GCC and Asian markets',
    ],
    bestFor: ['Super-premium positioning', 'Export ranges for the GCC and Asia', 'Signature limited editions'],
    aktclLines: [lineName('super-slim')],
    specs: specs({
      ...COMMON,
      rodLength: { value: '100 mm', typical: true },
      circumference: { value: '16.0–17.0 mm' },
      diameter: { value: '4.8–5.4 mm', typical: true },
      filterLength: { value: '20–25 mm', typical: true },
      tobaccoWeight: { value: '0.30–0.40 g', typical: true },
      filterOptions: { value: 'Firm-tip, recessed, carbon' },
      packFormats: { value: 'Super slim hinge-lid, lipstick box' },
      packDimensions: { value: '100 × 57 × 9 mm (soft pack, L × W × H)' },
      // As supplied (owner's instruction); physically inconsistent, see the header.
      outerDimensions: { value: '540 × 280 × 115 mm (L × W × H)' },
      masterCartonDimensions: { value: '105 × 60 × 100 mm (L × W × H)' },
      masterCartonGrossWeight: { value: '12–14 kg', typical: true },
      palletConfiguration: { value: '8 outers per layer, 6 layers per pallet (48 outers)' },
    }),
  },
  {
    slug: 'nano',
    name: 'Nano',
    lengthLabel: '84–100 mm',
    rod: { lengthMm: 84, lengthMaxMm: 100, relativeGirth: 'nano' },
    tagline: 'The most compact format we make.',
    paragraphs: [
      'Nano is the smallest-diameter format in the range: a 14.0–15.5 mm circumference on an 84–100 mm rod, packed in nano hinge-lid or compact slide packs.',
      'At this diameter small variations show, so our Nano runs are held to the same tolerances as our slim formats.',
    ],
    whyChoose: [
      'Smallest circumference in the range',
      'Compact nano hinge-lid and slide packs',
      'Firm-tip and recessed filters',
      'Growing demand in newer markets',
    ],
    bestFor: ['Compact-pack brands', 'Portfolio extensions alongside slims', 'Travel retail ranges'],
    aktclLines: [lineName('nano')],
    specs: specs({
      ...COMMON,
      rodLength: { value: '84–100 mm', typical: true },
      circumference: { value: '14.0–15.5 mm' },
      diameter: { value: '3.8–4.5 mm', typical: true },
      filterLength: { value: '15–20 mm', typical: true },
      tobaccoWeight: { value: '0.20–0.30 g', typical: true },
      tobaccoType: { value: 'Virginia blend (customisable)' },
      moisture: { value: '12% ± 2%', typical: true },
      filterOptions: { value: 'Firm-tip, recessed' },
      packFormats: { value: 'Nano hinge-lid, compact slide' },
      packDimensions: { value: '100 × 52 × 8 mm (soft pack, L × W × H)' },
      // As supplied (owner's instruction); physically inconsistent, see the header.
      outerDimensions: { value: '540 × 275 × 110 mm (L × W × H)' },
      masterCartonDimensions: { value: '105 × 55 × 95 mm (L × W × H)' },
      masterCartonGrossWeight: { value: '10–11.5 kg', typical: true },
      palletConfiguration: { value: '10 outers per layer, 7 layers per pallet (70 outers)' },
    }),
  },
];

export const sizeBySlug = (slug?: string) => cigaretteSizes.find((s) => s.slug === slug);

/** Named as the supplied sheets name them, where they name the field. */
export const SPEC_LABELS: Record<keyof SizeSpecs, string> = {
  rodLength: 'Rod length',
  circumference: 'Circumference',
  diameter: 'Diameter',
  filterLength: 'Filter length',
  tobaccoWeight: 'Tobacco weight',
  tobaccoType: 'Tobacco type',
  moisture: 'Moisture content',
  filterOptions: 'Filter options',
  packFormats: 'Pack formats',
  sticksPerPack: 'Cigarettes per pack',
  packsPerOuter: 'Packs per outer',
  outersPerMasterCarton: 'Outers per master carton',
  packsPerMasterCarton: 'Packs per master carton',
  sticksPerMasterCarton: 'Cigarettes per master carton',
  packDimensions: 'Pack dimensions',
  outerDimensions: 'Outer carton size',
  masterCartonDimensions: 'Master carton size',
  masterCartonGrossWeight: 'Gross weight per master carton',
  palletConfiguration: 'Pallet configuration',
  cartons40HC: '40′ high cube container',
  cartons20ft: '20′ container',
  moq: 'Minimum order quantity',
};

/** Every SizeSpecs key exactly once (routeMeta.test.ts checks it). */
export const SPEC_GROUPS: { title: string; keys: (keyof SizeSpecs)[] }[] = [
  {
    title: 'Rod',
    keys: [
      'rodLength',
      'circumference',
      'diameter',
      'filterLength',
      'tobaccoWeight',
      'tobaccoType',
      'moisture',
      'filterOptions',
      'packFormats',
    ],
  },
  {
    title: 'Packaging structure',
    keys: ['sticksPerPack', 'packsPerOuter', 'outersPerMasterCarton', 'packsPerMasterCarton', 'sticksPerMasterCarton'],
  },
  {
    title: 'Dimensions & weights',
    keys: ['packDimensions', 'outerDimensions', 'masterCartonDimensions', 'masterCartonGrossWeight', 'palletConfiguration'],
  },
  {
    title: 'Logistics & MOQ',
    keys: ['cartons40HC', 'cartons20ft', 'moq'],
  },
];

/** true once at least one figure is filled in for this size. */
export const hasAnySpecs = (s: CigaretteSize) => Object.values(s.specs).some((v) => v !== null);
