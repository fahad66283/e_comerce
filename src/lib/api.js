"use client";

import { useCallback, useEffect, useState } from "react";

// Calls the store's API. Throws an Error with the server's message when something fails.
export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: {
      "X-Requested-With": "fetch", // required by the server for changes (CSRF protection)
      ...(body !== undefined && { "Content-Type": "application/json" }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    // empty or non-JSON response
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}). Please try again.`);
  return data;
}

// Uploads one image file and returns its URL.
export async function uploadImage(blob, purpose = "product") {
  const form = new FormData();
  form.append("file", blob, "upload");
  form.append("purpose", purpose);
  const res = await fetch("/api/admin/uploads", {
    method: "POST",
    credentials: "same-origin",
    headers: { "X-Requested-With": "fetch" },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed. Please try again.");
  return data.url;
}

// Removes uploaded images that were never saved (the server keeps any that are in use).
export function deleteUploads(urls) {
  const list = urls.filter((u) => typeof u === "string" && u.startsWith("/api/images/"));
  if (list.length) api("/api/admin/uploads", { method: "DELETE", body: { urls: list } }).catch(() => {});
}

// Loads data from a GET endpoint: { data, error, loading, reload }.
export function useApiData(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    api(path)
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((err) => !cancelled && setState((s) => ({ data: s.data, error: err.message, loading: false })));
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  return { ...state, reload };
}
