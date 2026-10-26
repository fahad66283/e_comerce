import Constants from "expo-constants";

// The website the app talks to: same API, same MySQL data. Set it in app.json → expo.extra.apiUrl,
// or with EXPO_PUBLIC_API_URL when developing (e.g. EXPO_PUBLIC_API_URL=http://192.168.1.5:3000).
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? Constants.expoConfig?.extra?.apiUrl ?? "https://hakstores.com").replace(/\/+$/, "");

// Images are stored by the website (e.g. "/api/images/abc..."); the app loads them from there.
export function absoluteUrl(path) {
  if (!path) return null;
  return /^https?:\/\//.test(path) ? path : `${API_URL}${path}`;
}
