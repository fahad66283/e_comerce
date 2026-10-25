import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { API_URL } from "./config";

// Calls the store's API (the same one the website uses). The app logs in with a token
// ("Authorization: Bearer ...") instead of the website's cookie.
let token = null;
export const setApiToken = (value) => {
  token = value;
};
export const getApiToken = () => token;

function headers(extra) {
  return {
    "X-Requested-With": "fetch", // required by the server for changes
    "X-Client": "app",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...extra,
  };
}

async function send(path, init) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error("Can't reach the store. Please check your internet connection and try again.");
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    // empty or non-JSON response
  }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status}). Please try again.`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Throws an Error with the server's message when something fails.
export function api(path, { method = "GET", body } = {}) {
  return send(path, {
    method,
    headers: headers(body !== undefined ? { "Content-Type": "application/json" } : {}),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// Uploads a photo picked on the phone ({ uri, mimeType }) and returns its URL ("/api/images/...").
export async function uploadImage(asset, purpose = "product") {
  const form = new FormData();
  if (Platform.OS === "web") {
    form.append("file", await (await fetch(asset.uri)).blob(), "upload");
  } else {
    form.append("file", { uri: asset.uri, name: "upload.jpg", type: asset.mimeType || "image/jpeg" });
  }
  form.append("purpose", purpose);
  const data = await send("/api/admin/uploads", { method: "POST", headers: headers(), body: form });
  return data.url;
}

// Removes uploaded photos that were never saved (the server keeps any that are in use).
export function deleteUploads(urls) {
  const list = urls.filter((u) => typeof u === "string" && u.startsWith("/api/images/"));
  if (list.length) api("/api/admin/uploads", { method: "DELETE", body: { urls: list } }).catch(() => {});
}

// Loads data from a GET endpoint: { data, error, loading, reload }. While reloading, the last data stays.
export function useApiData(path) {
  const [state, setState] = useState({ key: null, data: null, error: null });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const key = path ? `${path}#${version}` : null;

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    const done = `${path}#${version}`;
    api(path)
      .then((data) => !cancelled && setState({ key: done, data, error: null }))
      .catch((err) => !cancelled && setState((s) => ({ key: done, data: s.data, error: err.message })));
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  return { data: state.data, error: state.error, loading: !!key && state.key !== key, reload };
}
