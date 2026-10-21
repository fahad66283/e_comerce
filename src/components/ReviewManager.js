"use client";

import Link from "next/link";
import { formatDate } from "@/context/OrdersContext";
import { useProducts } from "@/context/ProductsContext";
import { useReviews } from "@/context/ReviewsContext";
import { Stars } from "./Stars";

// Reviews tab: see all customer reviews and remove inappropriate ones.
export default function ReviewManager() {
  const { reviews, deleteReview } = useReviews();
  const { getProduct } = useProducts();
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl">Customer Reviews</h2>
        {reviews.length > 0 && (
          <p className="flex items-center gap-2 text-sm text-grey-500">
            <Stars value={average} /> {average.toFixed(1)} average from {reviews.length} reviews
          </p>
        )}
      </div>
      {reviews.length === 0 ? (
        <p className="card mt-6 p-8 text-center text-grey-500">No reviews yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {reviews.map((r) => {
            const product = getProduct(r.productId);
            return (
              <li key={r.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={r.rating} />
                    <span className="font-extrabold">{r.name}</span>
                    {r.verified && <span className="text-xs font-bold text-brand-700">✓ Verified buyer</span>}
                    <span className="text-xs text-grey-500">· {formatDate(r.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-grey-500">
                    on{" "}
                    {product ? (
                      <Link href={`/products/${product.id}#reviews`} className="font-bold text-ink hover:underline">
                        {product.emoji} {product.name}
                      </Link>
                    ) : (
                      "a deleted product"
                    )}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-grey-700">{r.comment}</p>
                </div>
                <button
                  type="button"
                  onClick={() => confirm("Delete this review?") && deleteReview(r.id)}
                  className="btn btn-outline btn-sm shrink-0"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
