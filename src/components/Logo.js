"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import StoredImage from "./StoredImage";

// Store logo: the super admin's uploaded logo, or the HAK logo by default.
// Use `light` on dark backgrounds (footer).
export default function Logo({ light = false, className = "h-[30px]", onClick }) {
  const { general } = useSettings().settings;
  const uploaded = light ? general.logoLight ?? general.logo : general.logo;
  /* eslint-disable @next/next/no-img-element -- small static/blob logo images */
  const fallback = (
    <img src={light ? "/logo-light.svg" : "/logo.svg"} alt={general.storeName} className={`w-auto ${className}`} />
  );
  return (
    <Link href="/" onClick={onClick} className="flex shrink-0 items-center" aria-label={`${general.storeName} home`}>
      {uploaded ? (
        <span className={light && !general.logoLight ? "rounded-lg bg-white px-2 py-1" : ""}>
          <StoredImage id={uploaded} alt={general.storeName} className={`w-auto max-w-[180px] object-contain ${className}`} fallback={fallback} />
        </span>
      ) : (
        fallback
      )}
    </Link>
  );
  /* eslint-enable @next/next/no-img-element */
}
