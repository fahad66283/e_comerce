import Link from "next/link";
import { formatPrice } from "@/data/products";
import ProductImage from "./ProductImage";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.id}`}>
        <div className="transition group-hover:scale-[1.02]">
          <ProductImage product={product} />
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-500">
          {product.category}
        </p>
        <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-indigo-600">
          {product.name}
        </h3>
      </Link>
      <div className="mt-1 text-sm text-amber-500">★ {product.rating}</div>
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
        <AddToCartButton productId={product.id} className="text-sm" />
      </div>
    </div>
  );
}
