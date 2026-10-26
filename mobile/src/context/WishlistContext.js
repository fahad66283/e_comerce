import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { loadJson, saveJson } from "@/lib/storage";
import { useProducts, useStore } from "./StoreContext";

// Logged-in shoppers: wishlist saved in MySQL (same list as on the website).
// Guests: kept on the phone and added to the account when they log in or sign up.
const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, serverWishlist, refresh } = useStore();
  const { getProduct } = useProducts();
  const [guestIds, setGuestIds] = useState([]);
  // Instant feedback for logged-in taps until the refreshed list arrives from the server.
  const [optimistic, setOptimistic] = useState({ base: serverWishlist, ids: serverWishlist });
  if (optimistic.base !== serverWishlist) setOptimistic({ base: serverWishlist, ids: serverWishlist });

  useEffect(() => {
    loadJson("wishlist", []).then((ids) => setGuestIds(Array.isArray(ids) ? ids : []));
  }, []);

  const ids = user ? optimistic.ids : guestIds;
  const items = ids.map(getProduct).filter(Boolean);
  const isWished = (id) => ids.includes(id);

  async function toggleWish(id) {
    if (!user) {
      setGuestIds((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        saveJson("wishlist", next);
        return next;
      });
      return;
    }
    const removing = optimistic.ids.includes(id);
    setOptimistic((s) => ({ ...s, ids: removing ? s.ids.filter((x) => x !== id) : [...s.ids, id] }));
    try {
      await api("/api/wishlist", { method: removing ? "DELETE" : "POST", body: removing ? { id } : { ids: [id] } });
    } finally {
      refresh();
    }
  }

  // Called right after login/sign-up: moves the guest wishlist into the account.
  async function mergeGuestWishlist() {
    const local = await loadJson("wishlist", []);
    if (!local.length) return;
    try {
      await api("/api/wishlist", { method: "POST", body: { ids: local } });
      setGuestIds([]);
      await saveJson("wishlist", []);
    } catch {
      // keep the guest list if this fails
    }
  }

  return (
    <WishlistContext.Provider value={{ items, count: items.length, isWished, toggleWish, mergeGuestWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
