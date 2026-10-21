"use client";

import { createContext, useContext } from "react";
import { createLocalStore } from "@/lib/localStore";
import { useProducts } from "./ProductsContext";

// Wishlist product ids, saved in this browser.
const wishlistStore = createLocalStore("wishlist", []);

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const ids = wishlistStore.useValue();
  const { getProduct } = useProducts();

  // Products the admin deleted simply drop out of the wishlist.
  const items = ids.map(getProduct).filter(Boolean);

  function isWished(id) {
    return ids.includes(id);
  }

  function toggleWish(id) {
    wishlistStore.set((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function removeWish(id) {
    wishlistStore.set((prev) => prev.filter((x) => x !== id));
  }

  return (
    <WishlistContext.Provider value={{ items, count: items.length, isWished, toggleWish, removeWish }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
