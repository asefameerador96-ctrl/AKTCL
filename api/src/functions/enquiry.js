import { app } from "@azure/functions";
import { automationSignal, validateEnquiry } from "../lib/validate.js";
import { checkRateLimit, clientIp } from "../lib/rateLimit.js";
import { saveEnquiry, setEmailStatus, storageConfigured } from "../lib/storage.js";
import { mailConfigured, missingMailSettings, sendEnquiryMail } from "../lib/mail.js";

/**
 * POST /api/enquiry — receives the trade enquiry form (src/components/EnquiryForm.tsx).
 *
 * An enquiry is delivered to every sink that is configured: a row in Azure Table
 * Storage and/or an email over SMTP. One success is enough to tell the visitor it
 * was sent. Settings and operations are described in docs/enquiry-api.md.
 *
 * Logs never contain personal data — only sink results, country and product.
 */

// The form's JSON is a few KB at most; anything larger is not from the form.
const MAX_BODY_BYTES = 16 * 1024;

const HEADERS = { "Cache-Control": "no-store" };

const reply = (status, jsonBody, headers = {}) => ({ status, jsonBody, headers: { ...HEADERS, ...headers } });

/** Status and error code only: SDK and SMTP error messages can quote addresses. */
const describe = (err) => ({
  code: err?.code || err?.name || "error",
  status: err?.statusCode || err?.responseCode,
});

export async function handleEnquiry(request, context) {
  // A JSON content type forces a CORS preflight, which this endpoint never answers,
  // so another website cannot make its visitors' browsers post here.
  if (!(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
    return reply(415, { ok: false, error: "unsupported_media_type" });
  }

  let body;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      return reply(413, { ok: false, error: "too_large" });
    }
    body = JSON.parse(raw);
  } catch {
    return reply(400, { ok: false, error: "invalid_json" });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return reply(400, { ok: false, error: "validation", fields: ["body"] });
  }

  // Answer exactly as a success would, so a bot learns nothing about the checks.
  const signal = automationSignal(body);
  if (signal) {
    context.log("enquiry: dropped", { reason: signal });
    return reply(200, { ok: true });
  }

  const result = validateEnquiry(body);
  if (!result.ok) {
    return reply(400, { ok: false, error: "validation", fields: result.fields });
  }
  const enquiry = result.value;

  // Only well-formed enquiries count: the limit protects the mailbox and the table.
  const limit = checkRateLimit(clientIp(request));
  if (!limit.allowed) {
    context.log("enquiry: rate limited");
    return reply(429, { ok: false, error: "rate_limited" }, { "Retry-After": String(limit.retryAfterSeconds) });
  }

  const useStorage = storageConfigured();
  const useMail = mailConfigured();

  if (!useStorage && !useMail) {
    context.error("enquiry: no sink configured", { missingMailSettings: missingMailSettings() });
    return reply(503, { ok: false, error: "not_configured" });
  }

  const now = new Date();
  const [stored, mailed] = await Promise.allSettled([
    useStorage ? saveEnquiry(enquiry, now, useMail ? "pending" : "not_configured") : null,
    useMail ? sendEnquiryMail(enquiry, now) : null,
  ]);

  const storageOk = useStorage && stored.status === "fulfilled";
  const mailOk = useMail && mailed.status === "fulfilled";

  if (useStorage && !storageOk) context.error("enquiry: table sink failed", describe(stored.reason));
  if (useMail && !mailOk) context.error("enquiry: email sink failed", describe(mailed.reason));

  if (storageOk && useMail) {
    await setEmailStatus(stored.value, mailOk ? "sent" : "failed").catch((err) =>
      context.warn("enquiry: could not record email status", describe(err))
    );
  }

  context.log("enquiry: processed", {
    table: useStorage ? (storageOk ? "ok" : "failed") : "off",
    email: useMail ? (mailOk ? "ok" : "failed") : "off",
    country: enquiry.country,
    product: enquiry.product,
  });

  if (storageOk || mailOk) return reply(200, { ok: true });
  return reply(502, { ok: false, error: "delivery_failed" });
}

app.http("enquiry", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "enquiry",
  handler: handleEnquiry,
});
