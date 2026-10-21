"use client";

import { createContext, useContext } from "react";
import { createLocalStore, useHydrated } from "@/lib/localStore";
import { getShipping } from "@/data/products";
import { evaluateCoupon, useCoupons } from "./CouponsContext";
import { useProducts } from "./ProductsContext";

// Cart items are stored as [{ id, quantity }] in localStorage, plus the applied coupon code.
const cartStore = createLocalStore("cart", []);
const couponCodeStore = createLocalStore("cartCoupon", null);

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const rawItems = cartStore.useValue();
  const loaded = useHydrated();
  const { getProduct } = useProducts();
  const { findCoupon } = useCoupons();
  const couponCode = couponCodeStore.useValue();

  function addToCart(id, quantity = 1) {
    cartStore.set((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + quantity } : item
        );
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
    couponCodeStore.set(null);
  }

  function applyCoupon(code) {
    const coupon = findCoupon(code);
    const result = evaluateCoupon(coupon, subtotal);
    if (result.error) return result;
    couponCodeStore.set(coupon.code);
    return {};
  }

  function removeCoupon() {
    couponCodeStore.set(null);
  }

  // Products deleted by the admin simply drop out of the cart.
  const items = rawItems
    .map((item) => ({ ...item, product: getProduct(item.id) }))
    .filter((item) => item.product && item.quantity > 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // The coupon is re-checked whenever the cart changes (e.g. it drops below the minimum).
  const couponResult = couponCode ? evaluateCoupon(findCoupon(couponCode), subtotal) : null;
  const discount = couponResult?.discount ?? 0;
  const couponError = couponResult?.error ?? null;
  const shipping = getShipping(subtotal - discount);
  const total = subtotal - discount + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        couponCode,
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
