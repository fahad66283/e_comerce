import { Suspense } from "react";
import { getProduct, products } from "@/data/products";
import ProductDetail from "@/components/ProductDetail";

// Default products are prerendered; products added by the admin render on demand.
export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  return { title: product ? `${product.name} – HAK Store` : "Product – HAK Store" };
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
