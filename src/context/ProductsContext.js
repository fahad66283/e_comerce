"use client";

import { createContext, useContext } from "react";
import { defaultCategories, products as defaultProducts } from "@/data/products";
import { createLocalStore } from "@/lib/localStore";

// Listings and categories start from the static catalog. Admin changes are saved in
// this browser's localStorage until a real backend/database is added.
const productsStore = createLocalStore("products", defaultProducts);
const categoriesStore = createLocalStore("categories", defaultCategories);

export const LOW_STOCK = 5;

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
  const categories = categoriesStore.useValue();

  function getProduct(id) {
    return products.find((p) => p.id === id);
  }

  function getCategory(name) {
    return categories.find((c) => c.name === name);
  }

  // ---- Products ----
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

  // Called when an order is placed: [{ id, quantity }]
  function reduceStock(items) {
    productsStore.set((prev) =>
      prev.map((p) => {
        const item = items.find((i) => i.id === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
      })
    );
  }

  function resetProducts() {
    productsStore.reset();
  }

  // ---- Categories ----
  function addCategory(data) {
    if (categories.some((c) => c.name.toLowerCase() === data.name.toLowerCase())) {
      return { error: `A category called "${data.name}" already exists.` };
    }
    categoriesStore.set((prev) => [...prev, data]);
    return {};
  }

  // Renaming a category also moves its products to the new name.
  function updateCategory(oldName, data) {
    const clash = categories.some(
      (c) => c.name !== oldName && c.name.toLowerCase() === data.name.toLowerCase()
    );
    if (clash) return { error: `A category called "${data.name}" already exists.` };
    categoriesStore.set((prev) => prev.map((c) => (c.name === oldName ? data : c)));
    if (data.name !== oldName) {
      productsStore.set((prev) =>
        prev.map((p) => (p.category === oldName ? { ...p, category: data.name } : p))
      );
    }
    return {};
  }

  function deleteCategory(name) {
    const count = products.filter((p) => p.category === name).length;
    if (count > 0) {
      return { error: `"${name}" still has ${count} product(s). Move or delete them first.` };
    }
    categoriesStore.set((prev) => prev.filter((c) => c.name !== name));
    return {};
  }

  function resetCategories() {
    categoriesStore.reset();
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        getProduct,
        getCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        reduceStock,
        resetProducts,
        addCategory,
        updateCategory,
        deleteCategory,
        resetCategories,
      }}
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
