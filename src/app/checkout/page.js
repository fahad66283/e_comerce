"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import OrderSummary from "@/components/OrderSummary";

const fields = [
  { name: "fullName", label: "Full Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone Number", type: "tel", autoComplete: "tel" },
  { name: "address", label: "Address", type: "text", autoComplete: "street-address", wide: true },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { name: "postalCode", label: "Postal Code", type: "text", autoComplete: "postal-code" },
];

export default function CheckoutPage() {
  const { items, loaded, clearCart } = useCart();
  const [payment, setPayment] = useState("cod");
  const [orderId, setOrderId] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    // Static demo: no backend yet, so just generate an order number and clear the cart.
    setOrderId(`ORD-${Date.now().toString().slice(-6)}`);
    clearCart();
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-6xl">🎉</p>
        <h1 className="mt-4 text-3xl font-bold">Thank you for your order!</h1>
        <p className="mt-2 text-gray-600">
          Your order number is <span className="font-semibold">{orderId}</span>.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          This is a demo store, so no real order was placed.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (!loaded) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-gray-500">Loading...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/products" className="mt-4 inline-block text-indigo-600 hover:underline">
          Go to Shop →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Shipping Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.name} className={f.wide ? "sm:col-span-2" : ""}>
                  <span className="text-sm font-medium text-gray-700">{f.label}</span>
                  <input
                    required
                    name={f.name}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Payment Method</h2>
            <div className="mt-4 space-y-3">
              {[
                { value: "cod", label: "💵 Cash on Delivery" },
                { value: "card", label: "💳 Credit / Debit Card (coming soon)", disabled: true },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 rounded-lg border p-4 ${
                    payment === opt.value ? "border-indigo-600 bg-indigo-50" : "border-gray-300"
                  } ${opt.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={payment === opt.value}
                    disabled={opt.disabled}
                    onChange={() => setPayment(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </section>
        </div>

        <OrderSummary>
          <ul className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
            {items.map(({ id, quantity, product }) => (
              <li key={id} className="flex justify-between gap-2">
                <span className="text-gray-600">
                  {product.name} × {quantity}
                </span>
                <span>{formatPrice(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700"
          >
            Place Order
          </button>
        </OrderSummary>
      </form>
    </div>
  );
}
