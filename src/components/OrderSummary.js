"use client";

import { useCart } from "@/context/CartContext";
import { FREE_SHIPPING_MIN, formatPrice, getShipping } from "@/data/products";

export default function OrderSummary({ showItems = false, children }) {
  const { items, subtotal } = useCart();
  const shipping = getShipping(subtotal);

  return (
    <aside className="h-fit rounded-panel bg-ink p-[26px] text-white lg:sticky lg:top-24">
      <h3 className="mb-4 text-[1.05rem] text-white">Order Summary</h3>
      {showItems && (
        <ul className="mb-3 max-h-[210px] overflow-y-auto border-b border-[#2A2A2A] pb-3">
          {items.map(({ id, quantity, product }) => (
            <li key={id} className="flex justify-between gap-2 py-1 text-[0.84rem] text-[#B8BBB6]">
              <span>
                {product.name} × {quantity}
              </span>
              <span>{formatPrice(product.price * quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="text-[0.88rem] text-[#B8BBB6]">
        <div className="flex justify-between py-1.5">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between py-1.5">
          <dt>Shipping</dt>
          <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-grey-500">
            Add {formatPrice(FREE_SHIPPING_MIN - subtotal)} more for free shipping.
          </p>
        )}
        <div className="mt-1.5 flex justify-between border-t border-[#2A2A2A] pt-3.5 text-[1.12rem] font-extrabold text-white">
          <dt>Total</dt>
          <dd>{formatPrice(subtotal + shipping)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}
