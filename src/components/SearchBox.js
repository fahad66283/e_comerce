"use client";

import { useRouter } from "next/navigation";

// Header search: sends the shopper to the shop page with ?q=...
export default function SearchBox({ className = "", onSearch }) {
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const q = new FormData(e.target).get("q").trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    onSearch?.();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 rounded-full border border-grey-200 bg-grey-50 px-4 py-2 transition-[width,border-color] focus-within:border-ink ${className}`}
    >
      <span aria-hidden="true">🔍</span>
      <input
        type="search"
        name="q"
        placeholder="Search products..."
        aria-label="Search products"
        className="w-full bg-transparent text-[0.88rem] outline-none"
      />
    </form>
  );
}
