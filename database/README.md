# HAK Store – MySQL database

The whole website reads and writes these tables on **Hostinger** (or any MySQL 8 / MariaDB 10.4+ server).

```
database/
├── migrations/
│   ├── 001_initial_schema.sql   ← the 16 store tables
│   └── 002_server_features.sql  ← photos (images), login sessions, order access keys
└── seeds/
    └── 001_default_data.sql     ← default categories, products, coupons, website content, staff accounts
```

The files were tested on MariaDB 10.11 in strict mode. They contain no `CREATE DATABASE`,
triggers, procedures or `DEFINER` lines, so phpMyAdmin on Hostinger's shared/business hosting accepts them.

## Setup: automatic (recommended)

1. **hPanel → Websites → your site → Databases → Management:** create a database with a user and a
   strong password. Hostinger adds a prefix, e.g. `u123456789_hakstore`.
2. Put the details in the app's `.env` file (copy `.env.example`) or in the Node.js app's
   **Environment variables** in hPanel: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
3. Start (or redeploy) the app.

When the app starts it connects, creates the `schema_migrations` table, runs every migration in
`database/migrations/` that hasn't run yet (in file-name order), and, **only if the `users` table is
empty**, loads `seeds/001_default_data.sql`. The server log shows each step
(`[database] applying migration ...`). Existing data is never replaced, so new migration files added
in later updates are applied safely on the next start.

Check the connection at `/api/health`.

## Setup: manual import in phpMyAdmin (optional)

Use this if the database user isn't allowed to create tables, or to restore a backup.

1. Click **Enter phpMyAdmin** next to the database in hPanel.
2. **Import** `migrations/001_initial_schema.sql`, then `migrations/002_server_features.sql`.
3. Import the data – choose **one**:
   - `seeds/001_default_data.sql` for a fresh store with the default products and content, **or**
   - a backup: **Dashboard → Backup → Download backup (.sql)**. It contains everything: products,
     photos, categories, coupons, orders, reviews, users, messages and website content.

> Importing a data file **replaces** the data in these tables. Take a phpMyAdmin export first if the
> database already has live data.

## Backups

- **Dashboard → Backup** (super admin) downloads the whole store as one `.sql` file (login sessions
  are not included).
- Hostinger also keeps automatic backups of databases (hPanel → **Backups**).

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
| `images` | Uploaded product photos and logos (served at `/api/images/<id>`) |
| `sessions` | Login sessions (SHA-256 hash of the cookie token, expiry) |
| `schema_migrations` | Which migration files have been applied |

## Accounts in the default data

| Role | Login | Password |
| --- | --- | --- |
| Super admin | `fahadshah6622@gmail.com` or username `fahad shah` | the password you chose |
| Admin | `kamisofts@gmail.com` | the password you chose |

Passwords are never stored. `password_hash` uses the format
`pbkdf2_sha256$<iterations>$<salt hex>$<hash hex>` (PBKDF2-HMAC-SHA256, 600,000 iterations, 32-byte key).
The app checks passwords in `src/lib/server/password.js`; another program can check them like this:

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

It is only used for a brand-new (empty) database. Changing the defaults in `src/data/` does not
change a store that is already running: edit live content in the dashboard instead.

## Common problems

| The site says | Fix |
| --- | --- |
| Database settings are missing | `DB_HOST`, `DB_NAME` or `DB_USER` is empty. Check `.env` / the environment variables, then restart. |
| The database username or password is wrong | Check `DB_USER` and `DB_PASSWORD`. Put the password in double quotes in `.env` if it contains `#`. |
| The database name was not found | `DB_NAME` must include Hostinger's prefix, e.g. `u123456789_hakstore`. |
| Could not reach the database server | Use `DB_HOST=localhost` on Hostinger. From your own computer, enable **Remote MySQL** and use its host name. |

## Hosting plan

The website is a Next.js (Node.js) app, so it needs a Hostinger plan that runs Node.js apps:
**Business Web Hosting**, the **Cloud** plans, or a **VPS**.
