# HAK Store – E-commerce Store

A static e-commerce web application built with **React**, **Next.js** (App Router) and **Tailwind CSS**.

## Theme

- Black and green brand colours with the **Tajawal** font, defined as design tokens in `src/app/globals.css`
  (`ink`, `brand-*`, `grey-*`) together with shared classes such as `btn`, `btn-primary`, `panel` and `field-input`.
- Logo files: `public/logo.svg` (light backgrounds), `public/logo-light.svg` (dark backgrounds) and
  `src/app/icon.svg` (browser tab icon), all converted from `HAK_logo.pdf`.

## Features

- Home page with hero, category tiles, popular products, new arrivals, promos and newsletter sign-up
- Shop page with category filter, search (also from the header search box) and sorting
- Product detail pages (statically generated) with quantity selector and related products
- Shopping cart saved in the browser (`localStorage`), with quantity controls and free-shipping logic
- Checkout form with Cash on Delivery (demo order confirmation, no backend yet)
- About Us and Contact Us pages (contact form is a demo, messages are not sent yet)
- Login and registration for customers
- Admin dashboard (`/admin`) to add, edit and delete product listings
- Responsive layout with mobile menu

## Admin Account

Login at `/login` with the admin email `kamisofts@gmail.com` to open the Admin Dashboard.
Only a SHA-256 hash of the admin password is stored in the code (`src/context/AuthContext.js`).

> **Important – demo only.** There is no backend yet, so accounts, the login session and admin
> product changes are all saved in the browser's `localStorage`:
> - Admin changes are only visible in the browser where they were made, not to other visitors.
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
│   ├── register/page.js      # Registration
│   ├── admin/page.js         # Admin dashboard (manage products)
│   └── not-found.js          # 404 page
├── components/               # Navbar, Footer, ProductCard, AdminDashboard, ...
├── context/
│   ├── AuthContext.js        # Login, registration, admin check
│   ├── CartContext.js        # Cart state
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
