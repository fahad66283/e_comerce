"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const formElement = e.target;
    const form = new FormData(formElement);
    setBusy(true);
    try {
      // Saved in MySQL; admins read it in Dashboard → Messages.
      await api("/api/contact", {
        method: "POST",
        body: { name: form.get("name"), email: form.get("email"), subject: form.get("subject"), message: form.get("message") },
      });
      formElement.reset();
      setSent(true);
      setError("");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="panel">
      <div className="grid gap-x-3.5 gap-y-4 sm:grid-cols-2">
        <label>
          <span className="field-label">Full Name</span>
          <input required name="name" autoComplete="name" className="field-input" />
        </label>
        <label>
          <span className="field-label">Email</span>
          <input required type="email" name="email" autoComplete="email" className="field-input" />
        </label>
        <label className="sm:col-span-2">
          <span className="field-label">Subject</span>
          <input required name="subject" className="field-input" />
        </label>
        <label className="sm:col-span-2">
          <span className="field-label">Your Message</span>
          <textarea required name="message" rows={5} className="field-input" />
        </label>
      </div>
      <button type="submit" disabled={busy} className="btn btn-primary mt-5 w-full">
        {busy ? "Sending..." : "Send Message"}
      </button>
      {error && <p className="mt-3 text-[0.88rem] font-bold text-red-600">{error}</p>}
      {sent && (
        <p role="status" className="mt-3 text-[0.88rem] font-bold text-brand-700">
          ✓ Your message has been sent. We&apos;ll get back to you soon.
        </p>
      )}
    </form>
  );
}
