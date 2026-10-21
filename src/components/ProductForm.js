"use client";

import { useState } from "react";
import { categories } from "@/data/products";
import ProductImage from "./ProductImage";

const emptyProduct = {
  name: "",
  price: "",
  category: categories[1],
  emoji: "📦",
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
    <form onSubmit={handleSubmit} className="panel">
      <h2 className="text-xl">{product ? `Edit: ${product.name}` : "Add New Product"}</h2>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_200px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="field-label">Product Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="field-input"
            />
          </label>
          <label>
            <span className="field-label">Price (Rs.)</span>
            <input
              required
              type="number"
              min="1"
              step="1"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="field-input"
            />
          </label>
          <label>
            <span className="field-label">Stock</span>
            <input
              required
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              className="field-input"
            />
          </label>
          <label>
            <span className="field-label">Category</span>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="field-input"
            >
              {categories
                .filter((c) => c !== "All")
                .map((c) => (
                  <option key={c}>{c}</option>
                ))}
            </select>
          </label>
          <label>
            <span className="field-label">Rating (0–5)</span>
            <input
              required
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={(e) => update("rating", e.target.value)}
              className="field-input"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Emoji (image)</span>
            <input
              value={form.emoji}
              onChange={(e) => update("emoji", e.target.value)}
              className="field-input"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Description</span>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="field-input"
            />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            <span className="field-label">Show on home page (featured)</span>
          </label>
        </div>

        <div>
          <p className="field-label">Preview</p>
          <div className="mt-1.5 overflow-hidden rounded-card border border-grey-200">
            <ProductImage product={{ ...form, name: form.name || "Preview" }} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="submit" className="btn btn-primary">
          {product ? "Save Changes" : "Add Product"}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}
