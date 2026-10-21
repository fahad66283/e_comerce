"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import OrderSummary from "@/components/OrderSummary";

const fields = [
  { name: "fullName", label: "Full Name", type: "text", autoComplete: "name" },
  { name: "phone", label: "Phone Number", type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { name: "address", label: "Full Address", type: "text", autoComplete: "street-address", wide: true },
];

const paymentOptions = [
  { value: "cod", icon: "💵", title: "Cash on Delivery", text: "Pay in cash when your order arrives" },
  { value: "card", icon: "💳", title: "Credit / Debit Card", text: "Coming soon", disabled: true },
];

export default function CheckoutPage() {
  const { items, loaded, clearCart } = useCart();
  const [orderId, setOrderId] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    // Static demo: no backend yet, so just generate an order number and clear the cart.
    setOrderId(`#HAK-${Date.now().toString().slice(-6)}`);
    clearCart();
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-[500px] px-6 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100">
          <svg viewBox="0 0 24 24" fill="none" className="h-[38px] w-[38px]" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="#3F8C2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="section-title">Your order has been received!</h1>
        <p className="mt-2.5 text-grey-500">
          Thank you for shopping at HAK Store. This is a demo store, so no real order was placed.
        </p>
        <div className="my-4 inline-block rounded-full border-[1.5px] border-grey-200 bg-grey-100 px-[22px] py-2.5 font-extrabold tracking-wide">
          {orderId}
        </div>
        <div>
          <Link href="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return <p className="container-page py-16 text-grey-500">Loading...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[500px] px-6 py-16 text-center">
        <h1 className="section-title">Your cart is empty</h1>
        <Link href="/products" className="btn btn-primary mt-6">
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-16">
      <div className="mb-8">
        <span className="eyebrow">Checkout</span>
        <h1 className="section-title">Shipping &amp; payment details</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid items-start gap-9 lg:grid-cols-[1fr_370px]">
        <div className="grid gap-5">
          <section className="panel">
            <h3 className="mb-4 text-[1.05rem]">Delivery Information</h3>
            <div className="grid gap-x-3.5 gap-y-4 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.name} className={f.wide ? "sm:col-span-2" : ""}>
                  <span className="field-label">{f.label}</span>
                  <input
                    required
                    name={f.name}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    className="field-input"
                  />
                </label>
              ))}
              <label className="sm:col-span-2">
                <span className="field-label">Order Notes (optional)</span>
                <textarea name="notes" rows={3} className="field-input" />
              </label>
            </div>
          </section>

          <section className="panel">
            <h3 className="mb-4 text-[1.05rem]">Payment Method</h3>
            <div className="grid gap-2.5">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3.5 rounded-field border-[1.5px] border-grey-200 px-[15px] py-[13px] transition has-[:checked]:border-ink has-[:checked]:bg-grey-50 ${
                    opt.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    defaultChecked={opt.value === "cod"}
                    disabled={opt.disabled}
                    className="accent-ink"
                  />
                  <span className="w-8 text-center text-xl">{opt.icon}</span>
                  <span>
                    <strong className="block text-[0.9rem]">{opt.title}</strong>
                    <span className="text-[0.76rem] text-grey-500">{opt.text}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <OrderSummary showItems>
          <button type="submit" className="btn btn-primary mt-[18px] w-full">
            Place Order
          </button>
        </OrderSummary>
      </form>
    </div>
  );
}
