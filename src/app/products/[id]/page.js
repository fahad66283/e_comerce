import { getProduct, products } from "@/data/products";
import ProductDetail from "@/components/ProductDetail";

// Default products are prerendered; products added by the admin render on demand.
export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  return { title: product ? `${product.name} – ShopEase` : "Product – ShopEase" };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
