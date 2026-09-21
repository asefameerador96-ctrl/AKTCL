/**
 * "From Seed to Smoke" — the seven stages of the value chain.
 *
 * SOURCE OF TRUTH: workbook rows 3–9 (PROCESS). `label` = Phase (col B),
 * `title` = Catchy Title (col C), `short` = Short Description (col D),
 * `long` = Long Description (col F). Copy is verbatim; do not embellish.
 *
 * This module is text only (no image imports) so tests and tooling can load it
 * without the Vite image pipeline. Images are attached in ./images.ts by `slug`.
 */

export interface JourneyStage {
  slug: string;
  /** Short stage name for nav, breadcrumbs and the "01 / 07" rail. */
  label: string;
  title: string;
  short: string;
  long: string;
}

export const journeyIntro = {
  eyebrow: 'From Seed to Smoke',
  heading: 'Our Journey',
} as const;

export const journey: JourneyStage[] = [
  {
    slug: 'seed',
    label: 'Seed',
    title: 'Where Quality Takes Root',
    short:
      'Every exceptional tobacco leaf begins with carefully selected seeds and decades of agricultural expertise.',
    long:
      'Our journey begins long before a tobacco leaf reaches the field. It starts with the careful selection of high-performing tobacco seed varieties chosen for their quality, consistency, and adaptability. Working closely with experienced growers, our agronomy teams ensure that every planting season begins with the strongest possible foundation. Through research, field trials, and continuous improvement, we cultivate the genetics that will ultimately define the quality of every leaf harvested. For us, excellence is never accidental—it is planted from the very beginning.',
  },
  {
    slug: 'harvest',
    label: 'Harvest',
    title: 'Harvested at the Perfect Moment',
    short:
      'Every tobacco leaf is harvested at optimum maturity to preserve its natural character and quality.',
    long:
      'Harvesting is one of the most critical stages in tobacco production. Our experienced field teams carefully monitor leaf maturity to ensure every harvest captures the ideal balance of color, texture, and quality. Each leaf is handled with precision to preserve its natural integrity before moving into the curing process. Attention to detail during harvest forms the foundation for exceptional finished products.',
  },
  {
    slug: 'cure',
    label: 'Cure',
    title: "Preserving Nature's Best",
    short:
      'Specialized curing techniques transform freshly harvested leaves into premium tobacco.',
    long:
      'Once harvested, tobacco leaves undergo carefully controlled curing processes that naturally develop their color, aroma, texture, and quality. Whether flue-cured, air-cured, or processed through other specialized methods, each batch is continuously monitored to ensure consistency. This transformation combines generations of craftsmanship with modern technology, unlocking the full potential of every leaf.',
  },
  {
    slug: 'buying',
    label: 'Buying',
    title: 'Sourcing Excellence at the Source',
    short:
      'Every exceptional tobacco product starts with an exceptional leaf. We source, select and procure tobacco with precision to build quality into every stage of our value chain.',
    long:
      'Our tobacco leaf procurement operation is built around quality, consistency and long-term farmer relationships. We source tobacco from carefully managed growing areas and apply systematic quality assessment throughout the buying process. Our teams evaluate each crop against established specifications, ensuring the right grades and characteristics are selected for downstream processing and blending requirements. By combining field-level expertise, farmer engagement and disciplined procurement, we create a dependable foundation for our integrated Seed to Smoke value chain.',
  },
  {
    slug: 'process',
    label: 'Process',
    title: 'Refined Through Precision',
    short:
      'Advanced processing technologies ensure consistency, purity, and quality in every tobacco leaf.',
    long:
      'Following curing, tobacco enters our state-of-the-art processing facilities where advanced technology meets decades of manufacturing expertise. Leaves are graded, conditioned, threshed, blended, and prepared under rigorous quality control systems. Every batch is carefully inspected to ensure consistency, traceability, and compliance with international quality standards before entering production.',
  },
  {
    slug: 'manufacture',
    label: 'Manufacture',
    title: 'Crafted with Precision',
    short:
      'Innovation, technology, and quality assurance come together to produce world-class tobacco products.',
    long:
      'Manufacturing represents the culmination of our agricultural knowledge and industrial excellence. Using advanced production technologies, highly trained personnel, and strict quality assurance systems, we manufacture tobacco products that consistently meet international standards. From blending and production to packaging and final inspection, every stage reflects our commitment to precision, efficiency, and reliability.',
  },
  {
    slug: 'smoke',
    label: 'Smoke',
    title: 'The Final Destination of Our Journey',
    short:
      'Every stage of our journey reflects our commitment to quality, craftsmanship, and manufacturing excellence.',
    long:
      'From a single tobacco seed to a finished product, every stage of our vertically integrated operation is driven by expertise, innovation, and uncompromising quality standards. Our complete oversight of cultivation, curing, processing, manufacturing, packaging, and export ensures consistency across the entire value chain. "From Seed to Smoke" is more than a philosophy—it represents our dedication to agricultural excellence, responsible manufacturing, and building lasting partnerships across global markets.',
  },
];

export const journeyBySlug = (slug: string | undefined) =>
  journey.find((s) => s.slug === slug);
