"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { claimGuestOrders } from "@/lib/guestOrders";

// Only allow redirects to pages on this site (e.g. "/account"), never other websites.
function safeNext(value) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const { user, login, register, logout } = useAuth();
  const { mergeGuestWishlist } = useWishlist();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isStaff = (u) => u.role === "admin" || u.role === "superadmin";
  const homeFor = (u) => (isStaff(u) ? "/dashboard" : "/account");
  const switchHref = (isSignup ? "/login" : "/signup") + (next ? `?next=${encodeURIComponent(next)}` : "");

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");
    setError("");

    if (isSignup && password !== form.get("confirm")) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const result = isSignup
      ? await register(form.get("name"), email, password)
      : await login(email, password);
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    await Promise.all([mergeGuestWishlist(), claimGuestOrders()]);
    router.push(next ?? homeFor(result.user));
    router.refresh();
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-5xl">👋</p>
        <h1 className="section-title mt-4">You&apos;re logged in as {user.name}</h1>
        <p className="mt-1 text-grey-500">{user.email}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={homeFor(user)} className="btn btn-primary">
            {isStaff(user) ? "Go to Dashboard" : "My Account"}
          </Link>
          <button type="button" onClick={logout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <form onSubmit={handleSubmit} className="panel">
        <div className="text-center">
          <span className="eyebrow">{isSignup ? "Sign Up" : "Login"}</span>
        </div>
        <h1 className="section-title text-center">{isSignup ? "Create an account" : "Welcome back"}</h1>
        <p className="mt-1 text-center text-sm text-grey-500">
          {isSignup ? "Sign up to track your orders" : "Login to your account"}
        </p>

        {error && (
          <p role="alert" className="mt-6 rounded-field bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {isSignup && (
            <label className="block">
              <span className="field-label">Full Name</span>
              <input required name="name" autoComplete="name" className="field-input" />
            </label>
          )}
          <label className="block">
            <span className="field-label">{isSignup ? "Email" : "Email or Username"}</span>
            <input
              required
              type={isSignup ? "email" : "text"}
              name="email"
              autoComplete={isSignup ? "email" : "username"}
              autoCapitalize="none"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Password</span>
            <input
              required
              type="password"
              name="password"
              minLength={isSignup ? 6 : undefined}
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="field-input"
            />
          </label>
          {isSignup && (
            <label className="block">
              <span className="field-label">Confirm Password</span>
              <input required type="password" name="confirm" autoComplete="new-password" className="field-input" />
            </label>
          )}
        </div>

        {isSignup && (
          <p className="mt-4 text-xs text-grey-500">
            By signing up you agree to our{" "}
            <Link href="/terms" className="font-bold text-ink underline">Terms &amp; Conditions</Link> and{" "}
            <Link href="/privacy-policy" className="font-bold text-ink underline">Privacy Policy</Link>.
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full">
          {busy ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <p className="mt-6 text-center text-sm text-grey-500">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <Link href={switchHref} className="font-extrabold text-brand-700 hover:underline">
            {isSignup ? "Login" : "Sign Up"}
          </Link>
        </p>
      </form>
    </div>
  );
}
