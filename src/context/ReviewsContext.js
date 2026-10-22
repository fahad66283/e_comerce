"use client";

import { createContext, useContext } from "react";

// Average ratings for every product (from MySQL). The reviews themselves load on each product page.
const ReviewsContext = createContext(null);

export function ReviewsProvider({ ratings, children }) {
  // The product's starting rating counts as one review, so a single new review
  // moves the average without completely replacing it.
  function getRating(product) {
    const stats = ratings[product.id] ?? { sum: 0, count: 0 };
    const base = Number(product.rating) || 0;
    const total = stats.sum + base;
    const count = stats.count + (base ? 1 : 0);
    return { average: count ? total / count : 0, count: stats.count };
  }

  return <ReviewsContext.Provider value={{ getRating }}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error("useReviews must be used inside ReviewsProvider");
  return context;
}
