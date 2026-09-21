/**
 * Best-effort per-IP rate limit: 5 enquiries per 10 minutes.
 *
 * The counters live in this process's memory. Static Web Apps managed functions
 * are ephemeral — instances are recycled when idle and there may be more than one
 * — so this slows a flood from a single address but is not a guarantee. The
 * honeypot and timing checks do the rest; see docs/enquiry-api.md.
 */

export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_PER_WINDOW = 5;

// Bounds memory if many distinct addresses arrive between recycles.
const MAX_TRACKED = 2000;

/** ip -> timestamps (ms) of accepted requests inside the window */
const hits = new Map();

/**
 * Extracts the client IP without its source port.
 *
 * Static Web Apps sets x-forwarded-for to "ip:port" and the port changes on every
 * request, so leaving it in would give each request its own bucket.
 */
export function clientIp(request) {
  const raw =
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    request.headers.get("x-azure-clientip") ||
    "";

  if (!raw) return "";

  // "[2001:db8::1]:443" -> "2001:db8::1"
  const bracketed = raw.match(/^\[([^\]]+)\]/);
  if (bracketed) return bracketed[1];

  // A bare IPv6 address contains several colons and carries no port.
  const colons = (raw.match(/:/g) || []).length;
  if (colons > 1) return raw;

  // "203.0.113.4:51514" -> "203.0.113.4"
  return raw.split(":")[0];
}

/**
 * Records the request and says whether it is within the limit.
 * An unknown address (local development) is never limited.
 *
 * @returns {{ allowed: true } | { allowed: false, retryAfterSeconds: number }}
 */
export function checkRateLimit(ip, now = Date.now()) {
  if (!ip) return { allowed: true };

  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return { allowed: false, retryAfterSeconds: Math.ceil((recent[0] + WINDOW_MS - now) / 1000) };
  }

  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > MAX_TRACKED) prune(now);
  return { allowed: true };
}

function prune(now) {
  for (const [ip, times] of hits) {
    if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(ip);
  }
  // Still over after dropping expired entries: forget the oldest addresses.
  for (const ip of hits.keys()) {
    if (hits.size <= MAX_TRACKED) break;
    hits.delete(ip);
  }
}

/** Test hook. */
export function resetRateLimit() {
  hits.clear();
}
