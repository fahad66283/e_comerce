"use client";

import { useState } from "react";
import ProductImage from "./ProductImage";

// Main image with up to 4 more thumbnails underneath.
export default function ProductGallery({ product }) {
  const images = product.images ?? [];
  const [index, setIndex] = useState(0);
  const current = images[Math.min(index, images.length - 1)];

  return (
    <div>
      <ProductImage product={product} size="lg" imageId={current} />
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2.5">
          {images.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={id === current}
              className={`overflow-hidden rounded-field border-2 transition ${id === current ? "border-ink" : "border-transparent hover:border-grey-400"}`}
            >
              <ProductImage product={product} size="md" imageId={id} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
