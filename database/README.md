# HAK Store – MySQL database

These files create the HAK Store database on **Hostinger** (or any MySQL 8 / MariaDB 10.4+ server).

```
database/
├── migrations/
│   └── 001_initial_schema.sql   ← creates all 16 tables (run first)
└── seeds/
    └── 001_default_data.sql     ← default categories, products, coupons, website content, staff accounts
```

Both files were tested on MariaDB 10.11 in strict mode. They contain no `CREATE DATABASE`,
triggers, procedures or `DEFINER` lines, so phpMyAdmin on Hostinger's shared/business hosting accepts them.

## Import on Hostinger (step by step)

1. Log in to **hPanel** → **Websites** → your site → **Databases** → **Management**.
2. Create a database: choose a name, user and a strong password. Note them down
   (Hostinger adds a prefix, e.g. `u123456789_hakstore`).
3. Click **Enter phpMyAdmin** next to the new database.
4. Go to **Import** → choose `database/migrations/001_initial_schema.sql` → **Import**.
5. Import the data – choose **one**:
   - `database/seeds/001_default_data.sql` for a fresh store with the default products and content, **or**
   - your own export: log in as super admin → **Dashboard → Backup → Download .sql**, then import that file.
     It contains everything you set up in the browser: products (with photos), categories, coupons,
     orders, reviews, users and all website content.

> Importing a data file **replaces** the data in these tables. Take a phpMyAdmin export first if the
> database already has live data.

## Tables

| Table | What it stores |
| --- | --- |
| `users` | Super admin, admins and customers (`role`, `status`, `password_hash`) |
| `categories` | Product categories (name, slug, icon, description) |
| `products` | Products, price, sale price (`compare_at_price`), stock, featured/new flags |
| `product_images` | Up to 5 photos per product (`sort_order` 0 = main photo) |
| `coupons` | Discount codes (percent or fixed, minimum order, active) |
| `orders` | Orders incl. guest checkout, totals, coupon, status, payment method/status/transaction ID |
| `order_items` | Items in each order (name and price copied at the time of purchase) |
| `order_status_history` | Every status change, for order tracking |
| `reviews` | Product reviews and ratings (verified buyer flag) |
| `wishlists` | Saved products per user |
| `contact_messages` | Contact form messages |
| `newsletter_subscribers` | Newsletter emails |
| `settings` | Website content and store settings, one JSON document per section |
| `pages` | Privacy Policy, Terms & Conditions, Return Policy |
| `faqs` | FAQ questions and answers |
| `schema_migrations` | Which migration files have been applied |

## Accounts in the default data

| Role | Login | Password |
| --- | --- | --- |
| Super admin | `fahadshah6622@gmail.com` or username `fahad shah` | the password you chose |
| Admin | `kamisofts@gmail.com` | the password you chose |

Passwords are never stored. `password_hash` uses the format
`pbkdf2_sha256$<iterations>$<salt hex>$<hash hex>` (PBKDF2-HMAC-SHA256, 600,000 iterations, 32-byte key).
A server checks a password like this:

```php
// PHP
[$scheme, $iterations, $salt, $hash] = explode('$', $row['password_hash']);
$ok = hash_equals($hash, hash_pbkdf2('sha256', $password, hex2bin($salt), (int) $iterations, 64));
```

```js
// Node.js
const [, iterations, salt, hash] = row.password_hash.split("$");
const derived = crypto.pbkdf2Sync(password, Buffer.from(salt, "hex"), Number(iterations), 32, "sha256");
const ok = crypto.timingSafeEqual(derived, Buffer.from(hash, "hex"));
```

**Change the default passwords after the first login**, and keep this repository private.

## Regenerating the seed file

The seed file is generated from the same default data the website uses:

```bash
npm run db:seed   # needs Node.js 22+
```

## Important: the website is not connected to MySQL yet

Right now the website saves everything in each visitor's browser (localStorage/IndexedDB). These SQL
files prepare the database; the next step is a server layer (Next.js API routes using `mysql2`) that
reads and writes these tables, so every visitor sees the same products, orders and content.

On Hostinger that needs a plan that can run Node.js apps: **Business Web Hosting**, the **Cloud** plans,
or a **VPS**. Plans without Node.js can still host the database, but not this Next.js server.
