# HAK Store – iOS & Android app

The HAK Store mobile app, built with **Expo (React Native)**. It looks and works like the website
(same green and black theme, Tajawal font, same screens and flows) and uses the **same MySQL database**
through the website's API: products, orders, accounts, reviews, coupons and every setting the super
admin changes appear in the app and on the website at the same time.

## What's in the app

**Customers** (bottom tabs: Home · Shop · Wishlist · Cart · Account)
- Home with the announcement bar, hero, category tiles, popular / new / sale products, promos, features, newsletter
- Shop with search, category and filter pills (On Sale, New Arrivals) and sorting; Categories screen
- Product screen: photo gallery, price and sale price, stock, quantity, add to cart, wishlist, "Order on WhatsApp", reviews
- Cart with coupon codes, free-shipping progress and the same totals as the website
- Checkout as a guest or logged in: Cash on Delivery, Bank Transfer / JazzCash / Easypaisa (with transaction ID),
  and **card payments with Stripe** (Stripe's secure page opens inside the app and returns to the order)
- Order confirmation, Track Order, My Account (orders, password), Login / Sign Up
- About Us with the Google Map, Contact (form, call, email, WhatsApp), FAQs, Privacy / Terms / Return policies
- Floating WhatsApp button

**Admins** (Account → Open Dashboard)
- Overview with alerts (out of stock, low stock, new orders, payments to verify), stats and recent orders
- Orders (search, filter, change order and payment status), Products (add / edit / delete, **up to 5 photos from
  the phone**, Featured / New switches), Categories, Coupons, Reviews, Customers, Messages & newsletter, Sales report
- Super admin: edit the whole **Website** and **Settings** (same sections as the website), **Users**, **Backup** (.sql)

Everything the super admin changes in the dashboard (texts, colours, logo, payment methods, shipping...) shows in the
app straight away — no app update needed.

## Before you start

1. **Deploy the latest website code** to Hostinger first. The app needs the website's newest API
   (`/api/store`, app logins, Stripe return to the app).
2. Install [Node.js](https://nodejs.org) **22 (22.13 or newer)** or 24 on your computer.
3. Install **Expo Go** on your phone (App Store / Google Play).

## Run the app on your phone (Expo Go)

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with your phone (iPhone: Camera app; Android: Expo Go). The app opens and loads the store from
`https://hakstores.com`.

### Use a different website address

The address is `expo.extra.apiUrl` in `app.json` (default `https://hakstores.com`). To try the app against the
website running on your computer, start it with your computer's network address (phone and computer on the same Wi-Fi):

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.5:3000 npx expo start
```

## Card payments in the app

Card payments appear when Stripe is set up on the website (`STRIPE_SECRET_KEY` etc. in the website's `.env`,
see the main README). Also set **`SITE_URL=https://hakstores.com`** there: Stripe's payment page returns to
`https://hakstores.com/api/stripe/app-return`, which sends the customer back into the app. This also works in
Expo Go while testing.

## Publish to the App Store and Google Play

Builds are made in the cloud with **EAS** (no Mac or Android Studio needed):

```bash
cd mobile
npx eas-cli@latest login          # free Expo account
npx eas-cli@latest init           # links this app to your Expo account
npx eas-cli@latest build -p android --profile preview      # test APK to install on Android phones
npx eas-cli@latest build -p all --profile production       # store builds for Android and iOS
npx eas-cli@latest submit -p android                        # upload to Google Play
npx eas-cli@latest submit -p ios                            # upload to the App Store
```

You need a **Google Play Console** account (one-time fee) and an **Apple Developer Program** membership (yearly fee).
EAS asks for them the first time and can create the signing keys for you.

App identity (change before the first store release if you like):
- Name: `HAK Store` (`app.json` → `name`), version `1.0.0`
- iOS bundle ID / Android package: `com.hakstores.app`
- Icon, splash screen and logos: `assets/` (made from the website's logo files)
- Deep-link scheme: `hakstore` (used by the Stripe return link; keep it in sync with
  `src/app/api/stripe/app-return/route.js` on the website)

## How it's built

```
mobile/
├── app.json, eas.json        # app name, icons, bundle IDs, EAS build profiles
├── metro.config.js           # lets the app share plain modules with the website (../src)
└── src/
    ├── app/                  # screens (Expo Router). Same paths as the website: /products, /checkout, /track-order...
    │   ├── (tabs)/           # Home, Shop, Wishlist, Cart, Account
    │   └── dashboard/        # admin screens
    ├── components/           # UI pieces in the website's style (ui.js, shop.js, OrderSummary, ...)
    ├── context/              # StoreContext (data from /api/store, settings, login), Cart, Wishlist
    └── lib/                  # API client, theme, secure token storage, files
```

- The app logs in with a token kept in the phone's secure storage (Keychain / Keystore); the website uses a cookie.
  Both are the same sessions in MySQL, so logging out or disabling a user works everywhere.
- Modules shared with the website are imported as `@shared/...`: default content (`data/siteContent.js`), coupon rules,
  date formatting, search, the map helper and the website editor's section definitions — so both stay in sync.
- Screens use the same paths as the website, so links in the editable content (e.g. `[Track Order](/track-order)`) open
  the right screen in the app.

Commands: `npx expo start` (develop), `npx expo lint` (lint), `npx expo export --platform ios|android` (check the bundle builds).
