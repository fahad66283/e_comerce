"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";
import { applyStoreName, defaultSettings, mergeSettings } from "@/data/siteContent";
import { createLocalStore } from "@/lib/localStore";

// Website content and store settings edited by the super admin.
// DEMO ONLY: saved in this browser until the site is connected to MySQL.
const settingsStore = createLocalStore("siteSettings", {});

const SettingsContext = createContext(null);

const HEX = /^#[0-9a-f]{6}$/i;

export function SettingsProvider({ children }) {
  const saved = settingsStore.useValue();
  // rawSettings keep "{storeName}" placeholders (for the editor); settings have them filled in.
  const rawSettings = useMemo(() => mergeSettings(defaultSettings, saved), [saved]);
  const settings = useMemo(() => applyStoreName(rawSettings, rawSettings.general.storeName), [rawSettings]);

  function saveSection(key, value) {
    settingsStore.set((prev) => ({ ...prev, [key]: value }));
  }

  function resetSection(key) {
    settingsStore.set((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  return (
    <SettingsContext.Provider value={{ settings, rawSettings, saved, saveSection, resetSection }}>
      <ThemeColors general={settings.general} />
      <StoreNameInTitle name={settings.general.storeName} />
      {children}
    </SettingsContext.Provider>
  );
}

// Overrides the theme's colour variables when the super admin picks new brand colours.
function ThemeColors({ general }) {
  const brand = HEX.test(general.brandColor) ? general.brandColor : defaultSettings.general.brandColor;
  const ink = HEX.test(general.darkColor) ? general.darkColor : defaultSettings.general.darkColor;
  const isDefault =
    brand.toLowerCase() === defaultSettings.general.brandColor.toLowerCase() &&
    ink.toLowerCase() === defaultSettings.general.darkColor.toLowerCase();
  if (isDefault) return null;
  const mix = (amount, other) => `color-mix(in oklab, ${brand} ${amount}%, ${other})`;
  const css = `:root{--color-brand-500:${brand};--color-brand-600:${mix(86, "black")};--color-brand-700:${mix(72, "black")};--color-brand-900:${mix(48, "black")};--color-brand-100:${mix(18, "white")};--color-brand-50:${mix(8, "white")};--color-ink:${ink};}`;
  return <style>{css}</style>;
}

// Page titles are written as "… – HAK Store"; show the current store name in the browser tab instead.
function StoreNameInTitle({ name }) {
  const pathname = usePathname();
  useEffect(() => {
    if (name === defaultSettings.general.storeName) return;
    const fix = () => {
      if (document.title.includes(defaultSettings.general.storeName)) {
        document.title = document.title.replaceAll(defaultSettings.general.storeName, name);
      }
    };
    fix();
    const observer = new MutationObserver(fix);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [name, pathname]);
  return null;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}

// Enabled payment methods (Card always shows as "coming soon": it needs a payment gateway).
export function usePaymentMethods() {
  const { settings } = useContext(SettingsContext);
  return settings.payments.methods.filter((m) => m.enabled);
}
