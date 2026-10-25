"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";
import { applyStoreName, defaultSettings, mergeSettings } from "@/data/siteContent";
import { api } from "@/lib/api";

// Website content and store settings, loaded from MySQL and edited by the super admin.
const SettingsContext = createContext(null);

const HEX = /^#[0-9a-f]{6}$/i;

export function SettingsProvider({ saved, stripe, children }) {
  const router = useRouter();
  // rawSettings keep "{storeName}" placeholders (for the editor); settings have them filled in.
  const rawSettings = useMemo(() => mergeSettings(defaultSettings, saved ?? {}), [saved]);
  const settings = useMemo(() => applyStoreName(rawSettings, rawSettings.general.storeName), [rawSettings]);

  async function saveSection(key, value) {
    await api(`/api/admin/settings/${key}`, { method: "PUT", body: value });
    router.refresh();
  }

  async function resetSection(key) {
    await api(`/api/admin/settings/${key}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <SettingsContext.Provider value={{ settings, rawSettings, saveSection, resetSection, stripe }}>
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
    const original = defaultSettings.general.storeName;
    if (name === original) return;
    // The new name can contain the old one ("HAK Store Lahore"), so check it isn't already applied
    // or the observer below would keep rewriting the title forever.
    const applied = (title) => (name.includes(original) ? title.includes(name) : !title.includes(original));
    const fix = () => {
      if (!applied(document.title)) document.title = document.title.replaceAll(original, name);
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

// Payment methods switched on by the super admin, plus card payments when Stripe is set up in .env.
export function usePaymentMethods() {
  const { settings, stripe } = useContext(SettingsContext);
  const { methods, stripeEnabled, stripeTitle, stripeText } = settings.payments;
  const card = stripe?.ready && stripeEnabled ? [{ id: "stripe", title: stripeTitle, text: stripeText, details: [] }] : [];
  return [...methods.filter((m) => m.enabled), ...card];
}
