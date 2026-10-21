"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { categories } from "@/data/products";
import { useProducts } from "@/context/ProductsContext";
import ProductCard from "./ProductCard";

const categoryIcons = { All: "🛍️", Electronics: "🎧", Fashion: "👕", Home: "🪴", Accessories: "👜" };

export default function ProductList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { products } = useProducts();
  const [sort, setSort] = useState("featured");

  // Category and search live in the URL so links and the header search box work.
  const param = searchParams.get("category");
  const category = categories.includes(param) ? param : "All";
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
      p.name.toLowerCase().includes(search.trim().toLowerCase())
  );
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

  return (
    <>
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 [scrollbar-width:none]">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => updateUrl({ category: c === "All" ? "" : c })}
            className={`pill ${category === c ? "pill-active" : ""}`}
          >
            <span aria-hidden="true">{categoryIcons[c]}</span>
            {c}
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
