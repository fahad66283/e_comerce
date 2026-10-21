"use client";

import { useImageUrl } from "@/lib/imageStore";

// Shows an uploaded image by id; renders `fallback` while loading or if it's missing.
export default function StoredImage({ id, alt, className = "", fallback = null }) {
  const url = useImageUrl(id);
  if (!url) return fallback;
  // eslint-disable-next-line @next/next/no-img-element -- local blob URLs, not optimisable by next/image
  return <img src={url} alt={alt} className={className} />;
}
