"use client";

// Image helpers for the browser:
//  • resizeImage – shrinks photos before they are uploaded to the server
//  • legacy IndexedDB readers – only used to import photos from the old browser-only version

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

// Photos become JPEG (max 1200px); logos stay PNG to keep transparency.
export async function resizeImage(file, { maxSize = 1200, keepTransparency = false } = {}) {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error(`${file.name}: please use JPG, PNG, WebP or GIF.`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name} is larger than 15 MB.`);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!keepTransparency) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const type = keepTransparency ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not process the image."))), type, 0.82)
  );
}

export const isUploadedImage = (value) => typeof value === "string" && value.startsWith("/api/images/");

// Every uploaded-image URL found anywhere inside a value (product, settings section, ...).
export function collectImageUrls(value, found = new Set()) {
  if (isUploadedImage(value)) found.add(value);
  else if (Array.isArray(value)) value.forEach((v) => collectImageUrls(v, found));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectImageUrls(v, found));
  return found;
}

// ---- Old browser-only version: photos were kept in IndexedDB ("hak-store" → "images") ----
function openLegacyDb() {
  return new Promise((resolve) => {
    if (!globalThis.indexedDB) return resolve(null);
    const request = indexedDB.open("hak-store", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("images");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// { "img-...": "data:image/...;base64,..." } for every photo saved by the old version.
export async function readLegacyImages() {
  const db = await openLegacyDb();
  if (!db || !db.objectStoreNames.contains("images")) return {};
  const entries = await new Promise((resolve) => {
    const tx = db.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const keys = store.getAllKeys();
    const values = store.getAll();
    tx.oncomplete = () => resolve(keys.result.map((k, i) => [k, values.result[i]]));
    tx.onerror = () => resolve([]);
  });
  const out = {};
  for (const [id, blob] of entries) {
    if (typeof id === "string" && blob instanceof Blob) out[id] = await blobToDataUrl(blob);
  }
  return out;
}
