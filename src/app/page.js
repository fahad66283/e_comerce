import Link from "next/link";
import CategoryTiles from "@/components/CategoryTiles";
import FeaturedProducts from "@/components/FeaturedProducts";
import Newsletter from "@/components/Newsletter";

const features = [
  { icon: "🚚", title: "Fast Delivery", text: "To every city within 2–5 working days" },
  { icon: "🔒", title: "Secure Shopping", text: "Your details are always protected" },
  { icon: "🔄", title: "Easy Returns", text: "Return or exchange within 7 days" },
  { icon: "🎧", title: "Friendly Support", text: "Our team is ready to help you" },
];

export default function Home() {
  return (
    <>
      <section className="border-b border-grey-200 bg-brand-50">
        <div className="container-page grid items-center gap-12 py-12 lg:grid-cols-[1fr_0.95fr] lg:py-16">
          <div>
            <span className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-grey-200 bg-white px-[15px] py-[7px] text-[0.8rem] font-bold text-grey-700">
              ✨ Everything you need in one place
            </span>
            <h1 className="text-[clamp(2rem,4.2vw,3.1rem)] font-black tracking-tight">
              Shop easier. <span className="text-brand-600">Delivered faster.</span>
            </h1>
            <p className="mt-4 max-w-[460px] text-[1.06rem] text-grey-700">
              From electronics and fashion to home goods and accessories — everything you need at
              HAK Store, delivered to your door.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-primary">
                Shop Now
              </Link>
              <Link href="#popular" className="btn btn-outline">
                Popular Picks
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-[0.84rem] font-medium text-grey-700">
              <span>🚚 Fast delivery</span>
              <span>💵 Cash on delivery</span>
              <span>🔄 7-day returns</span>
            </div>
          </div>

          <CategoryTiles />
        </div>
      </section>

      <section id="popular" className="container-page scroll-mt-24 py-16">
        <div className="mb-8 max-w-[600px]">
          <span className="eyebrow">Picked for you</span>
          <h2 className="section-title">Most popular this week</h2>
          <p className="section-sub">Hand-picked products from every category.</p>
        </div>
        <FeaturedProducts />
      </section>

      <section className="container-page py-9">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col items-start gap-3 rounded-panel bg-ink p-8 text-white">
            <h3 className="text-[1.4rem] text-white">Deals of the week</h3>
            <p className="text-grey-400">
              Discounts on selected products. New customers get 10% off with code{" "}
              <strong className="text-brand-500">WELCOME10</strong>.
            </p>
            <Link href="/products?filter=sale" className="btn btn-primary">
              Shop the Sale
            </Link>
          </div>
          <div className="flex flex-col items-start gap-3 rounded-panel bg-brand-500 p-8">
            <h3 className="text-[1.4rem]">Free Shipping</h3>
            <p className="text-brand-900">On all orders over Rs. 5,000, delivered to every city.</p>
            <Link href="/products" className="btn btn-dark">
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 max-w-[600px]">
          <span className="eyebrow">Just arrived</span>
          <h2 className="section-title">New at HAK Store</h2>
        </div>
        <FeaturedProducts mode="new" limit={4} />
      </section>

      <section className="container-page py-9">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-[600px]">
            <span className="eyebrow">On sale</span>
            <h2 className="section-title">Today&apos;s best deals</h2>
          </div>
          <Link href="/products?filter=sale" className="text-sm font-extrabold text-brand-700 hover:underline">
            View all deals →
          </Link>
        </div>
        <FeaturedProducts mode="sale" limit={4} />
      </section>

      <section className="container-page py-9">
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-card border border-grey-200 bg-grey-50 px-[18px] py-6 text-center">
              <div className="mb-2.5 text-[1.6rem]">{f.icon}</div>
              <h4 className="mb-1 text-[0.94rem]">{f.title}</h4>
              <p className="text-[0.83rem] text-grey-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-9">
        <Newsletter />
      </section>
    </>
  );
}
