import Link from "next/link";
import { categories, products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const features = [
  { icon: "🚚", title: "Free Shipping", text: "On orders over Rs. 5,000" },
  { icon: "🔒", title: "Secure Payment", text: "Your payment is protected" },
  { icon: "↩️", title: "Easy Returns", text: "7-day return policy" },
];

export default function Home() {
  const featured = products.filter((p) => p.featured);

  return (
    <>
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center md:flex-row md:text-left">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Shop the Best Deals of the Season
            </h1>
            <p className="mt-4 text-lg text-indigo-100">
              Electronics, fashion, home goods and more, all in one place.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-indigo-600 shadow hover:bg-indigo-50"
            >
              Shop Now →
            </Link>
          </div>
          <div className="flex-1 text-center text-9xl">🛍️</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
            <span className="text-3xl">{f.icon}</span>
            <div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="text-2xl font-bold">Shop by Category</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {categories
            .filter((c) => c !== "All")
            .map((c) => (
              <Link
                key={c}
                href={`/products?category=${c}`}
                className="rounded-full border border-gray-300 bg-white px-5 py-2 font-medium hover:border-indigo-600 hover:text-indigo-600"
              >
                {c}
              </Link>
            ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/products" className="font-medium text-indigo-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
