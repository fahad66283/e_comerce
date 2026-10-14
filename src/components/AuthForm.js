"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600";

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
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-5xl">👋</p>
        <h1 className="mt-4 text-2xl font-bold">You&apos;re logged in as {user.name}</h1>
        <p className="mt-1 text-gray-500">{user.email}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href={user.role === "admin" ? "/admin" : "/products"}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
          >
            {user.role === "admin" ? "Go to Admin" : "Continue Shopping"}
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium hover:border-indigo-600"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold">
          {isRegister ? "Create an account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          {isRegister ? "Register to start shopping" : "Login to your account"}
        </p>

        {error && (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {isRegister && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Full Name</span>
              <input required name="name" autoComplete="name" className={inputClass} />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input required type="email" name="email" autoComplete="email" className={inputClass} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              required
              type="password"
              name="password"
              minLength={isRegister ? 6 : undefined}
              autoComplete={isRegister ? "new-password" : "current-password"}
              className={inputClass}
            />
          </label>
          {isRegister && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Confirm Password</span>
              <input
                required
                type="password"
                name="confirm"
                autoComplete="new-password"
                className={inputClass}
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-medium text-indigo-600 hover:underline"
          >
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </form>
    </div>
  );
}
