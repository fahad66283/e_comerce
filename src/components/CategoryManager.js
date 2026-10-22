"use client";

import { useState } from "react";
import { useProducts } from "@/context/ProductsContext";

const empty = { name: "", icon: "🛍️", description: "" };

// Categories tab: add, rename, edit and delete categories.
export default function CategoryManager() {
  const { categories, products, addCategory, updateCategory, deleteCategory, resetCategories } = useProducts();
  const [editing, setEditing] = useState(null); // null | "new" | category
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState({ text: "", error: false });

  function open(target) {
    setEditing(target);
    setForm(target === "new" ? empty : target);
    setMessage({ text: "", error: false });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = { name: form.name.trim(), icon: form.icon.trim() || "🛍️", description: form.description.trim() };
    const result = editing === "new" ? await addCategory(data) : await updateCategory(editing.name, data);
    if (result.error) {
      setMessage({ text: result.error, error: true });
      return;
    }
    setMessage({ text: `Category "${data.name}" was ${editing === "new" ? "added" : "updated"}.`, error: false });
    setEditing(null);
  }

  async function handleDelete(category) {
    if (!confirm(`Delete the "${category.name}" category?`)) return;
    const result = await deleteCategory(category.name);
    setMessage(result.error ? { text: result.error, error: true } : { text: `"${category.name}" was deleted.`, error: false });
  }

  async function handleReset() {
    if (!confirm("Restore the original categories? Extra categories without products are removed.")) return;
    const result = await resetCategories();
    setEditing(null);
    setMessage(result.error ? { text: result.error, error: true } : { text: "Categories were reset.", error: false });
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl">Categories</h2>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleReset} className="btn btn-outline btn-sm">
            Reset to Default
          </button>
          <button type="button" onClick={() => open("new")} className="btn btn-primary btn-sm">
            + Add Category
          </button>
        </div>
      </div>

      {message.text && (
        <p
          role="status"
          className={`mt-6 rounded-field px-4 py-3 text-sm font-bold ${
            message.error ? "bg-red-50 text-red-700" : "bg-brand-100 text-brand-700"
          }`}
        >
          {message.text}
        </p>
      )}

      {editing && (
        <form onSubmit={handleSubmit} className="panel mt-6 grid gap-4 sm:grid-cols-[120px_1fr]">
          <h3 className="text-lg sm:col-span-2">{editing === "new" ? "Add Category" : `Edit: ${editing.name}`}</h3>
          <label>
            <span className="field-label">Icon (emoji)</span>
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="field-input text-center text-xl"
            />
          </label>
          <label>
            <span className="field-label">Name</span>
            <input
              required
              maxLength={40}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="field-input"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Description</span>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="field-input"
            />
          </label>
          {editing !== "new" && (
            <p className="text-xs text-grey-500 sm:col-span-2">
              Renaming a category also moves all of its products to the new name.
            </p>
          )}
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="btn btn-primary">
              {editing === "new" ? "Add Category" : "Save Changes"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const count = products.filter((p) => p.category === c.name).length;
          return (
            <div key={c.name} className="card flex flex-col p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">{c.icon}</span>
                <div>
                  <p className="font-extrabold">{c.name}</p>
                  <p className="text-sm text-grey-500">
                    {count} {count === 1 ? "product" : "products"}
                  </p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm text-grey-500">{c.description || "No description."}</p>
              <div className="mt-4 flex gap-4 text-sm">
                <button type="button" onClick={() => open(c)} className="font-bold hover:text-brand-700 hover:underline">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(c)} className="font-bold text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {categories.length === 0 && <p className="card mt-6 p-8 text-center text-grey-500">No categories yet.</p>}
    </div>
  );
}
