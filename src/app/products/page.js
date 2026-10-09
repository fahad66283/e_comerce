import { Suspense } from "react";
import ProductList from "@/components/ProductList";

export const metadata = {
  title: "Shop – ShopEase",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">All Products</h1>
      <Suspense fallback={<p className="mt-6 text-gray-500">Loading products...</p>}>
        <ProductList />
      </Suspense>
    </div>
  );
}
