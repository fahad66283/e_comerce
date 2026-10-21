"use client";

import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { useReviews } from "@/context/ReviewsContext";
import { useSettings } from "@/context/SettingsContext";
import { whatsappLink } from "@/data/siteContent";
import { Inline } from "./RichText";
import { useHydrated } from "@/lib/localStore";
import ProductGallery from "./ProductGallery";
import ProductActions from "./ProductActions";
import ProductCard from "./ProductCard";
import Price from "./Price";
import ProductReviews from "./ProductReviews";
import { Stars } from "./Stars";
import WishlistButton from "./WishlistButton";

export default function ProductDetail({ id }) {
  const { products, getProduct } = useProducts();
  const hydrated = useHydrated();
  const { getRating } = useReviews();
  const { settings } = useSettings();
  const product = getProduct(id);

  if (!product) {
    // Products added by the admin only exist in the browser, so wait until it is readable.
    if (!hydrated) return <p className="container-page py-16 text-grey-500">Loading...</p>;
    return (
      <div className="mx-auto max-w-[500px] px-6 py-16 text-center">
        <p className="text-6xl">🤷</p>
        <h1 className="section-title mt-4">Product not found</h1>
        <p className="mt-2 text-grey-500">This product may have been removed.</p>
        <Link href="/products" className="btn btn-primary mt-8">
          Back to Shop
        </Link>
      </div>
    );
  }

  const { average, count } = getRating(product);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container-page py-12">
      <nav className="text-sm text-grey-500">
        <Link href="/" className="hover:text-ink">Home</Link> /{" "}
        <Link href="/products" className="hover:text-ink">Shop</Link> /{" "}
        <span className="font-bold text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid items-start gap-10 md:grid-cols-2">
        <ProductGallery product={product} />

        <div className="md:py-4">
          <span className="text-[0.75rem] font-extrabold uppercase tracking-wide text-brand-700">
            {product.category}
          </span>
          <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)]">{product.name}</h1>
          <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-grey-500 hover:text-ink">
            <Stars value={average} />
            {average.toFixed(1)} · {count} {count === 1 ? "review" : "reviews"}
          </a>
          <div className="mt-4">
            <Price product={product} size="lg" />
          </div>
          <p className="mt-4 text-grey-500">{product.description}</p>

          {product.stock > 0 ? (
            <>
              <p className="mt-4 text-sm font-bold text-brand-700">
                ✓ In stock ({product.stock} available)
              </p>
              <ProductActions product={product} />
            </>
          ) : (
            <p className="mt-4 font-bold text-red-600">Out of stock</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <WishlistButton product={product} withLabel className="btn btn-outline btn-sm" />
            {settings.contact.whatsapp && (
              <a
                href={whatsappLink(
                  settings.contact.whatsapp,
                  `Hi ${settings.general.storeName}! I'd like to order: ${product.name} (${product.id})`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm bg-[#25D366] text-white hover:bg-[#1ebe5b]"
              >
                Order on WhatsApp
              </a>
            )}
          </div>

          {settings.productPage.highlights.length > 0 && (
            <ul className="mt-8 grid gap-2 border-t border-grey-200 pt-6 text-sm text-grey-700">
              {settings.productPage.highlights.map((h, i) => (
                <li key={i}>
                  <Inline text={h} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ProductReviews product={product} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">You may also like</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(224px,1fr))] gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
