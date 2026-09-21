/**
 * Cigarette sizes — the /cigarette-sizes segment (owner request, 2026-09-22).
 *
 * DATA PROVENANCE — read before editing:
 *
 * 1. Format definitions, not AKTCL data. `name`, `lengthLabel` and `rod` are the
 *    industry's nominal rod-length definitions of each format (King Size 84 mm, 100s
 *    100 mm, Slim 100–120 mm, Super Slim 100 mm, Nano 84–100 mm). They say what the
 *    format IS, not what AKTCL produces, and drive the drawn rod diagram only.
 *
 * 2. `specs` is AKTCL production data and is ALL `null` ("On request") until AKTCL
 *    confirms its own figures. The reference infographics the owner supplied (King
 *    Size, 100s, Slim, Super Slim, Nano "Packaging & Logistics Specifications") are
 *    Orchid Cigarettes' copyrighted artwork showing Orchid's production specs. Do not
 *    copy those images into the repo and do not type their numbers in here — several
 *    of their labels also look swapped (see docs/content-inventory.md, gap list).
 *
 * 3. Copy is verbatim from ./products.ts (workbook rows 21–27): `aktclLines` takes the
 *    product names from there by slug rather than retyping them. Nothing else here is
 *    AKTCL copy; `sizesIntro` is UI microcopy.
 *
 * Filling in later is a data edit in this file only. When AKTCL supplies a figure,
 * pass it to `specs({ … })` for that size; every key left out stays "On request":
 *
 *   specs: specs({
 *     sticksPerPack: { value: '<AKTCL figure>' },
 *     moisture: { value: '<AKTCL figure>', typical: true }, // typical: a nominal value
 *   }),
 *
 * An infographic AKTCL owns can be attached per size through `infographic`
 * (registered in ./images.ts like every other image); it renders only when present.
 */
import type { SiteImage } from '@/content/images';
import { categories } from '@/content/products';

/** null => rendered as "On request". `typical` marks a nominal value, shown with "(typical)" after it. */
export type SpecValue = { value: string; typical?: boolean } | null;

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
  /** Format definition (nominal rod length), not AKTCL production data. */
  lengthLabel: string;
  /** Format definition: drives the drawn rod diagram only. */
  rod: {
    lengthMm: number;
    /** Upper end where the format is defined as a range (Slim, Nano). */
    lengthMaxMm?: number;
    relativeGirth: 'regular' | 'slim' | 'superslim' | 'nano';
  };
  /** ONLY verbatim AKTCL copy. Absent until AKTCL supplies a line that describes the format. */
  summary?: string;
  /** AKTCL product names (from ./products.ts) made in this format. May be empty. */
  aktclLines: string[];
  /** AKTCL production data — every value null ("On request") until AKTCL confirms it. */
  specs: SizeSpecs;
  /** Optional per-size infographic AKTCL owns the rights to. Absent for now. */
  infographic?: SiteImage;
}

/** Every field, in display order, "On request" unless given. See the header comment. */
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

/** UI microcopy only — no AKTCL claim. The lead goes stale once specs are filled; revisit then. */
export const sizesIntro: { eyebrow: string; heading: string; lead?: string } = {
  eyebrow: 'Cigarette Sizes',
  heading: 'Formats & specifications',
  lead: 'Specifications for each format are available on request through the enquiry form.',
};

/*
 * TODO(Asef): no `summary` on any size. The workbook has no copy for 100s or Slim, and
 * the finished-cigarette one-liners describe individual lines, not whole formats — the
 * Super Slim line is also consumer-styled, so it is listed by name only (compliance).
 * Supply a trade-toned line per format and it goes in `summary` verbatim.
 */
export const cigaretteSizes: CigaretteSize[] = [
  {
    slug: 'king-size',
    name: 'King Size',
    lengthLabel: '84 mm', // format definition
    rod: { lengthMm: 84, relativeGirth: 'regular' }, // format definition
    aktclLines: [lineName('premium-king-size'), lineName('king-size-filter')],
    specs: specs(), // TODO(Asef): AKTCL's own figures, pending confirmation
  },
  {
    slug: '100s',
    name: '100s',
    lengthLabel: '100 mm', // format definition
    rod: { lengthMm: 100, relativeGirth: 'regular' }, // format definition
    aktclLines: [],
    specs: specs(), // TODO(Asef): AKTCL's own figures, pending confirmation
  },
  {
    slug: 'slim',
    name: 'Slim',
    lengthLabel: '100–120 mm', // format definition
    rod: { lengthMm: 100, lengthMaxMm: 120, relativeGirth: 'slim' }, // format definition
    aktclLines: [],
    specs: specs(), // TODO(Asef): AKTCL's own figures, pending confirmation
  },
  {
    slug: 'super-slim',
    name: 'Super Slim',
    lengthLabel: '100 mm', // format definition
    rod: { lengthMm: 100, relativeGirth: 'superslim' }, // format definition
    aktclLines: [lineName('super-slim')],
    specs: specs(), // TODO(Asef): AKTCL's own figures, pending confirmation
  },
  {
    slug: 'nano',
    name: 'Nano',
    lengthLabel: '84–100 mm', // format definition
    rod: { lengthMm: 84, lengthMaxMm: 100, relativeGirth: 'nano' }, // format definition
    aktclLines: [lineName('nano')],
    specs: specs(), // TODO(Asef): AKTCL's own figures, pending confirmation
  },
];

export const sizeBySlug = (slug?: string) => cigaretteSizes.find((s) => s.slug === slug);

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
  packDimensions: 'Pack dimensions (L × W × H)',
  outerDimensions: 'Outer dimensions (L × W × H)',
  masterCartonDimensions: 'Master carton dimensions (L × W × H)',
  masterCartonGrossWeight: 'Master carton gross weight',
  palletConfiguration: 'Pallet configuration',
  cartons40HC: "Master cartons per 40' HC container",
  cartons20ft: "Master cartons per 20' container",
  moq: 'Minimum order',
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

/** true once AKTCL has confirmed at least one figure for this size. */
export const hasAnySpecs = (s: CigaretteSize) => Object.values(s.specs).some((v) => v !== null);
