"use client";

import { createContext, useContext } from "react";
import { products as defaultProducts } from "@/data/products";
import { createLocalStore } from "@/lib/localStore";

// Listings start from the static catalog. Admin changes are saved in this
// browser's localStorage until a real backend/database is added.
const productsStore = createLocalStore("products", defaultProducts);

const ProductsContext = createContext(null);

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductsProvider({ children }) {
  const products = productsStore.useValue();

  function getProduct(id) {
    return products.find((p) => p.id === id);
  }

  function addProduct(data) {
    const base = slugify(data.name) || "product";
    let id = base;
    for (let n = 2; products.some((p) => p.id === id); n++) id = `${base}-${n}`;
    productsStore.set((prev) => [...prev, { ...data, id }]);
    return id;
  }

  function updateProduct(id, data) {
    productsStore.set((prev) => prev.map((p) => (p.id === id ? { ...data, id } : p)));
  }

  function deleteProduct(id) {
    productsStore.set((prev) => prev.filter((p) => p.id !== id));
  }

  function resetProducts() {
    productsStore.reset();
  }

  return (
    <ProductsContext.Provider
      value={{ products, getProduct, addProduct, updateProduct, deleteProduct, resetProducts }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used inside ProductsProvider");
  return context;
}
