import "server-only";
import { query, queryOne } from "../db";

export async function getWishlist(userId) {
  const rows = await query(
    "SELECT p.slug FROM wishlists w JOIN products p ON p.id = w.product_id WHERE w.user_id = ? ORDER BY w.created_at",
    [userId]
  );
  return rows.map((r) => r.slug);
}

export async function addToWishlist(userId, slugs) {
  for (const slug of slugs.slice(0, 200)) {
    const product = await queryOne("SELECT id FROM products WHERE slug = ?", [String(slug)]);
    if (product) await query("INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)", [userId, product.id]);
  }
}

export async function removeFromWishlist(userId, slug) {
  await query("DELETE w FROM wishlists w JOIN products p ON p.id = w.product_id WHERE w.user_id = ? AND p.slug = ?", [userId, String(slug)]);
}
