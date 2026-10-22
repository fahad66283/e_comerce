"use client";

import { useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice } from "@/data/products";
import { PAYMENT_ICONS } from "@/data/siteContent";
import { api } from "@/lib/api";
import StatusBadge from "./StatusBadge";

const ranges = [
  { key: 7, label: "Last 7 days" },
  { key: 30, label: "Last 30 days" },
  { key: 90, label: "Last 90 days" },
  { key: 0, label: "All time" },
];

const DAY = 24 * 60 * 60 * 1000;

function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shortDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Tile({ label, value, note }) {
  return (
    <div className="rounded-card border-[1.5px] border-grey-200 bg-white p-5">
      <p className="text-sm font-semibold text-grey-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      {note && <p className="mt-0.5 text-xs text-grey-500">{note}</p>}
    </div>
  );
}

// Daily revenue bar chart: one series, so no legend; hover/focus a bar for its values.
function RevenueChart({ days }) {
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(...days.map((d) => d.revenue), 1);
  const labelEvery = Math.ceil(days.length / 8);
  const gridValues = [max, max / 2];

  return (
    <section className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[1.05rem]">Revenue per day</h3>
        <button type="button" onClick={() => setShowTable(!showTable)} className="text-sm font-bold text-brand-700 hover:underline">
          {showTable ? "Show chart" : "Show as table"}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white text-grey-500">
              <tr>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Orders</th>
                <th className="py-2 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-200">
              {[...days].reverse().map((d) => (
                <tr key={d.key}>
                  <td className="py-1.5">{shortDate(d.key)}</td>
                  <td className="py-1.5">{d.orders}</td>
                  <td className="py-1.5 text-right font-bold">{formatPrice(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex h-56 w-14 shrink-0 flex-col justify-between pb-6 text-right text-[0.65rem] text-grey-500 sm:w-16 sm:text-[0.7rem]">
            {gridValues.map((v) => (
              <span key={v}>{formatPrice(Math.round(v))}</span>
            ))}
            <span>Rs. 0</span>
          </div>
          <div className="relative min-w-0 flex-1">
            {/* recessive grid lines at max, half and zero */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[calc(100%-24px)]" aria-hidden="true">
              <div className="absolute inset-x-0 top-0 border-t border-dashed border-grey-200" />
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-grey-200" />
              <div className="absolute inset-x-0 bottom-0 border-t border-grey-400" />
            </div>
            <div className="flex h-56 items-end gap-[2px] pb-6">
              {days.map((d, i) => (
                <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
                  <button
                    type="button"
                    aria-label={`${shortDate(d.key)}: ${formatPrice(d.revenue)} from ${d.orders} orders`}
                    className="flex h-full w-full items-end outline-none"
                  >
                    <span
                      className="block w-full rounded-t-[4px] bg-brand-700 transition-opacity group-hover:opacity-80 group-focus-within:opacity-80"
                      style={{ height: `${(d.revenue / max) * 100}%`, minHeight: d.revenue > 0 ? 3 : 0 }}
                    />
                  </button>
                  <span className="pointer-events-none absolute bottom-[calc(100%+4px)] left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-field bg-ink px-2.5 py-1.5 text-xs text-white group-focus-within:block group-hover:block">
                    <strong className="block text-sm">{formatPrice(d.revenue)}</strong>
                    {shortDate(d.key)} · {d.orders} {d.orders === 1 ? "order" : "orders"}
                  </span>
                  {/* phones: first and last date only; wider screens: about 8 dates */}
                  {(i === 0 || i === days.length - 1 || i % labelEvery === 0) && (
                    <span
                      className={`absolute top-full mt-1.5 whitespace-nowrap text-[0.65rem] text-grey-500 ${
                        i === 0 ? "left-0" : i === days.length - 1 ? "right-0" : "left-1/2 hidden -translate-x-1/2 sm:inline"
                      } ${i !== 0 && i !== days.length - 1 && days.length - 1 - i < labelEvery ? "!hidden" : ""}`}
                    >
                      {shortDate(d.key)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Horizontal bars for a breakdown (single hue = magnitude), values labelled directly.
function BarList({ rows, format = formatPrice }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="grid gap-3">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="mb-1 flex justify-between gap-3">
            <span className="font-bold">{r.label}</span>
            <span className="text-grey-700">{format(r.value)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-grey-100">
            <div className="h-full rounded-full bg-brand-700" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function SalesReport({ orders, onChange }) {
  const { products } = useProducts();
  const [range, setRange] = useState(30);
  // "Now" is fixed when the report opens, so re-renders don't shift the date range.
  const [now] = useState(() => Date.now());
  const inRange = orders.filter((o) => range === 0 || now - new Date(o.createdAt).getTime() <= range * DAY);
  const valid = inRange.filter((o) => o.status !== "Cancelled");
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const itemsSold = valid.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);
  const discounts = valid.reduce((s, o) => s + (o.discount ?? 0), 0);
  const hasDemo = orders.some((o) => o.demo);

  // Daily buckets for the chart ("All time" shows the last 90 days).
  const chartDays = range === 0 ? 90 : range;
  const days = Array.from({ length: chartDays }, (_, i) => {
    const key = dayKey(now - (chartDays - 1 - i) * DAY);
    const dayOrders = valid.filter((o) => dayKey(o.createdAt) === key);
    return { key, orders: dayOrders.length, revenue: dayOrders.reduce((s, o) => s + o.total, 0) };
  });

  // Top products and categories by revenue.
  const byProduct = {};
  const byCategory = {};
  for (const o of valid) {
    for (const i of o.items) {
      const p = (byProduct[i.id] ??= { name: i.name, emoji: i.emoji, units: 0, revenue: 0 });
      p.units += i.quantity;
      p.revenue += i.price * i.quantity;
      const category = i.category ?? products.find((x) => x.id === i.id)?.category ?? "Other";
      byCategory[category] = (byCategory[category] ?? 0) + i.price * i.quantity;
    }
  }
  const topProducts = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const categoryRows = Object.entries(byCategory)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const paymentCounts = {};
  for (const o of inRange) {
    const key = `${PAYMENT_ICONS[o.payment.method] ?? "💳"} ${o.payment.title}`;
    paymentCounts[key] = (paymentCounts[key] ?? 0) + 1;
  }
  const paymentRows = Object.entries(paymentCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const statusCounts = ["Processing", "Shipped", "Delivered", "Cancelled"].map((s) => ({
    status: s,
    count: inRange.filter((o) => o.status === s).length,
  }));

  function exportCsv() {
    const header = ["Order ID", "Date", "Customer", "Email", "Phone", "City", "Items", "Subtotal", "Discount", "Shipping", "Total", "Status", "Payment", "Payment Status"];
    const rows = inRange.map((o) => [
      o.id,
      new Date(o.createdAt).toISOString().slice(0, 10),
      o.customer.name,
      o.customer.email,
      o.customer.phone,
      o.customer.city,
      o.items.map((i) => `${i.name} x${i.quantity}`).join("; "),
      o.subtotal,
      o.discount ?? 0,
      o.shipping,
      o.total,
      o.status,
      o.payment.title,
      o.payment.status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `hak-orders-${dayKey(now)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  const [demoBusy, setDemoBusy] = useState(false);
  const [demoError, setDemoError] = useState("");

  // Sample orders (stored with is_demo = 1) so the charts have something to show.
  async function demo(method) {
    setDemoBusy(true);
    try {
      await api("/api/admin/orders/demo", { method });
      setDemoError("");
    } catch (err) {
      setDemoError(err.message);
    }
    setDemoBusy(false);
    onChange();
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl">Sales Report &amp; Analytics</h2>
        <div className="flex flex-wrap gap-2">
          {hasDemo ? (
            <button type="button" onClick={() => demo("DELETE")} disabled={demoBusy} className="btn btn-outline btn-sm">
              Remove demo orders
            </button>
          ) : (
            <button type="button" onClick={() => demo("POST")} disabled={demoBusy || products.length === 0} className="btn btn-outline btn-sm">
              Add demo orders
            </button>
          )}
          <button type="button" onClick={exportCsv} disabled={inRange.length === 0} className="btn btn-dark btn-sm">
            Export CSV
          </button>
        </div>
      </div>

      {demoError && <p className="rounded-field bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{demoError}</p>}

      {/* Date range filter: one row above everything it scopes */}
      <div role="radiogroup" aria-label="Date range" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {ranges.map((r) => (
          <button
            key={r.key}
            type="button"
            role="radio"
            aria-checked={range === r.key}
            onClick={() => setRange(r.key)}
            className={`pill !px-3.5 !py-1.5 !text-xs ${range === r.key ? "pill-active" : ""}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Tile label="Revenue" value={formatPrice(revenue)} note="Excludes cancelled orders" />
        <Tile label="Orders" value={inRange.length} note={`${valid.length} not cancelled`} />
        <Tile label="Avg. Order Value" value={formatPrice(valid.length ? Math.round(revenue / valid.length) : 0)} />
        <Tile label="Items Sold" value={itemsSold} />
        <Tile label="Discounts Given" value={formatPrice(discounts)} />
      </div>

      {inRange.length === 0 ? (
        <p className="card p-8 text-center text-grey-500">
          No orders in this period yet. Use “Add demo orders” to preview the report with sample data.
        </p>
      ) : (
        <>
          <RevenueChart days={days} />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <section className="card p-5">
              <h3 className="mb-4 text-[1.05rem]">Top products</h3>
              <table className="w-full text-left text-sm">
                <thead className="text-grey-500">
                  <tr>
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 text-right font-medium">Units</th>
                    <th className="pb-2 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-200">
                  {topProducts.map((p) => (
                    <tr key={p.name}>
                      <td className="py-2 font-bold">
                        {p.emoji} {p.name}
                      </td>
                      <td className="py-2 text-right">{p.units}</td>
                      <td className="py-2 text-right font-bold">{formatPrice(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="card p-5">
              <h3 className="mb-4 text-[1.05rem]">Sales by category</h3>
              <BarList rows={categoryRows} />
            </section>

            <section className="card p-5">
              <h3 className="mb-4 text-[1.05rem]">Orders by status</h3>
              <ul className="grid grid-cols-2 gap-3">
                {statusCounts.map((s) => (
                  <li key={s.status} className="flex items-center justify-between rounded-field bg-grey-50 px-3 py-2.5">
                    <StatusBadge status={s.status} />
                    <span className="text-lg font-black">{s.count}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card p-5">
              <h3 className="mb-4 text-[1.05rem]">Payment methods</h3>
              <BarList rows={paymentRows} format={(v) => `${v} ${v === 1 ? "order" : "orders"}`} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
