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
| Login / Sign up | `/login`, `/signup` |
| My Account (profile + order history) | `/account` |
| Admin Dashboard (overview, orders, products, customers) | `/dashboard` |
| About Us / Contact Us | `/about`, `/contact` |
| FAQs | `/faqs` |
| Privacy Policy / Terms & Conditions | `/privacy-policy`, `/terms` |
| Return Policy | `/return-policy` |

Old addresses `/admin` and `/register` redirect to `/dashboard` and `/signup`.

## Features

- Cart saved in the browser, with free-shipping logic (free over Rs. 5,000, otherwise Rs. 250)
- Checkout saves the order, reduces product stock and opens an order confirmation page
- Customers can sign up, log in and see their orders (including guest orders with the same email)
- Admin dashboard: sales overview, low-stock list, order status updates (Processing, Shipped,
  Delivered, Cancelled), product management and a customer list
- Contact form and newsletter sign-up are demos (nothing is sent yet)
- Responsive layout with mobile menu

> The policy pages (privacy, terms, returns) are starting templates. Review them, ideally with a
> legal advisor, before launching.

## Admin Account

Login at `/login` with the admin email `kamisofts@gmail.com` to open the Dashboard (`/dashboard`).
Only a SHA-256 hash of the admin password is stored in the code (`src/context/AuthContext.js`).

> **Important – demo only.** There is no backend yet, so accounts, the login session, orders and admin
> product changes are all saved in the browser's `localStorage`:
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
