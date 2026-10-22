import "server-only";
import mysql from "mysql2/promise";
import { query } from "../db";

// Full data backup as SQL (all tables, photos included). Import it with phpMyAdmin
// after the migration files to restore the store on any MySQL/MariaDB server.
const TABLES = [
  "users", "categories", "products", "images", "product_images", "coupons", "orders", "order_items",
  "order_status_history", "reviews", "wishlists", "contact_messages", "newsletter_subscribers", "settings", "pages", "faqs",
];

const esc = (value) => (typeof value === "boolean" ? (value ? "1" : "0") : mysql.escape(value, false, "Z"));

export async function buildBackupSql(storeName) {
  const parts = [
    `-- ${storeName} – database backup`,
    `-- Created: ${new Date().toISOString()}`,
    "-- Restore: import database/migrations/*.sql first, then this file (phpMyAdmin → Import).",
    "-- This REPLACES the data in these tables.",
    "",
    "SET NAMES utf8mb4;",
    "SET time_zone = '+00:00';",
    "SET FOREIGN_KEY_CHECKS = 0;",
    "",
    ...[...TABLES].reverse().map((t) => `DELETE FROM \`${t}\`;`),
    "",
  ];
  for (const table of TABLES) {
    const rows = await query(`SELECT * FROM \`${table}\``);
    parts.push(`-- ${table}: ${rows.length} rows`);
    if (rows.length === 0) continue;
    const columns = Object.keys(rows[0]).map((c) => `\`${c}\``).join(", ");
    const perStatement = table === "images" ? 1 : 100; // keep each statement small
    for (let i = 0; i < rows.length; i += perStatement) {
      const values = rows.slice(i, i + perStatement).map((row) => `(${Object.values(row).map(esc).join(", ")})`);
      parts.push(`INSERT INTO \`${table}\` (${columns}) VALUES\n${values.join(",\n")};`);
    }
    parts.push("");
  }
  parts.push("SET FOREIGN_KEY_CHECKS = 1;", "");
  return parts.join("\n");
}
