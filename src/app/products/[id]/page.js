import { connection } from "next/server";
import { Suspense } from "react";
import { products } from "@/data/products";
import ProductDetail from "@/components/ProductDetail";
import { getProduct } from "@/lib/server/store/catalog";

// Sample ids for the build; every product (including ones added in the dashboard) renders on request.
export function generateStaticParams() {
  return products.slice(0, 1).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  await connection();
  const product = await getProduct(id).catch(() => null);
  return {
    title: product ? `${product.name} – HAK Store` : "Product – HAK Store",
    description: product?.description,
  };
}

// params are read inside <Suspense> so ids that weren't prerendered can stream in.
export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<p className="container-page py-16 text-grey-500">Loading...</p>}>
      {params.then(({ id }) => (
        <ProductDetail id={id} />
      ))}
    </Suspense>
  );
}
