"use client";

import Link from "next/link";
import { useReviews } from "@/context/ReviewsContext";
import ProductImage from "./ProductImage";
import AddToCartButton from "./AddToCartButton";
import Price from "./Price";
import { Stars } from "./Stars";
import WishlistButton from "./WishlistButton";

function Badge({ product }) {
  const base = "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold";
  if (product.stock < 1) return <span className={`${base} border-[1.5px] border-ink bg-white`}>Sold out</span>;
  if (product.compareAt > product.price) {
    return (
      <span className={`${base} bg-brand-500`}>
        -{Math.round((1 - product.price / product.compareAt) * 100)}%
      </span>
    );
  }
  if (product.isNew) return <span className={`${base} border-[1.5px] border-ink bg-white`}>New</span>;
  if (product.featured) return <span className={`${base} bg-brand-500`}>Popular</span>;
  return null;
}

export default function ProductCard({ product }) {
  const { getRating } = useReviews();
  const { average, count } = getRating(product);

  return (
    <article className="card relative flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <Link href={`/products/${product.id}`} aria-label={`View ${product.name}`}>
        <ProductImage product={product}>
          <Badge product={product} />
        </ProductImage>
      </Link>
      <WishlistButton
        product={product}
        className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white shadow-sm hover:scale-110"
      />
      <div className="flex flex-1 flex-col gap-1.5 p-[15px]">
        <span className="text-[0.7rem] font-extrabold uppercase tracking-wide text-brand-700">
          {product.category}
        </span>
        <h3 className="text-[0.98rem] font-extrabold">
          <Link href={`/products/${product.id}`} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 flex-1 text-[0.82rem] text-grey-500">{product.description}</p>
        <div className="flex items-center gap-1.5 text-[0.78rem] text-grey-500">
          <Stars value={average} size="text-[0.85rem]" />
          {average.toFixed(1)}
          {count > 0 && <span>({count})</span>}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <Price product={product} />
          <AddToCartButton product={product} variant="icon" />
        </div>
      </div>
    </article>
  );
}
