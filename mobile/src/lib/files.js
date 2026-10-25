import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

function downloadInBrowser(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

// Saves text (e.g. a CSV report) and opens the phone's share sheet (save to Files, email, WhatsApp...).
export async function shareTextFile(name, content, mimeType) {
  if (Platform.OS === "web") return downloadInBrowser(new Blob([content], { type: mimeType }), name);
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  await file.write(content);
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: name });
}

// Downloads a file from the store's API (with the login token) and shares it.
export async function shareDownload(url, name, headers, mimeType) {
  if (Platform.OS === "web") {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Download failed (${res.status}).`);
    return downloadInBrowser(await res.blob(), name);
  }
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  const saved = await File.downloadFileAsync(url, file, { headers });
  await Sharing.shareAsync(saved.uri, { mimeType, dialogTitle: name });
}
