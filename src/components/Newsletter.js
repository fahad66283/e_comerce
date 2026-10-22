"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function Newsletter({ title, text }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const formElement = e.target;
    try {
      await api("/api/newsletter", { method: "POST", body: { email: new FormData(formElement).get("email") } });
      formElement.reset();
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-between gap-6 rounded-panel bg-ink p-8 text-center text-white sm:p-10 md:flex-row md:text-left">
      <div>
        <h3 className="mb-1.5 text-xl text-white">{title}</h3>
        <p className="text-grey-400">{text}</p>
      </div>
      {done ? (
        <p className="font-bold text-brand-500">✓ Subscribed successfully!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap justify-center gap-2.5">
          <input
            name="email"
            type="email"
            required
            placeholder="Your email address"
            aria-label="Email address"
            className="min-w-[230px] rounded-full border-[1.5px] border-[#333] bg-[#161616] px-[18px] py-3 text-white outline-none placeholder:text-grey-500 focus:border-brand-500"
          />
          <button type="submit" className="btn btn-primary">
            Subscribe
          </button>
          {error && <p className="w-full text-sm font-bold text-amber-400">{error}</p>}
        </form>
      )}
    </div>
  );
}
