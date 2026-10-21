"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useHydrated } from "@/lib/localStore";

export default function WishlistButton({ product, className = "", withLabel = false }) {
  const { isWished, toggleWish } = useWishlist();
  const hydrated = useHydrated();
  const wished = hydrated && isWished(product.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleWish(product.id);
      }}
      aria-pressed={wished}
      aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      className={`flex items-center justify-center gap-2 transition ${className}`}
    >
      <span aria-hidden="true" className={`text-lg leading-none ${wished ? "text-red-500" : "text-grey-500"}`}>
        {wished ? "♥" : "♡"}
      </span>
      {withLabel && <span>{wished ? "In Wishlist" : "Add to Wishlist"}</span>}
    </button>
  );
}
