"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useApiData } from "@/lib/api";
import { formatDate } from "@/lib/format";
import OrderItems from "./OrderItems";
import OrderTimeline from "./OrderTimeline";
import PaymentInfo from "./PaymentInfo";
import StatusBadge from "./StatusBadge";

export default function OrderConfirmation() {
  const params = useSearchParams();
  const id = params.get("id");
  const key = params.get("key") ?? "";
  const sessionId = params.get("session_id"); // back from paying on Stripe
  const { user } = useAuth();
  const { clearCart } = useCart();
  const query = `key=${encodeURIComponent(key)}${sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : ""}`;
  const { data, loading, reload } = useApiData(id ? `/api/orders/${encodeURIComponent(id)}?${query}` : null);
  const order = data?.order;
  const [checks, setChecks] = useState(0);

  const paidByCard = sessionId && order?.payment.method === "stripe";
  useEffect(() => {
    if (paidByCard && order.payment.status === "Paid") clearCart();
  }, [paidByCard, order?.payment.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stripe can take a few seconds to confirm: check again a few times.
  useEffect(() => {
    if (!paidByCard || order.payment.status !== "Pending" || order.status === "Cancelled" || checks >= 5) return;
    const timer = setTimeout(() => {
      setChecks((n) => n + 1);
      reload();
    }, 3000);
    return () => clearTimeout(timer);
  }, [paidByCard, order?.payment.status, order?.status, checks, reload]);

  if (id && loading) return <p className="container-page py-16 text-grey-500">Loading your order...</p>;

  if (!order) {
    return (
      <div className="mx-auto max-w-[500px] px-6 py-16 text-center">
        <p className="text-5xl">🔍</p>
        <h1 className="section-title mt-4">Order not found</h1>
        <p className="mt-2 text-grey-500">Check the link from your confirmation, or use Track Order with your order ID and email or phone.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/track-order" className="btn btn-primary">
            Track Order
          </Link>
          <Link href="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const { customer } = order;

  return (
    <div className="mx-auto max-w-[760px] px-6 py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100">
          <svg viewBox="0 0 24 24" fill="none" className="h-[38px] w-[38px]" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="#3F8C2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="section-title">Thank you, your order has been received!</h1>
        <p className="mt-2.5 text-grey-500">
          We&apos;ll start preparing it right away. It should arrive within 2–5 working days.
        </p>
        {paidByCard && (
          <p className={`mx-auto mt-4 max-w-md rounded-field px-4 py-3 text-sm font-bold ${order.payment.status === "Paid" ? "bg-brand-100 text-brand-700" : "bg-amber-50 text-amber-900"}`}>
            {order.payment.status === "Paid"
              ? "✓ Your card payment was successful."
              : checks >= 5
                ? "We haven't received the payment confirmation yet. It will update automatically – you can track this order any time."
                : "Confirming your card payment..."}
          </p>
        )}
        <div className="my-4 inline-block rounded-full border-[1.5px] border-grey-200 bg-grey-100 px-[22px] py-2.5 font-extrabold tracking-wide">
          #{order.id}
        </div>
      </div>

      <section className="panel mt-6">
        <h2 className="mb-5 text-[1.05rem]">Order Status</h2>
        <OrderTimeline order={order} />
        <p className="mt-5 text-center text-sm text-grey-500">
          Save your order ID <strong className="text-ink">#{order.id}</strong> to{" "}
          <Link href={`/track-order?id=${order.id}`} className="font-extrabold text-brand-700 hover:underline">
            track your order
          </Link>{" "}
          any time.
        </p>
      </section>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <section className="panel">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[1.05rem]">Order Details</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-grey-500">Placed on {formatDate(order.createdAt)}</p>
          <div className="mt-3">
            <OrderItems order={order} />
          </div>
        </section>

        <section className="panel h-fit text-[0.9rem]">
          <h2 className="mb-3 text-[1.05rem]">Delivery To</h2>
          <p className="font-bold">{customer.name}</p>
          <p className="text-grey-500">{customer.address}</p>
          <p className="text-grey-500">{customer.city}</p>
          <p className="mt-2 text-grey-500">📞 {customer.phone}</p>
          <p className="text-grey-500">✉️ {customer.email}</p>
          <h2 className="mb-1 mt-5 text-[1.05rem]">Payment</h2>
          <PaymentInfo order={order} />
        </section>
      </div>

      <p className="mt-6 text-center text-xs text-grey-500">
        Keep your order number for tracking. We&apos;ll contact you if anything is unclear.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
        {user ? (
          <Link href="/account" className="btn btn-outline">
            View My Orders
          </Link>
        ) : (
          <Link href="/signup?next=/account" className="btn btn-outline">
            Create an Account
          </Link>
        )}
      </div>
    </div>
  );
}
