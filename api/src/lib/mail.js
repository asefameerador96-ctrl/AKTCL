import nodemailer from "nodemailer";
import { headerSafe } from "./validate.js";

const REQUIRED = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "ENQUIRY_TO"];

const env = (key) => (process.env[key] || "").trim();

/** Names (never values) of the mail settings that are still empty. */
export const missingMailSettings = () => REQUIRED.filter((key) => !env(key));

export const mailConfigured = () => missingMailSettings().length === 0;

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

/**
 * Sends the enquiry to ENQUIRY_TO with Reply-To set to the enquirer, so the export
 * desk answers by pressing Reply. Every header value built from user input goes
 * through headerSafe (CR/LF stripped) — nodemailer also guards against header
 * injection, this does not rely on it.
 */
export async function sendEnquiryMail(enquiry, now) {
  const from = env("ENQUIRY_FROM") || env("SMTP_USER");
  const subject = headerSafe(
    `[aktcl.com] Enquiry — ${enquiry.product} — ${enquiry.company}, ${enquiry.country}`,
    240
  );

  await getTransport().sendMail({
    from: { name: "AKTCL Website", address: headerSafe(from) },
    to: env("ENQUIRY_TO")
      .split(",")
      .map((address) => headerSafe(address))
      .filter(Boolean),
    replyTo: { name: headerSafe(enquiry.name, 120), address: headerSafe(enquiry.email, 254) },
    subject,
    text: textBody(enquiry, now),
    html: htmlBody(enquiry, now),
  });
}
