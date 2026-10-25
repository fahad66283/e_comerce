# HAK Store – E-commerce Store

An e-commerce web application built with **React**, **Next.js** (App Router) and **Tailwind CSS**, with all
data (products, orders, accounts, reviews, photos and website content) stored in a **MySQL** database.

## Quick Start

1. Create a MySQL database (on Hostinger: **hPanel → Databases → Management**).
2. Copy `.env.example` to a new file named **`.env`** (next to `package.json`) and fill in your database details:

   ```ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=u123456789_hakstore
   DB_USER=u123456789_hak
   DB_PASSWORD="your database password"
   ```

   Keep the double quotes around the password (needed when it contains `#` or spaces).
3. Install and start:

   ```bash
   npm install
   npm run build
   npm start
   ```

On the first start the app **creates all tables and loads the default data automatically**: no phpMyAdmin
import needed. Open `/api/health` to check the connection (`{"ok":true,"database":"connected",...}`).
If something is wrong, the site shows what to fix (missing settings, wrong password, unknown database...).

> `.env` holds your database password, so it is **never committed to git** (it's in `.gitignore`).
> Only `.env.example`, without real values, is in the repository.

## Theme

- Black and green brand colours with the **Tajawal** font, defined as design tokens in `src/app/globals.css`
  (`ink`, `brand-*`, `grey-*`) together with shared classes such as `btn`, `btn-primary`, `panel` and `field-input`.
- Logo files: `public/logo.svg` (light backgrounds), `public/logo-light.svg` (dark backgrounds) and
  `src/app/icon.svg` (browser tab icon), all converted from `HAK_logo.pdf`.

## Pages

| Page | Route |
| --- | --- |
| Home | `/` |
| Shop (filter, search, sort) | `/products` |
| Categories | `/categories` |
| Product details | `/products/[id]` |
| Cart | `/cart` |
| Checkout | `/checkout` |
| Order confirmation | `/order-confirmation?id=...` |
| Order tracking | `/track-order` |
| Wishlist | `/wishlist` |
| Login / Sign up | `/login`, `/signup` |
| My Account (profile + order history) | `/account` |
| Admin Dashboard (overview, orders, products, customers, messages...) | `/dashboard` |
| About Us / Contact Us | `/about`, `/contact` |
| FAQs | `/faqs` |
| Privacy Policy / Terms & Conditions | `/privacy-policy`, `/terms` |
| Return Policy | `/return-policy` |

Old addresses `/admin` and `/register` redirect to `/dashboard` and `/signup`.

## Features

**Storefront**
- **Search** with live suggestions in the header (name, category and description); full results on the shop page
- **Wishlist**: ♡ on every product, `/wishlist` page and a header counter
- **Reviews & ratings**: star reviews on product pages, rating breakdown, "Verified buyer" badge
- **Guest checkout**: no account needed; logged-in customers get their details filled in
- **Payments**: Cash on Delivery, Bank Transfer, JazzCash and Easypaisa (customer enters the transaction ID,
  admin verifies and marks it paid), and **credit/debit cards with Stripe** (see below)
- **Google Map** of your shop on the About Us page, editable by the super admin
- **Unique order IDs** like `HAK-261021-7K3Q` (date + random code)
- **Order tracking** at `/track-order` with order ID + email or phone, and a status timeline
- **Discounts**: sale prices per product ("Original price") and coupon codes (e.g. `WELCOME10`, `SAVE500`)
- **WhatsApp** floating chat button and "Order on WhatsApp" on product pages
- Mobile responsive on every page

**Admin dashboard (`/dashboard`)**
- Overview with notifications: out-of-stock and low-stock products (≤ 5), new orders, payments to verify
- Orders: search, filter by status, update order status and payment status, view details and history
- Products: add, edit, delete, search, filter (low stock, out of stock, featured, new, on sale),
  one-click Featured / New toggles, sale prices
- Categories: add, rename (moves its products), edit and delete (blocked while it has products)
- Coupons: create percentage or fixed coupons with a minimum order, switch on/off, see usage
- Reviews: view and delete customer reviews
- Customers: registered and guest customers with order count and total spent
- Messages: contact form messages (mark as read, delete), with a counter in the header
- Reports: revenue, orders, average order value, items sold, discounts, revenue-per-day chart,
  top products, sales by category, orders by status, payment methods, date ranges and CSV export

## Settings to change before launch

Log in as super admin → **Dashboard → Settings**:
- **Contact & WhatsApp:** your WhatsApp number (international format, digits only, e.g. `923001234567`), phone, email, address
- **Payment Methods:** your bank, JazzCash and Easypaisa account details

And **Dashboard → Website → About Us** → map address / exact location of your shop.

> The policy pages (privacy, terms, returns) are starting templates. Review them, ideally with a
> legal advisor, before launching.

## Staff Accounts & Roles

| Role | Login | Can do |
| --- | --- | --- |
| **Super admin** | `fahadshah6622@gmail.com` or username `fahad shah` | Everything: store management **plus** editing the whole website, store settings, users and backups |
| **Admin** | `kamisofts@gmail.com` (or admins the super admin adds) | Orders, products, categories, coupons, reviews, customers, reports |
| **Customer** | Signs up at `/signup` | Shopping, wishlist, reviews, order history |

Passwords are stored in the `users` table only as salted PBKDF2-SHA256 hashes (`src/lib/server/password.js`).
Change passwords from **My Account → Password**; the super admin can reset any user's password in **Dashboard → Users**.

**Security**
- Logins are checked on the server. The session is a random token in an `httpOnly` cookie (30 days);
  only its SHA-256 hash is saved in the `sessions` table. Logging out deletes it.
- Every admin action is checked on the server (`requireStaff` / `requireSuperAdmin` in `src/lib/server/api.js`).
- Prices, stock, coupons and shipping are recalculated on the server when an order is placed, so they
  can't be changed in the browser. Stock is reserved inside a database transaction.
- Login, sign-up, contact, reviews and order tracking are rate-limited.
- An order's details can be opened only with the secret link from checkout, by the customer's account,
  by staff, or on **Track Order** with the order ID + email/phone.

**What stays in the browser:** the shopping cart and a guest's wishlist (until they log in, when the
wishlist and any guest orders placed in that browser are added to their account).

