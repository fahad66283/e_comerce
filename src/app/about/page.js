import Link from "next/link";

export const metadata = {
  title: "About Us – HAK Store",
};

const values = [
  { icon: "✅", title: "Trusted Quality", text: "We choose every product carefully before adding it to the store." },
  { icon: "🧭", title: "Wide Selection", text: "From electronics to fashion, everything in one place." },
  { icon: "💬", title: "Great Customer Service", text: "Our team is happy to help before and after you buy." },
];

const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "4", label: "Product Categories" },
  { value: "50+", label: "Cities Served" },
  { value: "4.7", label: "Customer Rating" },
  { value: "6 days", label: "Support Every Week" },
  { value: "7", label: "Days to Return" },
];

export default function AboutPage() {
  return (
    <div className="container-page py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="eyebrow">About Us</span>
          <h1 className="section-title">The HAK Store story</h1>
          <p className="mt-3.5 text-grey-700">
            HAK Store started with a simple idea: bring everything you need every day into one
            online place that combines quality with easy shopping. We work with trusted suppliers to
            offer a varied range of electronics, fashion, home goods and accessories, with delivery
            that reaches every city.
          </p>
          <div className="mt-6 grid gap-4">
            {values.map((v) => (
              <div key={v.title} className="flex items-start gap-3.5">
                <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-brand-100 text-[1.3rem]">
                  {v.icon}
                </span>
                <div>
                  <h4>{v.title}</h4>
                  <p className="text-[0.88rem] text-grey-500">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn btn-primary">
              Browse Products
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Contact Us
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-card border-[1.5px] border-grey-200 bg-white px-3.5 py-6 text-center">
              <div className="text-[1.7rem] font-black text-brand-600">{s.value}</div>
              <div className="mt-1 text-[0.76rem] font-semibold text-grey-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
