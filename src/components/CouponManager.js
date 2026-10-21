"use client";

import { useState } from "react";
import { useCoupons } from "@/context/CouponsContext";
import { useOrders } from "@/context/OrdersContext";
import { formatPrice } from "@/data/products";

const empty = { code: "", type: "percent", value: 10, minOrder: 0, active: true };

// Coupons tab: create, edit, switch on/off and delete discount codes.
export default function CouponManager() {
  const { coupons, saveCoupon, deleteCoupon } = useCoupons();
  const { orders } = useOrders();
  const [editing, setEditing] = useState(null); // null | "new" | coupon
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function open(target) {
    setEditing(target);
    setForm(target === "new" ? empty : target);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const data = { ...form, value: Number(form.value), minOrder: Number(form.minOrder) };
    if (data.type === "percent" && (data.value < 1 || data.value > 90)) {
      setError("Percentage discounts must be between 1 and 90.");
      return;
    }
    const result = saveCoupon(data, editing === "new" ? null : editing.code);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(null);
  }

  const uses = (code) => orders.filter((o) => o.couponCode === code && o.status !== "Cancelled");

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl">Coupons &amp; Discounts</h2>
          <p className="text-sm text-grey-500">
            For sale prices on single products, set an “Original Price” in the Products tab.
          </p>
        </div>
        <button type="button" onClick={() => open("new")} className="btn btn-primary btn-sm">
          + Add Coupon
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="panel mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <h3 className="text-lg sm:col-span-2 lg:col-span-4">
            {editing === "new" ? "Add Coupon" : `Edit: ${editing.code}`}
          </h3>
          <label>
            <span className="field-label">Code</span>
            <input
              required
              maxLength={20}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. EID20"
              className="field-input uppercase"
            />
          </label>
          <label>
            <span className="field-label">Discount Type</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="field-input">
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount (Rs.)</option>
            </select>
          </label>
          <label>
            <span className="field-label">{form.type === "percent" ? "Discount (%)" : "Discount (Rs.)"}</span>
            <input
              required
              type="number"
              min="1"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="field-input"
            />
          </label>
          <label>
            <span className="field-label">Minimum Order (Rs.)</span>
            <input
              required
              type="number"
              min="0"
              value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
              className="field-input"
            />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 accent-ink"
            />
            <span className="field-label">Active (customers can use it)</span>
          </label>
          {error && <p className="text-sm font-bold text-red-600 sm:col-span-2 lg:col-span-4">{error}</p>}
          <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
            <button type="submit" className="btn btn-primary">
              Save Coupon
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-grey-200 bg-grey-50 text-grey-500">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Min. Order</th>
              <th className="px-4 py-3 font-medium">Used</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grey-200">
            {coupons.map((c) => {
              const used = uses(c.code);
              return (
                <tr key={c.code} className="hover:bg-grey-50">
                  <td className="px-4 py-3 font-extrabold tracking-wide">{c.code}</td>
                  <td className="px-4 py-3">{c.type === "percent" ? `${c.value}% off` : `${formatPrice(c.value)} off`}</td>
                  <td className="px-4 py-3 text-grey-500">{c.minOrder > 0 ? formatPrice(c.minOrder) : "None"}</td>
                  <td className="px-4 py-3 text-grey-500">
                    {used.length}× · {formatPrice(used.reduce((s, o) => s + o.discount, 0))} saved
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => saveCoupon({ ...c, active: !c.active }, c.code)}
                      className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                        c.active ? "bg-brand-100 text-brand-700" : "bg-grey-100 text-grey-500"
                      }`}
                      title="Click to switch on/off"
                    >
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => open(c)} className="mr-3 font-bold hover:text-brand-700 hover:underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => confirm(`Delete coupon ${c.code}?`) && deleteCoupon(c.code)}
                      className="font-bold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="px-4 py-10 text-center text-grey-500">No coupons yet.</p>}
      </div>
    </div>
  );
}
