"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatDate, useOrders } from "@/context/OrdersContext";
import { formatPrice } from "@/data/products";
import OrderItems from "./OrderItems";
import OrderTimeline from "./OrderTimeline";
import PaymentInfo from "./PaymentInfo";
import StatusBadge from "./StatusBadge";

export default function TrackOrder() {
  const initialId = useSearchParams().get("id") ?? "";
  const { findOrderForTracking } = useOrders();
  const { user } = useAuth();
  const [lookup, setLookup] = useState(null);
  const [error, setError] = useState("");

  // Re-read the order on every render so status changes show up straight away.
  const order = lookup ? findOrderForTracking(lookup.id, lookup.contact) : null;

  function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const id = form.get("id").trim().replace(/^#/, "");
    const contact = form.get("contact").trim();
    if (findOrderForTracking(id, contact)) {
      setLookup({ id, contact });
      setError("");
    } else {
      setLookup(null);
      setError("We couldn't find an order with these details. Check the order ID and the email or phone used at checkout.");
    }
  }

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-8 text-center">
          <span className="eyebrow">Order Tracking</span>
          <h1 className="section-title">Track your order</h1>
          <p className="section-sub">Enter your order ID and the email or phone number you used at checkout.</p>
        </div>

        <form onSubmit={handleSubmit} className="panel grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label>
            <span className="field-label">Order ID</span>
            <input
              required
              name="id"
              defaultValue={initialId}
              placeholder="HAK-261021-XXXX"
              className="field-input uppercase placeholder:normal-case"
            />
          </label>
          <label>
            <span className="field-label">Email or Phone</span>
            <input required name="contact" defaultValue={user?.email} className="field-input" />
          </label>
          <button type="submit" className="btn btn-primary">
            Track
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 rounded-field bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        {order && (
          <div className="mt-6 grid gap-5">
            <section className="panel">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-grey-500">Order</p>
                  <p className="text-xl font-black">#{order.id}</p>
                  <p className="text-sm text-grey-500">Placed on {formatDate(order.createdAt, true)}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={order.status} />
                  <p className="mt-1 font-extrabold">{formatPrice(order.total)}</p>
                </div>
              </div>
              <OrderTimeline order={order} />
            </section>

            <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
              <section className="panel">
                <h2 className="mb-2 text-[1.05rem]">Items</h2>
                <OrderItems order={order} />
              </section>
              <section className="panel h-fit text-[0.9rem]">
                <h2 className="mb-2 text-[1.05rem]">Delivery To</h2>
                <p className="font-bold">{order.customer.name}</p>
                <p className="text-grey-500">
                  {order.customer.address}, {order.customer.city}
                </p>
                <h2 className="mb-1 mt-5 text-[1.05rem]">Payment</h2>
                <PaymentInfo order={order} />
              </section>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-grey-500">
          Need help with your order?{" "}
          <Link href="/contact" className="font-extrabold text-brand-700 hover:underline">
            Contact us
          </Link>{" "}
          or chat with us on WhatsApp.
        </p>
      </div>
    </div>
  );
}
