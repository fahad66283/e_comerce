// Builds INSERT statements for the MySQL schema in database/migrations/001_initial_schema.sql.
// Used by Dashboard → Backup ("Export for MySQL") and by scripts/generate-seed.mjs.
// Pure JavaScript with no imports, so it runs both in the browser and in Node.

const POLICY_PAGES = { privacy: "privacy-policy", terms: "terms", returns: "return-policy" };

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  // Doubled quotes work in every SQL mode; backslashes are escaped for MySQL's default mode.
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

function sqlDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 19).replace("T", " ");
}

function insert(table, columns, rows) {
  if (rows.length === 0) return `-- (no rows for ${table})\n`;
  const chunks = [];
  for (let i = 0; i < rows.length; i += 100) {
    const values = rows.slice(i, i + 100).map((row) => `  (${row.map(sqlValue).join(", ")})`);
    chunks.push(`INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES\n${values.join(",\n")};\n`);
  }
  return chunks.join("");
}

// Replaces uploaded-image ids ("img-...") with their URLs (or data URLs) everywhere in a value.
function withImageUrls(value, images) {
  if (typeof value === "string" && value.startsWith("img-")) return images[value] ?? null;
  if (Array.isArray(value)) return value.map((v) => withImageUrls(v, images));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withImageUrls(v, images)]));
  }
  return value;
}

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function buildSqlDump({
  categories = [],
  products = [],
  coupons = [],
  orders = [],
  reviews = [],
  users = [],
  settings = {},
  images = {},
  title = "HAK Store data",
}) {
  const now = new Date().toISOString();
  const categoryIds = new Map(categories.map((c, i) => [c.name, i + 1]));
  const productIds = new Map(products.map((p, i) => [p.id, i + 1]));
  const userIds = new Map(users.map((u, i) => [u.email, i + 1]));
  const realOrders = orders.filter((o) => !o.demo);

  let sql = `-- ${title}
-- Generated: ${now}
--
-- Import this AFTER database/migrations/001_initial_schema.sql (phpMyAdmin → Import).
-- It REPLACES all store data in these tables with the data below.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM \`order_status_history\`;
DELETE FROM \`order_items\`;
DELETE FROM \`orders\`;
DELETE FROM \`reviews\`;
DELETE FROM \`wishlists\`;
DELETE FROM \`product_images\`;
DELETE FROM \`products\`;
DELETE FROM \`categories\`;
DELETE FROM \`coupons\`;
DELETE FROM \`faqs\`;
DELETE FROM \`pages\`;
DELETE FROM \`settings\`;
DELETE FROM \`users\`;

`;

  sql += "-- Users (passwords are salted PBKDF2-SHA256 hashes; see database/README.md)\n";
  sql += insert(
    "users",
    ["id", "name", "username", "email", "password_hash", "role", "status", "created_at"],
    users.map((u) => [
      userIds.get(u.email),
      u.name,
      u.username ?? null,
      u.email,
      u.passwordHash,
      u.role ?? "customer",
      u.status ?? "active",
      sqlDate(u.createdAt) ?? sqlDate(now),
    ])
  );

  sql += "\n-- Categories\n";
  sql += insert(
    "categories",
    ["id", "name", "slug", "icon", "description", "sort_order"],
    categories.map((c, i) => [i + 1, c.name, slugify(c.name) || `category-${i + 1}`, c.icon ?? null, c.description ?? null, i])
  );

  sql += "\n-- Products\n";
  sql += insert(
    "products",
    ["id", "slug", "category_id", "name", "description", "price", "compare_at_price", "stock", "emoji", "rating", "is_featured", "is_new", "status", "sort_order"],
    products.map((p, i) => [
      i + 1,
      p.id,
      categoryIds.get(p.category) ?? null,
      p.name,
      p.description ?? "",
      Number(p.price) || 0,
      p.compareAt > p.price ? Number(p.compareAt) : null,
      Math.max(0, Number(p.stock) || 0),
      p.emoji ?? null,
      Number(p.rating) || 0,
      !!p.featured,
      !!p.isNew,
      "active",
      i,
    ])
  );

  sql += "\n-- Product images (max 5 per product; URL is a file path or a data: URL)\n";
  sql += insert(
    "product_images",
    ["product_id", "url", "alt", "sort_order"],
    products.flatMap((p) =>
      (p.images ?? [])
        .slice(0, 5)
        .filter((id) => images[id])
        .map((id, i) => [productIds.get(p.id), images[id], p.name, i])
    )
  );

  sql += "\n-- Coupons\n";
  sql += insert(
    "coupons",
    ["code", "type", "value", "min_order", "is_active"],
    coupons.map((c) => [c.code, c.type, Number(c.value) || 0, Number(c.minOrder) || 0, !!c.active])
  );

  sql += "\n-- Orders\n";
  sql += insert(
    "orders",
    [
      "id", "order_number", "user_id", "is_guest", "customer_name", "customer_email", "customer_phone", "city", "address",
      "notes", "subtotal", "discount", "coupon_code", "shipping", "total", "status", "payment_method", "payment_title",
      "payment_status", "payment_reference", "created_at",
    ],
    realOrders.map((o, i) => [
      i + 1,
      o.id,
      o.guest ? null : (userIds.get(o.customer.email) ?? null),
      !!o.guest || !userIds.has(o.customer.email),
      o.customer.name,
      o.customer.email,
      o.customer.phone,
      o.customer.city,
      o.customer.address,
      o.notes || null,
      o.subtotal,
      o.discount ?? 0,
      o.couponCode ?? null,
      o.shipping,
      o.total,
      o.status,
      o.payment?.method ?? "cod",
      o.payment?.title ?? "Cash on Delivery",
      o.payment?.status ?? "Pending",
      o.payment?.reference ?? null,
      sqlDate(o.createdAt),
    ])
  );

  sql += "\n-- Order items\n";
  sql += insert(
    "order_items",
    ["order_id", "product_id", "product_name", "product_emoji", "category_name", "unit_price", "quantity", "line_total"],
    realOrders.flatMap((o, i) =>
      o.items.map((item) => [
        i + 1,
        productIds.get(item.id) ?? null,
        item.name,
        item.emoji ?? null,
        item.category ?? null,
        item.price,
        item.quantity,
        item.price * item.quantity,
      ])
    )
  );

  sql += "\n-- Order status history\n";
  sql += insert(
    "order_status_history",
    ["order_id", "status", "created_at"],
    realOrders.flatMap((o, i) =>
      (o.statusHistory ?? [{ status: o.status, at: o.createdAt }]).map((h) => [i + 1, h.status, sqlDate(h.at)])
    )
  );

  sql += "\n-- Reviews\n";
  sql += insert(
    "reviews",
    ["product_id", "user_id", "name", "email", "rating", "comment", "is_verified", "is_approved", "created_at"],
    reviews
      .filter((r) => productIds.has(r.productId))
      .map((r) => [
        productIds.get(r.productId),
        r.email ? (userIds.get(r.email) ?? null) : null,
        r.name,
        r.email || null,
        r.rating,
        r.comment,
        !!r.verified,
        true,
        sqlDate(r.createdAt),
      ])
  );

  const { faqs, ...rest } = settings;
  const settingRows = Object.entries(rest)
    .filter(([key]) => !POLICY_PAGES[key])
    .map(([key, value]) => [key, JSON.stringify(withImageUrls(value, images))]);
  sql += "\n-- Website settings (JSON per section)\n";
  sql += insert("settings", ["setting_key", "setting_value"], settingRows);

  sql += "\n-- Policy pages\n";
  sql += insert(
    "pages",
    ["slug", "title", "intro", "updated_label", "content"],
    Object.entries(POLICY_PAGES)
      .filter(([key]) => settings[key])
      .map(([key, slug]) => {
        const page = settings[key];
        return [slug, page.title, page.intro, page.updated, JSON.stringify({ highlights: page.highlights ?? [], sections: page.sections ?? [] })];
      })
  );

  sql += "\n-- FAQs\n";
  sql += insert(
    "faqs",
    ["group_name", "question", "answer", "sort_order"],
    (faqs?.items ?? []).map((f, i) => [f.group || "General", f.question, f.answer, i])
  );
  if (faqs) {
    sql += insert("settings", ["setting_key", "setting_value"], [["faqs", JSON.stringify({ eyebrow: faqs.eyebrow, title: faqs.title, intro: faqs.intro })]]);
  }

  sql += "\nSET FOREIGN_KEY_CHECKS = 1;\n";
  return sql;
}
