"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { FREE_SHIPPING_MIN, formatPrice } from "@/data/products";
import Logo from "./Logo";
import SearchBox from "./SearchBox";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const { count } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navLinks = isAdmin ? [...links, { href: "/admin", label: "Admin" }] : links;
  const close = () => setOpen(false);

  function handleLogout() {
    logout();
    close();
    router.push("/");
  }

  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-[0.84rem] text-white">
        🚚 <strong className="text-brand-500">Free shipping</strong> on orders over{" "}
        {formatPrice(FREE_SHIPPING_MIN)} — delivery to every city
      </div>

      <header className="sticky top-0 z-50 border-b border-grey-200 bg-white/95 backdrop-blur">
        <div className="container-page flex items-center justify-between gap-5 py-3.5">
          <Logo />

          <nav className="hidden items-center gap-7 lg:flex">
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
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <SearchBox className="hidden w-[220px] focus-within:w-[260px] md:flex" />
            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <>
                  <span className="whitespace-nowrap text-sm font-bold text-grey-700">
                    Hi, {user.name}
                  </span>
                  <button type="button" onClick={handleLogout} className="btn btn-outline btn-sm">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn btn-primary btn-sm">
                  Login
                </Link>
              )}
            </div>
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
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl hover:bg-grey-100 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] overflow-y-auto bg-white p-6 transition-transform duration-300 lg:hidden ${
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
            </Link>
          ))}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="border-b border-grey-200 px-1 py-3.5 text-left text-xl font-extrabold"
            >
              Logout ({user.name})
            </button>
          ) : (
            <Link
              href="/login"
              onClick={close}
              className="border-b border-grey-200 px-1 py-3.5 text-xl font-extrabold text-brand-700"
            >
              Login / Register
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
