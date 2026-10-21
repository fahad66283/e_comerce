import { Suspense } from "react";
import ProductList from "@/components/ProductList";

export const metadata = {
  title: "Shop – HAK Store",
};

export default function ProductsPage() {
  return (
    <div className="container-page py-16">
      <div className="mb-8 max-w-[600px]">
        <span className="eyebrow">Shop</span>
        <h1 className="section-title">Browse all products</h1>
        <p className="section-sub">Use the filters below to find what you need quickly.</p>
      </div>
      <Suspense fallback={<p className="text-grey-500">Loading products...</p>}>
        <ProductList />
      </Suspense>
    </div>
  );
}
