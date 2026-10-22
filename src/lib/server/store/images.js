import "server-only";
import crypto from "node:crypto";
import { ApiError } from "../api";
import { query, queryOne } from "../db";

// Uploaded photos/logos are stored in the `images` table and served from /api/images/<id>,
// so they survive redeploys and are included in database backups.
const MAX_BYTES = 5 * 1024 * 1024;
const URL_PATTERN = /^\/api\/images\/([a-f0-9]{24})$/;

export const imageUrl = (id) => `/api/images/${id}`;
export const imageIdFromUrl = (url) => (typeof url === "string" ? url.match(URL_PATTERN)?.[1] ?? null : null);
export const isImageUrl = (url) => URL_PATTERN.test(url ?? "");

// Detects the real file type from its first bytes (never trust the browser's label).
function sniff(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export async function saveImage(buffer) {
  if (!buffer?.length) throw new ApiError(400, "The file is empty.");
  if (buffer.length > MAX_BYTES) throw new ApiError(413, "Images must be smaller than 5 MB.");
  const mime = sniff(buffer);
  if (!mime) throw new ApiError(400, "Please upload a JPG, PNG, WebP or GIF image.");
  const id = crypto.randomBytes(12).toString("hex");
  await query("INSERT INTO images (id, mime, size, data) VALUES (?, ?, ?, ?)", [id, mime, buffer.length, buffer]);
  return imageUrl(id);
}

export async function getImage(id) {
  if (!/^[a-f0-9]{24}$/.test(id)) return null;
  return queryOne("SELECT mime, data FROM images WHERE id = ?", [id]);
}

// Deletes images that are no longer used by any product, setting or past order.
export async function deleteUnusedImages(urls) {
  const ids = [...new Set(urls.map(imageIdFromUrl).filter(Boolean))];
  for (const id of ids) {
    const url = imageUrl(id);
    const used = await queryOne(
      `SELECT (SELECT COUNT(*) FROM product_images WHERE url = ?) +
              (SELECT COUNT(*) FROM order_items WHERE product_image = ?) +
              (SELECT COUNT(*) FROM settings WHERE setting_value LIKE ?) AS uses`,
      [url, url, `%${id}%`]
    );
    if (Number(used.uses) === 0) await query("DELETE FROM images WHERE id = ?", [id]);
  }
}
