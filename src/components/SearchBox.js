"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice } from "@/data/products";
import { matchesSearch } from "@/lib/search";
import ProductImage from "./ProductImage";

// Header search with live product suggestions. Enter opens the shop page with ?q=...
export default function SearchBox({ className = "", onSearch }) {
  const router = useRouter();
  const { products } = useProducts();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = query.trim() ? products.filter((p) => matchesSearch(p, query)).slice(0, 5) : [];

  function done() {
    setOpen(false);
    setQuery("");
    onSearch?.();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    done();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
      className={`relative flex items-center gap-2 rounded-full border border-grey-200 bg-grey-50 px-4 py-2 transition-[width,border-color] focus-within:border-ink ${className}`}
    >
      <span aria-hidden="true">🔍</span>
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        placeholder="Search products..."
        aria-label="Search products"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open && query.trim() !== ""}
        autoComplete="off"
        className="w-full bg-transparent text-[0.88rem] outline-none"
      />
      {open && query.trim() && (
        <div
          id={listId}
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-card border border-grey-200 bg-white shadow-lift"
        >
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-grey-500">No products found for “{query.trim()}”</p>
          ) : (
            <ul>
              {suggestions.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    onClick={done}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-grey-50"
                  >
                    <ProductImage product={p} size="xs" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{p.name}</span>
                      <span className="text-xs text-grey-500">{p.category}</span>
                    </span>
                    <span className="text-sm font-extrabold">{formatPrice(p.price)}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="submit"
                  className="w-full border-t border-grey-200 px-4 py-2.5 text-left text-sm font-extrabold text-brand-700 hover:bg-grey-50"
                >
                  See all results for “{query.trim()}” →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
