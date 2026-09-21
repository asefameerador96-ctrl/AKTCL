/**
 * Server-side validation for the enquiry form.
 *
 * The browser validates with the zod schema in src/lib/enquiry.ts, but nothing a
 * client sends is trusted: every field is re-checked and cleaned here. LIMITS
 * repeats ENQUIRY_LIMITS from that file — change both together.
 */

export const LIMITS = {
  name: 120,
  company: 120,
  country: 80,
  email: 254,
  phone: 40,
  product: 120,
  volume: 200,
  messageMin: 10,
  messageMax: 4000,
};

/** A person cannot fill seven fields faster than this; a script usually does. */
export const MIN_FILL_MS = 3000;

// No whitespace, angle brackets or list separators, so the address is safe to use
// as a Reply-To header as well as being plausibly deliverable.
const EMAIL_RE = /^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\]{2,}$/;
const PHONE_RE = /^[+()\d\s./-]{6,40}$/;

const str = (v) => (typeof v === "string" ? v : "");

/** Collapse to one clean line: control characters (incl. CR/LF) become spaces. */
export function singleLine(value) {
  return str(value).replace(/\p{Cc}+/gu, " ").replace(/\s+/g, " ").trim();
}

/** Keep line breaks and tabs, drop every other control character. */
export function multiLine(value) {
  return str(value)
    .replace(/\r\n?/g, "\n")
    .replace(/[^\P{Cc}\n\t]/gu, "")
    .trim();
}

/**
 * Anything placed in a mail header goes through here. singleLine already removes
 * CR/LF (header injection); the cap keeps a hostile value from bloating the header.
 */
export function headerSafe(value, max = 200) {
  return singleLine(value).slice(0, max);
}

/** Path only: no query string or fragment, so no personal data rides along. */
export function cleanPath(raw) {
  if (typeof raw !== "string" || !raw.startsWith("/")) return "/";
  return singleLine(raw.split("?")[0].split("#")[0]).slice(0, 200) || "/";
}

/**
 * Returns why a submission looks automated, or null for a plausible human.
 *
 * Both timestamps come from the visitor's own clock and only their difference is
 * used, so a wrong clock on the visitor's machine cannot reject a real enquiry.
 */
export function automationSignal(body) {
  if (body.website != null && String(body.website).trim() !== "") return "honeypot";
  const elapsed = Number(body.submittedAt) - Number(body.renderedAt);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return "too_fast";
  return null;
}

/**
 * @returns {{ ok: true, value: object } | { ok: false, fields: string[] }}
 */
export function validateEnquiry(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, fields: ["body"] };
  }

  const fields = [];
  const between = (s, min, max) => s.length >= min && s.length <= max;

  const name = singleLine(body.name);
  if (!between(name, 2, LIMITS.name)) fields.push("name");

  const company = singleLine(body.company);
  if (!between(company, 2, LIMITS.company)) fields.push("company");

  const country = singleLine(body.country);
  if (!between(country, 2, LIMITS.country)) fields.push("country");

  const email = str(body.email).trim();
  if (email.length > LIMITS.email || !EMAIL_RE.test(email)) fields.push("email");

  const phone = singleLine(body.phone);
  if (phone && !PHONE_RE.test(phone)) fields.push("phone");

  const product = singleLine(body.product);
  if (!between(product, 1, LIMITS.product)) fields.push("product");

  const volume = singleLine(body.volume);
  if (volume.length > LIMITS.volume) fields.push("volume");

  const message = multiLine(body.message);
  if (!between(message, LIMITS.messageMin, LIMITS.messageMax)) fields.push("message");

  if (body.consent !== true) fields.push("consent");

  if (fields.length) return { ok: false, fields };

  return {
    ok: true,
    value: { name, company, country, email, phone, product, volume, message, page: cleanPath(body.page) },
  };
}
