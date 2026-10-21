"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ORDER_STATUSES, formatDate, useOrders } from "@/context/OrdersContext";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice } from "@/data/products";
import ProductManager from "./ProductManager";
import StatusBadge from "./StatusBadge";

const tabs = ["Overview", "Orders", "Products", "Customers"];
const LOW_STOCK = 5;

function StatCard({ label, value }) {
  return (
    <div className="rounded-card border-[1.5px] border-grey-200 bg-white p-5">
      <p className="text-sm font-semibold text-grey-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-brand-600 sm:text-3xl">{value}</p>
    </div>
  );
}

function OrdersTable({ orders, onStatusChange }) {
  if (orders.length === 0) {
    return <p className="card px-4 py-10 text-center text-grey-500">No orders yet.</p>;
  }
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-grey-200 bg-grey-50 text-grey-500">
          <tr>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Items</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-grey-200">
          {orders.map((o) => (
            <tr key={o.id} className="align-top hover:bg-grey-50">
              <td className="whitespace-nowrap px-4 py-3">
                <Link href={`/order-confirmation?id=${o.id}`} className="font-bold hover:text-brand-700">
                  #{o.id}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-grey-500">{formatDate(o.createdAt)}</td>
              <td className="px-4 py-3">
                <p className="font-bold">{o.customer.name}</p>
                <p className="text-xs text-grey-500">
                  {o.customer.phone} · {o.customer.city}
                </p>
              </td>
              <td className="px-4 py-3 text-grey-500">
                {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-bold">{formatPrice(o.total)}</td>
              <td className="px-4 py-3">
                {onStatusChange ? (
                  <select
                    value={o.status}
                    onChange={(e) => onStatusChange(o.id, e.target.value)}
                    aria-label={`Status of order ${o.id}`}
                    className="rounded-full border-[1.5px] border-grey-200 bg-white px-3 py-1.5 text-sm font-bold outline-none focus:border-ink"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={o.status} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAdmin, hydrated, customers } = useAuth();
  const { orders, updateOrderStatus } = useOrders();
  const { products } = useProducts();
  const [tab, setTab] = useState("Overview");

  if (!hydrated) {
    return <p className="container-page py-16 text-grey-500">Loading...</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="section-title mt-4">Admin access only</h1>
        <p className="mt-2 text-grey-500">Please login with the admin account to open the dashboard.</p>
        <Link href="/login?next=/dashboard" className="btn btn-primary mt-8">
          Login
        </Link>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== "Cancelled");
  const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === "Processing").length;
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK);

  const customerRows = customers.map((c) => {
    const theirs = activeOrders.filter((o) => o.customer.email === c.email);
    return { ...c, orders: theirs.length, spent: theirs.reduce((sum, o) => sum + o.total, 0) };
  });

  return (
    <div className="container-page py-16">
      <div className="mb-8">
        <span className="eyebrow">Admin</span>
        <h1 className="section-title">Dashboard</h1>
        <p className="section-sub">Track sales and manage orders, products and customers.</p>
      </div>

      <div role="tablist" className="mb-8 flex gap-2.5 overflow-x-auto pb-1.5 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`pill ${tab === t ? "pill-active" : ""}`}
          >
            {t}
            {t === "Orders" && pending > 0 && (
              <span className="rounded-full bg-brand-500 px-2 text-xs font-extrabold text-ink">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Revenue" value={formatPrice(revenue)} />
            <StatCard label="Orders" value={orders.length} />
            <StatCard label="Products" value={products.length} />
            <StatCard label="Customers" value={customers.length} />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl">Recent Orders</h2>
                <button type="button" onClick={() => setTab("Orders")} className="text-sm font-extrabold text-brand-700 hover:underline">
                  View all →
                </button>
              </div>
              <OrdersTable orders={orders.slice(0, 5)} />
            </section>
            <section>
              <h2 className="mb-4 text-xl">Low Stock</h2>
              <div className="card p-5">
                {lowStock.length === 0 ? (
                  <p className="text-sm text-grey-500">All products have more than {LOW_STOCK} in stock.</p>
                ) : (
                  <ul className="divide-y divide-grey-200">
                    {lowStock.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <span className="font-bold">
                          {p.emoji} {p.name}
                        </span>
                        <span className={p.stock < 1 ? "font-extrabold text-red-600" : "font-bold text-amber-700"}>
                          {p.stock < 1 ? "Out of stock" : `${p.stock} left`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <button type="button" onClick={() => setTab("Products")} className="btn btn-outline btn-sm mt-4 w-full">
                  Manage Products
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === "Orders" && (
        <section>
          <h2 className="mb-4 text-xl">All Orders</h2>
          <OrdersTable orders={orders} onStatusChange={updateOrderStatus} />
        </section>
      )}

      {tab === "Products" && <ProductManager />}

      {tab === "Customers" && (
        <section>
          <h2 className="mb-4 text-xl">Registered Customers</h2>
          {customerRows.length === 0 ? (
            <p className="card px-4 py-10 text-center text-grey-500">No customers have signed up yet.</p>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-grey-200 bg-grey-50 text-grey-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Orders</th>
                    <th className="px-4 py-3 font-medium">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-200">
                  {customerRows.map((c) => (
                    <tr key={c.email} className="hover:bg-grey-50">
                      <td className="px-4 py-3 font-bold">{c.name}</td>
                      <td className="px-4 py-3 text-grey-500">{c.email}</td>
                      <td className="px-4 py-3">{c.orders}</td>
                      <td className="px-4 py-3 font-bold">{formatPrice(c.spent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-8 text-xs text-grey-500">
        Demo mode: orders, customers and product changes are stored in this browser only.
      </p>
    </div>
  );
}
