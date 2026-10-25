import { router } from "expo-router";
import { Linking } from "react-native";

// Links in the editable content are written as website paths ("/track-order", "/products?filter=sale").
// The app's screens use the same paths, so they open in the app; other links open in the browser.
export function openLink(href) {
  if (!href) return;
  if (href.startsWith("/") && !href.startsWith("//")) {
    const path = href.split("#")[0] || "/";
    router.push(path);
    return;
  }
  if (/^(https?:|mailto:|tel:)/i.test(href)) Linking.openURL(href).catch(() => {});
}
