// Google Maps for the About page, from what the super admin typed: an address, coordinates,
// a google.com/maps link, or the <iframe> code from Google Maps → Share → Embed a map.
// Only ever returns google.com addresses, whatever was typed.

const COORDS = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

function googleUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /^(www\.|maps\.)?google\.[a-z.]{2,6}$/.test(url.hostname) ? url : null;
  } catch {
    return null;
  }
}

// What to search for: an address/place/coordinates, or null for links we can't use.
function searchText(value) {
  if (!/^https?:/i.test(value)) return value;
  const url = googleUrl(value);
  if (!url) return null;
  const at = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ?? value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return `${at[1]},${at[2]}`;
  const place = url.pathname.match(/\/maps\/(?:place|search)\/([^/]+)/);
  if (place) return decodeURIComponent(place[1].replace(/\+/g, " "));
  return url.searchParams.get("q") || url.searchParams.get("query");
}

function embedFor(text) {
  const value = String(text ?? "").trim();
  if (!value) return null;
  const src = value.match(/src\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, "&");
  if (src || value.includes("/maps/embed")) {
    const url = googleUrl(src ?? value);
    return url && url.pathname.startsWith("/maps/embed") ? url.toString() : null;
  }
  const q = searchText(value);
  if (!q) return null;
  const coords = q.match(COORDS);
  return `https://maps.google.com/maps?q=${encodeURIComponent(coords ? `${coords[1]},${coords[2]}` : q)}&z=15&output=embed`;
}

// Map to show: the exact location if it can be used (short links like maps.app.goo.gl can't), else the address.
export function mapEmbedUrl(location, address) {
  return embedFor(location) ?? embedFor(address);
}

// "Get directions" link: coordinates when given, otherwise the address.
export function mapDirectionsUrl(location, address) {
  const fromLocation = String(location ?? "").includes("/maps/embed") ? null : searchText(String(location ?? "").trim());
  const q = fromLocation || String(address ?? "").trim();
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}
