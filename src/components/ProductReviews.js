"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useReviews } from "@/context/ReviewsContext";
import { api, useApiData } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { StarInput, Stars } from "./Stars";

export default function ProductReviews({ product }) {
  const { getRating } = useReviews();
  const { user } = useAuth();
  const router = useRouter();
  const { data, reload } = useApiData(`/api/reviews?product=${encodeURIComponent(product.id)}`);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false);
  const [busy, setBusy] = useState(false);

  const reviews = data?.reviews ?? [];
  const { average } = getRating(product);
  const breakdown = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }
    const formElement = e.target;
    const form = new FormData(formElement);
    setBusy(true);
    try {
      // The server marks the review "Verified buyer" when this account ordered the product.
      await api("/api/reviews", {
        method: "POST",
        body: { product: product.id, name: form.get("name") ?? "", rating, comment: form.get("comment") },
      });
      formElement.reset();
      setRating(0);
      setError("");
      setThanks(true);
      reload();
      router.refresh(); // update the average rating
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
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
            <button type="submit" disabled={busy} className="btn btn-primary mt-4 w-full">
              {busy ? "Sending..." : "Submit Review"}
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
