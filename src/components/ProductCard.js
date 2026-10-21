import Link from "next/link";
import { formatPrice } from "@/data/products";
import ProductImage from "./ProductImage";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }) {
  const soldOut = product.stock < 1;
  return (
    <article className="card flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <Link href={`/products/${product.id}`} aria-label={`View ${product.name}`}>
        <ProductImage product={product}>
          {soldOut ? (
            <span className="absolute left-3 top-3 rounded-full border-[1.5px] border-ink bg-white px-2.5 py-1 text-[0.7rem] font-extrabold">
              Sold out
            </span>
          ) : (
            product.featured && (
              <span className="absolute left-3 top-3 rounded-full bg-brand-500 px-2.5 py-1 text-[0.7rem] font-extrabold">
                Popular
              </span>
            )
          )}
        </ProductImage>
      </Link>
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
        <div className="text-[0.78rem] text-grey-500">⭐ {Number(product.rating).toFixed(1)}</div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[1.03rem] font-extrabold">{formatPrice(product.price)}</span>
          <AddToCartButton product={product} variant="icon" />
        </div>
      </div>
    </article>
  );
}