## Super Admin: Edit the Whole Website

**Dashboard → Website** (content) and **Dashboard → Settings** (store settings):

- **Branding:** store name, tagline, logo upload (header + footer), brand and dark colours
- **Announcement bar**, **Home page** (hero, sections, promo cards, features, newsletter),
  **Shop & Categories** headings, **Product page** highlights, **About Us** (incl. the Google Map), **FAQs**,
  **Privacy Policy**, **Terms & Conditions**, **Return Policy**, **Footer** (text + social links)
- **Contact & WhatsApp**, **Shipping** (fee, free-shipping threshold), **Payment methods**
  (switch on/off, account details, card payments), **Stock alerts** (low-stock threshold)

Long text supports `**bold**`, `[links](/page)` and `- ` bullets. Write `{storeName}` to insert the store name.
Default content lives in `src/data/siteContent.js`.

**Dashboard → Users:** add admins or customers, change roles, disable accounts, set passwords.
**Dashboard → Backup:** download the whole database as a `.sql` file (restore it in phpMyAdmin), and copy
data saved in a browser by the old browser-only version of the site into MySQL.

## Google Map (About Us)

**Dashboard → Website → About Us** has the map settings, and changes are live straight away:

- **Show Google Map** – switch the map on or off
- **Map heading** and **Address** (shown under the map, and used for the map when no exact location is set)
- **Exact map location** (optional) – one of:
  - coordinates, e.g. `31.5204, 74.3587` (in Google Maps, right-click your shop to copy them)
  - the embed code: Google Maps → your place → **Share → Embed a map → Copy HTML**, then paste it as it is
  - a `google.com/maps/place/...` link

No Google API key is needed. Only google.com map addresses are ever shown, whatever is pasted.

## Card Payments (Stripe)

Customers can pay by credit/debit card on Stripe's secure payment page (Stripe Checkout). Card details
never touch this website.

**Set up**
1. Create an account at [stripe.com](https://stripe.com) (Stripe must support the country your
   business is registered in).
2. **Stripe Dashboard → Developers → API keys:** copy the **Secret key** into `.env` (or Hostinger's
   environment variables) as `STRIPE_SECRET_KEY`. Start with the test key (`sk_test_...`) and switch to
   the live key (`sk_live_...`) when you're ready. The publishable key isn't needed.
3. **Developers → Webhooks → Add endpoint:** `https://your-domain.com/api/stripe/webhook` with the events
   `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`
   and `checkout.session.async_payment_failed`. Copy its **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
4. Set `SITE_URL=https://your-domain.com` and, if your prices aren't in Pakistani rupees, `STRIPE_CURRENCY`
   (default `pkr`; amounts are charged as they are, not converted).
5. Restart / redeploy. **Card payments now show at checkout.** **Dashboard → Settings → Payment Methods**
   shows whether Stripe is connected (and in test mode), and lets you switch cards off or rename them.

**How it works**
- The order is saved first (stock reserved, payment *Pending*), then the customer is sent to Stripe for the
  order total (one line: products, discount and shipping included).
- After paying, the confirmation page checks the payment with Stripe and marks the order **Paid**, with the
  Stripe payment ID on the order. The webhook does the same even if the customer closes the page.
