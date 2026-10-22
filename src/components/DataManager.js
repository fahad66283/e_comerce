"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { api } from "@/lib/api";
import { readLegacyImages } from "@/lib/imageStore";

// Data saved in the browser by the old (browser-only) version of the site.
const LEGACY_KEYS = ["products", "categories", "coupons", "orders", "reviews", "users", "accountOverrides", "siteSettings"];

function readLegacyData() {
  const data = {};
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) data[key] = JSON.parse(raw);
    } catch {
      // ignore unreadable entries
    }
  }
  return data;
}

const noopSubscribe = () => () => {};
const hasLegacyData = () => LEGACY_KEYS.some((key) => localStorage.getItem(key) !== null);

export default function DataManager() {
  const router = useRouter();
  const legacy = useSyncExternalStore(noopSubscribe, hasLegacyData, () => false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  async function importLegacy() {
    if (!confirm("Copy the products, orders, users, reviews, coupons and website content saved in this browser into the MySQL database?")) return;
    setBusy(true);
    try {
      const data = readLegacyData();
      data.images = await readLegacyImages();
      const { imported } = await api("/api/admin/import", { method: "POST", body: data });
      const summary = Object.entries(imported)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${n} ${k}`)
        .join(", ");
      setMessage({ text: `✓ Imported ${summary || "nothing new"}. You can now clear this browser's old data.`, error: false });
      router.refresh();
    } catch (err) {
      setMessage({ text: `Import failed: ${err.message}`, error: true });
    }
    setBusy(false);
  }

  function clearLegacy() {
    if (!confirm("Remove the old store data from this browser? (The MySQL database is not affected.)")) return;
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    indexedDB.deleteDatabase("hak-store");
    window.location.reload();
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl">Backup &amp; Data</h2>
        <p className="text-sm text-grey-500">Everything on the website is stored in your MySQL database.</p>
      </div>

      {message.text && (
        <p role="status" className={`rounded-field px-4 py-3 text-sm font-bold ${message.error ? "bg-red-50 text-red-700" : "bg-brand-100 text-brand-700"}`}>
          {message.text}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel flex flex-col">
          <p className="text-3xl">🗄️</p>
          <h3 className="mt-2 text-lg">Download database backup</h3>
          <p className="mt-1 flex-1 text-sm text-grey-500">
            A complete .sql copy of your store: products, photos, orders, customers, coupons, reviews, messages and website content.
            Restore it in phpMyAdmin (after the files in <code>database/migrations</code>). Keep it private.
          </p>
          <a href="/api/admin/backup" className="btn btn-dark mt-4">
            Download backup (.sql)
          </a>
        </section>

        <section className="panel flex flex-col">
          <p className="text-3xl">💡</p>
          <h3 className="mt-2 text-lg">Automatic backups on Hostinger</h3>
          <p className="mt-1 flex-1 text-sm text-grey-500">
            Hostinger also backs up your database. In hPanel open <strong>Files → Backups</strong> (or Databases → phpMyAdmin → Export)
            to download or restore a copy at any time.
          </p>
        </section>
      </div>

      {legacy && (
        <section className="rounded-panel border-[1.5px] border-amber-200 bg-amber-50 p-6">
          <h3 className="text-lg">Old data found in this browser</h3>
          <p className="mt-1 text-sm text-amber-900">
            This browser still has store data from the earlier browser-only version of the website (products, orders, users, photos
            or website content you set up before MySQL). Copy it into the database once, then clear it.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={importLegacy} disabled={busy} className="btn btn-dark">
              {busy ? "Importing..." : "Import into MySQL"}
            </button>
            <button type="button" onClick={clearLegacy} disabled={busy} className="btn btn-outline">
              Clear old browser data
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
