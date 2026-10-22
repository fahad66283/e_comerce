"use client";

import { createContext, useContext } from "react";
import { shippingFor } from "@/data/siteContent";
import { api } from "@/lib/api";
import { evaluateCoupon } from "@/lib/coupons";
import { createLocalStore, useHydrated } from "@/lib/localStore";
import { useProducts } from "./ProductsContext";
import { useSettings } from "./SettingsContext";

// The cart stays in the shopper's browser until checkout ([{ id, quantity }]), like most shops.
// The coupon is checked by the server; prices, stock and the discount are recalculated at checkout.
const cartStore = createLocalStore("cart", []);
const couponStore = createLocalStore("cartCoupon", null); // { code, type, value, minOrder, active }

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const rawItems = cartStore.useValue();
  const savedCoupon = couponStore.useValue();
  const loaded = useHydrated();
  const { getProduct } = useProducts();
  const { settings } = useSettings();
  // Older versions saved just the code as text; ignore that.
  const coupon = savedCoupon && typeof savedCoupon === "object" ? savedCoupon : null;

  function addToCart(id, quantity = 1) {
    cartStore.set((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...prev, { id, quantity }];
    });
  }

  function updateQuantity(id, quantity) {
    if (quantity < 1) return removeFromCart(id);
    cartStore.set((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }

  function removeFromCart(id) {
    cartStore.set((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    cartStore.set([]);
    couponStore.set(null);
  }

  // Products removed by the admin simply drop out of the cart.
  const items = rawItems
    .map((item) => ({ ...item, product: getProduct(item.id) }))
    .filter((item) => item.product && item.quantity > 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function applyCoupon(code) {
    try {
      const { coupon: checked } = await api("/api/coupons/check", { method: "POST", body: { code, subtotal } });
      couponStore.set(checked);
      return {};
    } catch (err) {
      return { error: err.message };
    }
  }

  function removeCoupon() {
    couponStore.set(null);
  }

  // Re-checked whenever the cart changes (e.g. it drops below the coupon's minimum).
  const couponResult = coupon ? evaluateCoupon(coupon, subtotal) : null;
  const discount = couponResult?.discount ?? 0;
  const couponError = couponResult?.error ?? null;
  const shipping = shippingFor(subtotal - discount, settings.shipping);
  const total = subtotal - discount + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        couponCode: coupon?.code ?? null,
        couponError,
        discount,
        shipping,
        total,
        loaded,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
