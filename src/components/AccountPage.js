"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatDate, useOrders } from "@/context/OrdersContext";
import { formatPrice } from "@/data/products";
import OrderItems from "./OrderItems";
import StatusBadge from "./StatusBadge";

const quickLinks = [
  { href: "/products", icon: "🛍️", label: "Continue Shopping" },
  { href: "/return-policy", icon: "🔄", label: "Return Policy" },
  { href: "/faqs", icon: "❓", label: "FAQs" },
  { href: "/contact", icon: "💬", label: "Contact Support" },
];

export default function AccountPage() {
  const { user, isAdmin, hydrated, logout } = useAuth();
  const { getOrdersByEmail } = useOrders();
  const router = useRouter();

  if (!hydrated) return <p className="container-page py-16 text-grey-500">Loading...</p>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-5xl">👤</p>
        <h1 className="section-title mt-4">Login to your account</h1>
        <p className="mt-2 text-grey-500">View your orders and account details.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/login?next=/account" className="btn btn-primary">
            Login
          </Link>
          <Link href="/signup?next=/account" className="btn btn-outline">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const orders = getOrdersByEmail(user.email);
  const totalSpent = orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0);

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="container-page py-16">
      <div className="mb-8">
        <span className="eyebrow">My Account</span>
        <h1 className="section-title">Welcome back, {user.name}</h1>
        <p className="section-sub">Manage your details and keep track of your orders.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="grid gap-5">
          <section className="panel">
            <div className="flex items-center gap-3.5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xl font-black">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-extrabold">{user.name}</p>
                <p className="truncate text-sm text-grey-500">{user.email}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-card bg-grey-50 p-3">
                <dt className="text-xs font-semibold text-grey-500">Orders</dt>
                <dd className="text-xl font-black text-brand-600">{orders.length}</dd>
              </div>
              <div className="rounded-card bg-grey-50 p-3">
                <dt className="text-xs font-semibold text-grey-500">Total Spent</dt>
                <dd className="text-[0.95rem] font-black text-brand-600">{formatPrice(totalSpent)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-grey-500">
              Account type: <strong className="text-ink">{isAdmin ? "Administrator" : "Customer"}</strong>
            </p>
            <div className="mt-5 grid gap-2.5">
              {isAdmin && (
                <Link href="/dashboard" className="btn btn-dark btn-sm">
                  Open Dashboard
                </Link>
              )}
              <button type="button" onClick={handleLogout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </div>
          </section>

          <nav className="panel grid gap-1 !p-3">
            {quickLinks.map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-field px-3 py-2.5 font-bold hover:bg-grey-50">
                <span aria-hidden="true">{l.icon}</span>
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section>
          <h2 className="mb-4 text-xl">My Orders</h2>
          {orders.length === 0 ? (
            <div className="panel text-center">
              <p className="text-4xl">📦</p>
              <p className="mt-3 font-bold">You haven&apos;t placed any orders yet.</p>
              <Link href="/products" className="btn btn-primary mt-5">
                Start Shopping
              </Link>
            </div>
          ) : (
            <ul className="grid gap-4">
              {orders.map((order) => (
                <li key={order.id}>
                  <details className="card group p-5">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-extrabold">#{order.id}</p>
                        <p className="text-sm text-grey-500">
                          {formatDate(order.createdAt)} · {order.items.reduce((n, i) => n + i.quantity, 0)} items
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={order.status} />
                        <span className="font-extrabold">{formatPrice(order.total)}</span>
                        <span className="text-grey-400 transition group-open:rotate-180" aria-hidden="true">
                          ▾
                        </span>
                      </div>
                    </summary>
                    <div className="mt-4 border-t border-grey-200 pt-2">
                      <OrderItems order={order} />
                      <p className="mt-3 text-sm text-grey-500">
                        Delivering to {order.customer.address}, {order.customer.city} ·{" "}
                        {`${order.payment.title} (${order.payment.status})`}
                      </p>
                      <Link
                        href={`/track-order?id=${order.id}`}
                        className="mt-3 inline-block text-sm font-extrabold text-brand-700 hover:underline"
                      >
                        Track this order →
                      </Link>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-grey-500">
            Orders placed while logged out with the same email address also appear here.
          </p>
        </section>
      </div>
    </div>
  );
}
