"use client";

import { useState } from "react";

// Read-only star rating, e.g. <Stars value={4.3} />
export function Stars({ value, size = "text-sm" }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={`inline-flex ${size}`} role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden="true" className={n <= rounded ? "text-amber-400" : n - 0.5 === rounded ? "text-amber-300" : "text-grey-200"}>
          ★
        </span>
      ))}
    </span>
  );
}

// Clickable 1–5 star input for review forms.
export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex text-3xl" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          className={`px-0.5 transition ${n <= (hover || value) ? "text-amber-400" : "text-grey-200"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
