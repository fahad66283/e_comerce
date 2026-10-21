import { formatPrice } from "@/data/products";

// Price with the original price struck through when the product is on sale.
export default function Price({ product, size = "md" }) {
  const onSale = product.compareAt > product.price;
  const big = size === "lg";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={`font-extrabold ${big ? "text-[1.6rem]" : "text-[1.03rem]"}`}>{formatPrice(product.price)}</span>
      {onSale && (
        <>
          <span className={`text-grey-400 line-through ${big ? "text-base" : "text-[0.8rem]"}`}>
            {formatPrice(product.compareAt)}
          </span>
          {big && (
            <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-extrabold">
              Save {Math.round((1 - product.price / product.compareAt) * 100)}%
            </span>
          )}
        </>
      )}
    </span>
  );
}
