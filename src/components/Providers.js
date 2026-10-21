"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CouponsProvider } from "@/context/CouponsContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { ReviewsProvider } from "@/context/ReviewsContext";
import { WishlistProvider } from "@/context/WishlistContext";

// All store state, in dependency order (the cart needs products and coupons, etc.).
export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CouponsProvider>
          <CartProvider>
            <WishlistProvider>
              <ReviewsProvider>
                <OrdersProvider>{children}</OrdersProvider>
              </ReviewsProvider>
            </WishlistProvider>
          </CartProvider>
        </CouponsProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
