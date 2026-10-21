"use client";

import { useSettings } from "@/context/SettingsContext";

// Editable heading for the Shop and Categories pages.
export default function ListingHeading({ page }) {
  const { listings } = useSettings().settings;
  return (
    <div className="mb-8 max-w-[600px]">
      <span className="eyebrow">{listings[`${page}Eyebrow`]}</span>
      <h1 className="section-title">{listings[`${page}Title`]}</h1>
      <p className="section-sub">{listings[`${page}Text`]}</p>
    </div>
  );
}
