"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/data/products";

function CouponBox() {
  const { couponCode, couponError, discount, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  async function handleApply() {
    if (!code.trim()) return;
    setBusy(true);
    const result = await applyCoupon(code);
    setBusy(false);
    setError(result.error ?? "");
    if (!result.error) setCode("");
  }

  if (couponCode) {
    return (
      <div className="mb-3 rounded-field border border-[#2A2A2A] p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span>
            🏷️ <strong className="text-brand-500">{couponCode}</strong>{" "}
            {discount > 0 && <span className="text-[#B8BBB6]">applied</span>}
          </span>
          <button type="button" onClick={removeCoupon} className="text-xs font-bold text-grey-400 hover:text-white">
            Remove
          </button>
        </div>
        {couponError && <p className="mt-1 text-xs text-amber-400">{couponError}</p>}
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="Coupon code"
          aria-label="Coupon code"
          className="min-w-0 flex-1 rounded-full border-[1.5px] border-[#333] bg-[#161616] px-4 py-2 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-grey-500 focus:border-brand-500"
        />
        <button type="button" onClick={handleApply} disabled={busy} className="btn btn-primary btn-sm">
          {busy ? "..." : "Apply"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-amber-400">{error}</p>}
    </div>
  );
}

export default function OrderSummary({ showItems = false, children }) {
  const { items, subtotal, discount, shipping, total } = useCart();
  const { freeShippingMin } = useSettings().settings.shipping;

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
      <CouponBox />
      <dl className="text-[0.88rem] text-[#B8BBB6]">
        <div className="flex justify-between py-1.5">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between py-1.5 text-brand-500">
            <dt>Discount</dt>
            <dd>−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between py-1.5">
          <dt>Shipping</dt>
          <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        {shipping > 0 && freeShippingMin > 0 && (
          <p className="text-xs text-grey-500">
            Add {formatPrice(freeShippingMin - (subtotal - discount))} more for free shipping.
          </p>
        )}
        <div className="mt-1.5 flex justify-between border-t border-[#2A2A2A] pt-3.5 text-[1.12rem] font-extrabold text-white">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}
