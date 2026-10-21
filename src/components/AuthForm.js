"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register, logout } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");

    if (isRegister && password !== form.get("confirm")) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const result = isRegister
      ? await register(form.get("name"), email, password)
      : await login(email, password);
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(result.user.role === "admin" ? "/admin" : "/products");
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-5xl">👋</p>
        <h1 className="section-title mt-4">You&apos;re logged in as {user.name}</h1>
        <p className="mt-1 text-grey-500">{user.email}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={user.role === "admin" ? "/admin" : "/products"} className="btn btn-primary">
            {user.role === "admin" ? "Go to Admin" : "Continue Shopping"}
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
          <span className="eyebrow">{isRegister ? "Register" : "Login"}</span>
        </div>
        <h1 className="section-title text-center">
          {isRegister ? "Create an account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-center text-sm text-grey-500">
          {isRegister ? "Register to start shopping" : "Login to your account"}
        </p>

        {error && (
          <p role="alert" className="mt-6 rounded-field bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {isRegister && (
            <label className="block">
              <span className="field-label">Full Name</span>
              <input required name="name" autoComplete="name" className="field-input" />
            </label>
          )}
          <label className="block">
            <span className="field-label">Email</span>
            <input required type="email" name="email" autoComplete="email" className="field-input" />
          </label>
          <label className="block">
            <span className="field-label">Password</span>
            <input
              required
              type="password"
              name="password"
              minLength={isRegister ? 6 : undefined}
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="field-input"
            />
          </label>
          {isRegister && (
            <label className="block">
              <span className="field-label">Confirm Password</span>
              <input
                required
                type="password"
                name="confirm"
                autoComplete="new-password"
                className="field-input"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="btn btn-primary mt-6 w-full"
        >
          {busy ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>

        <p className="mt-6 text-center text-sm text-grey-500">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-extrabold text-brand-700 hover:underline"
          >
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </form>
    </div>
  );
}
