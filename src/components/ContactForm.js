"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Static demo: no backend yet, so the message is not actually sent anywhere.
    e.target.reset();
    setSent(true);
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
      <button type="submit" className="btn btn-primary mt-5 w-full">
        Send Message
      </button>
      {sent && (
        <p role="status" className="mt-3 text-[0.88rem] font-bold text-brand-700">
          ✓ Your message has been sent. We&apos;ll get back to you soon.
        </p>
      )}
    </form>
  );
}
