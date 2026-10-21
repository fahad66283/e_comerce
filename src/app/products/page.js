import { Suspense } from "react";
import ProductList from "@/components/ProductList";
import ListingHeading from "@/components/ListingHeading";

export const metadata = {
  title: "Shop – HAK Store",
};

export default function ProductsPage() {
  return (
    <div className="container-page py-16">
      <ListingHeading page="shop" />
      <Suspense fallback={<p className="text-grey-500">Loading products...</p>}>
        <ProductList />
      </Suspense>
    </div>
  );
}
