"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ productId, quantity = 1, disabled = false, className = "" }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addToCart(productId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={`cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-600 ${className}`}
      >
        Sold Out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-lg px-4 py-2 font-medium text-white transition ${
        added ? "bg-green-600" : "bg-indigo-600 hover:bg-indigo-700"
      } ${className}`}
    >
      {added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
