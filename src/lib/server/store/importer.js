import "server-only";
import { defaultSettings } from "@/data/siteContent";
import { normalizeCode } from "@/lib/coupons";
import { query, queryOne, transaction } from "../db";
import { saveImage } from "./images";
import { saveSection } from "./settings";

// One-time import of data created in the old browser-only version of the site
// (Dashboard → Backup → "Import from this browser").
const slugify = (value) =>
  String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 150);

function replaceImageIds(value, map) {
  if (typeof value === "string" && value.startsWith("img-")) return map.get(value) ?? null;
  if (Array.isArray(value)) return value.map((v) => replaceImageIds(v, map)).filter((v) => v !== null);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceImageIds(v, map)]));
  return value;
}

const date = (v) => (v && !Number.isNaN(new Date(v).getTime()) ? new Date(v) : new Date());

export async function importBrowserData(data) {
  const counts = { images: 0, categories: 0, products: 0, coupons: 0, users: 0, orders: 0, reviews: 0, settings: 0 };

  // 1. Photos and logos
  const imageMap = new Map();
  for (const [id, dataUrl] of Object.entries(data.images ?? {})) {
    const match = typeof dataUrl === "string" && dataUrl.match(/^data:image\/[a-z+]+;base64,(.+)$/);
    if (!id.startsWith("img-") || !match) continue;
    try {
      imageMap.set(id, await saveImage(Buffer.from(match[1], "base64")));
      counts.images += 1;
    } catch {
      // skip files that aren't valid images
    }
  }

  // 2. Categories
  for (const c of Array.isArray(data.categories) ? data.categories : []) {
    if (!c?.name) continue;
    const exists = await queryOne("SELECT id FROM categories WHERE name = ?", [String(c.name).slice(0, 80)]);
    if (exists) continue;
    let slug = slugify(c.name) || "category";
    for (let n = 2; await queryOne("SELECT id FROM categories WHERE slug = ?", [slug]); n++) slug = `${slugify(c.name)}-${n}`;
    await query("INSERT INTO categories (name, slug, icon, description, sort_order) VALUES (?, ?, ?, ?, 999)", [
      String(c.name).slice(0, 80), slug, String(c.icon ?? "🛍️").slice(0, 16), String(c.description ?? "").slice(0, 255),
    ]);
    counts.categories += 1;
  }

  // 3. Products (matched by their address/slug)
  for (const [i, p] of (Array.isArray(data.products) ? data.products : []).entries()) {
    if (!p?.id || !p?.name) continue;
    const category = await queryOne("SELECT id FROM categories WHERE name = ?", [String(p.category ?? "")]);
    const images = (Array.isArray(p.images) ? p.images : []).map((id) => imageMap.get(id)).filter(Boolean).slice(0, 5);
    const values = [
      category?.id ?? null, String(p.name).slice(0, 200), String(p.description ?? ""), Number(p.price) || 0,
      p.compareAt > p.price ? Number(p.compareAt) : null, Math.max(0, Math.floor(Number(p.stock) || 0)),
      String(p.emoji ?? "📦").slice(0, 16), Math.min(5, Math.max(0, Number(p.rating) || 0)), !!p.featured, !!p.isNew,
    ];
    await transaction(async (tx) => {
      const [existing] = await tx.query("SELECT id FROM products WHERE slug = ?", [String(p.id).slice(0, 160)]);
      let productId = existing?.id;
      if (productId) {
        await tx.query(
          "UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, compare_at_price = ?, stock = ?, emoji = ?, rating = ?, is_featured = ?, is_new = ?, status = 'active' WHERE id = ?",
          [...values, productId]
        );
      } else {
        const result = await tx.query(
          "INSERT INTO products (category_id, name, description, price, compare_at_price, stock, emoji, rating, is_featured, is_new, slug, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [...values, String(p.id).slice(0, 160), 1000 + i]
        );
        productId = result.insertId;
      }
      if (images.length) {
        await tx.query("DELETE FROM product_images WHERE product_id = ?", [productId]);
        for (const [n, url] of images.entries()) {
          await tx.query("INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?, ?, ?, ?)", [productId, url, String(p.name).slice(0, 200), n]);
        }
      }
    });
    counts.products += 1;
  }

  // 4. Coupons
  for (const c of Array.isArray(data.coupons) ? data.coupons : []) {
    const code = normalizeCode(c?.code);
    if (!code || !["percent", "fixed"].includes(c.type) || !(Number(c.value) > 0)) continue;
    await query(
      "INSERT INTO coupons (code, type, value, min_order, is_active) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type = VALUES(type), value = VALUES(value), min_order = VALUES(min_order), is_active = VALUES(is_active)",
      [code.slice(0, 40), c.type, Number(c.value), Number(c.minOrder) || 0, !!c.active]
    );
    counts.coupons += 1;
  }

  // 5. Registered users (existing emails are left alone)
  for (const u of Array.isArray(data.users) ? data.users : []) {
    const email = String(u?.email ?? "").trim().toLowerCase();
    if (!email || !u.passwordHash || (await queryOne("SELECT id FROM users WHERE email = ?", [email]))) continue;
    await query("INSERT INTO users (name, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
      String(u.name ?? email).slice(0, 100), email, String(u.passwordHash).slice(0, 255),
      u.role === "admin" ? "admin" : "customer", u.status === "disabled" ? "disabled" : "active", date(u.createdAt),
    ]);
    counts.users += 1;
  }

  // 6. Orders (skipped if the order number already exists)
  for (const o of Array.isArray(data.orders) ? data.orders : []) {
    if (!o?.id || o.demo || !o.customer || (await queryOne("SELECT id FROM orders WHERE order_number = ?", [String(o.id)]))) continue;
    const user = o.guest ? null : await queryOne("SELECT id FROM users WHERE email = ?", [String(o.customer.email ?? "").toLowerCase()]);
    const payment = typeof o.payment === "object" && o.payment ? o.payment : { method: "cod", title: String(o.payment ?? "Cash on Delivery"), status: "Pending" };
    await transaction(async (tx) => {
      const result = await tx.query(
        `INSERT INTO orders (order_number, user_id, is_guest, customer_name, customer_email, customer_phone, city, address, notes, subtotal, discount,
                             coupon_code, shipping, total, status, payment_method, payment_title, payment_status, payment_reference, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          String(o.id).slice(0, 30), user?.id ?? null, !user, String(o.customer.name ?? "").slice(0, 120), String(o.customer.email ?? "").toLowerCase().slice(0, 190),
          String(o.customer.phone ?? "").slice(0, 40), String(o.customer.city ?? "").slice(0, 100), String(o.customer.address ?? "").slice(0, 255), o.notes || null,
          Number(o.subtotal) || 0, Number(o.discount) || 0, o.couponCode ?? null, Number(o.shipping) || 0, Number(o.total) || 0,
          ["Processing", "Shipped", "Delivered", "Cancelled"].includes(o.status) ? o.status : "Processing",
          String(payment.method ?? "cod").slice(0, 30), String(payment.title ?? "Cash on Delivery").slice(0, 80),
          ["Pending", "Paid", "Refunded"].includes(payment.status) ? payment.status : "Pending", payment.reference ?? null, date(o.createdAt),
        ]
      );
      for (const item of Array.isArray(o.items) ? o.items : []) {
        const product = await tx.query("SELECT id FROM products WHERE slug = ?", [String(item.id ?? "")]);
        await tx.query(
          "INSERT INTO order_items (order_id, product_id, product_name, product_emoji, product_image, category_name, unit_price, quantity, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [result.insertId, product[0]?.id ?? null, String(item.name ?? "Product").slice(0, 200), item.emoji ?? null, imageMap.get(item.image) ?? null,
           item.category ?? null, Number(item.price) || 0, Math.max(1, Number(item.quantity) || 1), (Number(item.price) || 0) * (Number(item.quantity) || 1)]
        );
      }
      for (const h of Array.isArray(o.statusHistory) && o.statusHistory.length ? o.statusHistory : [{ status: o.status, at: o.createdAt }]) {
        if (["Processing", "Shipped", "Delivered", "Cancelled"].includes(h.status)) {
          await tx.query("INSERT INTO order_status_history (order_id, status, created_at) VALUES (?, ?, ?)", [result.insertId, h.status, date(h.at)]);
        }
      }
    });
    counts.orders += 1;
  }

  // 7. Reviews
  for (const r of Array.isArray(data.reviews) ? data.reviews : []) {
    const product = await queryOne("SELECT id FROM products WHERE slug = ?", [String(r?.productId ?? "")]);
    const rating = Math.round(Number(r?.rating));
    if (!product || !(rating >= 1 && rating <= 5) || !r.comment) continue;
    const duplicate = await queryOne("SELECT id FROM reviews WHERE product_id = ? AND name = ? AND comment = ?", [product.id, String(r.name ?? ""), String(r.comment)]);
    if (duplicate) continue;
    const user = r.email ? await queryOne("SELECT id FROM users WHERE email = ?", [String(r.email).toLowerCase()]) : null;
    await query("INSERT INTO reviews (product_id, user_id, name, email, rating, comment, is_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
      product.id, user?.id ?? null, String(r.name ?? "Customer").slice(0, 100), r.email || null, rating, String(r.comment).slice(0, 1000), !!r.verified, date(r.createdAt),
    ]);
    counts.reviews += 1;
  }

  // 8. Website content and settings
  for (const [key, value] of Object.entries(data.siteSettings ?? {})) {
    if (!(key in defaultSettings) || !value || typeof value !== "object") continue;
    try {
      await saveSection(key, replaceImageIds(value, imageMap));
      counts.settings += 1;
    } catch {
      // skip sections that don't pass validation
    }
  }
  return counts;
}
