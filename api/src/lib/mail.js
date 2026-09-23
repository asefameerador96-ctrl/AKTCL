import nodemailer from "nodemailer";
import { EmailClient, KnownEmailSendStatus } from "@azure/communication-email";
import { headerSafe } from "./validate.js";

/**
 * Two ways out, whichever the application settings describe:
 *
 *   ACS   Azure Communication Services Email, sending as ENQUIRY_FROM from the
 *         verified domain mail.aktcl.com (SPF, DKIM and DKIM2 all pass, and the
 *         From domain is aligned with the site the enquiry came from — which is
 *         what a corporate mail filter looks for). This is how aktcl.com sends.
 *   SMTP  Any ordinary mailbox. Kept because it costs nothing to keep and it is
 *         the obvious fallback if AKTCL later wants the mail to leave from their
 *         own tenant.
 *
 * ACS wins when both are set. Either way the recipient is ENQUIRY_TO and Reply-To
 * is the enquirer, so the export desk answers by pressing Reply.
 */
const ACS_REQUIRED = ["ACS_CONNECTION_STRING", "ENQUIRY_FROM", "ENQUIRY_TO"];
const SMTP_REQUIRED = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "ENQUIRY_TO"];

/**
 * How long to wait for the service to report the message sent. ACS has already
 * accepted and queued it by the time beginSend resolves, so running out of patience
 * here is not a failure — it only means the row cannot be stamped "sent". Kept well
 * inside the platform's request timeout.
 */
const ACS_POLL_MS = 10000;

const env = (key) => (process.env[key] || "").trim();

const missing = (keys) => keys.filter((key) => !env(key));

const useAcs = () => missing(ACS_REQUIRED).length === 0;

/**
 * Names (never values) of the mail settings that are still empty, for the route that
 * is evidently being set up: ACS if its connection string is there at all, SMTP if a
 * host is, and otherwise the ACS list, which is what aktcl.com runs on.
 */
export const missingMailSettings = () => {
  if (env("ACS_CONNECTION_STRING")) return missing(ACS_REQUIRED);
  if (env("SMTP_HOST")) return missing(SMTP_REQUIRED);
  return missing(ACS_REQUIRED);
};

export const mailConfigured = () => useAcs() || missing(SMTP_REQUIRED).length === 0;

let cached;

function getTransport() {
  if (cached) return cached;
  const port = Number(env("SMTP_PORT"));
  cached = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    // 465 is TLS from the first byte; every other port must upgrade with STARTTLS
    // before the password is sent.
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") },
    // Fail well inside the platform's request timeout instead of hanging the form.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  return cached;
}

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CONSENT_LINE =
  "The sender confirmed they are a tobacco trade professional of legal age and agreed to be contacted about this enquiry.";

function rows(enquiry) {
  return [
    ["Name", enquiry.name],
    ["Company", enquiry.company],
    ["Country", enquiry.country],
    ["Email", enquiry.email],
    ["Phone / WhatsApp", enquiry.phone || "—"],
    ["Product of interest", enquiry.product],
    ["Estimated volume", enquiry.volume || "—"],
  ];
}

function textBody(enquiry, now) {
  return [
    "New trade enquiry from aktcl.com",
    "",
    ...rows(enquiry).map(([label, value]) => `${label}: ${value}`),
    "",
    "Message",
    "-------",
    enquiry.message,
    "",
    "--",
    `Submitted ${now.toISOString()} from ${enquiry.page}`,
    CONSENT_LINE,
    "Reply to this email to answer the enquirer directly.",
  ].join("\n");
}

function htmlBody(enquiry, now) {
  const cell = 'style="padding:4px 16px 4px 0;vertical-align:top"';
  const table = rows(enquiry)
    .map(([label, value]) => `<tr><th align="left" ${cell}>${escapeHtml(label)}</th><td ${cell}>${escapeHtml(value)}</td></tr>`)
    .join("");
  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5">',
    "<h2>New trade enquiry from aktcl.com</h2>",
    `<table cellpadding="0" cellspacing="0">${table}</table>`,
    "<h3>Message</h3>",
    `<p style="white-space:pre-wrap">${escapeHtml(enquiry.message)}</p>`,
    "<hr>",
    `<p><small>Submitted ${escapeHtml(now.toISOString())} from ${escapeHtml(enquiry.page)}<br>`,
    `${escapeHtml(CONSENT_LINE)}<br>Reply to this email to answer the enquirer directly.</small></p>`,
    "</div>",
  ].join("");
}

/** ENQUIRY_TO is one address or several, comma separated. */
const recipients = () =>
  env("ENQUIRY_TO")
    .split(",")
    .map((address) => headerSafe(address))
    .filter(Boolean);

let acsClient;

/**
 * The Azure route. beginSend resolves once the service has accepted the message, so a
 * poll that runs out of time is reported as accepted rather than failed — the mail is
 * queued either way, and the enquiry is in the table regardless.
 */
async function sendThroughAcs(enquiry, now, subject) {
  acsClient ??= new EmailClient(env("ACS_CONNECTION_STRING"));
  const poller = await acsClient.beginSend({
    senderAddress: headerSafe(env("ENQUIRY_FROM")),
    content: { subject, plainText: textBody(enquiry, now), html: htmlBody(enquiry, now) },
    recipients: { to: recipients().map((address) => ({ address })) },
    replyTo: [{ address: headerSafe(enquiry.email, 254), displayName: headerSafe(enquiry.name, 120) }],
  });

  try {
    const result = await poller.pollUntilDone({ abortSignal: AbortSignal.timeout(ACS_POLL_MS) });
    if (result.status !== KnownEmailSendStatus.Succeeded) {
      throw new Error(`ACS reported ${result.status}`);
    }
  } catch (err) {
    // Still accepted; only the confirmation was slow.
    if (err?.name !== "AbortError" && err?.name !== "TimeoutError") throw err;
  }
}

/**
 * Sends the enquiry to ENQUIRY_TO with Reply-To set to the enquirer, so the export
 * desk answers by pressing Reply. Every header value built from user input goes
 * through headerSafe (CR/LF stripped) — the transports also guard against header
 * injection, this does not rely on that.
 */
export async function sendEnquiryMail(enquiry, now) {
  const subject = headerSafe(
    `[aktcl.com] Enquiry — ${enquiry.product} — ${enquiry.company}, ${enquiry.country}`,
    240
  );

  if (useAcs()) return sendThroughAcs(enquiry, now, subject);

  const from = env("ENQUIRY_FROM") || env("SMTP_USER");
  await getTransport().sendMail({
    from: { name: "AKTCL Website", address: headerSafe(from) },
    to: recipients(),
    replyTo: { name: headerSafe(enquiry.name, 120), address: headerSafe(enquiry.email, 254) },
    subject,
    text: textBody(enquiry, now),
    html: htmlBody(enquiry, now),
  });
}
