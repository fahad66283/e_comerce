import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// The login token goes in the phone's secure keychain; the cart, wishlist and cached store data
// in normal app storage. (The web preview, used for testing, falls back to localStorage.)
const web = Platform.OS === "web";

export const secureStore = {
  get: (key) => (web ? Promise.resolve(globalThis.localStorage?.getItem(key) ?? null) : SecureStore.getItemAsync(key)),
  set: (key, value) => (web ? Promise.resolve(globalThis.localStorage?.setItem(key, value)) : SecureStore.setItemAsync(key, value)),
  remove: (key) => (web ? Promise.resolve(globalThis.localStorage?.removeItem(key)) : SecureStore.deleteItemAsync(key)),
};

export async function loadJson(key, fallback) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function saveJson(key, value) {
  return AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}
