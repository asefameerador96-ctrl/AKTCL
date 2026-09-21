import { createHash } from "node:crypto";

/** Placeholder in public/staticwebapp.config.json that prerender.mjs replaces in dist/. */
export const CSP_HASH_TOKEN = "'sha256-INLINE-SCRIPTS'";

const EXECUTABLE = /^(module|text\/javascript|application\/javascript)?$/i;

/**
 * CSP hash sources for the executable inline scripts in an HTML document (the
 * pre-paint theme / age-gate script in index.html). JSON-LD and other data blocks
 * are never executed, so script-src does not apply to them.
 */
export function inlineScriptHashes(html) {
  const hashes = new Set();
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1] ?? "";
    if (!EXECUTABLE.test(type)) continue;
    hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }
  return [...hashes];
}
