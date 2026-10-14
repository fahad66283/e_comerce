"use client";

import { useProducts } from "@/context/ProductsContext";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const { products } = useProducts();
  const featured = products.filter((p) => p.featured);

  if (featured.length === 0) {
    return <p className="mt-6 text-gray-500">No featured products yet.</p>;
  }

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
