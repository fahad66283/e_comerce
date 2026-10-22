"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import { api } from "@/lib/api";

// Products and categories from MySQL. Admin changes go through the API, then the page data refreshes.
const ProductsContext = createContext(null);

export function ProductsProvider({ products, categories, children }) {
  const router = useRouter();

  const getProduct = (id) => products.find((p) => p.id === id);
  const getCategory = (name) => categories.find((c) => c.name === name);

  async function change(path, method, body) {
    const data = await api(path, { method, body });
    router.refresh();
    return data;
  }

  // Products: these throw an Error with a readable message if something fails.
  const addProduct = async (data) => (await change("/api/admin/products", "POST", data)).id;
  const updateProduct = (id, data) => change(`/api/admin/products/${encodeURIComponent(id)}`, "PUT", data);
  const setProductFlags = (id, flags) => change(`/api/admin/products/${encodeURIComponent(id)}`, "PATCH", flags);
  const deleteProduct = (id) => change(`/api/admin/products/${encodeURIComponent(id)}`, "DELETE");
  const resetProducts = () => change("/api/admin/products/reset", "POST");

  // Categories: these return { error } instead of throwing.
  async function safe(fn) {
    try {
      await fn();
      return {};
    } catch (err) {
      return { error: err.message };
    }
  }
  const addCategory = (data) => safe(() => change("/api/admin/categories", "POST", data));
  const updateCategory = (originalName, data) => safe(() => change("/api/admin/categories", "PUT", { ...data, originalName }));
  const deleteCategory = (name) => safe(() => change("/api/admin/categories", "DELETE", { name }));
  const resetCategories = () => safe(() => change("/api/admin/categories/reset", "POST"));

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        getProduct,
        getCategory,
        addProduct,
        updateProduct,
        setProductFlags,
        deleteProduct,
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
