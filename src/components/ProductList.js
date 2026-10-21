"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/context/ProductsContext";
import { useReviews } from "@/context/ReviewsContext";
import { matchesSearch } from "@/lib/search";
import ProductCard from "./ProductCard";

export default function ProductList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { products, categories } = useProducts();
  const { getRating } = useReviews();
  const pills = [{ name: "All", icon: "🛍️" }, ...categories];
  const [sort, setSort] = useState("featured");

  // Category and search live in the URL so links and the header search box work.
  const param = searchParams.get("category");
  const category = categories.some((c) => c.name === param) ? param : "All";
  const filter = searchParams.get("filter"); // "sale" | "new"
  const search = searchParams.get("q") ?? "";

  function updateUrl(changes) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  let list = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (filter !== "sale" || p.compareAt > p.price) &&
      (filter !== "new" || p.isNew) &&
      matchesSearch(p, search)
  );
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "rating") list = [...list].sort((a, b) => getRating(b).average - getRating(a).average);

  return (
    <>
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 [scrollbar-width:none]">
        {pills.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => updateUrl({ category: c.name === "All" ? "" : c.name })}
            className={`pill ${category === c.name ? "pill-active" : ""}`}
          >
            <span aria-hidden="true">{c.icon}</span>
            {c.name}
          </button>
        ))}
        {[
          { key: "sale", label: "On Sale", icon: "🏷️" },
          { key: "new", label: "New Arrivals", icon: "✨" },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => updateUrl({ filter: filter === f.key ? "" : f.key })}
            className={`pill ${filter === f.key ? "pill-active" : ""}`}
          >
            <span aria-hidden="true">{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-[22px] mt-[18px] flex flex-wrap items-center justify-between gap-3">
        <span className="text-[0.88rem] text-grey-500">{list.length} products found</span>
        <div className="flex flex-wrap gap-2.5">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => updateUrl({ q: e.target.value })}
            aria-label="Search products"
            className="w-full rounded-full border-[1.5px] border-grey-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink sm:w-56"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border-[1.5px] border-grey-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink"
            aria-label="Sort products"
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {list.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(224px,1fr))] gap-5">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-grey-500">
          No products match your search. Try another word or category.
        </p>
      )}
    </>
  );
}
