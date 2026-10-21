"use client";

import { useEffect, useState } from "react";
import { useHydrated } from "./localStore";

// Uploaded images (product photos, logos) are kept in the browser's IndexedDB, which can hold
// far more than localStorage. Records reference them by id ("img-..."). When the store moves to
// MySQL, images become files on the server (database/README.md).
const DB_NAME = "hak-store";
const STORE = "images";
let dbPromise;

function openDb() {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function withStore(mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error("Could not save the image (storage may be full)."));
  });
}

export const isImageId = (value) => typeof value === "string" && value.startsWith("img-");

export function putImage(id, blob) {
  return withStore("readwrite", (store) => store.put(blob, id));
}

export function getImageBlob(id) {
  return withStore("readonly", (store) => store.get(id));
}

export async function deleteImages(ids) {
  const list = ids.filter(isImageId);
  if (list.length === 0) return;
  urlCache.forEach((url, id) => {
    if (list.includes(id)) {
      URL.revokeObjectURL(url);
      urlCache.delete(id);
    }
  });
  await withStore("readwrite", (store) => list.forEach((id) => store.delete(id)));
}

export function listImageIds() {
  return withStore("readonly", (store) => store.getAllKeys());
}

// Every image id found anywhere inside a value (product, settings section, ...).
export function collectImageIds(value, found = new Set()) {
  if (isImageId(value)) found.add(value);
  else if (Array.isArray(value)) value.forEach((v) => collectImageIds(v, found));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectImageIds(v, found));
  return found;
}

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

// Shrinks a photo before saving. Photos become JPEG (max 1200px); logos stay PNG to keep transparency.
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

export async function saveUploadedImage(file, options) {
  const blob = await resizeImage(file, options);
  const id = `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  await putImage(id, blob);
  return id;
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl) {
  return (await fetch(dataUrl)).blob();
}

// Object URLs for displaying stored images, shared by all components.
const urlCache = new Map();

export function useImageUrl(id) {
  const hydrated = useHydrated();
  const [, setLoaded] = useState(0);

  useEffect(() => {
    if (!isImageId(id) || urlCache.has(id)) return;
    let cancelled = false;
    getImageBlob(id)
      .then((blob) => {
        if (!blob || cancelled) return;
        if (!urlCache.has(id)) urlCache.set(id, URL.createObjectURL(blob));
        setLoaded((n) => n + 1);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Nothing during server render/hydration, so the HTML always matches.
  return hydrated && isImageId(id) ? (urlCache.get(id) ?? null) : null;
}
