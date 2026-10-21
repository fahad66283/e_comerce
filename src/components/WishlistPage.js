"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useHydrated } from "@/lib/localStore";
import ProductCard from "./ProductCard";

export default function WishlistPage() {
  const { items } = useWishlist();
  const hydrated = useHydrated();

  return (
    <div className="container-page py-16">
      <div className="mb-8 max-w-[600px]">
        <span className="eyebrow">Wishlist</span>
        <h1 className="section-title">Your saved products</h1>
        <p className="section-sub">Tap the ♡ on any product to save it here for later.</p>
      </div>
      {!hydrated ? (
        <p className="text-grey-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="panel mx-auto max-w-md text-center">
          <p className="text-5xl text-grey-400">♡</p>
          <p className="mt-3 font-bold">Your wishlist is empty.</p>
          <Link href="/products" className="btn btn-primary mt-5">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(224px,1fr))] gap-5">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
