# ShopEase – E-commerce Store

A static e-commerce web application built with **React**, **Next.js** (App Router) and **Tailwind CSS**.

## Features

- Home page with hero, categories and featured products
- Shop page with category filter, search and sorting
- Product detail pages (statically generated) with quantity selector and related products
- Shopping cart saved in the browser (`localStorage`), with quantity controls and free-shipping logic
- Checkout form with Cash on Delivery (demo order confirmation, no backend yet)
- Responsive layout with mobile menu

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
│   └── not-found.js          # 404 page
├── components/               # Navbar, Footer, ProductCard, ProductList, ...
├── context/CartContext.js    # Cart state (localStorage)
└── data/products.js          # Static product catalog
```

## Editing Products

All products live in `src/data/products.js`. Add, remove or edit entries there. Each product uses an
emoji and gradient as a placeholder image; replace with real photos (via `next/image`) when ready.

## Next Steps

- Replace static data with a database (MongoDB / PostgreSQL) or a headless commerce API
- Add user accounts and authentication
- Integrate a payment gateway (e.g. Stripe, PayFast, JazzCash, Easypaisa)
- Save orders and add an admin dashboard
