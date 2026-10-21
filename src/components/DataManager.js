"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCoupons } from "@/context/CouponsContext";
import { useOrders } from "@/context/OrdersContext";
import { useProducts } from "@/context/ProductsContext";
import { useReviews } from "@/context/ReviewsContext";
import { useSettings } from "@/context/SettingsContext";
import { blobToDataUrl, collectImageIds, dataUrlToBlob, getImageBlob, listImageIds, putImage } from "@/lib/imageStore";
import { buildSqlDump } from "@/lib/sqlExport";

// Everything the store keeps in this browser (the login session is left out on purpose).
const BACKUP_KEYS = ["products", "categories", "coupons", "orders", "reviews", "users", "accountOverrides", "siteSettings", "wishlist", "cart", "cartCoupon"];

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

async function imagesAsDataUrls(ids) {
  const out = {};
  for (const id of ids) {
    const blob = await getImageBlob(id);
    if (blob) out[id] = await blobToDataUrl(blob);
  }
  return out;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function DataManager() {
  const { exportAccounts } = useAuth();
  const { products, categories } = useProducts();
  const { coupons } = useCoupons();
  const { orders } = useOrders();
  const { reviews } = useReviews();
  const { settings } = useSettings();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState({ text: "", error: false });

  async function exportSql() {
    setBusy("sql");
    try {
      const images = await imagesAsDataUrls([...collectImageIds([products, settings])]);
      const sql = buildSqlDump({
        title: `${settings.general.storeName} – data export`,
        categories,
        products,
        coupons,
        orders,
        reviews,
        users: exportAccounts(),
        settings,
        images,
      });
      download(`hak-store-data-${today()}.sql`, sql, "application/sql");
      setMessage({ text: "SQL file downloaded. Import it in phpMyAdmin after the schema file (see database/README.md).", error: false });
    } catch (err) {
      setMessage({ text: `Export failed: ${err.message}`, error: true });
    }
    setBusy("");
  }

  async function backupJson() {
    setBusy("json");
    try {
      const data = {};
      for (const key of BACKUP_KEYS) {
        const raw = localStorage.getItem(key);
        if (raw !== null) data[key] = JSON.parse(raw);
      }
      const backup = { app: "hak-store", version: 1, createdAt: new Date().toISOString(), data, images: await imagesAsDataUrls(await listImageIds()) };
      download(`hak-store-backup-${today()}.json`, JSON.stringify(backup), "application/json");
      setMessage({ text: "Backup downloaded. Keep it private: it contains customer details and password hashes.", error: false });
    } catch (err) {
      setMessage({ text: `Backup failed: ${err.message}`, error: true });
    }
    setBusy("");
  }

  async function restore(file) {
    if (!file) return;
    setBusy("restore");
    try {
      const backup = JSON.parse(await file.text());
      if (backup.app !== "hak-store" || !backup.data) throw new Error("This is not a HAK Store backup file.");
      if (!confirm("Restore this backup? It replaces the store data in this browser (products, orders, settings, users…).")) {
        setBusy("");
        return;
      }
      for (const [id, dataUrl] of Object.entries(backup.images ?? {})) {
        if (id.startsWith("img-")) await putImage(id, await dataUrlToBlob(dataUrl));
      }
      for (const key of BACKUP_KEYS) {
        if (key in backup.data) localStorage.setItem(key, JSON.stringify(backup.data[key]));
        else localStorage.removeItem(key);
      }
      window.location.reload();
    } catch (err) {
      setMessage({ text: `Restore failed: ${err.message}`, error: true });
      setBusy("");
    }
  }

  const realOrders = orders.filter((o) => !o.demo).length;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl">Backup &amp; Export</h2>
        <p className="text-sm text-grey-500">
          Move your store to MySQL on Hostinger, or copy it to another browser or computer.
        </p>
      </div>

      {message.text && (
        <p role="status" className={`rounded-field px-4 py-3 text-sm font-bold ${message.error ? "bg-red-50 text-red-700" : "bg-brand-100 text-brand-700"}`}>
          {message.text}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="panel flex flex-col">
          <p className="text-3xl">🗄️</p>
          <h3 className="mt-2 text-lg">Export for MySQL</h3>
          <p className="mt-1 flex-1 text-sm text-grey-500">
            One .sql file with your {products.length} products, {categories.length} categories, {realOrders} orders, {reviews.length} reviews,
            coupons, users and all website content (photos included). Import it on Hostinger after the schema file.
          </p>
          <button type="button" onClick={exportSql} disabled={!!busy} className="btn btn-dark mt-4">
            {busy === "sql" ? "Preparing..." : "Download .sql"}
          </button>
        </section>

        <section className="panel flex flex-col">
          <p className="text-3xl">💾</p>
          <h3 className="mt-2 text-lg">Download backup</h3>
          <p className="mt-1 flex-1 text-sm text-grey-500">
            A complete copy of everything stored in this browser, including uploaded photos. Use it to restore later or on another device.
          </p>
          <button type="button" onClick={backupJson} disabled={!!busy} className="btn btn-outline mt-4">
            {busy === "json" ? "Preparing..." : "Download backup (.json)"}
          </button>
        </section>

        <section className="panel flex flex-col">
          <p className="text-3xl">♻️</p>
          <h3 className="mt-2 text-lg">Restore backup</h3>
          <p className="mt-1 flex-1 text-sm text-grey-500">
            Load a backup file into this browser. This replaces the current products, orders, settings and users here.
          </p>
          <label className={`btn btn-outline mt-4 ${busy ? "pointer-events-none opacity-60" : ""}`}>
            {busy === "restore" ? "Restoring..." : "Choose backup file"}
            <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => restore(e.target.files[0])} />
          </label>
        </section>
      </div>

      <div className="rounded-panel border-[1.5px] border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-extrabold">Why this matters</p>
        <p className="mt-1">
          Until the website is connected to a MySQL database, everything you change here is saved only in this browser.
          Download a backup regularly so you don&apos;t lose your work if browser data is cleared.
        </p>
      </div>
    </div>
  );
}
