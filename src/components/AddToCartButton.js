"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

// variant "icon": round "+" button used on product cards; "full": wide button.
export default function AddToCartButton({ product, quantity = 1, variant = "full", className = "" }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock < 1;

  function handleClick() {
    addToCart(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={soldOut}
        aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl transition disabled:cursor-not-allowed disabled:bg-grey-200 disabled:text-grey-400 ${
          added ? "bg-brand-500 text-ink" : "bg-ink text-white hover:scale-105 hover:bg-brand-500 hover:text-ink"
        } ${className}`}
      >
        {added ? "✓" : "+"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      className={`btn ${added ? "btn-dark" : "btn-primary"} ${className}`}
    >
      {soldOut ? "Sold Out" : added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
