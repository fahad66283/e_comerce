"use client";

import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Static demo: no backend yet, so the message is not actually sent anywhere.
    e.target.reset();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-5xl">✅</p>
        <h2 className="mt-4 text-2xl font-bold">Thanks for reaching out!</h2>
        <p className="mt-2 text-gray-600">We&apos;ll get back to you within 24 hours.</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-indigo-600 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">Send us a message</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium text-gray-700">Name</span>
          <input required name="name" autoComplete="name" className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input required type="email" name="email" autoComplete="email" className={inputClass} />
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium text-gray-700">Subject</span>
          <input required name="subject" className={inputClass} />
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium text-gray-700">Message</span>
          <textarea required name="message" rows={5} className={inputClass} />
        </label>
      </div>
      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700"
      >
        Send Message
      </button>
    </form>
  );
}
