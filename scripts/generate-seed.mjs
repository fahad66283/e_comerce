// Regenerates database/seeds/001_default_data.sql from the website's default data.
// Usage: npm run db:seed   (Node.js 22+)
import { writeFileSync } from "node:fs";
import { BUILT_IN_ACCOUNTS } from "../src/data/accounts.js";
import { defaultCategories, defaultCoupons, products } from "../src/data/products.js";
import { defaultSettings } from "../src/data/siteContent.js";
import { buildSqlDump } from "../src/lib/sqlExport.js";

const sql = buildSqlDump({
  title: "HAK Store – default data (categories, products, coupons, website content, staff accounts)",
  categories: defaultCategories,
  products,
  coupons: defaultCoupons,
  users: BUILT_IN_ACCOUNTS,
  // Keeps {storeName} placeholders; the website fills in the current store name.
  settings: defaultSettings,
});

const out = new URL("../database/seeds/001_default_data.sql", import.meta.url);
writeFileSync(out, sql);
console.log(`Wrote ${out.pathname} (${(sql.length / 1024).toFixed(1)} KB)`);
