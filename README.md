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

Edit `src/data/store.js`:
- `whatsapp`: your WhatsApp number (international format, digits only, e.g. `923001234567`)
- Bank, JazzCash and Easypaisa account details in `PAYMENT_METHODS`
- Store phone and email

> The policy pages (privacy, terms, returns) are starting templates. Review them, ideally with a
> legal advisor, before launching.

## Admin Account

Login at `/login` with the admin email `kamisofts@gmail.com` to open the Dashboard (`/dashboard`).
Only a SHA-256 hash of the admin password is stored in the code (`src/context/AuthContext.js`).

> **Important – demo only.** There is no backend yet, so accounts, the login session, orders, reviews,
> wishlists, coupons and admin catalog changes are all saved in the browser's `localStorage`:
> - Data is only visible in the browser where it was created. For example, the admin only sees orders
>   placed in their own browser, and product changes are not seen by other visitors.
> - The admin check runs in the browser, so a technical user could bypass it.
>
> Before going live, move products, users and login to a server with a database.

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
│   ├── order-confirmation/   # Order confirmation
│   ├── faqs/, privacy-policy/, terms/, return-policy/
│   └── not-found.js          # 404 page
├── components/               # Navbar, Footer, ProductCard, AdminDashboard, ...
├── context/
│   ├── AuthContext.js        # Login, registration, admin check
│   ├── CartContext.js        # Cart state
│   ├── OrdersContext.js      # Orders
│   └── ProductsContext.js    # Product listings (editable by admin)
├── lib/localStore.js         # localStorage-backed store helper
└── data/products.js          # Default product catalog
```

## Editing Products

The default products live in `src/data/products.js`. The admin can also add, edit and delete
products from `/admin`; "Reset to Default" restores the list from that file. Each product uses an
emoji on the brand green as a placeholder image; replace with real photos (via `next/image`) when ready.

## Next Steps

- Replace static data with a database (MongoDB / PostgreSQL) or a headless commerce API
- Add user accounts and authentication
- Integrate a payment gateway (e.g. Stripe, PayFast, JazzCash, Easypaisa)
- Save orders and add an admin dashboard
