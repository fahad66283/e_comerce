"use client";

import Link from "next/link";
import { useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice } from "@/data/products";
import ProductForm from "./ProductForm";

// Products tab of the dashboard: add, edit, delete and reset listings.
export default function ProductManager() {
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts();
  // null = no form, "new" = adding, otherwise the product being edited
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  function handleSave(data) {
    if (editing === "new") {
      addProduct(data);
      setMessage(`"${data.name}" was added.`);
    } else {
      updateProduct(editing.id, data);
      setMessage(`"${data.name}" was updated.`);
    }
    setEditing(null);
  }

  function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    deleteProduct(product.id);
    if (editing?.id === product.id) setEditing(null);
    setMessage(`"${product.name}" was deleted.`);
  }

  function handleReset() {
    if (!confirm("Reset all products to the original list? Your changes will be lost.")) return;
    resetProducts();
    setEditing(null);
    setMessage("Products were reset to the original list.");
  }

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStock = products.filter((p) => p.stock < 1).length;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl">Products</h2>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleReset} className="btn btn-outline btn-sm">
            Reset to Default
          </button>
          <button type="button" onClick={() => setEditing("new")} className="btn btn-primary btn-sm">
            + Add Product
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Products", value: products.length },
          { label: "Items in Stock", value: totalStock },
          { label: "Out of Stock", value: outOfStock },
        ].map((stat) => (
          <div key={stat.label} className="rounded-card border-[1.5px] border-grey-200 bg-white p-5">
            <p className="text-sm font-semibold text-grey-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-black text-brand-600">{stat.value}</p>
          </div>
        ))}
      </div>

      {message && (
        <p role="status" className="mt-6 rounded-field bg-brand-100 px-4 py-3 text-sm font-bold text-brand-700">
          {message}
        </p>
      )}

      {editing && (
        <div className="mt-6">
          <ProductForm
            key={editing === "new" ? "new" : editing.id}
            product={editing === "new" ? null : editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-grey-200 bg-grey-50 text-grey-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grey-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-grey-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xl">
                      {p.emoji}
                    </span>
                    <Link href={`/products/${p.id}`} className="font-bold hover:text-brand-700">
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-grey-500">{p.category}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className={`px-4 py-3 ${p.stock < 1 ? "font-medium text-red-600" : ""}`}>
                  {p.stock < 1 ? "Out of stock" : p.stock}
                </td>
                <td className="px-4 py-3">{p.featured ? "⭐ Yes" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(p);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="mr-3 font-bold text-ink hover:text-brand-700 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="font-bold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-10 text-center text-grey-500">No products. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
