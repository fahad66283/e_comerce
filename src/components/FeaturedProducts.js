"use client";

import { useProducts } from "@/context/ProductsContext";
import ProductCard from "./ProductCard";

// mode "featured": products marked featured; "new": the most recently added ones.
export default function FeaturedProducts({ mode = "featured", limit = 8 }) {
  const { products } = useProducts();
  const list =
    mode === "new"
      ? products.slice(-limit).reverse()
      : products.filter((p) => p.featured).slice(0, limit);

  if (list.length === 0) {
    return <p className="text-grey-500">No products to show yet.</p>;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(224px,1fr))] gap-5">
      {list.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
