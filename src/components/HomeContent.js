"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import CategoryTiles from "./CategoryTiles";
import FeaturedProducts from "./FeaturedProducts";
import Newsletter from "./Newsletter";
import { Inline } from "./RichText";

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="max-w-[600px]">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="section-title">{title}</h2>
      {text && <p className="section-sub">{text}</p>}
    </div>
  );
}

const promoStyles = [
  { card: "bg-ink text-white", title: "text-white", text: "text-grey-400", strong: "font-extrabold text-brand-500", button: "btn-primary" },
  { card: "bg-brand-500", title: "", text: "text-brand-900", strong: "font-extrabold", button: "btn-dark" },
];

export default function HomeContent() {
  const { home } = useSettings().settings;

  return (
    <>
      <section className="border-b border-grey-200 bg-brand-50">
        <div className="container-page grid items-center gap-12 py-12 lg:grid-cols-[1fr_0.95fr] lg:py-16">
          <div>
            {home.heroBadge && (
              <span className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-grey-200 bg-white px-[15px] py-[7px] text-[0.8rem] font-bold text-grey-700">
                {home.heroBadge}
              </span>
            )}
            <h1 className="text-[clamp(2rem,4.2vw,3.1rem)] font-black tracking-tight">
              {home.heroTitle} <span className="text-brand-600">{home.heroHighlight}</span>
            </h1>
            <p className="mt-4 max-w-[460px] text-[1.06rem] text-grey-700">{home.heroText}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-primary">
                {home.primaryButton}
              </Link>
              <Link href="#popular" className="btn btn-outline">
                {home.secondaryButton}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-[0.84rem] font-medium text-grey-700">
              {home.trustItems.map((item, i) => (
                <span key={i}>{item}</span>
              ))}
            </div>
          </div>
          <CategoryTiles />
        </div>
      </section>

      <section id="popular" className="container-page scroll-mt-24 py-16">
        <div className="mb-8">
          <SectionHeading eyebrow={home.popularEyebrow} title={home.popularTitle} text={home.popularText} />
        </div>
        <FeaturedProducts />
      </section>

      {home.promos.length > 0 && (
        <section className="container-page py-9">
          <div className="grid gap-5 md:grid-cols-2">
            {home.promos.map((promo, i) => {
              const style = promoStyles[i % promoStyles.length];
              return (
                <div key={i} className={`flex flex-col items-start gap-3 rounded-panel p-8 ${style.card}`}>
                  <h3 className={`text-[1.4rem] ${style.title}`}>{promo.title}</h3>
                  <p className={style.text}>
                    <Inline text={promo.text} strongClassName={style.strong} />
                  </p>
                  {promo.button && (
                    <Link href={promo.link || "/products"} className={`btn ${style.button}`}>
                      {promo.button}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="container-page py-16">
        <div className="mb-8">
          <SectionHeading eyebrow={home.newEyebrow} title={home.newTitle} />
        </div>
        <FeaturedProducts mode="new" limit={4} />
      </section>

      <section className="container-page py-9">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <SectionHeading eyebrow={home.saleEyebrow} title={home.saleTitle} />
          <Link href="/products?filter=sale" className="text-sm font-extrabold text-brand-700 hover:underline">
            View all deals →
          </Link>
        </div>
        <FeaturedProducts mode="sale" limit={4} />
      </section>

      {home.features.length > 0 && (
        <section className="container-page py-9">
          <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {home.features.map((f, i) => (
              <div key={i} className="rounded-card border border-grey-200 bg-grey-50 px-[18px] py-6 text-center">
                <div className="mb-2.5 text-[1.6rem]">{f.icon}</div>
                <h4 className="mb-1 text-[0.94rem]">{f.title}</h4>
                <p className="text-[0.83rem] text-grey-500">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-9">
        <Newsletter title={home.newsletterTitle} text={home.newsletterText} />
      </section>
    </>
  );
}
