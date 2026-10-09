"use client";

import { useState } from "react";
import AddToCartButton from "./AddToCartButton";

export default function ProductActions({ product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="mt-8 flex items-center gap-4">
      <div className="flex items-center rounded-lg border border-gray-300 bg-white">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-4 py-2 text-lg hover:bg-gray-100"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-10 text-center font-medium">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          className="px-4 py-2 text-lg hover:bg-gray-100"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <AddToCartButton productId={product.id} quantity={quantity} className="flex-1 py-3" />
    </div>
  );
}
