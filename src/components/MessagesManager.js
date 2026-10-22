"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, useApiData } from "@/lib/api";
import { formatDate } from "@/lib/format";

// Contact form messages and newsletter subscribers (from MySQL).
export default function MessagesManager() {
  const { data, reload, loading, error } = useApiData("/api/admin/messages");
  const router = useRouter();
  const [view, setView] = useState("messages");
  const messages = data?.messages ?? [];
  const subscribers = data?.subscribers ?? [];
  const unread = messages.filter((m) => !m.read).length;

  async function change(method, body) {
    await api("/api/admin/messages", { method, body }).catch(() => {});
    reload();
    router.refresh(); // unread badge
  }

  function copyEmails() {
    navigator.clipboard?.writeText(subscribers.map((s) => s.email).join(", "));
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl">Messages</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => setView("messages")} className={`pill !px-3.5 !py-1.5 !text-xs ${view === "messages" ? "pill-active" : ""}`}>
            Contact messages ({messages.length}{unread ? `, ${unread} new` : ""})
          </button>
          <button type="button" onClick={() => setView("subscribers")} className={`pill !px-3.5 !py-1.5 !text-xs ${view === "subscribers" ? "pill-active" : ""}`}>
            Newsletter ({subscribers.length})
          </button>
        </div>
      </div>

      {error && <p className="mt-6 rounded-field bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      {loading && <p className="card mt-6 p-8 text-center text-grey-500">Loading...</p>}

      {!loading && view === "messages" && (
        messages.length === 0 ? (
          <p className="card mt-6 p-8 text-center text-grey-500">No messages yet. Messages from the Contact page appear here.</p>
        ) : (
          <ul className="mt-6 grid gap-3">
            {messages.map((m) => (
              <li key={m.id} className={`card p-5 ${m.read ? "" : "border-ink"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-extrabold">
                      {!m.read && <span className="mr-2 rounded-full bg-brand-500 px-2 py-0.5 text-[0.65rem]">NEW</span>}
                      {m.subject}
                    </p>
                    <p className="text-sm text-grey-500">
                      {m.name} ·{" "}
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="font-bold text-brand-700 hover:underline">
                        {m.email}
                      </a>{" "}
                      · {formatDate(m.createdAt, true)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => change("PATCH", { id: m.id, read: !m.read })} className="btn btn-outline btn-sm">
                      Mark as {m.read ? "unread" : "read"}
                    </button>
                    <button type="button" onClick={() => confirm("Delete this message?") && change("DELETE", { id: m.id })} className="btn btn-outline btn-sm">
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-grey-700">{m.message}</p>
              </li>
            ))}
          </ul>
        )
      )}

      {!loading && view === "subscribers" && (
        <div className="card mt-6 p-5">
          {subscribers.length === 0 ? (
            <p className="text-center text-grey-500">No subscribers yet.</p>
          ) : (
            <>
              <div className="mb-3 flex justify-end">
                <button type="button" onClick={copyEmails} className="btn btn-outline btn-sm">
                  Copy all emails
                </button>
              </div>
              <ul className="divide-y divide-grey-200 text-sm">
                {subscribers.map((s) => (
                  <li key={s.email} className="flex justify-between gap-3 py-2">
                    <span className="font-bold">{s.email}</span>
                    <span className="text-grey-500">{formatDate(s.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
