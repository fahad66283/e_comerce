// Password hashing with PBKDF2-SHA256 (salted, 600,000 iterations) using the browser's Web Crypto.
// Stored format: pbkdf2_sha256$<iterations>$<salt hex>$<hash hex> – the same format the MySQL
// `users.password_hash` column uses, so a future server can verify it (see database/README.md).
const ITERATIONS = 600000;

const toHex = (buffer) => Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (hex) => new Uint8Array(hex.match(/../g).map((x) => parseInt(x, 16)));

function subtle() {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Login needs a secure connection (https or localhost).");
  }
  return crypto.subtle;
}

async function pbkdf2(password, salt, iterations) {
  const key = await subtle().importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await subtle().deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, key, 256);
  return toHex(bits);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2_sha256$${ITERATIONS}$${toHex(salt)}$${await pbkdf2(password, salt, ITERATIONS)}`;
}

export async function verifyPassword(password, stored) {
  if (!stored) return false;
  // Older versions of this site stored a plain SHA-256 hash; still accepted, then upgraded.
  if (/^[0-9a-f]{64}$/.test(stored)) {
    return toHex(await subtle().digest("SHA-256", new TextEncoder().encode(password))) === stored;
  }
  const [scheme, iterations, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2_sha256" || !salt || !hash) return false;
  return (await pbkdf2(password, fromHex(salt), Number(iterations))) === hash;
}

export function needsRehash(stored) {
  return !stored?.startsWith(`pbkdf2_sha256$${ITERATIONS}$`);
}
