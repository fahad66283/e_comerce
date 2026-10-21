"use client";

import Link from "next/link";
import { useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { useSettings } from "@/context/SettingsContext";
import { collectImageIds, deleteImages } from "@/lib/imageStore";
import { matchesSearch } from "@/lib/search";
import { formatPrice } from "@/data/products";
import ProductForm from "./ProductForm";
import ProductImage from "./ProductImage";

const makeFilters = (lowStock) => [
  { key: "all", label: "All", test: () => true },
  { key: "low", label: "Low stock", test: (p) => p.stock > 0 && p.stock <= lowStock },
  { key: "out", label: "Out of stock", test: (p) => p.stock < 1 },
  { key: "featured", label: "Featured", test: (p) => p.featured },
  { key: "new", label: "New", test: (p) => p.isNew },
  { key: "sale", label: "On sale", test: (p) => p.compareAt > p.price },
];

// Small on/off switch used for the Featured and New flags.
function Toggle({ on, label, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-brand-500" : "bg-grey-200"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

// Products tab of the dashboard: add, edit, delete and reset listings.
export default function ProductManager() {
  const { products, categories, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts();
  const { settings } = useSettings();
  const lowStock = settings.inventory.lowStock;
  const filters = makeFilters(lowStock);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
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
    deleteImages(product.images ?? []);
    if (editing?.id === product.id) setEditing(null);
    setMessage(`"${product.name}" was deleted.`);
  }

  function handleReset() {
    if (!confirm("Reset all products to the original list? Your changes will be lost.")) return;
    deleteImages([...collectImageIds(products)]);
    resetProducts();
    setEditing(null);
    setMessage("Products were reset to the original list.");
  }

  const activeFilter = filters.find((f) => f.key === filter);
  const shown = products.filter((p) => activeFilter.test(p) && matchesSearch(p, search));
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
          <button
            type="button"
            onClick={() => setEditing("new")}
            disabled={categories.length === 0}
            title={categories.length === 0 ? "Add a category first" : undefined}
            className="btn btn-primary btn-sm"
          >
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="w-full rounded-full border-[1.5px] border-grey-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink sm:w-64"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`pill !px-3.5 !py-1.5 !text-xs ${filter === f.key ? "pill-active" : ""}`}
            >
              {f.label} ({products.filter(f.test).length})
            </button>
          ))}
        </div>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-grey-200 bg-grey-50 text-grey-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium">New</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grey-200">
            {shown.map((p) => (
              <tr key={p.id} className="hover:bg-grey-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductImage product={p} size="xs" />
                    <Link href={`/products/${p.id}`} className="font-bold hover:text-brand-700">
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-grey-500">{p.category}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {formatPrice(p.price)}
                  {p.compareAt > p.price && (
                    <span className="ml-1.5 text-xs text-grey-400 line-through">{formatPrice(p.compareAt)}</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {p.stock < 1 ? (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-extrabold text-red-700">Out of stock</span>
                  ) : p.stock <= lowStock ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-800">
                      Low · {p.stock}
                    </span>
                  ) : (
                    p.stock
                  )}
                </td>
                <td className="px-4 py-3">
                  <Toggle on={p.featured} label={`Featured: ${p.name}`} onClick={() => updateProduct(p.id, { ...p, featured: !p.featured })} />
                </td>
                <td className="px-4 py-3">
                  <Toggle on={p.isNew} label={`New arrival: ${p.name}`} onClick={() => updateProduct(p.id, { ...p, isNew: !p.isNew })} />
                </td>
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
        {shown.length === 0 && (
          <p className="px-4 py-10 text-center text-grey-500">
            {products.length === 0 ? "No products. Add one to get started." : "No products match this filter."}
          </p>
        )}
      </div>
    </div>
  );
}
