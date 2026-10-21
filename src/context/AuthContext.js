"use client";

import { createContext, useContext } from "react";
import { BUILT_IN_ACCOUNTS } from "@/data/accounts";
import { createLocalStore, useHydrated } from "@/lib/localStore";
import { hashPassword, needsRehash, verifyPassword } from "@/lib/password";

// DEMO ONLY: with no backend, accounts live in this browser's localStorage and the role
// checks run in the browser. Move auth to a server (database/README.md) before going live.
const usersStore = createLocalStore("users", []); // registered accounts
const overridesStore = createLocalStore("accountOverrides", {}); // changes to built-in accounts
const sessionStore = createLocalStore("session", null); // { email }

const builtInEmails = new Set(BUILT_IN_ACCOUNTS.map((a) => a.email));

// Emails and usernames are compared case-insensitively, ignoring extra spaces.
export const normalizeLogin = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");

const AuthContext = createContext(null);

function publicAccount(a) {
  return {
    name: a.name,
    email: a.email,
    username: a.username ?? null,
    role: a.role,
    status: a.status ?? "active",
    builtIn: a.builtIn,
    createdAt: a.createdAt ?? null,
  };
}

export function AuthProvider({ children }) {
  const session = sessionStore.useValue();
  const registered = usersStore.useValue();
  const overrides = overridesStore.useValue();
  const hydrated = useHydrated();

  const all = [
    ...BUILT_IN_ACCOUNTS.map((a) => ({ ...a, status: "active", ...overrides[a.email], builtIn: true })),
    ...registered
      .filter((u) => !builtInEmails.has(u.email))
      .map((u) => ({ role: "customer", status: "active", ...u, builtIn: false })),
  ];

  const current = session ? all.find((a) => a.email === session.email && a.status !== "disabled") : null;
  const user = current ? publicAccount(current) : null;
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = isSuperAdmin || user?.role === "admin";

  function findAccount(login) {
    const id = normalizeLogin(login);
    return all.find((a) => a.email === id || (a.username && a.username === id));
  }

  function saveAccount(email, changes) {
    if (builtInEmails.has(email)) {
      overridesStore.set((prev) => ({ ...prev, [email]: { ...prev[email], ...changes } }));
    } else {
      usersStore.set((prev) => prev.map((u) => (u.email === email ? { ...u, ...changes } : u)));
    }
  }

  async function login(identifier, password) {
    try {
      const account = findAccount(identifier);
      if (!account || !(await verifyPassword(password, account.passwordHash))) {
        return { error: "Incorrect email/username or password." };
      }
      if (account.status === "disabled") {
        return { error: "This account has been disabled. Please contact the store." };
      }
      if (needsRehash(account.passwordHash)) {
        saveAccount(account.email, { passwordHash: await hashPassword(password) });
      }
      sessionStore.set({ email: account.email });
      return { user: publicAccount(account) };
    } catch (err) {
      return { error: err.message };
    }
  }

  function validateNew(name, email, password) {
    if (!name.trim()) return "Please enter a name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (findAccount(email)) return "An account with this email already exists.";
    return null;
  }

  async function createAccount({ name, email, password, role }) {
    email = normalizeLogin(email);
    const error = validateNew(name, email, password);
    if (error) return { error };
    try {
      const account = {
        name: name.trim(),
        email,
        role,
        status: "active",
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      usersStore.set((prev) => [...prev, account]);
      return { user: publicAccount({ ...account, builtIn: false }) };
    } catch (err) {
      return { error: err.message };
    }
  }

  async function register(name, email, password) {
    const result = await createAccount({ name, email, password, role: "customer" });
    if (result.user) sessionStore.set({ email: result.user.email });
    return result;
  }

  function logout() {
    sessionStore.set(null);
  }

  async function changePassword(currentPassword, newPassword) {
    if (!current) return { error: "Please log in again." };
    if (newPassword.length < 6) return { error: "The new password must be at least 6 characters." };
    try {
      if (!(await verifyPassword(currentPassword, current.passwordHash))) {
        return { error: "Your current password is incorrect." };
      }
      saveAccount(current.email, { passwordHash: await hashPassword(newPassword) });
      return {};
    } catch (err) {
      return { error: err.message };
    }
  }

  // ---- Super admin: user management ----
  const denied = { error: "Only the super admin can manage users." };

  async function adminCreateUser(data) {
    if (!isSuperAdmin) return denied;
    if (!["admin", "customer"].includes(data.role)) return { error: "Choose Admin or Customer." };
    return createAccount(data);
  }

  function adminUpdateUser(email, changes) {
    if (!isSuperAdmin) return denied;
    const account = all.find((a) => a.email === email);
    if (!account) return { error: "User not found." };
    if (account.role === "superadmin") return { error: "The super admin account can't be changed here." };
    const allowed = {};
    if (changes.name !== undefined) allowed.name = changes.name.trim();
    if (changes.status !== undefined) allowed.status = changes.status;
    if (changes.role !== undefined && !account.builtIn && ["admin", "customer"].includes(changes.role)) {
      allowed.role = changes.role;
    }
    saveAccount(email, allowed);
    return {};
  }

  async function adminSetPassword(email, password) {
    if (!isSuperAdmin) return denied;
    if (password.length < 6) return { error: "Password must be at least 6 characters." };
    const account = all.find((a) => a.email === email);
    if (!account || (account.role === "superadmin" && account.email !== current?.email)) {
      return { error: "User not found." };
    }
    try {
      saveAccount(email, { passwordHash: await hashPassword(password) });
      return {};
    } catch (err) {
      return { error: err.message };
    }
  }

  function adminDeleteUser(email) {
    if (!isSuperAdmin) return denied;
    if (builtInEmails.has(email)) return { error: "Built-in accounts can be disabled but not deleted." };
    usersStore.set((prev) => prev.filter((u) => u.email !== email));
    return {};
  }

  // Full account records (with password hashes) for the super admin's MySQL export.
  function exportAccounts() {
    return isSuperAdmin ? all.map(({ builtIn, ...a }) => a) : [];
  }

  const accounts = all.map(publicAccount);
  // Registered customers (for the dashboard's Customers tab).
  const customers = accounts.filter((a) => a.role === "customer");

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isSuperAdmin,
        hydrated,
        accounts,
        customers,
        login,
        register,
        logout,
        changePassword,
        adminCreateUser,
        adminUpdateUser,
        adminSetPassword,
        adminDeleteUser,
        exportAccounts,
      }}
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
