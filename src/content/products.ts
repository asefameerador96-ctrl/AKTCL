/**
 * Product line — two categories.
 *
 * SOURCE OF TRUTH: workbook rows 10–27 (PRODUCT). `name` = Catchy Title (col C),
 * `short` = Short Description (col D), `long` = Long Description (col F).
 * Copy is verbatim apart from the two corrections listed in
 * docs/content-inventory.md ("Priduct" → "Product"; "It characterized" →
 * "It is characterized").
 *
 * The workbook contains NO technical specifications (grades, moisture, nicotine,
 * cut width, packing, MOQ, container loads, cigarette dimensions). `specs` is
 * therefore empty everywhere and the spec table is not rendered until AKTCL
 * supplies real values. Never fill it with typical/industry numbers.
 *
 * Text only — images are attached in ./images.ts by `slug`.
 */

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  slug: string;
  name: string;
  short: string;
  /** Absent where the workbook has no long description. */
  long?: string;
  /** Rendered as a spec table when non-empty. TODO(Asef): supply real values. */
  specs: ProductSpec[];
  /**
   * false = listed on the category page only. Used where the workbook has a single
   * line of copy and no dedicated photography, so a standalone page would be empty.
   */
  hasDetailPage: boolean;
}

export interface ProductCategory {
  slug: string;
  /** Short label for nav, breadcrumbs and cards. */
  label: string;
  /**
   * "CATEGORY 01" style eyebrow from col B. Kept as the workbook's record, but not
   * rendered: category numbering was decoration (owner feedback, 2026-09) and the
   * category's name says the same.
   */
  eyebrow: string;
  title: string;
  short: string;
  long: string;
  products: Product[];
}

/** Row 10. B10 reads "Our Priduct line" in the workbook — typo corrected. */
export const productsIntro = {
  eyebrow: 'What We Export',
  heading: 'Our Product Line',
  short:
    'From premium tobacco leaf to world-class finished cigarettes, our vertically integrated operations enable us to deliver products that meet the diverse needs of manufacturers, distributors, and global markets.',
  long:
    'Our product portfolio reflects decades of agricultural expertise, advanced manufacturing capabilities, and an unwavering commitment to quality. From premium leaf tobacco sourced through carefully managed cultivation programs to finished cigarette brands manufactured in state-of-the-art facilities, every product is developed to meet international quality standards. Whether supplying tobacco manufacturers with processed leaf or delivering finished cigarettes through our own brands and private label partnerships, we combine consistency, innovation, and precision at every stage of production. Our flexible manufacturing capabilities allow us to serve partners across diverse markets while maintaining the highest standards of quality assurance and traceability.',
} as const;

