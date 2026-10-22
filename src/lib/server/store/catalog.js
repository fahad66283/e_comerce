import "server-only";
import { defaultCategories, products as defaultProducts } from "@/data/products";
import { ApiError, number, text } from "../api";
import { query, queryOne, transaction } from "../db";
import { deleteUnusedImages, isImageUrl } from "./images";

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150);

// ---------------- Categories ----------------
export async function listCategories() {
  const rows = await query("SELECT id, name, icon, description FROM categories ORDER BY sort_order, id");
  return rows.map((r) => ({ name: r.name, icon: r.icon ?? "🛍️", description: r.description ?? "" }));
}

function categoryInput(data) {
  return {
    name: text(data.name, "Category name", { max: 80 }),
    icon: text(data.icon, "Icon", { max: 16, required: false }) || "🛍️",
    description: text(data.description, "Description", { max: 255, required: false }),
  };
}

export async function addCategory(data) {
  const c = categoryInput(data);
  if (await queryOne("SELECT id FROM categories WHERE name = ?", [c.name])) {
    throw new ApiError(409, `A category called "${c.name}" already exists.`);
  }
  let slug = slugify(c.name) || "category";
  for (let n = 2; await queryOne("SELECT id FROM categories WHERE slug = ?", [slug]); n++) slug = `${slugify(c.name)}-${n}`;
  const [{ next }] = await query("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM categories");
  await query("INSERT INTO categories (name, slug, icon, description, sort_order) VALUES (?, ?, ?, ?, ?)", [c.name, slug, c.icon, c.description, next]);
}

export async function updateCategory(oldName, data) {
  const c = categoryInput(data);
  const existing = await queryOne("SELECT id FROM categories WHERE name = ?", [oldName]);
  if (!existing) throw new ApiError(404, "Category not found.");
  const clash = await queryOne("SELECT id FROM categories WHERE name = ? AND id <> ?", [c.name, existing.id]);
  if (clash) throw new ApiError(409, `A category called "${c.name}" already exists.`);
  // Products point to the category by id, so renaming moves them along automatically.
  await query("UPDATE categories SET name = ?, icon = ?, description = ? WHERE id = ?", [c.name, c.icon, c.description, existing.id]);
}

export async function deleteCategory(name) {
  const existing = await queryOne("SELECT id FROM categories WHERE name = ?", [name]);
  if (!existing) throw new ApiError(404, "Category not found.");
  const [{ count }] = await query("SELECT COUNT(*) AS count FROM products WHERE category_id = ?", [existing.id]);
  if (count > 0) throw new ApiError(409, `"${name}" still has ${count} product(s). Move or delete them first.`);
  await query("DELETE FROM categories WHERE id = ?", [existing.id]);
}

// Restores the default categories and removes other empty categories.
export async function resetCategories() {
  await transaction(async (tx) => {
    for (const [i, c] of defaultCategories.entries()) {
      await tx.query(
        `INSERT INTO categories (name, slug, icon, description, sort_order) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE icon = VALUES(icon), description = VALUES(description), sort_order = VALUES(sort_order)`,
        [c.name, slugify(c.name), c.icon, c.description, i]
      );
    }
    await tx.query(
      `DELETE FROM categories WHERE name NOT IN (${defaultCategories.map(() => "?").join(",")})
         AND id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL)`,
      defaultCategories.map((c) => c.name)
    );
  });
}

// ---------------- Products ----------------
function toProduct(row, images) {
  return {
    id: row.slug,
    name: row.name,
    category: row.category_name ?? "",
    description: row.description,
    price: Number(row.price),
    compareAt: row.compare_at_price === null ? null : Number(row.compare_at_price),
    stock: row.stock,
    emoji: row.emoji ?? "📦",
    rating: Number(row.rating),
    featured: !!row.is_featured,
    isNew: !!row.is_new,
    images,
  };
}

const PRODUCT_SELECT = `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id`;

export async function listProducts() {
  const [rows, images] = await Promise.all([
    query(`${PRODUCT_SELECT} WHERE p.status = 'active' ORDER BY p.sort_order, p.id`),
    query("SELECT product_id, url FROM product_images ORDER BY product_id, sort_order"),
  ]);
  const byProduct = new Map();
  for (const img of images) {
    if (!byProduct.has(img.product_id)) byProduct.set(img.product_id, []);
    byProduct.get(img.product_id).push(img.url);
  }
  return rows.map((row) => toProduct(row, byProduct.get(row.id) ?? []));
}

export async function getProduct(slug) {
  const row = await queryOne(`${PRODUCT_SELECT} WHERE p.slug = ? AND p.status = 'active'`, [String(slug)]);
  if (!row) return null;
  const images = await query("SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order", [row.id]);
  return toProduct(row, images.map((i) => i.url));
}

