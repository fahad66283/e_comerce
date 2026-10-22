import "server-only";
import { unstable_rethrow } from "next/navigation";
import { connection } from "next/server";
import { DatabaseNotConfiguredError, describeDatabaseError } from "./db";
import { getCurrentUser, isStaff } from "./auth";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const DB_ERROR_CODES = new Set(["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR", "ER_DBACCESS_DENIED_ERROR", "PROTOCOL_CONNECTION_LOST"]);

// Wraps a route handler: CSRF check for changes, JSON errors, no leaking of internal details.
export function route(handler) {
  return async (request, context) => {
    // API routes always run per request (never pre-generated at build time).
    await connection();
    try {
      if (request.method !== "GET" && request.method !== "HEAD") {
        // Browsers can't add this header to cross-site form posts, so it blocks CSRF.
        if (request.headers.get("x-requested-with") !== "fetch") throw new ApiError(403, "Request blocked.");
      }
      return await handler(request, context);
    } catch (err) {
      unstable_rethrow(err); // let Next.js handle its own internal signals
      if (err instanceof ApiError) return Response.json({ error: err.message }, { status: err.status });
      if (err instanceof DatabaseNotConfiguredError || DB_ERROR_CODES.has(err?.code)) {
        console.error("[database]", err.code, err.message);
        return Response.json({ error: describeDatabaseError(err) }, { status: 503 });
      }
      console.error(err);
      return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export async function readJson(request, maxBytes = 1_000_000) {
  const text = await request.text();
  if (text.length > maxBytes) throw new ApiError(413, "The request is too large.");
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError(400, "Invalid request.");
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Please log in.");
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (!isStaff(user)) throw new ApiError(403, "Admins only.");
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.role !== "superadmin") throw new ApiError(403, "Only the super admin can do this.");
  return user;
}

// ---- Input validation ----
export function text(value, label, { max = 255, min = 0, required = true } = {}) {
  const v = typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
  if (required && !v) throw new ApiError(400, `${label} is required.`);
  if (v.length > max) throw new ApiError(400, `${label} is too long (max ${max} characters).`);
  if (v && v.length < min) throw new ApiError(400, `${label} is too short (min ${min} characters).`);
  return v;
}

export function number(value, label, { min = 0, max = 100_000_000, integer = false } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) {
    throw new ApiError(400, `${label} must be ${integer ? "a whole number" : "a number"} between ${min} and ${max}.`);
  }
  return n;
}

export function email(value, label = "Email") {
  const v = text(value, label, { max: 190 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new ApiError(400, "Please enter a valid email address.");
  return v;
}

export const ok = (data = {}) => Response.json(data);
