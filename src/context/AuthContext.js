"use client";

import { createContext, useContext } from "react";
import { createLocalStore, useHydrated } from "@/lib/localStore";

// DEMO ONLY: with no backend, accounts live in this browser's localStorage and
// the admin check runs in the browser, so it can be bypassed. Move auth to a
// server (with properly salted password hashes) before going live.
export const ADMIN_EMAIL = "kamisofts@gmail.com";
// SHA-256 of the admin password, so the plain password is not in the code.
const ADMIN_PASSWORD_HASH = "42a0e29afd3a33677df86c908a12f8513063c928131ada525f9612dc65342e83";

const usersStore = createLocalStore("users", []);
const sessionStore = createLocalStore("session", null);

const AuthContext = createContext(null);

async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Login needs a secure connection (https or localhost).");
  }
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function AuthProvider({ children }) {
  const user = sessionStore.useValue();
  const accounts = usersStore.useValue();
  const hydrated = useHydrated();

  async function login(email, password) {
    email = email.trim().toLowerCase();
    try {
      const hash = await hashPassword(password);
      if (email === ADMIN_EMAIL) {
        if (hash !== ADMIN_PASSWORD_HASH) return { error: "Incorrect email or password." };
        sessionStore.set({ name: "Admin", email, role: "admin" });
        return { user: sessionStore.get() };
      }
      const account = usersStore.get().find((u) => u.email === email);
      if (!account || account.passwordHash !== hash) {
        return { error: "Incorrect email or password." };
      }
      sessionStore.set({ name: account.name, email, role: "customer" });
      return { user: sessionStore.get() };
    } catch (err) {
      return { error: err.message };
    }
  }

  async function register(name, email, password) {
    name = name.trim();
    email = email.trim().toLowerCase();
    if (!name) return { error: "Please enter your name." };
    if (password.length < 6) return { error: "Password must be at least 6 characters." };
    if (email === ADMIN_EMAIL || usersStore.get().some((u) => u.email === email)) {
      return { error: "An account with this email already exists." };
    }
    try {
      const passwordHash = await hashPassword(password);
      usersStore.set((prev) => [...prev, { name, email, passwordHash }]);
      sessionStore.set({ name, email, role: "customer" });
      return { user: sessionStore.get() };
    } catch (err) {
      return { error: err.message };
    }
  }

  // Registered customers (without password hashes), for the admin dashboard.
  const customers = accounts.map(({ name, email }) => ({ name, email }));

  function logout() {
    sessionStore.set(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAdmin: user?.role === "admin", hydrated, customers, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
