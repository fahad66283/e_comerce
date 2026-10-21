"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import { useProducts } from "@/context/ProductsContext";
import { useReviews } from "@/context/ReviewsContext";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/data/products";
import CategoryManager from "./CategoryManager";
import CouponManager from "./CouponManager";
import DataManager from "./DataManager";
import OrdersManager from "./OrdersManager";
import ProductManager from "./ProductManager";
import ReviewManager from "./ReviewManager";
import SalesReport from "./SalesReport";
import SettingsEditor from "./SettingsEditor";
import UsersManager from "./UsersManager";

const adminTabs = ["Overview", "Orders", "Products", "Categories", "Coupons", "Reviews", "Customers", "Reports"];
// Only the super admin can edit the website, store settings and users.
const superAdminTabs = ["Website", "Settings", "Users", "Backup"];

function StatCard({ label, value }) {
  return (
    <div className="rounded-card border-[1.5px] border-grey-200 bg-white p-5">
      <p className="text-sm font-semibold text-grey-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-brand-600 sm:text-3xl">{value}</p>
    </div>
  );
}

function Alert({ tone, icon, children, action, onAction }) {
  const tones = {
    red: "border-red-200 bg-red-50 text-red-800",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
  };
  return (
    <li className={`flex flex-wrap items-center justify-between gap-3 rounded-card border px-4 py-3 text-sm ${tones[tone]}`}>
      <span className="flex items-center gap-2 font-bold">
        <span aria-hidden="true">{icon}</span>
        {children}
      </span>
      <button type="button" onClick={onAction} className="font-extrabold underline">
        {action}
      </button>
    </li>
  );
}

