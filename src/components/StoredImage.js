"use client";

import { useState } from "react";

// An uploaded image (served from /api/images/...); renders `fallback` if it's missing or fails to load.
export default function StoredImage({ src, alt, className = "", fallback = null }) {
  const [failed, setFailed] = useState(null);
  if (!src || failed === src) return fallback;
  // eslint-disable-next-line @next/next/no-img-element -- uploaded images served by the store's API
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(src)} />;
}
