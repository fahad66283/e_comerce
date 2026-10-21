"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatDate, useOrders } from "@/context/OrdersContext";
import { useReviews } from "@/context/ReviewsContext";
import { StarInput, Stars } from "./Stars";

export default function ProductReviews({ product }) {
  const { getReviews, getRating, addReview } = useReviews();
  const { user } = useAuth();
  const { getOrdersByEmail } = useOrders();
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false);

  const reviews = getReviews(product.id);
  const { average } = getRating(product);
  const breakdown = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }
    const form = new FormData(e.target);
    const email = user?.email ?? "";
    // "Verified buyer" when this account has an order containing the product.
    const verified =
      !!email && getOrdersByEmail(email).some((o) => o.items.some((i) => i.id === product.id));
    addReview({
      productId: product.id,
      name: (user?.name ?? form.get("name")).trim(),
      email,
      rating,
      comment: form.get("comment").trim(),
      verified,
    });
    e.target.reset();
    setRating(0);
    setError("");
    setThanks(true);
  }

  return (
    <section className="mt-16" id="reviews">
      <h2 className="section-title mb-6">Customer reviews</h2>
      <div className="grid items-start gap-8 lg:grid-cols-[320px_1fr]">
        <div className="grid gap-5">
          <div className="panel">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black">{average.toFixed(1)}</span>
              <div>
                <Stars value={average} size="text-lg" />
                <p className="text-sm text-grey-500">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
            <ul className="mt-4 grid gap-1.5">
              {breakdown.map(({ n, count }) => (
                <li key={n} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-grey-500">{n}★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-grey-100">
                    <span
                      className="block h-full rounded-full bg-amber-400"
                      style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="w-5 text-right text-grey-500">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="panel">
            <h3 className="text-[1.05rem]">Write a review</h3>
            <div className="mt-3">
              <StarInput value={rating} onChange={setRating} />
            </div>
            {!user && (
              <label className="mt-3 block">
                <span className="field-label">Your Name</span>
                <input required name="name" maxLength={60} className="field-input" />
              </label>
            )}
            <label className="mt-3 block">
              <span className="field-label">Your Review</span>
              <textarea required name="comment" rows={4} maxLength={1000} className="field-input" />
            </label>
            {error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
            {thanks && <p className="mt-2 text-sm font-bold text-brand-700">✓ Thanks for your review!</p>}
            <button type="submit" className="btn btn-primary mt-4 w-full">
              Submit Review
            </button>
          </form>
        </div>

        <div>
          {reviews.length === 0 ? (
            <p className="card p-6 text-center text-grey-500">No reviews yet. Be the first to review this product!</p>
          ) : (
            <ul className="grid gap-4">
              {reviews.map((r) => (
                <li key={r.id} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-black text-brand-700">
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-extrabold leading-tight">{r.name}</p>
                        {r.verified && <p className="text-xs font-bold text-brand-700">✓ Verified buyer</p>}
                      </div>
                    </div>
                    <span className="text-xs text-grey-500">{formatDate(r.createdAt)}</span>
                  </div>
                  <div className="mt-2">
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-grey-700">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
