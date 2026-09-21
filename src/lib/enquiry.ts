import { z } from 'zod';
import { categories, type ProductCategory } from '@/content/products';
import { COUNTRIES } from '@/lib/countries';

/**
 * The trade enquiry: schema, product options and the call to the API.
 *
 * The server (api/src/lib/validate.js) re-validates everything and repeats
 * ENQUIRY_LIMITS — change both together.
 */

export const ENQUIRY_ENDPOINT = '/api/enquiry';

export const ENQUIRY_LIMITS = {
  name: 120,
  company: 120,
  email: 254,
  phone: 40,
  product: 120,
  volume: 200,
  messageMin: 10,
  messageMax: 4000,
} as const;

// ---- product of interest ---------------------------------------------------

export const OTHER_PRODUCT = 'Other / general enquiry';

/** Lets a buyer of several leaf types or formats enquire without picking one. */
const categoryOption = (category: ProductCategory) => `${category.label} (multiple products)`;

export interface ProductOptionGroup {
  label: string;
  options: string[];
}

/** Every product by name, grouped by category. Derived, so new products appear by themselves. */
export const productOptionGroups: ProductOptionGroup[] = categories.map((category) => ({
  label: category.label,
  options: [...category.products.map((product) => product.name), categoryOption(category)],
}));

const PRODUCT_VALUES = new Set([...productOptionGroups.flatMap((group) => group.options), OTHER_PRODUCT]);

const normalise = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Resolves the ?product= value that enquiry links carry (a product or category
 * name, or a slug) to one of the select's options. null = no such option.
 */
export function matchProductOption(query: string | null | undefined): string | null {
  const wanted = normalise(query ?? '');
  if (!wanted) return null;
  const is = (candidate: string) => normalise(candidate) === wanted;

  for (const category of categories) {
    const product = category.products.find((p) => is(p.name) || is(p.slug));
    if (product) return product.name;
    if (is(category.label) || is(category.title) || is(category.slug)) return categoryOption(category);
  }
  return is(OTHER_PRODUCT) ? OTHER_PRODUCT : null;
}

// ---- schema ----------------------------------------------------------------

const tooLong = (max: number) => `Please keep this under ${max} characters.`;

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(ENQUIRY_LIMITS.name, tooLong(ENQUIRY_LIMITS.name)),
  company: z
    .string()
    .trim()
    .min(2, 'Please enter your company name.')
    .max(ENQUIRY_LIMITS.company, tooLong(ENQUIRY_LIMITS.company)),
  country: z.string().refine((value) => COUNTRIES.includes(value), 'Please select your country.'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your business email address.')
    .max(ENQUIRY_LIMITS.email, tooLong(ENQUIRY_LIMITS.email))
    .email('Please enter a valid email address.'),
  /** Optional: an empty string passes. */
  phone: z
    .string()
    .trim()
    .regex(/^$|^[+()\d\s./-]{6,40}$/, 'Please enter a valid phone number, including the country code.'),
  product: z.string().refine((value) => PRODUCT_VALUES.has(value), 'Please select a product.'),
  /** Optional free text: "2 x 40ft per month", "trial order", etc. */
  volume: z.string().trim().max(ENQUIRY_LIMITS.volume, tooLong(ENQUIRY_LIMITS.volume)),
  message: z
    .string()
    .trim()
    .min(ENQUIRY_LIMITS.messageMin, 'Please tell us a little more about your requirement.')
    .max(ENQUIRY_LIMITS.messageMax, tooLong(ENQUIRY_LIMITS.messageMax)),
  consent: z.boolean().refine((value) => value, 'Please confirm this to send your enquiry.'),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type EnquiryField = keyof EnquiryInput;

export const ENQUIRY_FIELDS = Object.keys(enquirySchema.shape) as EnquiryField[];

/** What is posted: the form values plus the two spam signals and the source page. */
export interface EnquiryPayload extends EnquiryInput {
  /** Honeypot. People never see the field, so anything in it came from a script. */
  website: string;
  /**
   * The visitor's clock when the form rendered and when it was sent. The server
   * uses only the difference (too fast = script), so a wrong clock is harmless.
   */
  renderedAt: number;
  submittedAt: number;
  /** Path the form was submitted from — no query string. */
  page: string;
}

// ---- submit ----------------------------------------------------------------

/**
 * validation   the server rejected one or more fields (400)
 * rate_limited too many enquiries from this connection (429)
 * server       the API answered but could not deliver (5xx, or not deployed)
 * network      no answer at all (offline, timeout)
 */
export type EnquiryErrorKind = 'validation' | 'rate_limited' | 'server' | 'network';

export interface EnquiryResult {
  ok: boolean;
  /** Set whenever ok is false. */
  error?: EnquiryErrorKind;
  /** The fields the server rejected ('validation' only). */
  fields: EnquiryField[];
}

const failed = (error: EnquiryErrorKind, fields: EnquiryField[] = []): EnquiryResult => ({
  ok: false,
  error,
  fields,
});

const TIMEOUT_MS = 25000;

export async function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENQUIRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data: unknown = await response.json().catch(() => null);
    const body = (data && typeof data === 'object' ? data : {}) as { ok?: unknown; fields?: unknown };

    // Insist on the API's own {ok:true}: a host without the API can answer a POST
    // with 200 and an HTML page, which must never read as "enquiry sent".
    if (response.ok && body.ok === true) return { ok: true, fields: [] };

    if (response.status === 400) {
      const rejected: unknown[] = Array.isArray(body.fields) ? body.fields : [];
      return failed(
        'validation',
        ENQUIRY_FIELDS.filter((field) => rejected.includes(field))
      );
    }
    if (response.status === 429) return failed('rate_limited');
    return failed('server');
  } catch {
    return failed('network');
  } finally {
    window.clearTimeout(timer);
  }
}
