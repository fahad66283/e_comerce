"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice } from "@/data/products";
import { usePaymentMethods } from "@/context/SettingsContext";
import { PAYMENT_ICONS } from "@/data/siteContent";
import OrderSummary from "@/components/OrderSummary";

const fields = [
  { name: "fullName", label: "Full Name", type: "text", autoComplete: "name" },
  { name: "phone", label: "Phone Number", type: "tel", autoComplete: "tel", placeholder: "03XX XXXXXXX" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { name: "address", label: "Full Address", type: "text", autoComplete: "street-address", wide: true },
];

export default function CheckoutPage() {
  const { items, subtotal, discount, couponCode, shipping, total, loaded, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const { reduceStock } = useProducts();
  const router = useRouter();
  const [method, setMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const methods = usePaymentMethods();
  // Falls back to the first enabled method if the chosen one was switched off.
  const selected = methods.find((m) => m.id === method) ?? methods[0];
  const isManual = selected?.details.length > 0;

  function handleSubmit(e) {
    e.preventDefault();
    const tooMany = items.find(({ quantity, product }) => quantity > product.stock);
    if (tooMany) {
      setError(`Only ${tooMany.product.stock} × ${tooMany.product.name} left in stock. Please update your cart.`);
      return;
    }
    if (!selected) {
      setError("No payment method is available right now. Please contact us.");
      return;
    }
    const form = new FormData(e.target);
    // Static demo: the order is saved in this browser only, no money is taken.
    const id = placeOrder({
      items: items.map(({ id, quantity, product }) => ({
        id,
        quantity,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
        image: product.images?.[0] ?? null,
        category: product.category,
      })),
      subtotal,
      discount,
      couponCode: discount > 0 ? couponCode : null,
      shipping,
      total,
      notes: form.get("notes"),
      guest: !user,
      payment: {
        method: selected.id,
        title: selected.title,
        reference: isManual ? form.get("reference").trim() : null,
        status: "Pending",
      },
      customer: {
        name: form.get("fullName").trim(),
        phone: form.get("phone").trim(),
        email: form.get("email"),
        city: form.get("city").trim(),
        address: form.get("address").trim(),
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
          {!user && (
            <div className="flex flex-col gap-3 rounded-panel border-[1.5px] border-brand-500 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-extrabold">Checking out as a guest</p>
                <p className="text-sm text-grey-700">
                  No account needed. You can track your order with its order ID and your email or phone.
                </p>
              </div>
              <Link href="/login?next=/checkout" className="btn btn-outline btn-sm shrink-0">
                Login instead
              </Link>
            </div>
          )}

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
                    placeholder={f.placeholder}
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
              {[...methods, { id: "card", title: "Credit / Debit Card", text: "Coming soon", disabled: true }].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3.5 rounded-field border-[1.5px] border-grey-200 px-[15px] py-[13px] transition has-[:checked]:border-ink has-[:checked]:bg-grey-50 ${
                    opt.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={selected?.id === opt.id}
                    onChange={() => setMethod(opt.id)}
                    disabled={opt.disabled}
                    className="accent-ink"
                  />
                  <span className="w-8 text-center text-xl">{PAYMENT_ICONS[opt.id] ?? "💳"}</span>
                  <span>
                    <strong className="block text-[0.9rem]">{opt.title}</strong>
                    <span className="text-[0.76rem] text-grey-500">{opt.text}</span>
                  </span>
                </label>
              ))}
            </div>

            {isManual && (
              <div className="mt-4 rounded-field border border-grey-200 bg-grey-50 p-4">
                <p className="text-sm font-bold">
                  Send {formatPrice(total)} to the account below, then enter your transaction ID:
                </p>
                <dl className="mt-2 grid gap-1 text-sm">
                  {selected.details.map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="text-grey-500">{label}</dt>
                      <dd className="font-bold">{value}</dd>
                    </div>
                  ))}
                </dl>
                <label className="mt-3 block">
                  <span className="field-label">Transaction ID / Reference</span>
                  <input key={selected.id} required name="reference" minLength={4} className="field-input" />
                </label>
                <p className="mt-2 text-xs text-grey-500">
                  We&apos;ll confirm your payment and then ship your order.
                </p>
              </div>
            )}
          </section>
        </div>

        <OrderSummary showItems>
          {error && (
            <p role="alert" className="mt-3 rounded-field bg-red-500/15 px-3 py-2 text-sm font-bold text-red-300">
              {error}
            </p>
          )}
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
