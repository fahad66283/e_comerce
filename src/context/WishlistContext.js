"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { api } from "@/lib/api";
import { createLocalStore } from "@/lib/localStore";
import { useAuth } from "./AuthContext";
import { useProducts } from "./ProductsContext";

// Logged-in shoppers: wishlist saved in MySQL. Guests: kept in the browser and added to the
// account when they log in or sign up.
const guestStore = createLocalStore("wishlist", []);

const WishlistContext = createContext(null);

export function WishlistProvider({ serverIds, children }) {
  const { user } = useAuth();
  const { getProduct } = useProducts();
  const router = useRouter();
  const guestIds = guestStore.useValue();
  // Instant feedback for logged-in clicks until the refreshed list arrives from the server.
  const [optimistic, setOptimistic] = useState({ base: serverIds, ids: serverIds });
  if (optimistic.base !== serverIds) setOptimistic({ base: serverIds, ids: serverIds });

  const ids = user ? optimistic.ids : guestIds;
  const items = ids.map(getProduct).filter(Boolean);
  const isWished = (id) => ids.includes(id);

  async function toggleWish(id) {
    if (!user) {
      guestStore.set((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      return;
    }
    const removing = optimistic.ids.includes(id);
    setOptimistic((s) => ({ ...s, ids: removing ? s.ids.filter((x) => x !== id) : [...s.ids, id] }));
    try {
      await api("/api/wishlist", { method: removing ? "DELETE" : "POST", body: removing ? { id } : { ids: [id] } });
    } finally {
      router.refresh();
    }
  }

  function removeWish(id) {
    if (isWished(id)) toggleWish(id);
  }

  // Called after login/sign-up: moves the guest wishlist into the account.
  async function mergeGuestWishlist() {
    const local = guestStore.get();
    if (!local.length) return;
    try {
      await api("/api/wishlist", { method: "POST", body: { ids: local } });
      guestStore.set([]);
    } catch {
      // keep the guest list if this fails
    }
  }

  return (
    <WishlistContext.Provider value={{ items, count: items.length, isWished, toggleWish, removeWish, mergeGuestWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
