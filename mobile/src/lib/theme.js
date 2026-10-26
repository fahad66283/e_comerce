// The website's theme (src/app/globals.css): black + green, Tajawal font, rounded cards.
// Brand and dark colours follow the super admin's Branding settings, like the website.

export const fonts = {
  light: "Tajawal_300Light",
  regular: "Tajawal_400Regular",
  medium: "Tajawal_500Medium",
  bold: "Tajawal_700Bold",
  extrabold: "Tajawal_800ExtraBold",
  black: "Tajawal_900Black",
};

export const radius = { field: 10, card: 14, panel: 20, pill: 999 };

const grey = { 50: "#FAFAF9", 100: "#F2F2F0", 200: "#E6E6E3", 400: "#A8ACA8", 500: "#6E726E", 700: "#45473F" };
const DEFAULT_BRAND = "#61C149";
const DEFAULT_INK = "#0A0A0A";
const HEX = /^#[0-9a-f]{6}$/i;

function mix(hex, other, amount) {
  const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(other.slice(i, i + 2), 16));
  return `#${a.map((v, i) => Math.round(v * amount + b[i] * (1 - amount)).toString(16).padStart(2, "0")).join("")}`;
}

export function buildColors(general = {}) {
  const brand = HEX.test(general.brandColor) ? general.brandColor : DEFAULT_BRAND;
  const ink = HEX.test(general.darkColor) ? general.darkColor : DEFAULT_INK;
  const isDefault = brand.toLowerCase() === DEFAULT_BRAND.toLowerCase();
  return {
    ink,
    white: "#FFFFFF",
    grey,
    brand50: isDefault ? "#F2FAEF" : mix(brand, "#FFFFFF", 0.08),
    brand100: isDefault ? "#E6F5E0" : mix(brand, "#FFFFFF", 0.18),
    brand500: brand,
    brand600: isDefault ? "#4FA83A" : mix(brand, "#000000", 0.86),
    brand700: isDefault ? "#3F8C2E" : mix(brand, "#000000", 0.72),
    brand900: isDefault ? "#2E5B22" : mix(brand, "#000000", 0.48),
    red: "#DC2626",
    redSoft: "#FEF2F2",
    amber: "#B45309",
    amberSoft: "#FFFBEB",
    star: "#FBBF24",
    sky: "#0369A1",
    skySoft: "#F0F9FF",
  };
}
