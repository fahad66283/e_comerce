"use client";

import { useCart } from "@/context/CartContext";
import { FREE_SHIPPING_MIN, formatPrice, getShipping } from "@/data/products";

export default function OrderSummary({ children }) {
  const { subtotal } = useCart();
  const shipping = getShipping(subtotal);

  return (
    <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold">Order Summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Shipping</dt>
          <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-gray-500">
            Add {formatPrice(FREE_SHIPPING_MIN - subtotal)} more for free shipping.
          </p>
        )}
        <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold">
          <dt>Total</dt>
          <dd>{formatPrice(subtotal + shipping)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}
