"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { useSettings } from "@/context/SettingsContext";
import { useWishlist } from "@/context/WishlistContext";
import Logo from "./Logo";
import { Inline } from "./RichText";
import SearchBox from "./SearchBox";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/account", label: "My Account" },
];

const badge =
  "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-brand-500 px-[3px] text-[0.65rem] font-extrabold text-ink";

function UserMenu({ user, isAdmin, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user.name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-black text-ink transition hover:ring-2 hover:ring-ink"
      >
        {user.name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-card border border-grey-200 bg-white py-1.5 shadow-lift">
          <p className="truncate px-4 py-2 text-sm">
            <span className="block font-extrabold">{user.name}</span>
            <span className="text-xs text-grey-500">{user.email}</span>
          </p>
          <div className="my-1 border-t border-grey-200" />
          {[
            { href: "/account", label: "My Account" },
            ...(isAdmin ? [{ href: "/dashboard", label: "Dashboard" }] : []),
            { href: "/track-order", label: "Track Order" },
            { href: "/wishlist", label: "Wishlist" },
          ].map((item) => (
            <Link key={item.href} href={item.href} role="menuitem" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm font-bold hover:bg-grey-50">
              {item.label}
            </Link>
          ))}
          <div className="my-1 border-t border-grey-200" />
          <button type="button" role="menuitem" onClick={onLogout} className="block w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-grey-50">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, isAdmin, logout, adminSummary } = useAuth();
  const { products } = useProducts();
  const { settings } = useSettings();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Admin alerts: new orders to process + products running low + unread messages.
  const alerts = isAdmin
    ? adminSummary.pendingOrders +
      adminSummary.unreadMessages +
      products.filter((p) => p.stock <= settings.inventory.lowStock).length
    : 0;
  const navLinks = isAdmin ? [...links, { href: "/dashboard", label: "Dashboard", alerts }] : links;
  const close = () => setOpen(false);
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  function handleLogout() {
    close();
    logout();
  }

  return (
    <>
      {settings.announcement.enabled && (
        <div className="bg-ink px-4 py-2 text-[0.84rem] text-white">
          <div className="container-page flex items-center justify-center gap-4 !px-0 sm:justify-between">
            <span className="hidden w-24 sm:block" />
            <span className="text-center">
              <Inline text={settings.announcement.text} strongClassName="font-extrabold text-brand-500" linkClassName="font-bold text-brand-500 underline" />
            </span>
            <Link href="/track-order" className="hidden w-24 text-right font-bold hover:text-brand-500 sm:block">
              Track Order
            </Link>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-grey-200 bg-white/95 backdrop-blur">
        <div className="container-page flex items-center justify-between gap-4 py-3.5">
          <Logo />

          <nav aria-label="Main menu" className="hidden items-center gap-4 xl:flex 2xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap border-b-2 px-0.5 py-1.5 text-[0.92rem] font-bold transition-colors ${
                  isActive(link.href)
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
            <SearchBox className="hidden w-[180px] focus-within:w-[240px] md:flex 2xl:w-[220px]" />
            {user ? (
              <div className="hidden md:block">
                <UserMenu user={user} isAdmin={isAdmin} onLogout={handleLogout} />
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition hover:bg-grey-100"
              aria-label={`Wishlist with ${wishCount} items`}
            >
              <span aria-hidden="true">♡</span>
              {wishCount > 0 && <span className={badge}>{wishCount}</span>}
            </Link>
            <Link
              href="/cart"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition hover:bg-grey-100"
              aria-label={`Cart with ${count} items`}
            >
              🛒
              {count > 0 && <span className={badge}>{count}</span>}
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
        {user ? (
          <p className="mt-6 flex items-center gap-3 rounded-card bg-grey-50 p-3 text-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-black">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-extrabold">{user.name}</span>
              <span className="block truncate text-xs text-grey-500">{user.email}</span>
            </span>
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/login" onClick={close} className="btn btn-outline">
              Login
            </Link>
            <Link href="/signup" onClick={close} className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        )}
        <nav aria-label="Mobile menu" className="mt-4 flex flex-col">
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
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="border-b border-grey-200 px-1 py-3.5 text-left text-xl font-extrabold text-red-600"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </>
  );
}