export const categories: ProductCategory[] = [
  {
    slug: 'leaf-tobacco',
    label: 'Leaf Tobacco',
    eyebrow: 'Category 01',
    title: 'Premium Leaf Tobacco',
    short:
      'Premium tobacco cultivated, cured, processed, and graded to meet the diverse requirements of manufacturers around the world.',
    long:
      'Our premium leaf tobacco is produced through carefully managed cultivation, curing, and processing systems that ensure consistency, quality, and traceability. Available in multiple grades and processing formats, our leaf tobacco is designed to support manufacturers in producing products that meet international quality standards.',
    products: [
      {
        slug: 'virginia-flue-cured',
        name: 'Virginia Flue-Cured',
        short:
          'Premium bright-leaf tobacco renowned for its naturally sweet, smooth character and excellent burning properties.',
        long:
          'FCV tobacco is carefully cultivated and flue-cured under controlled temperatures, resulting in its characteristic golden-yellow colour, distinctive aroma and balanced taste. It is widely valued in cigarette manufacturing as a key component of premium blends, offering consistent quality, excellent filling power, smooth smoke delivery and desirable flavour characteristics.',
        specs: [],
        hasDetailPage: true,
      },
      {
        slug: 'burley',
        name: 'Burley Tobacco',
        short:
          'A naturally mild, full-bodied tobacco known for its excellent absorption capacity and ability to add body and depth to cigarette blends.',
        long:
          'It is characterized by its light-brown colour, low natural sugar content and distinctive nutty, slightly earthy profile. Its highly porous leaf structure provides excellent flavour absorption and blending flexibility, making it an important component in both conventional and premium cigarette blends.',
        specs: [],
        hasDetailPage: true,
      },
      {
        slug: 'cutrag',
        name: 'CUTRAG Tobacco',
        short:
          'Precision-cut tobacco designed to deliver consistent particle size, blend uniformity and efficient cigarette manufacturing performance.',
        long:
          'It is processed to achieve controlled cut width and consistency, supporting smooth feeding and uniform blending during cigarette production. Its precise cut and reliable physical characteristics contribute to consistent filling, stable burn performance and efficient machine processing, making it suitable for customized cigarette blends and manufacturing requirements.',
        specs: [],
        hasDetailPage: true,
      },
      {
        slug: 'cres',
        name: 'CRES',
        short:
          'An expanded tobacco stem product engineered to provide efficient volume utilization, controlled filling characteristics and consistent blend performance.',
        long:
          'CRES is produced by cutting, rolling and expanding tobacco stems, increasing their volume and improving their integration into tobacco blends. Its lightweight, porous structure helps provide efficient filler performance, consistent cut characteristics and optimized tobacco utilization, while maintaining compatibility with cigarette manufacturing processes.',
        specs: [],
        hasDetailPage: true,
      },
      {
        slug: 'diet',
        name: 'DIET',
        short:
          'DIET – Dry Ice Expanded Tobacco engineered to increase tobacco volume while delivering efficient filling, blend uniformity and optimized tobacco utilization.',
        long:
          'DIET is produced using dry ice expansion technology, which increases the volume of tobacco while maintaining its essential characteristics. Its expanded structure provides higher filling capacity, improved filler efficiency and reduced tobacco density, making it valuable for optimizing cigarette blend composition and manufacturing performance.',
        specs: [],
        hasDetailPage: true,
      },
      {
        slug: 'stem',
        name: 'STEM',
        short:
          'Tobacco STEM – a versatile tobacco raw material derived from the central veins and stems of tobacco leaves, offering efficient tobacco utilization and blending flexibility.',
        long:
          'Tobacco STEM is obtained from the stem and midrib portions of tobacco leaves and can be processed for use in tobacco blends. It provides an economical source of tobacco material while supporting efficient raw-material utilization, blend optimization and consistent processing performance.',
        specs: [],
        hasDetailPage: true,
      },
      {
        slug: 'scrap',
        name: 'SCRAP',
        // The workbook has only this one line for SCRAP (D19); no long description.
        short: 'Premium export-quality tobacco selected to international standards.',
        specs: [],
        hasDetailPage: true,
      },
      {
        slug: 'recon',
        name: 'RE-CON',
        short:
          'RE-CON Tobacco – a reconstituted tobacco sheet engineered to provide consistent quality, uniformity and efficient tobacco utilization in cigarette blends.',
        long:
          'RE-CON is produced by processing selected tobacco materials into a uniform tobacco sheet, offering consistent thickness, texture and composition. Its controlled characteristics support blend uniformity, efficient raw-material utilization and stable cigarette manufacturing performance, while allowing manufacturers greater flexibility in formulation.',
        specs: [],
        hasDetailPage: true,
      },
    ],
  },
  {
    slug: 'finished-cigarettes',
    label: 'Finished Cigarettes',
    eyebrow: 'Category 02',
    title: 'Finished Cigarettes',
    short:
      'Manufactured with premium tobacco and advanced technology to meet the needs of international brands, distributors, and private label partners.',
    long:
      'Our finished cigarette portfolio combines premium tobacco, precision engineering, and stringent quality assurance systems. We manufacture products across multiple formats and specifications for our own brands, OEM customers, and private label partners, ensuring consistency, compliance, and world-class manufacturing standards.',
    // One line of copy each and a single shared pack shot in the content folder, so
    // these are listed on the category page only until AKTCL supplies more.
    products: [
      {
        slug: 'premium-king-size',
        name: 'Premium King Size',
        short: 'Premium king-size cigarettes crafted for refined quality and consistency.',
        specs: [],
        hasDetailPage: false,
      },
      {
        slug: 'king-size-filter',
        name: 'King Size Filter',
        short: 'Standard filtered cigarettes for mainstream international markets.',
        specs: [],
        hasDetailPage: false,
      },
      {
        slug: 'super-slim',
        name: 'Super Slim',
        short: 'Elegant super slim cigarettes with modern styling.',
        specs: [],
        hasDetailPage: false,
      },
      {
        slug: 'nano',
        name: 'NANO',
        short: 'Compact-size cigarettes designed for convenience and portability.',
        specs: [],
        hasDetailPage: false,
      },
      {
        slug: 'private-label-manufacturing',
        name: 'Private Label Manufacturing',
        short:
          'OEM cigarette manufacturing customized to customer branding and specifications.',
        specs: [],
        hasDetailPage: false,
      },
      {
        slug: 'akt-signature-collection',
        name: 'AKT Signature Collection',
        short:
          "Flagship premium cigarette portfolio representing AKT's highest manufacturing standards.",
        specs: [],
        hasDetailPage: false,
      },
    ],
  },
];

export const categoryBySlug = (slug: string | undefined) =>
  categories.find((c) => c.slug === slug);

export const productBySlug = (categorySlug: string | undefined, slug: string | undefined) =>
  categoryBySlug(categorySlug)?.products.find((p) => p.slug === slug);

/** Flat list for the enquiry form's "product of interest" field. */
export const allProducts = categories.flatMap((c) =>
  c.products.map((p) => ({ ...p, category: c }))
);
