"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { ReviewsProvider } from "@/context/ReviewsContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { WishlistProvider } from "@/context/WishlistContext";

// Hands the data loaded from MySQL (see src/lib/server/storeData.js) to the whole site.
export default function Providers({ data, children }) {
  return (
    <SettingsProvider saved={data.settings} stripe={data.stripe}>
      <AuthProvider user={data.user} admin={data.admin}>
        <ProductsProvider products={data.products} categories={data.categories}>
          <CartProvider>
            <WishlistProvider serverIds={data.wishlist}>
              <ReviewsProvider ratings={data.ratings}>{children}</ReviewsProvider>
            </WishlistProvider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