export default function AdminDashboard() {
  const { isAdmin, isSuperAdmin, hydrated, customers, user } = useAuth();
  const { settings } = useSettings();
  const lowStockAt = settings.inventory.lowStock;
  const { orders } = useOrders();
  const { products } = useProducts();
  const { reviews } = useReviews();
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

  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === "Processing");
  const toVerify = orders.filter((o) => o.payment.method !== "cod" && o.payment.status === "Pending" && o.status !== "Cancelled");
  const outOfStock = products.filter((p) => p.stock < 1);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= lowStockAt);

  // Customers: registered accounts plus guests who ordered with another email.
  const registered = new Set(customers.map((c) => c.email));
  const guests = [];
  for (const o of orders) {
    if (!registered.has(o.customer.email) && !guests.some((g) => g.email === o.customer.email)) {
      guests.push({ name: o.customer.name, email: o.customer.email, phone: o.customer.phone, guest: true });
    }
  }
  const customerRows = [...customers.map((c) => ({ ...c, guest: false })), ...guests].map((c) => {
    const theirs = orders.filter((o) => o.customer.email === c.email && o.status !== "Cancelled");
    return { ...c, orders: theirs.length, spent: theirs.reduce((sum, o) => sum + o.total, 0) };
  });

  const badges = { Orders: pending.length, Products: outOfStock.length + lowStock.length };

  return (
    <div className="container-page py-16">
      <div className="mb-8">
        <span className="eyebrow">Admin</span>
        <h1 className="section-title">{isSuperAdmin ? "Super Admin Dashboard" : "Dashboard"}</h1>
        <p className="section-sub">
          Welcome, {user.name}.{" "}
          {isSuperAdmin
            ? "Manage the store, edit every part of the website, and control who has access."
            : "Track sales and manage orders, products, categories and customers."}
        </p>
      </div>

      <div role="tablist" className="mb-8 flex items-center gap-2.5 overflow-x-auto pb-1.5 [scrollbar-width:none] lg:flex-wrap lg:overflow-visible">
        {(isSuperAdmin ? [...adminTabs, ...superAdminTabs] : adminTabs).map((t) => (
          <Fragment key={t}>
            {t === superAdminTabs[0] && (
              <span className="mx-1 flex shrink-0 items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-grey-400" aria-hidden="true">
                <span className="h-6 w-px bg-grey-200" />
                Super admin
              </span>
            )}
            <button
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`pill ${tab === t ? "pill-active" : ""}`}
            >
              {t}
              {badges[t] > 0 && (
                <span className="rounded-full bg-red-500 px-2 text-xs font-extrabold text-white">{badges[t]}</span>
              )}
            </button>
          </Fragment>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-1 gap-8">
          <section>
            <h2 className="mb-3 text-xl">Notifications</h2>
            {pending.length + toVerify.length + outOfStock.length + lowStock.length === 0 ? (
              <p className="card p-4 text-sm text-grey-500">✓ All caught up. No alerts right now.</p>
            ) : (
              <ul className="grid gap-2.5">
                {outOfStock.length > 0 && (
                  <Alert tone="red" icon="⛔" action="Restock" onAction={() => setTab("Products")}>
                    {outOfStock.length} out of stock: {outOfStock.map((p) => p.name).join(", ")}
                  </Alert>
                )}
                {lowStock.length > 0 && (
                  <Alert tone="amber" icon="⚠️" action="View" onAction={() => setTab("Products")}>
                    {lowStock.length} running low (≤ {lowStockAt} left):{" "}
                    {lowStock.map((p) => `${p.name} (${p.stock})`).join(", ")}
                  </Alert>
                )}
                {pending.length > 0 && (
                  <Alert tone="blue" icon="🧾" action="Process" onAction={() => setTab("Orders")}>
                    {pending.length} new {pending.length === 1 ? "order" : "orders"} waiting to be processed
                  </Alert>
                )}
                {toVerify.length > 0 && (
                  <Alert tone="amber" icon="💳" action="Verify" onAction={() => setTab("Orders")}>
                    {toVerify.length} online {toVerify.length === 1 ? "payment" : "payments"} to verify
                  </Alert>
                )}
              </ul>
            )}
          </section>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Revenue" value={formatPrice(revenue)} />
            <StatCard label="Orders" value={orders.length} />
            <StatCard label="Products" value={products.length} />
            <StatCard label="Customers" value={customerRows.length} />
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl">Recent Orders</h2>
              <button type="button" onClick={() => setTab("Orders")} className="text-sm font-extrabold text-brand-700 hover:underline">
                View all →
              </button>
            </div>
            <OrdersManager compact limit={5} />
          </section>

          <p className="text-sm text-grey-500">
            {reviews.length} customer {reviews.length === 1 ? "review" : "reviews"} ·{" "}
            <button type="button" onClick={() => setTab("Reports")} className="font-extrabold text-brand-700 hover:underline">
              Open sales report →
            </button>
          </p>
        </div>
      )}

      {tab === "Orders" && (
        <section>
          <h2 className="mb-4 text-xl">Orders</h2>
          <OrdersManager />
        </section>
      )}

      {tab === "Products" && <ProductManager />}
      {tab === "Categories" && <CategoryManager />}
      {tab === "Coupons" && <CouponManager />}
      {tab === "Reviews" && <ReviewManager />}
      {tab === "Reports" && <SalesReport />}
      {isSuperAdmin && tab === "Website" && <SettingsEditor group="website" />}
      {isSuperAdmin && tab === "Settings" && <SettingsEditor group="settings" />}
      {isSuperAdmin && tab === "Users" && <UsersManager />}
      {isSuperAdmin && tab === "Backup" && <DataManager />}

      {tab === "Customers" && (
        <section>
          <h2 className="mb-4 text-xl">Customers</h2>
          {customerRows.length === 0 ? (
            <p className="card px-4 py-10 text-center text-grey-500">No customers yet.</p>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="border-b border-grey-200 bg-grey-50 text-grey-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Orders</th>
                    <th className="px-4 py-3 font-medium">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-200">
                  {customerRows.map((c) => (
                    <tr key={c.email} className="hover:bg-grey-50">
                      <td className="px-4 py-3 font-bold">{c.name}</td>
                      <td className="px-4 py-3 text-grey-500">{c.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                            c.guest ? "bg-grey-100 text-grey-500" : "bg-brand-100 text-brand-700"
                          }`}
                        >
                          {c.guest ? "Guest" : "Registered"}
                        </span>
                      </td>
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
        Demo mode: orders, customers and catalog changes are stored in this browser only.
      </p>
    </div>
  );
}
