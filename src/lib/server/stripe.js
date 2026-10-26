import "server-only";
import crypto from "node:crypto";

// Minimal Stripe API client (https://docs.stripe.com/api). Keys come from the .env file:
//   STRIPE_SECRET_KEY      sk_test_... or sk_live_...  (required for card payments)
//   STRIPE_WEBHOOK_SECRET  whsec_...                    (for /api/stripe/webhook)
//   STRIPE_CURRENCY        currency of the store prices (default pkr)
const API = "https://api.stripe.com/v1";

// Currencies Stripe counts in whole units instead of cents.
const ZERO_DECIMAL = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);

export class StripeError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function stripeConfig() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return {
    key,
    currency: (process.env.STRIPE_CURRENCY?.trim() || "pkr").toLowerCase(),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() || null,
    testMode: /^(sk|rk)_test_/.test(key),
  };
}

// Safe to send to the browser: whether card payments can be offered (never the keys).
export function stripeStatus() {
  const config = stripeConfig();
  return { ready: !!config, testMode: !!config?.testMode, webhook: !!config?.webhookSecret };
}

export function toMinorUnits(amount, currency) {
  return ZERO_DECIMAL.has(currency) ? Math.round(amount) : Math.round(amount * 100);
}

// Stripe takes form-encoded parameters, nested like line_items[0][price_data][currency].
function encode(params, prefix = "", out = new URLSearchParams()) {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === "object") encode(value, name, out);
    else out.append(name, String(value));
  }
  return out;
}

export async function stripeRequest(method, path, params, { idempotencyKey, timeoutMs = 20000 } = {}) {
  const config = stripeConfig();
  if (!config) throw new StripeError("Stripe is not set up (STRIPE_SECRET_KEY is missing).", 503);
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
    },
    body: params ? encode(params).toString() : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new StripeError(data.error?.message ?? `Stripe answered ${res.status}`, res.status, data.error?.code);
  return data;
}

// Checks the Stripe-Signature header of a webhook: HMAC-SHA256 of "timestamp.body" with the
// webhook secret, and a timestamp no older than 5 minutes (https://docs.stripe.com/webhooks#verify-manually).
export function verifyWebhookSignature(rawBody, header, secret, toleranceSeconds = 300) {
  let timestamp = null;
  const signatures = [];
  for (const part of String(header ?? "").split(",")) {
    const [key, value] = part.trim().split("=");
    if (key === "t") timestamp = Number(value);
    else if (key === "v1" && value) signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.`).update(rawBody).digest("hex");
  return signatures.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

// The site's public address for Stripe's return links. Set SITE_URL in .env to be explicit;
// otherwise it's taken from the request (Hostinger's proxy passes the real host).
export function siteUrl(request) {
  const configured = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? request.nextUrl.protocol.replace(":", "");
  return `${proto}://${host}`;
}
