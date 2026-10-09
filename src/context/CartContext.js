"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { getProduct } from "@/data/products";

const CartContext = createContext(null);
const STORAGE_KEY = "cart";
const EMPTY = [];

// Cart items are stored as [{ id, quantity }] in localStorage.
// A tiny external store keeps every component (and other tabs) in sync.
let cache = null;
const listeners = new Set();

function readCart() {
  if (cache === null) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      cache = saved.filter((item) => getProduct(item.id) && item.quantity > 0);
    } catch {
      cache = [];
    }
  }
  return cache;
}

function writeCart(update) {
  cache = update(readCart());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  function onStorage(e) {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

export function CartProvider({ children }) {
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY);
  // false during server render and hydration, true once the browser cart is readable
  const loaded = useSyncExternalStore(noopSubscribe, () => true, () => false);

  function addToCart(id, quantity = 1) {
    writeCart((prev) => {
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
    writeCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }

  function removeFromCart(id) {
    writeCart((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    writeCart(() => []);
  }

  const detailedItems = items.map((item) => ({ ...item, product: getProduct(item.id) }));
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = detailedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: detailedItems,
        count,
        subtotal,
        loaded,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
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
