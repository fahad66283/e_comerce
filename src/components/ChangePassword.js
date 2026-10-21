"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    if (form.get("next") !== form.get("confirm")) {
      setMessage({ text: "The new passwords do not match.", error: true });
      return;
    }
    setBusy(true);
    const result = await changePassword(form.get("current"), form.get("next"));
    setBusy(false);
    if (result.error) {
      setMessage({ text: result.error, error: true });
      return;
    }
    e.target.reset();
    setOpen(false);
    setMessage({ text: "✓ Your password was changed.", error: false });
  }

  return (
    <section className="panel">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[1.05rem]">Password</h3>
        {!open && (
          <button type="button" onClick={() => setOpen(true)} className="text-sm font-extrabold text-brand-700 hover:underline">
            Change
          </button>
        )}
      </div>
      {message.text && (
        <p role="status" className={`mt-2 text-sm font-bold ${message.error ? "text-red-600" : "text-brand-700"}`}>
          {message.text}
        </p>
      )}
      {open && (
        <form onSubmit={handleSubmit} className="mt-3 grid gap-3">
          <label>
            <span className="field-label">Current password</span>
            <input required type="password" name="current" autoComplete="current-password" className="field-input" />
          </label>
          <label>
            <span className="field-label">New password</span>
            <input required type="password" name="next" minLength={6} autoComplete="new-password" className="field-input" />
          </label>
          <label>
            <span className="field-label">Confirm new password</span>
            <input required type="password" name="confirm" minLength={6} autoComplete="new-password" className="field-input" />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
              {busy ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setMessage({ text: "", error: false });
              }}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
