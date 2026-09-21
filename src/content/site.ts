/**
 * Site-wide facts and copy.
 *
 * SOURCE OF TRUTH: "AKTCL - SITE CONTENTS, Plan, Written Content.xlsx" (Sheet1).
 * Wording is taken verbatim from the workbook; the cell each string came from is
 * noted beside it. Do not add facts, figures, brand names, certifications, years or
 * market lists that are not in the workbook — leave `null` and add the item to
 * docs/content-inventory.md instead. Anything `null` here is simply not rendered.
 */

export const site = {
  /** Display name, as written in the About Us copy (C28). */
  name: 'Abul Khair Tobacco Co. Ltd.',
  shortName: 'AKTCL',
  legalName: 'Abul Khair Tobacco Company Ltd.',
  parent: 'Abul Khair Group',
  country: 'Bangladesh',
  url: 'https://www.aktcl.com',
  /** C2 */
  tagline: 'From Seed to Smoke',
  /** Legal age shown on the age gate. 18 is the minimum purchase age in Bangladesh. */
  legalAge: 18,

  /**
   * Contact details — NOT in the workbook. TODO(Asef): supply the export desk's
   * details. While a value is null the matching link/row is hidden and the enquiry
   * form is the only contact route.
   */
  contact: {
    email: null as string | null,
    phone: null as string | null,
    /** Digits only, with country code, e.g. "8801XXXXXXXXX". */
    whatsapp: null as string | null,
    addressLines: null as string[] | null,
  },

  /** Social/profile URLs for the footer and Organization JSON-LD. TODO(Asef). */
  sameAs: [] as string[],

  /**
   * Compliance wording — from the build brief, NOT the workbook. Shown in the footer
   * on every page; the health warning is repeated on the age gate. Drafts until AKTCL
   * legal/regulatory signs them off: edit them here, and only here.
   */
  compliance: {
    healthWarning: 'WARNING: Tobacco products are harmful to health and are addictive.',
    tradeNotice:
      'This website is intended solely for tobacco trade professionals — importers, distributors and manufacturers — of legal age. It is not directed at consumers and does not sell tobacco products to the public.',
  },
} as const;

/** HERO row (A2:F2). */
export const hero = {
  /** C2 */
  title: 'From Seed to Smoke',
  /** D2 */
  subtitle: 'Growing Excellence. Crafting Quality. Delivering Trust.',
  /** F2 */
  body:
    'Our vertically integrated value chain gives us complete oversight of every stage—from seed selection and tobacco cultivation to curing, processing, manufacturing, packaging, and export. Guided by decades of expertise, advanced technology, and uncompromising quality standards, we deliver world-class tobacco products trusted by partners across global markets.',
} as const;

export type Site = typeof site;
