# HAK Store – E-commerce Store

A static e-commerce web application built with **React**, **Next.js** (App Router) and **Tailwind CSS**.

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
| Admin Dashboard (overview, orders, products, customers) | `/dashboard` |
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
  admin verifies and marks it paid). Card payments need an online payment gateway and a backend.
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
- Reports: revenue, orders, average order value, items sold, discounts, revenue-per-day chart,
  top products, sales by category, orders by status, payment methods, date ranges and CSV export

## Settings to change before launch

Log in as super admin → **Dashboard → Settings**:
- **Contact & WhatsApp:** your WhatsApp number (international format, digits only, e.g. `923001234567`), phone, email, address
- **Payment Methods:** your bank, JazzCash and Easypaisa account details

> The policy pages (privacy, terms, returns) are starting templates. Review them, ideally with a
> legal advisor, before launching.

## Staff Accounts & Roles

| Role | Login | Can do |
| --- | --- | --- |
| **Super admin** | `fahadshah6622@gmail.com` or username `fahad shah` | Everything: store management **plus** editing the whole website, store settings, users and backups |
| **Admin** | `kamisofts@gmail.com` (or admins the super admin adds) | Orders, products, categories, coupons, reviews, customers, reports |
| **Customer** | Signs up at `/signup` | Shopping, wishlist, reviews, order history |

Passwords are stored only as salted PBKDF2-SHA256 hashes (`src/lib/password.js`, `src/data/accounts.js`).
Change passwords from **My Account → Password**; the super admin can reset any user's password in **Dashboard → Users**.

> **Important – demo only.** There is no backend yet, so accounts, orders, reviews, settings and uploaded
> photos are saved in each browser (localStorage + IndexedDB):
> - Data is only visible in the browser where it was created. Use **Dashboard → Backup** to copy it.
> - The role checks run in the browser, so a technical user could bypass them.
>
> Before going live, connect the site to the MySQL database in `database/` with a server layer.

## Super Admin: Edit the Whole Website

**Dashboard → Website** (content) and **Dashboard → Settings** (store settings):

- **Branding:** store name, tagline, logo upload (header + footer), brand and dark colours
- **Announcement bar**, **Home page** (hero, sections, promo cards, features, newsletter),
  **Shop & Categories** headings, **Product page** highlights, **About Us**, **FAQs**,
  **Privacy Policy**, **Terms & Conditions**, **Return Policy**, **Footer** (text + social links)
- **Contact & WhatsApp**, **Shipping** (fee, free-shipping threshold), **Payment methods**
  (switch on/off, account details), **Stock alerts** (low-stock threshold)

Long text supports `**bold**`, `[links](/page)` and `- ` bullets. Write `{storeName}` to insert the store name.
Default content lives in `src/data/siteContent.js`.

**Dashboard → Users:** add admins or customers, change roles, disable accounts, set passwords.
**Dashboard → Backup:** download/restore a full backup, or export everything as a `.sql` file for MySQL.

## Product Photos

Each product can have **up to 5 photos** (Dashboard → Products → Add/Edit). Photos are resized in the
browser (max 1200px) and stored in IndexedDB; the first photo is the main image. Products without photos
show their emoji.

## MySQL Database (Hostinger)

See **[`database/README.md`](database/README.md)**: migration `001_initial_schema.sql` (16 tables),
seed `001_default_data.sql`, Hostinger phpMyAdmin import steps, and how to verify password hashes on a server.
Regenerate the seed with `npm run db:seed`.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build   # production build
npm start       # run the production build
npm run lint    # lint the code
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
│   └── not-found.js          # 404 page
├── components/               # Navbar, Footer, ProductCard, AdminDashboard, ...
├── context/
│   ├── AuthContext.js        # Login, registration, admin check
│   ├── CartContext.js        # Cart state
│   ├── OrdersContext.js      # Orders
│   └── ProductsContext.js    # Product listings (editable by admin)
├── lib/
│   ├── localStore.js         # localStorage-backed store helper
│   ├── imageStore.js         # Photo uploads (IndexedDB, resizing)
│   ├── password.js           # PBKDF2 password hashing
│   └── sqlExport.js          # MySQL export (dashboard + seed generator)
└── data/
    ├── products.js           # Default products, categories, coupons
    ├── siteContent.js        # Default editable website content & settings
    └── accounts.js           # Built-in super admin / admin accounts
database/                     # MySQL schema, seed and Hostinger guide
scripts/generate-seed.mjs     # Regenerates database/seeds/001_default_data.sql
```

## Editing Products

The default products live in `src/data/products.js`. Admins add, edit and delete products (with up to
5 photos each) from **Dashboard → Products**; "Reset to Default" restores the list from that file.

## Next Steps

- Connect the website to the MySQL database (`database/`) with Next.js API routes, so every visitor
  shares the same products, orders, accounts and content (needs Node.js hosting, e.g. Hostinger
  Business/Cloud or a VPS)
- Move login to the server with secure session cookies
- Store uploaded photos as files on the server
- Add an online payment gateway (e.g. JazzCash, Easypaisa, PayFast) and order emails
