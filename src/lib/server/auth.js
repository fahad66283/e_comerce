import "server-only";
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { query, queryOne } from "./db";

const COOKIE = "hak_session";
const SESSION_DAYS = 30;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    username: row.username ?? null,
    role: row.role,
  };
}

// The website keeps the session token in an httpOnly cookie. The mobile app (asks with
// "X-Client: app") gets the token back instead and sends it as "Authorization: Bearer <token>".
export async function createSession(userId, { cookie = true } = {}) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await query("DELETE FROM sessions WHERE expires_at < UTC_TIMESTAMP()");
  await query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)", [hashToken(token), userId, expires]);
  if (cookie) {
    (await cookies()).set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires,
    });
  }
  return token;
}

export async function isAppRequest() {
  return (await headers()).get("x-client") === "app";
}

async function sessionToken() {
  const bearer = (await headers()).get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  return bearer ?? (await cookies()).get(COOKIE)?.value;
}

export async function destroySession() {
  const token = await sessionToken();
  if (token) await query("DELETE FROM sessions WHERE token_hash = ?", [hashToken(token)]);
  (await cookies()).delete(COOKIE);
}

// The logged-in user (or null). Disabled accounts and expired sessions count as logged out.
export async function getCurrentUser() {
  const token = await sessionToken();
  if (!token || token.length > 100) return null;
  const row = await queryOne(
    `SELECT u.id, u.name, u.email, u.username, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP() AND u.status = 'active'`,
    [hashToken(token)]
  );
  return row ? publicUser(row) : null;
}

export const isStaff = (user) => user?.role === "admin" || user?.role === "superadmin";
