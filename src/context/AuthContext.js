"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import { api } from "@/lib/api";

// The logged-in user comes from the server (secure session cookie); login, sign-up and
// password changes are checked on the server against MySQL.
const AuthContext = createContext(null);

export function AuthProvider({ user, admin, children }) {
  const router = useRouter();
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = isSuperAdmin || user?.role === "admin";

  async function call(path, body) {
    try {
      const data = await api(path, { method: "POST", body });
      router.refresh();
      return data;
    } catch (err) {
      return { error: err.message };
    }
  }

  const login = (identifier, password) => call("/api/auth/login", { login: identifier, password });
  const register = (name, email, password) => call("/api/auth/register", { name, email, password });
  const changePassword = (current, next) => call("/api/account/password", { current, next });

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isSuperAdmin,
        hydrated: true,
        // Counts shown as badges for staff (new orders, unread messages).
        adminSummary: admin ?? { pendingOrders: 0, unreadMessages: 0 },
        login,
        register,
        logout,
        changePassword,
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
