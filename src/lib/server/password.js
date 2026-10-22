import "server-only";
import crypto from "node:crypto";
import { promisify } from "node:util";

// PBKDF2-SHA256, 600,000 iterations, 16-byte salt, 32-byte key.
// Format: pbkdf2_sha256$<iterations>$<salt hex>$<hash hex>
const ITERATIONS = 600000;
const pbkdf2 = promisify(crypto.pbkdf2);

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await pbkdf2(password, salt, ITERATIONS, 32, "sha256");
  return `pbkdf2_sha256$${ITERATIONS}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== "string") return false;
  // Plain SHA-256 hashes from the old browser-only version (upgraded after a successful login).
  if (/^[0-9a-f]{64}$/.test(stored)) {
    const digest = crypto.createHash("sha256").update(password).digest();
    return crypto.timingSafeEqual(digest, Buffer.from(stored, "hex"));
  }
  const [scheme, iterations, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2_sha256" || !salt || !hash || !(Number(iterations) > 0)) return false;
  const expected = Buffer.from(hash, "hex");
  const derived = await pbkdf2(password, Buffer.from(salt, "hex"), Number(iterations), expected.length, "sha256");
  return crypto.timingSafeEqual(derived, expected);
}

export function needsRehash(stored) {
  return !String(stored).startsWith(`pbkdf2_sha256$${ITERATIONS}$`);
}
