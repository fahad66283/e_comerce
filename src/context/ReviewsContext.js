"use client";

import { createContext, useContext } from "react";
import { createLocalStore } from "@/lib/localStore";

// Customer reviews: [{ id, productId, name, email, rating, comment, verified, createdAt }]
const reviewsStore = createLocalStore("reviews", []);

const ReviewsContext = createContext(null);

export function ReviewsProvider({ children }) {
  const reviews = reviewsStore.useValue();

  function getReviews(productId) {
    return reviews.filter((r) => r.productId === productId);
  }

  // The product's starting rating counts as one review, so a single new review
  // moves the average without completely replacing it.
  function getRating(product) {
    const list = getReviews(product.id);
    const total = list.reduce((sum, r) => sum + r.rating, Number(product.rating) || 0);
    const count = list.length + (product.rating ? 1 : 0);
    return { average: count ? total / count : 0, count: list.length };
  }

  function addReview(review) {
    const saved = {
      ...review,
      id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    reviewsStore.set((prev) => [saved, ...prev]);
  }

  function deleteReview(id) {
    reviewsStore.set((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <ReviewsContext.Provider value={{ reviews, getReviews, getRating, addReview, deleteReview }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error("useReviews must be used inside ReviewsProvider");
  return context;
}
