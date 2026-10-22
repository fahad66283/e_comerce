"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { formatPrice } from "@/data/products";
import { api } from "@/lib/api";
import { ORDER_STATUSES, PAYMENT_STATUSES, formatDate } from "@/lib/format";
import OrderItems from "./OrderItems";
import StatusBadge from "./StatusBadge";

const selectClass =
  "rounded-full border-[1.5px] border-grey-200 bg-white px-3 py-1.5 text-sm font-bold outline-none focus:border-ink";

// Orders table. `compact` shows the latest few orders read-only (for the overview).
export default function OrdersManager({ orders, onChange, compact = false, limit }) {
  const router = useRouter();
  const [failed, setFailed] = useState("");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);

  // Saves a status change, then reloads the orders (stock and badges refresh too).
  async function update(id, changes) {
    try {
      await api(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: changes });
      setFailed("");
    } catch (err) {
      setFailed(err.message);
    }
    onChange();
    router.refresh();
  }

  const q = search.trim().toLowerCase();
  let list = orders.filter(
    (o) =>
      (status === "All" || o.status === status) &&
      (!q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.includes(q) ||
        o.customer.phone.includes(q))
  );
  if (limit) list = list.slice(0, limit);

  return (
    <div>
      {failed && (
        <p role="alert" className="mb-4 rounded-field bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {failed}
        </p>
      )}
      {!compact && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name, email or phone"
            aria-label="Search orders"
            className="w-full rounded-full border-[1.5px] border-grey-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink sm:w-80"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {["All", ...ORDER_STATUSES].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`pill !px-3.5 !py-1.5 !text-xs ${status === s ? "pill-active" : ""}`}
              >
                {s} ({s === "All" ? orders.length : orders.filter((o) => o.status === s).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <p className="card px-4 py-10 text-center text-grey-500">
          {orders.length === 0 ? "No orders yet." : "No orders match this filter."}
        </p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-grey-200 bg-grey-50 text-grey-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {!compact && <th className="px-4 py-3 text-right font-medium">Details</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-200">
              {list.map((o) => (
                <Fragment key={o.id}>
                  <tr className="align-top hover:bg-grey-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="font-bold">#{o.id}</p>
                      <p className="text-xs text-grey-500">{formatDate(o.createdAt, true)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold">
                        {o.customer.name}{" "}
                        {o.guest && <span className="rounded bg-grey-100 px-1.5 text-[0.65rem] font-bold text-grey-500">GUEST</span>}
                      </p>
                      <p className="text-xs text-grey-500">
                        {o.customer.phone} · {o.customer.city}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="font-bold">{formatPrice(o.total)}</p>
                      <p className="text-xs text-grey-500">
                        {o.items.reduce((n, i) => n + i.quantity, 0)} items
                        {o.couponCode && ` · ${o.couponCode}`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-grey-500">{o.payment.title}</p>
                      {compact ? (
                        <p className="font-bold">{o.payment.status}</p>
                      ) : (
                        <select
                          value={o.payment.status}
                          onChange={(e) => update(o.id, { paymentStatus: e.target.value })}
                          aria-label={`Payment status of order ${o.id}`}
                          className={`${selectClass} mt-1`}
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {compact ? (
                        <StatusBadge status={o.status} />
                      ) : (
                        <select
                          value={o.status}
                          onChange={(e) => update(o.id, { status: e.target.value })}
                          aria-label={`Status of order ${o.id}`}
                          className={selectClass}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    {!compact && (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setOpen(open === o.id ? null : o.id)}
                          aria-expanded={open === o.id}
                          className="font-bold hover:text-brand-700 hover:underline"
                        >
                          {open === o.id ? "Hide" : "View"}
                        </button>
                      </td>
                    )}
                  </tr>
                  {open === o.id && (
                    <tr className="bg-grey-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
                          <div className="rounded-card bg-white p-4">
                            <OrderItems order={o} />
                          </div>
                          <div className="grid content-start gap-1 rounded-card bg-white p-4 text-sm">
                            <p className="font-extrabold">Delivery</p>
                            <p>{o.customer.name}</p>
                            <p className="text-grey-500">
                              {o.customer.address}, {o.customer.city}
                            </p>
                            <p className="text-grey-500">
                              {o.customer.phone} · {o.customer.email}
                            </p>
                            {o.notes && <p className="mt-1 text-grey-700">📝 {o.notes}</p>}
                            {o.payment.reference && (
                              <p className="mt-2">
                                <span className="font-extrabold">Transaction ID:</span> {o.payment.reference}
                              </p>
                            )}
                            <p className="mt-2 font-extrabold">History</p>
                            {(o.statusHistory ?? []).map((h, i) => (
                              <p key={i} className="text-grey-500">
                                {h.status} · {formatDate(h.at, true)}
                              </p>
                            ))}
                            <Link href={`/order-confirmation?id=${encodeURIComponent(o.id)}`} className="mt-2 font-bold text-brand-700 hover:underline">
                              Open order page →
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
