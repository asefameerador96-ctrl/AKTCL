/**
 * About Us.
 *
 * SOURCE OF TRUTH: workbook row 28 (merged cell C28:G28), verbatim, three
 * paragraphs. `facts` repeats ONLY figures that appear in those paragraphs — do
 * not add capacity, headcount, market or certification numbers that AKTCL has not
 * supplied.
 */

export const about = {
  heading: 'About Us',
  paragraphs: [
    'Abul Khair Tobacco Co. Ltd. (AKTCL) has been shaping Bangladesh\'s tobacco industry since 1953, beginning its journey with traditional biri before expanding into filtered cigarette manufacturing in 1997. Today, AKTCL stands as the largest local tobacco company and a national segment leader, built on decades of expertise and an integrated "Seed to Smoke" philosophy.',
    "With a network of 50,000+ registered farmers, AKTCL ensures a sustainable and reliable supply chain, supported by state-of-the-art Green Leaf Threshing (GLT) and cigarette manufacturing facilities equipped with the latest high-speed machinery from the world's leading equipment manufacturers. The company has developed a portfolio of strong local cigarette brands while establishing a growing global presence through the export of CRES, CUTRAG, DIET, RECON, STEM, leaf tobacco, and finished cigarettes and many more.",
    'Driven by continuous improvement and customer-focused development, AKTCL remains open to innovation, combining decades of heritage with modern technology to deliver quality products and world-class tobacco solutions to partners across the globe.',
  ],
} as const;

export interface Fact {
  /** Numeric part, animated by the count-up. */
  value: number;
  /** Rendered after the number, e.g. "+". */
  suffix?: string;
  /** false = show the number as a year (no thousands separator, no count-up from 0). */
  isYear?: boolean;
  label: string;
}

/** Years read as written ("1953"); counts get a thousands separator ("50,000"). */
export const formatFact = (fact: Fact, n: number = fact.value) =>
  fact.isYear ? String(n) : n.toLocaleString('en-US');

/** Every figure below is stated in the About Us copy above. */
export const facts: Fact[] = [
  { value: 1953, isYear: true, label: "Shaping Bangladesh's tobacco industry since" },
  { value: 1997, isYear: true, label: 'Filtered cigarette manufacturing since' },
  { value: 50000, suffix: '+', label: 'Registered farmers in our network' },
];

/** Milestones for the heritage timeline — only the two dated events AKTCL has given. */
export const milestones = [
  { year: '1953', text: 'AKTCL begins its journey with traditional biri.' },
  { year: '1997', text: 'Expansion into filtered cigarette manufacturing.' },
] as const;
