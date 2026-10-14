"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice } from "@/data/products";
import ProductForm from "./ProductForm";

export default function AdminDashboard() {
  const { isAdmin, hydrated } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts();
  // null = no form, "new" = adding, otherwise the product being edited
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  if (!hydrated) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-gray-500">Loading...</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-2xl font-bold">Admin access only</h1>
        <p className="mt-2 text-gray-500">Please login with the admin account to manage products.</p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Login
        </Link>
      </div>
    );
  }

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your store&apos;s product listings</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:border-red-500 hover:text-red-600"
          >
            Reset to Default
          </button>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Products", value: products.length },
          { label: "Items in Stock", value: totalStock },
          { label: "Out of Stock", value: outOfStock },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {message && (
        <p role="status" className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
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

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xl ${p.color}`}
                    >
                      {p.emoji}
                    </span>
                    <Link href={`/products/${p.id}`} className="font-medium hover:text-indigo-600">
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.category}</td>
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
                    className="mr-3 font-medium text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-10 text-center text-gray-500">No products. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
