import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getProduct, products } from "@/data/products";
import ProductImage from "@/components/ProductImage";
import ProductActions from "@/components/ProductActions";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  return { title: product ? `${product.name} – ShopEase` : "Product not found" };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

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
          <p className="mt-4 text-sm text-green-600">✓ In stock ({product.stock} available)</p>

          <ProductActions product={product} />

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
