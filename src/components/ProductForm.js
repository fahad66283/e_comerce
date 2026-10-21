"use client";

import { useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { deleteImages } from "@/lib/imageStore";
import ImageUploader from "./ImageUploader";
import ProductImage from "./ProductImage";

const emptyProduct = {
  name: "",
  price: "",
  compareAt: "",
  category: "",
  emoji: "📦",
  rating: 4.5,
  stock: 10,
  featured: false,
  isNew: true,
  description: "",
  images: [],
};

export default function ProductForm({ product, onSave, onCancel }) {
  const { categories } = useProducts();
  const [form, setForm] = useState(
    product
      ? { ...emptyProduct, ...product, compareAt: product.compareAt ?? "" }
      : { ...emptyProduct, category: categories[0]?.name ?? "" }
  );
  const [error, setError] = useState("");
  // Images uploaded while this form is open, so unsaved ones can be removed on cancel.
  const [uploaded, setUploaded] = useState([]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const price = Number(form.price);
    const compareAt = form.compareAt === "" ? null : Number(form.compareAt);
    if (compareAt !== null && compareAt <= price) {
      setError("The original price must be higher than the sale price, or left empty.");
      return;
    }
    // Remove images that were taken out of the product (or uploaded then removed).
    const kept = new Set(form.images);
    deleteImages([...(product?.images ?? []), ...uploaded].filter((id) => !kept.has(id)));
    onSave({
      ...form,
      name: form.name.trim(),
      emoji: form.emoji.trim() || "📦",
      description: form.description.trim(),
      price,
      compareAt,
      rating: Number(form.rating),
      stock: Number(form.stock),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="panel">
      <h2 className="text-xl">{product ? `Edit: ${product.name}` : "Add New Product"}</h2>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_200px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImageUploader
              label="Product Photos (up to 5)"
              value={form.images}
              onChange={(images) => update("images", images)}
              onUploaded={(ids) => setUploaded((prev) => [...prev, ...ids])}
              max={5}
            />
          </div>
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
            <span className="field-label">Original Price (optional, for sales)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={form.compareAt}
              onChange={(e) => update("compareAt", e.target.value)}
              placeholder="e.g. 5999"
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
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Starting Rating (0–5)</span>
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
            <span className="field-label">Emoji (shown when there are no photos)</span>
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
            <span className="field-label">Featured (shown in “Most popular” on the home page)</span>
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => update("isNew", e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            <span className="field-label">New arrival (shown in “New at HAK Store” with a New badge)</span>
          </label>
          {error && <p className="text-sm font-bold text-red-600 sm:col-span-2">{error}</p>}
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
        <button
          type="button"
          onClick={() => {
            deleteImages(uploaded);
            onCancel();
          }}
          className="btn btn-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
