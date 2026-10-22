"use client";

import { Fragment, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/data/roles";
import { api, useApiData } from "@/lib/api";

const roleStyles = {
  superadmin: "bg-ink text-white",
  admin: "bg-brand-100 text-brand-700",
  customer: "bg-grey-100 text-grey-700",
};

// Super admin: add admins/customers, change roles, disable accounts, set passwords.
export default function UsersManager() {
  const { user } = useAuth();
  const { data, reload, error: loadError } = useApiData("/api/admin/users");
  const accounts = data?.users ?? [];
  const [adding, setAdding] = useState(false);
  const [passwordFor, setPasswordFor] = useState(null);
  const [message, setMessage] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  const show = (text, error = false) => setMessage({ text, error });
  const list = accounts.filter((a) => filter === "all" || (filter === "staff" ? a.role !== "customer" : a.role === "customer"));

  // Runs an API call and shows its result; returns true when it worked.
  async function run(action, done) {
    setBusy(true);
    try {
      await action();
      show(done);
      return true;
    } catch (err) {
      show(err.message, true);
      return false;
    } finally {
      setBusy(false);
      reload();
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const body = { name: form.get("name"), email: form.get("email"), password: form.get("password"), role: form.get("role") };
    const worked = await run(() => api("/api/admin/users", { method: "POST", body }), `${body.name} was added as ${ROLE_LABELS[body.role]}.`);
    if (worked) setAdding(false);
  }

  async function handlePassword(e, account) {
    e.preventDefault();
    const password = new FormData(e.target).get("password");
    const worked = await run(() => api(`/api/admin/users/${account.id}/password`, { method: "POST", body: { password } }), "Password updated.");
    if (worked) setPasswordFor(null);
  }

  function update(account, changes, done) {
    run(() => api(`/api/admin/users/${account.id}`, { method: "PATCH", body: changes }), done);
  }

  function remove(account) {
    if (!confirm(`Delete ${account.name} (${account.email})? Their past orders are kept.`)) return;
    run(() => api(`/api/admin/users/${account.id}`, { method: "DELETE" }), `${account.name} was deleted.`);
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

      {loadError && (
        <p role="alert" className="mt-6 rounded-field bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{loadError}</p>
      )}

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
                <Fragment key={a.id}>
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
                      {isSuper ? (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${roleStyles[a.role]}`}>
                          {ROLE_LABELS[a.role]}

                        </span>
                      ) : (
                        <select
                          value={a.role}
                          onChange={(e) => update(a, { role: e.target.value }, `${a.name} is now ${ROLE_LABELS[e.target.value]}.`)}
                          aria-label={`Role of ${a.name}`}
                          className="rounded-full border-[1.5px] border-grey-200 bg-white px-3 py-1.5 text-sm font-bold outline-none focus:border-ink"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-grey-500">{a.orders}</td>
                    <td className="px-4 py-3">
                      {isSuper ? (
                        <span className="text-xs font-bold text-brand-700">Active</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            update(
                              a,
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
                        <button type="button" onClick={() => setPasswordFor(passwordFor === a.id ? null : a.id)} className="mr-3 font-bold hover:text-brand-700 hover:underline">
                          Set password
                        </button>
                      )}
                      {!isSuper && (
                        <button type="button" onClick={() => remove(a)} className="font-bold text-red-600 hover:underline">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                  {passwordFor === a.id && (
                    <tr className="bg-grey-50">
                      <td colSpan={5} className="px-4 py-3">
                        <form onSubmit={(e) => handlePassword(e, a)} className="flex flex-wrap items-end gap-3">
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
