import Link from "next/link";

export const metadata = {
  title: "About Us – ShopEase",
};

const values = [
  { icon: "⭐", title: "Quality First", text: "Every product is checked before it reaches you." },
  { icon: "💰", title: "Fair Prices", text: "Great products without the big price tag." },
  { icon: "🤝", title: "Customer Care", text: "Friendly support whenever you need help." },
  { icon: "🚚", title: "Fast Delivery", text: "Quick, reliable shipping across the country." },
];

const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "500+", label: "Products" },
  { value: "50+", label: "Cities Served" },
  { value: "4.8★", label: "Average Rating" },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold md:text-5xl">About ShopEase</h1>
          <p className="mt-4 text-lg text-indigo-100">
            Making online shopping simple, affordable and enjoyable for everyone.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Our Story</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            ShopEase started with a simple idea: everyone should be able to find quality products
            at fair prices without the hassle. What began as a small online shop has grown into a
            store offering electronics, fashion, home goods and accessories.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            We work directly with trusted suppliers to bring you the best deals, and we are
            committed to giving every customer a smooth experience from browsing to delivery.
          </p>
        </div>
        <div className="flex h-72 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-pink-500 text-9xl">
          🏬
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Why Choose Us</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-gray-50 p-6 text-center">
                <p className="text-4xl">{v.icon}</p>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-16 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-4xl font-extrabold text-indigo-600">{s.value}</p>
            <p className="mt-2 text-gray-600">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-8 text-center">
        <h2 className="text-2xl font-bold">Ready to start shopping?</h2>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/products"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
          >
            Browse Products
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium hover:border-indigo-600"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
