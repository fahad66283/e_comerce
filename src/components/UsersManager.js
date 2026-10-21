"use client";

import { Fragment, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrdersContext";
import { ROLE_LABELS } from "@/data/accounts";

const roleStyles = {
  superadmin: "bg-ink text-white",
  admin: "bg-brand-100 text-brand-700",
  customer: "bg-grey-100 text-grey-700",
};

// Super admin: add admins/customers, change roles, disable accounts, set passwords.
export default function UsersManager() {
  const { accounts, user, adminCreateUser, adminUpdateUser, adminSetPassword, adminDeleteUser } = useAuth();
  const { orders } = useOrders();
  const [adding, setAdding] = useState(false);
  const [passwordFor, setPasswordFor] = useState(null);
  const [message, setMessage] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  const show = (text, error = false) => setMessage({ text, error });
  const list = accounts.filter((a) => filter === "all" || (filter === "staff" ? a.role !== "customer" : a.role === "customer"));

  async function handleAdd(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    setBusy(true);
    const result = await adminCreateUser({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role: form.get("role"),
    });
    setBusy(false);
    if (result.error) return show(result.error, true);
    show(`${result.user.name} was added as ${ROLE_LABELS[result.user.role]}.`);
    setAdding(false);
  }

  async function handlePassword(e, email) {
    e.preventDefault();
    setBusy(true);
    const result = await adminSetPassword(email, new FormData(e.target).get("password"));
    setBusy(false);
    if (result.error) return show(result.error, true);
    show("Password updated.");
    setPasswordFor(null);
  }

  function update(email, changes, done) {
    const result = adminUpdateUser(email, changes);
    show(result.error ?? done, !!result.error);
  }

  function remove(account) {
    if (!confirm(`Delete ${account.name} (${account.email})? Their past orders are kept.`)) return;
    const result = adminDeleteUser(account.email);
    show(result.error ?? `${account.name} was deleted.`, !!result.error);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl">Users &amp; Admins</h2>
          <p className="text-sm text-grey-500">Admins can manage orders and products. Only you (super admin) can edit the website and users.</p>
        </div>
        <button type="button" onClick={() => setAdding(!adding)} className="btn btn-primary btn-sm shrink-0">
          + Add User
        </button>
      </div>

      {message.text && (
        <p role="status" className={`mt-6 rounded-field px-4 py-3 text-sm font-bold ${message.error ? "bg-red-50 text-red-700" : "bg-brand-100 text-brand-700"}`}>
          {message.text}
        </p>
      )}

      {adding && (
        <form onSubmit={handleAdd} className="panel mt-6 grid gap-4 sm:grid-cols-2">
          <h3 className="text-lg sm:col-span-2">Add a user</h3>
          <label>
            <span className="field-label">Full Name</span>
            <input required name="name" className="field-input" />
          </label>
          <label>
            <span className="field-label">Email</span>
            <input required type="email" name="email" autoComplete="off" className="field-input" />
          </label>
          <label>
            <span className="field-label">Password</span>
            <input required type="password" name="password" minLength={6} autoComplete="new-password" className="field-input" />
          </label>
          <label>
            <span className="field-label">Role</span>
            <select name="role" defaultValue="admin" className="field-input">
              <option value="admin">Admin (manages orders &amp; products)</option>
              <option value="customer">Customer</option>
            </select>
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy ? "Saving..." : "Add User"}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 flex gap-2">
        {[
          ["all", "All"],
          ["staff", "Staff"],
          ["customers", "Customers"],
        ].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setFilter(key)} className={`pill !px-3.5 !py-1.5 !text-xs ${filter === key ? "pill-active" : ""}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-grey-200 bg-grey-50 text-grey-500">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grey-200">
            {list.map((a) => {
              const isSelf = a.email === user.email;
              const isSuper = a.role === "superadmin";
              return (
                <Fragment key={a.email}>
                  <tr className="align-middle hover:bg-grey-50">
                    <td className="px-4 py-3">
                      <p className="font-bold">
                        {a.name} {isSelf && <span className="text-xs font-normal text-grey-500">(you)</span>}
                      </p>
                      <p className="text-xs text-grey-500">
                        {a.email}
                        {a.username && ` · username: ${a.username}`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {isSuper || a.builtIn ? (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${roleStyles[a.role]}`}>
                          {ROLE_LABELS[a.role]}
                          {a.builtIn && " · built-in"}
                        </span>
                      ) : (
                        <select
                          value={a.role}
                          onChange={(e) => update(a.email, { role: e.target.value }, `${a.name} is now ${ROLE_LABELS[e.target.value]}.`)}
                          aria-label={`Role of ${a.name}`}
                          className="rounded-full border-[1.5px] border-grey-200 bg-white px-3 py-1.5 text-sm font-bold outline-none focus:border-ink"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-grey-500">{orders.filter((o) => o.customer.email === a.email).length}</td>
                    <td className="px-4 py-3">
                      {isSuper ? (
                        <span className="text-xs font-bold text-brand-700">Active</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            update(
                              a.email,
                              { status: a.status === "disabled" ? "active" : "disabled" },
                              `${a.name} was ${a.status === "disabled" ? "enabled" : "disabled"}.`
                            )
                          }
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${a.status === "disabled" ? "bg-red-100 text-red-700" : "bg-brand-100 text-brand-700"}`}
                          title="Click to switch"
                        >
                          {a.status === "disabled" ? "Disabled" : "Active"}
                        </button>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {(!isSuper || isSelf) && (
                        <button type="button" onClick={() => setPasswordFor(passwordFor === a.email ? null : a.email)} className="mr-3 font-bold hover:text-brand-700 hover:underline">
                          Set password
                        </button>
                      )}
                      {!a.builtIn && (
                        <button type="button" onClick={() => remove(a)} className="font-bold text-red-600 hover:underline">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                  {passwordFor === a.email && (
                    <tr className="bg-grey-50">
                      <td colSpan={5} className="px-4 py-3">
                        <form onSubmit={(e) => handlePassword(e, a.email)} className="flex flex-wrap items-end gap-3">
                          <label className="min-w-[220px] flex-1">
                            <span className="field-label">New password for {a.name}</span>
                            <input required type="password" name="password" minLength={6} autoComplete="new-password" className="field-input" />
                          </label>
                          <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
                            {busy ? "Saving..." : "Save Password"}
                          </button>
                          <button type="button" onClick={() => setPasswordFor(null)} className="btn btn-outline btn-sm">
                            Cancel
                          </button>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
