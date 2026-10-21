"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { LOW_STOCK, useProducts } from "@/context/ProductsContext";
import { useWishlist } from "@/context/WishlistContext";
import { FREE_SHIPPING_MIN, formatPrice } from "@/data/products";
import Logo from "./Logo";
import SearchBox from "./SearchBox";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const { products } = useProducts();
  const { orders } = useOrders();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Admin alerts: new orders to process + products running low.
  const alerts = isAdmin
    ? orders.filter((o) => o.status === "Processing").length + products.filter((p) => p.stock <= LOW_STOCK).length
    : 0;
  const navLinks = isAdmin ? [...links, { href: "/dashboard", label: "Dashboard", alerts }] : links;
  const close = () => setOpen(false);

  function handleLogout() {
    logout();
    close();
    router.push("/");
  }

  return (
    <>
      <div className="bg-ink px-4 py-2 text-[0.84rem] text-white">
        <div className="container-page flex items-center justify-center gap-4 !px-0 sm:justify-between">
          <span className="hidden w-24 sm:block" />
          <span className="text-center">
            🚚 <strong className="text-brand-500">Free shipping</strong> on orders over{" "}
            {formatPrice(FREE_SHIPPING_MIN)}
          </span>
          <Link href="/track-order" className="hidden w-24 text-right font-bold hover:text-brand-500 sm:block">
            Track Order
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-grey-200 bg-white/95 backdrop-blur">
        <div className="container-page flex items-center justify-between gap-5 py-3.5">
          <Logo />

          <nav className="hidden items-center gap-6 xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 px-0.5 py-1.5 text-[0.95rem] font-bold transition-colors ${
                  pathname === link.href
                    ? "border-brand-500 text-ink"
                    : "border-transparent text-grey-700 hover:border-brand-500 hover:text-ink"
                }`}
              >
                {link.label}
                {link.alerts > 0 && (
                  <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[0.65rem] font-extrabold text-white">
                    {link.alerts}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <SearchBox className="hidden w-[220px] focus-within:w-[260px] md:flex" />
            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-2 whitespace-nowrap rounded-full py-1 pl-1 pr-3 text-sm font-bold text-grey-700 hover:bg-grey-100"
                  title="My Account"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 font-black text-ink">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[110px] truncate">{user.name}</span>
                </Link>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm">
                  Login
                </Link>
              )}
            </div>
            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition hover:bg-grey-100"
              aria-label={`Wishlist with ${wishCount} items`}
            >
              <span aria-hidden="true">♡</span>
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-brand-500 px-[3px] text-[0.65rem] font-extrabold text-ink">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition hover:bg-grey-100"
              aria-label={`Cart with ${count} items`}
            >
              🛒
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-brand-500 px-[3px] text-[0.65rem] font-extrabold text-ink">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl hover:bg-grey-100 xl:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] overflow-y-auto bg-white p-6 transition-transform duration-300 xl:hidden ${
          open ? "translate-y-0" : "pointer-events-none -translate-y-full"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="flex items-center justify-between">
          <Logo onClick={close} />
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl hover:bg-grey-100"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <SearchBox className="mt-6 w-full" onSearch={close} />
        <nav className="mt-7 flex flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="border-b border-grey-200 px-1 py-3.5 text-xl font-extrabold"
            >
              {link.label}
              {link.alerts > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-sm text-white">{link.alerts}</span>
              )}
            </Link>
          ))}
          <Link href="/wishlist" onClick={close} className="border-b border-grey-200 px-1 py-3.5 text-xl font-extrabold">
            Wishlist {wishCount > 0 && `(${wishCount})`}
          </Link>
          <Link href="/track-order" onClick={close} className="border-b border-grey-200 px-1 py-3.5 text-xl font-extrabold">
            Track Order
          </Link>
          {user ? (
            <>
              <Link
                href="/account"
                onClick={close}
                className="border-b border-grey-200 px-1 py-3.5 text-xl font-extrabold text-brand-700"
              >
                My Account
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="border-b border-grey-200 px-1 py-3.5 text-left text-xl font-extrabold"
              >
                Logout ({user.name})
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={close}
              className="border-b border-grey-200 px-1 py-3.5 text-xl font-extrabold text-brand-700"
            >
              Login / Sign Up
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
