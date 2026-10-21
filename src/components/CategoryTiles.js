"use client";

import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";

// Hero tiles on the home page: the first four categories plus two shortcuts.
export default function CategoryTiles() {
  const { categories } = useProducts();
  const tiles = [
    ...categories.slice(0, 4).map((c) => ({
      label: c.name,
      icon: c.icon,
      href: `/products?category=${encodeURIComponent(c.name)}`,
    })),
    { label: "On Sale", icon: "🏷️", href: "/products?filter=sale" },
    { label: "All Categories", icon: "🛍️", href: "/categories" },
  ];

  return (
    <div className="grid max-w-[460px] grid-cols-3 gap-3.5 lg:max-w-none">
      {tiles.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          className="flex flex-col items-center gap-2.5 rounded-card border-[1.5px] border-grey-200 bg-white px-2.5 py-5 text-center transition hover:-translate-y-[3px] hover:border-brand-500 hover:shadow-lift"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-[1.3rem]">
            {t.icon}
          </span>
          <span className="text-[0.82rem] font-extrabold">{t.label}</span>
        </Link>
      ))}
    </div>
  );
}
