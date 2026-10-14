"use client";

import { useState } from "react";
import { categories, colorOptions } from "@/data/products";
import ProductImage from "./ProductImage";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600";

const emptyProduct = {
  name: "",
  price: "",
  category: categories[1],
  emoji: "📦",
  color: colorOptions[0].value,
  rating: 4.5,
  stock: 10,
  featured: false,
  description: "",
};

export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(product ?? emptyProduct);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      name: form.name.trim(),
      emoji: form.emoji.trim() || "📦",
      description: form.description.trim(),
      price: Number(form.price),
      rating: Number(form.rating),
      stock: Number(form.stock),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">{product ? `Edit: ${product.name}` : "Add New Product"}</h2>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_200px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-gray-700">Product Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-gray-700">Price (Rs.)</span>
            <input
              required
              type="number"
              min="1"
              step="1"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-gray-700">Stock</span>
            <input
              required
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-gray-700">Category</span>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className={inputClass}
            >
              {categories
                .filter((c) => c !== "All")
                .map((c) => (
                  <option key={c}>{c}</option>
                ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium text-gray-700">Rating (0–5)</span>
            <input
              required
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={(e) => update("rating", e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-gray-700">Emoji (image)</span>
            <input
              value={form.emoji}
              onChange={(e) => update("emoji", e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <span className="text-sm font-medium text-gray-700">Background Color</span>
            <select
              value={form.color}
              onChange={(e) => update("color", e.target.value)}
              className={inputClass}
            >
              {colorOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium text-gray-700">Show on home page (featured)</span>
          </label>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700">Preview</p>
          <div className="mt-1">
            <ProductImage product={{ ...form, name: form.name || "Preview" }} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          {product ? "Save Changes" : "Add Product"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium hover:border-indigo-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
