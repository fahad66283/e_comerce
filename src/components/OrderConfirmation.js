"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatDate, useOrders } from "@/context/OrdersContext";
import { useHydrated } from "@/lib/localStore";
import OrderItems from "./OrderItems";
import StatusBadge from "./StatusBadge";

export default function OrderConfirmation() {
  const id = useSearchParams().get("id");
  const { getOrder } = useOrders();
  const { user } = useAuth();
  const hydrated = useHydrated();
  const order = id ? getOrder(id) : null;

  if (!hydrated) return <p className="container-page py-16 text-grey-500">Loading...</p>;

  if (!order) {
    return (
      <div className="mx-auto max-w-[500px] px-6 py-16 text-center">
        <p className="text-5xl">🔍</p>
        <h1 className="section-title mt-4">Order not found</h1>
        <p className="mt-2 text-grey-500">We couldn&apos;t find this order on this device.</p>
        <Link href="/products" className="btn btn-primary mt-8">
          Continue Shopping
        </Link>
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
        <div className="my-4 inline-block rounded-full border-[1.5px] border-grey-200 bg-grey-100 px-[22px] py-2.5 font-extrabold tracking-wide">
          #{order.id}
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-[1.4fr_1fr]">
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
          <p className="text-grey-500">💵 {order.payment}</p>
        </section>
      </div>

      <p className="mt-6 text-center text-xs text-grey-500">
        This is a demo store, so no real order was placed and no payment was taken.
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
            Sign Up to Track Orders
          </Link>
        )}
      </div>
    </div>
  );
}