async function productInput(data) {
  const price = number(data.price, "Price", { min: 1 });
  const compareAt = data.compareAt === null || data.compareAt === "" || data.compareAt === undefined ? null : number(data.compareAt, "Original price", { min: 1 });
  if (compareAt !== null && compareAt <= price) throw new ApiError(400, "The original price must be higher than the sale price, or left empty.");
  const categoryName = text(data.category, "Category", { max: 80 });
  const category = await queryOne("SELECT id FROM categories WHERE name = ?", [categoryName]);
  if (!category) throw new ApiError(400, "Please choose an existing category.");
  const images = Array.isArray(data.images) ? data.images : [];
  if (images.length > 5) throw new ApiError(400, "A product can have up to 5 photos.");
  if (!images.every(isImageUrl)) throw new ApiError(400, "Please upload the photos again.");
  return {
    name: text(data.name, "Product name", { max: 200 }),
    description: text(data.description, "Description", { max: 5000 }),
    price,
    compareAt,
    stock: number(data.stock, "Stock", { min: 0, max: 1_000_000, integer: true }),
    emoji: text(data.emoji, "Emoji", { max: 16, required: false }) || "📦",
    rating: number(data.rating ?? 0, "Rating", { min: 0, max: 5 }),
    featured: !!data.featured,
    isNew: !!data.isNew,
    categoryId: category.id,
    images: [...new Set(images)],
  };
}

async function writeImages(tx, productId, name, images) {
  await tx.query("DELETE FROM product_images WHERE product_id = ?", [productId]);
  for (const [i, url] of images.entries()) {
    await tx.query("INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?, ?, ?, ?)", [productId, url, name, i]);
  }
}

export async function addProduct(data) {
  const p = await productInput(data);
  const base = slugify(p.name) || "product";
  let slug = base;
  for (let n = 2; await queryOne("SELECT id FROM products WHERE slug = ?", [slug]); n++) slug = `${base}-${n}`;
  await transaction(async (tx) => {
    const [{ next }] = await tx.query("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM products");
    const result = await tx.query(
      `INSERT INTO products (slug, category_id, name, description, price, compare_at_price, stock, emoji, rating, is_featured, is_new, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, p.categoryId, p.name, p.description, p.price, p.compareAt, p.stock, p.emoji, p.rating, p.featured, p.isNew, next]
    );
    await writeImages(tx, result.insertId, p.name, p.images);
  });
  return slug;
}

export async function updateProduct(slug, data) {
  const existing = await queryOne("SELECT id FROM products WHERE slug = ?", [String(slug)]);
  if (!existing) throw new ApiError(404, "Product not found.");
  const p = await productInput(data);
  const oldImages = (await query("SELECT url FROM product_images WHERE product_id = ?", [existing.id])).map((r) => r.url);
  await transaction(async (tx) => {
    await tx.query(
      `UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, compare_at_price = ?, stock = ?, emoji = ?,
              rating = ?, is_featured = ?, is_new = ? WHERE id = ?`,
      [p.categoryId, p.name, p.description, p.price, p.compareAt, p.stock, p.emoji, p.rating, p.featured, p.isNew, existing.id]
    );
    await writeImages(tx, existing.id, p.name, p.images);
  });
  await deleteUnusedImages(oldImages.filter((url) => !p.images.includes(url)));
}

// Quick on/off switches from the product table (featured / new).
export async function setProductFlags(slug, { featured, isNew }) {
  const sets = [];
  const params = [];
  if (featured !== undefined) {
    sets.push("is_featured = ?");
    params.push(!!featured);
  }
  if (isNew !== undefined) {
    sets.push("is_new = ?");
    params.push(!!isNew);
  }
  if (sets.length === 0) return;
  const result = await query(`UPDATE products SET ${sets.join(", ")} WHERE slug = ?`, [...params, String(slug)]);
  if (result.affectedRows === 0) throw new ApiError(404, "Product not found.");
}

export async function deleteProduct(slug) {
  const existing = await queryOne("SELECT id FROM products WHERE slug = ?", [String(slug)]);
  if (!existing) throw new ApiError(404, "Product not found.");
  const images = (await query("SELECT url FROM product_images WHERE product_id = ?", [existing.id])).map((r) => r.url);
  await query("DELETE FROM products WHERE id = ?", [existing.id]); // photos rows and reviews are removed too
  await deleteUnusedImages(images);
}

// Replaces all products with the default catalog (past orders keep their own copy of each item).
export async function resetProducts() {
  const images = (await query("SELECT url FROM product_images")).map((r) => r.url);
  await resetCategories();
  await transaction(async (tx) => {
    await tx.query("DELETE FROM products");
    const categories = await tx.query("SELECT id, name FROM categories");
    const ids = new Map(categories.map((c) => [c.name, c.id]));
    for (const [i, p] of defaultProducts.entries()) {
      await tx.query(
        `INSERT INTO products (slug, category_id, name, description, price, compare_at_price, stock, emoji, rating, is_featured, is_new, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, ids.get(p.category) ?? null, p.name, p.description, p.price, p.compareAt ?? null, p.stock, p.emoji, p.rating, !!p.featured, !!p.isNew, i]
      );
    }
  });
  await deleteUnusedImages(images);
}
