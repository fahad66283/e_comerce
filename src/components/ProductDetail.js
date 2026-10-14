"use client";

import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { useHydrated } from "@/lib/localStore";
import { formatPrice } from "@/data/products";
import ProductImage from "./ProductImage";
import ProductActions from "./ProductActions";
import ProductCard from "./ProductCard";

export default function ProductDetail({ id }) {
  const { products, getProduct } = useProducts();
  const hydrated = useHydrated();
  const product = getProduct(id);

  if (!product) {
    // Products added by the admin only exist in the browser, so wait until it is readable.
    if (!hydrated) return <p className="mx-auto max-w-6xl px-4 py-10 text-gray-500">Loading...</p>;
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-6xl">🤷</p>
        <h1 className="mt-4 text-3xl font-bold">Product not found</h1>
        <p className="mt-2 text-gray-500">This product may have been removed.</p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:text-indigo-600">Home</Link> /{" "}
        <Link href="/products" className="hover:text-indigo-600">Shop</Link> /{" "}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <ProductImage product={product} size="lg" />

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-amber-500">★ {product.rating} / 5</p>
          <p className="mt-4 text-3xl font-bold">{formatPrice(product.price)}</p>
          <p className="mt-6 leading-relaxed text-gray-600">{product.description}</p>

          {product.stock > 0 ? (
            <>
              <p className="mt-4 text-sm text-green-600">✓ In stock ({product.stock} available)</p>
              <ProductActions product={product} />
            </>
          ) : (
            <p className="mt-4 font-medium text-red-600">Out of stock</p>
          )}

          <ul className="mt-8 space-y-2 border-t border-gray-200 pt-6 text-sm text-gray-600">
            <li>🚚 Free shipping on orders over Rs. 5,000</li>
            <li>↩️ 7-day easy returns</li>
            <li>💵 Cash on delivery available</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">You may also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