- If the customer cancels on Stripe's page, the order is cancelled, the stock is put back and their cart is
  still there. Unpaid payment pages expire after 1 hour and the order is cancelled the same way.
- Opening **Dashboard → Orders** also checks recent unpaid card orders with Stripe, in case a webhook was missed.
- Refunds: make them in the Stripe Dashboard, then set the order's payment status to *Refunded*.

Test it with Stripe's test card `4242 4242 4242 4242`, any future date and any CVC.

## Product Photos

Each product can have **up to 5 photos** (Dashboard → Products → Add/Edit). Photos are resized in the
browser (max 1200px, JPEG/PNG/WebP), stored in the MySQL `images` table and served from `/api/images/<id>`
with long-term caching. The first photo is the main image; products without photos show their emoji.
Logos uploaded in **Website → Branding** work the same way.

## Deploying on Hostinger

The site needs a plan that runs **Node.js web apps** (Business Web Hosting, Cloud plans or a VPS).

1. **hPanel → Databases → Management:** create the database and user. Note the full names
   (with the `u123456789_` prefix) and the password.
2. On your computer, copy `.env.example` to `.env` and fill in those details (`DB_HOST=localhost`
   when the database is on the same Hostinger account).
3. Open your Node.js web app's deployment settings (or **Environment variables** in the website
   dashboard), choose to **import a `.env` file** and pick your `.env`, or add the five
   `DB_...` variables (and the `STRIPE_...` / `SITE_URL` ones for card payments) one by one.
   Hostinger keeps them for every later deploy.
4. Deploy (build command `npm run build`, start command `npm start`), then open
   `https://your-domain/api/health`. The first visit creates the tables and default data.
5. Log in as the super admin and **change the default passwords** (My Account → Password).

**Working on your computer with the Hostinger database:** in hPanel → Databases → **Remote MySQL**,
allow your IP address, and use the host name shown there as `DB_HOST` in your local `.env`.

More about the tables, migrations and manual phpMyAdmin import: **[`database/README.md`](database/README.md)**.

## Commands

```bash
npm run dev     # development server on http://localhost:3000 (needs .env)
npm run build   # production build
npm start       # run the production build
npm run lint    # lint the code
npm run db:seed # regenerate database/seeds/001_default_data.sql from src/data
```

## Project Structure

```
src/
├── app/
│   ├── layout.js             # Root layout (navbar, footer, cart provider)
│   ├── page.js               # Home page
│   ├── products/page.js      # Shop (all products)
│   ├── products/[id]/page.js # Product detail
│   ├── cart/page.js          # Cart
│   ├── checkout/page.js      # Checkout
│   ├── about/page.js         # About Us
│   ├── contact/page.js       # Contact Us
│   ├── login/page.js         # Login
│   ├── signup/page.js        # Sign up
│   ├── dashboard/page.js     # Admin dashboard
│   ├── account/page.js       # My Account
│   ├── categories/page.js    # Categories
│   ├── wishlist/, track-order/ # Wishlist, order tracking
│   ├── order-confirmation/   # Order confirmation
│   ├── faqs/, privacy-policy/, terms/, return-policy/
│   ├── api/                  # Server API (auth, orders, reviews, admin/..., images, health)
│   └── not-found.js          # 404 page
├── components/               # Navbar, Footer, ProductCard, AdminDashboard, StoreShell, ...
├── context/                  # Settings, Auth, Products, Cart, Wishlist, Reviews (data comes from MySQL)
├── lib/
│   ├── server/
│   │   ├── db.js             # MySQL connection pool, automatic migrations + default data
│   │   ├── auth.js           # Sessions (httpOnly cookie) and the logged-in user
│   │   ├── api.js            # API helpers: errors, validation, role checks
│   │   ├── password.js       # PBKDF2 password hashing
│   │   ├── storeData.js      # Data loaded for every page
│   │   └── store/            # Database queries: catalog, orders, users, settings, images, ...
│   ├── api.js                # Browser helper for calling the API
│   ├── imageStore.js         # Photo resizing before upload
│   └── sqlExport.js          # SQL generator used by npm run db:seed
└── data/                     # Default products, website content and staff accounts (used for the seed)
database/                     # MySQL migrations, seed and guide
scripts/generate-seed.mjs     # Regenerates database/seeds/001_default_data.sql
.env.example                  # Template for your .env database settings
```

## Editing Products

Admins add, edit and delete products (with up to 5 photos each) from **Dashboard → Products**; changes
are saved in MySQL and visible to every visitor immediately. "Reset to Default" restores the default
products from `src/data/products.js` (orders keep their item names and prices).

## Next Steps

- Automatic JazzCash / Easypaisa payments (their merchant APIs)
- Send order confirmation and status emails
- Email verification and "forgot password" for customers
