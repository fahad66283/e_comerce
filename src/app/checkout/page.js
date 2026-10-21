"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useProducts } from "@/context/ProductsContext";
import { getShipping } from "@/data/products";
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
  const { items, subtotal, loaded, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const { reduceStock } = useProducts();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const shipping = getShipping(subtotal);
    // Static demo: the order is saved in this browser only, no payment is taken.
    const id = placeOrder({
      items: items.map(({ id, quantity, product }) => ({
        id,
        quantity,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
      })),
      subtotal,
      shipping,
      total: subtotal + shipping,
      payment: "Cash on Delivery",
      notes: form.get("notes"),
      customer: {
        name: form.get("fullName"),
        phone: form.get("phone"),
        email: form.get("email"),
        city: form.get("city"),
        address: form.get("address"),
      },
    });
    reduceStock(items);
    setPlacing(true);
    clearCart();
    router.push(`/order-confirmation?id=${id}`);
  }

  if (placing) {
    return <p className="container-page py-16 text-grey-500">Placing your order...</p>;
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
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[1.05rem]">Delivery Information</h3>
              {!user && (
                <p className="text-sm text-grey-500">
                  Have an account?{" "}
                  <Link href="/login?next=/checkout" className="font-extrabold text-brand-700 hover:underline">
                    Login
                  </Link>{" "}
                  to track your order.
                </p>
              )}
            </div>
            <div className="grid gap-x-3.5 gap-y-4 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.name} className={f.wide ? "sm:col-span-2" : ""}>
                  <span className="field-label">{f.label}</span>
                  <input
                    required
                    name={f.name}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    defaultValue={f.name === "fullName" ? user?.name : f.name === "email" ? user?.email : undefined}
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
          <p className="mt-3 text-center text-xs text-grey-400">
            By placing your order you agree to our{" "}
            <Link href="/terms" className="underline hover:text-white">Terms</Link> and{" "}
            <Link href="/return-policy" className="underline hover:text-white">Return Policy</Link>.
          </p>
        </OrderSummary>
      </form>
    </div>
  );
}
