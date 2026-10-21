"use client";

import Link from "next/link";
import { categoryInfo } from "@/data/products";
import { useProducts } from "@/context/ProductsContext";
import ProductCard from "./ProductCard";

export default function CategoryList() {
  const { products } = useProducts();
  const names = Object.keys(categoryInfo);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {names.map((name) => {
          const items = products.filter((p) => p.category === name);
          return (
            <Link
              key={name}
              href={`/products?category=${name}`}
              className="group flex flex-col rounded-panel border-[1.5px] border-grey-200 bg-white p-6 transition hover:-translate-y-[3px] hover:border-brand-500 hover:shadow-lift"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-[1.6rem]">
                {categoryInfo[name].icon}
              </span>
              <h2 className="mt-4 text-lg">{name}</h2>
              <p className="mt-1 flex-1 text-sm text-grey-500">{categoryInfo[name].description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-brand-700">
                  {items.length} {items.length === 1 ? "product" : "products"}
                </span>
                <span className="text-lg text-grey-400 transition group-hover:translate-x-1 group-hover:text-ink" aria-hidden="true">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {names.map((name) => {
        const items = products.filter((p) => p.category === name).slice(0, 4);
        if (items.length === 0) return null;
        return (
          <section key={name} className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-3">
              <h2 className="section-title">
                {categoryInfo[name].icon} {name}
              </h2>
              <Link href={`/products?category=${name}`} className="text-sm font-extrabold text-brand-700 hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(224px,1fr))] gap-5">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
