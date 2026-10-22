import "server-only";
import { ApiError, email as emailInput, text } from "../api";
import { query, queryOne } from "../db";
import { hashPassword, needsRehash, verifyPassword } from "../password";

const normalizeLogin = (value) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
const iso = (d) => (d instanceof Date ? d.toISOString() : d ? new Date(d).toISOString() : null);

function password(value, label = "Password") {
  const v = typeof value === "string" ? value : "";
  if (v.length < 6) throw new ApiError(400, `${label} must be at least 6 characters.`);
  if (v.length > 200) throw new ApiError(400, `${label} is too long.`);
  return v;
}

// Login with email or username (case-insensitive, extra spaces ignored).
export async function checkLogin(login, plain) {
  const id = normalizeLogin(login);
  if (!id || typeof plain !== "string" || !plain) throw new ApiError(400, "Please enter your email/username and password.");
  const user = await queryOne("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", [id, id]);
  if (!user || !(await verifyPassword(plain, user.password_hash))) throw new ApiError(401, "Incorrect email/username or password.");
  if (user.status === "disabled") throw new ApiError(403, "This account has been disabled. Please contact the store.");
  if (needsRehash(user.password_hash)) {
    await query("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(plain), user.id]);
  }
  return user;
}

export async function createUser({ name, email, password: plain, role = "customer" }) {
  const data = { name: text(name, "Name", { max: 100 }), email: emailInput(email), plain: password(plain) };
  if (!["admin", "customer"].includes(role)) throw new ApiError(400, "Choose Admin or Customer.");
  if (await queryOne("SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", [data.email, data.email])) {
    throw new ApiError(409, "An account with this email already exists.");
  }
  const result = await query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [
    data.name,
    data.email,
    await hashPassword(data.plain),
    role,
  ]);
  return { id: result.insertId, name: data.name, email: data.email, username: null, role };
}

export async function changeOwnPassword(userId, current, next) {
  const user = await queryOne("SELECT password_hash FROM users WHERE id = ?", [userId]);
  if (!user || !(await verifyPassword(String(current ?? ""), user.password_hash))) {
    throw new ApiError(400, "Your current password is incorrect.");
  }
  await query("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(password(next, "The new password")), userId]);
}

// ---------------- Super admin: user management ----------------
export async function listUsers() {
  const rows = await query(
    `SELECT u.id, u.name, u.username, u.email, u.role, u.status, u.created_at,
            (SELECT COUNT(*) FROM orders o WHERE (o.user_id = u.id OR o.customer_email = u.email) AND o.is_demo = 0) AS orders
       FROM users u ORDER BY FIELD(u.role, 'superadmin', 'admin', 'customer'), u.id`
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    username: r.username,
    email: r.email,
    role: r.role,
    status: r.status,
    createdAt: iso(r.created_at),
    orders: Number(r.orders),
    builtIn: r.role === "superadmin",
  }));
}

async function managedUser(id) {
  const user = await queryOne("SELECT id, name, role FROM users WHERE id = ?", [Number(id)]);
  if (!user) throw new ApiError(404, "User not found.");
  if (user.role === "superadmin") throw new ApiError(403, "The super admin account can't be changed here.");
  return user;
}

export async function updateUser(id, changes) {
  const user = await managedUser(id);
  if (changes.role !== undefined) {
    if (!["admin", "customer"].includes(changes.role)) throw new ApiError(400, "Choose Admin or Customer.");
    await query("UPDATE users SET role = ? WHERE id = ?", [changes.role, user.id]);
  }
  if (changes.status !== undefined) {
    if (!["active", "disabled"].includes(changes.status)) throw new ApiError(400, "Unknown status.");
    await query("UPDATE users SET status = ? WHERE id = ?", [changes.status, user.id]);
    if (changes.status === "disabled") await query("DELETE FROM sessions WHERE user_id = ?", [user.id]);
  }
  if (changes.name !== undefined) {
    await query("UPDATE users SET name = ? WHERE id = ?", [text(changes.name, "Name", { max: 100 }), user.id]);
  }
}

// The super admin can set anyone's password except another super admin's.
export async function setUserPassword(id, plain, actor) {
  const user = await queryOne("SELECT id, role FROM users WHERE id = ?", [Number(id)]);
  if (!user) throw new ApiError(404, "User not found.");
  if (user.role === "superadmin" && user.id !== actor.id) throw new ApiError(403, "You can't change another super admin's password.");
  await query("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(password(plain)), user.id]);
  if (user.id !== actor.id) await query("DELETE FROM sessions WHERE user_id = ?", [user.id]);
}

export async function deleteUser(id) {
  const user = await managedUser(id);
  await query("DELETE FROM users WHERE id = ?", [user.id]); // past orders are kept (user_id becomes NULL)
}

// ---------------- Customers (admins) ----------------
export async function listCustomers() {
  const [registered, stats] = await Promise.all([
    query("SELECT name, email, created_at FROM users WHERE role = 'customer' ORDER BY id"),
    query(
      `SELECT customer_email AS email, MAX(customer_name) AS name, MAX(customer_phone) AS phone,
              SUM(status <> 'Cancelled') AS orders, SUM(CASE WHEN status <> 'Cancelled' THEN total ELSE 0 END) AS spent
         FROM orders WHERE is_demo = 0 GROUP BY customer_email`
    ),
  ]);
  const byEmail = new Map(stats.map((s) => [s.email, s]));
  const rows = registered.map((u) => ({
    name: u.name,
    email: u.email,
    guest: false,
    orders: Number(byEmail.get(u.email)?.orders ?? 0),
    spent: Number(byEmail.get(u.email)?.spent ?? 0),
  }));
  const known = new Set(registered.map((u) => u.email));
  for (const s of stats) {
    if (!known.has(s.email)) rows.push({ name: s.name, email: s.email, guest: true, orders: Number(s.orders), spent: Number(s.spent) });
  }
  return rows;
}
