import "server-only";
import { ApiError, number, text } from "../api";
import { query, queryOne } from "../db";

const iso = (d) => (d instanceof Date ? d.toISOString() : d ? new Date(d).toISOString() : null);

// { productSlug: { sum, count } } for showing average ratings on product cards.
export async function getRatings() {
  const rows = await query(
    `SELECT p.slug, SUM(r.rating) AS sum, COUNT(*) AS count
       FROM reviews r JOIN products p ON p.id = r.product_id WHERE r.is_approved = 1 GROUP BY p.slug`
  );
  return Object.fromEntries(rows.map((r) => [r.slug, { sum: Number(r.sum), count: Number(r.count) }]));
}

export async function listReviews(productSlug) {
  const rows = await query(
    `SELECT r.id, r.name, r.rating, r.comment, r.is_verified, r.created_at
       FROM reviews r JOIN products p ON p.id = r.product_id
      WHERE p.slug = ? AND r.is_approved = 1 ORDER BY r.created_at DESC, r.id DESC LIMIT 200`,
    [String(productSlug)]
  );
  return rows.map((r) => ({ id: r.id, name: r.name, rating: r.rating, comment: r.comment, verified: !!r.is_verified, createdAt: iso(r.created_at) }));
}

export async function addReview(input, user) {
  const product = await queryOne("SELECT id FROM products WHERE slug = ? AND status = 'active'", [String(input.product ?? "")]);
  if (!product) throw new ApiError(404, "Product not found.");
  const rating = number(input.rating, "Rating", { min: 1, max: 5, integer: true });
  const comment = text(input.comment, "Your review", { max: 1000 });
  const name = user ? user.name : text(input.name, "Your name", { max: 60 });
  // "Verified buyer" when this account has a (not cancelled) order containing the product.
  const verified = user
    ? !!(await queryOne(
        `SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
          WHERE oi.product_id = ? AND o.user_id = ? AND o.status <> 'Cancelled' AND o.is_demo = 0 LIMIT 1`,
        [product.id, user.id]
      ))
    : false;
  await query("INSERT INTO reviews (product_id, user_id, name, email, rating, comment, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)", [
    product.id,
    user?.id ?? null,
    name,
    user?.email ?? null,
    rating,
    comment,
    verified,
  ]);
}

export async function listAllReviews() {
  const rows = await query(
    `SELECT r.id, r.name, r.email, r.rating, r.comment, r.is_verified, r.created_at, p.slug, p.name AS product_name, p.emoji
       FROM reviews r JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC, r.id DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    rating: r.rating,
    comment: r.comment,
    verified: !!r.is_verified,
    createdAt: iso(r.created_at),
    product: { id: r.slug, name: r.product_name, emoji: r.emoji },
  }));
}

export async function deleteReview(id) {
  await query("DELETE FROM reviews WHERE id = ?", [Number(id)]);
}
