import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { applyStoreName, defaultSettings, mergeSettings } from "@shared/data/siteContent";
import { api, setApiToken } from "@/lib/api";
import { loadJson, saveJson, secureStore } from "@/lib/storage";
import { buildColors } from "@/lib/theme";

// Everything the website's pages get from MySQL (settings, products, categories, ratings, the
// logged-in user, their wishlist, admin counters) comes from GET /api/store. The last copy is kept
// on the phone so the app opens instantly, then refreshes.
const StoreContext = createContext(null);
const TOKEN_KEY = "hak-session";
const CACHE_KEY = "store-cache";
const GUEST_ORDERS_KEY = "guest-orders";

export function StoreProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const fresh = await api("/api/store");
      setData(fresh);
      setError(null);
      saveJson(CACHE_KEY, { ...fresh, user: null, wishlist: [], admin: null }); // no personal data in the cache
      return fresh;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const [token, cached] = await Promise.all([secureStore.get(TOKEN_KEY).catch(() => null), loadJson(CACHE_KEY, null)]);
      if (token) setApiToken(token);
      if (cached) setData(cached);
      const fresh = await refresh();
      // A saved token that no longer works (logged out elsewhere, account disabled): forget it.
      if (token && fresh && !fresh.user) {
        setApiToken(null);
        secureStore.remove(TOKEN_KEY);
      }
      setReady(true);
    })();
  }, [refresh]);

  const value = useMemo(() => {
    const saved = data?.settings ?? {};
    const rawSettings = mergeSettings(defaultSettings, saved);
    const settings = applyStoreName(rawSettings, rawSettings.general.storeName);
    const products = data?.products ?? [];
    const categories = data?.categories ?? [];
    const ratings = data?.ratings ?? {};
    const user = data?.user ?? null;
    return {
      ready: ready || !!data,
      loaded: !!data,
      error,
      refresh,
      settings,
      rawSettings,
      colors: buildColors(settings.general),
      stripe: data?.stripe ?? { ready: false },
      products,
      categories,
      ratings,
      user,
      serverWishlist: data?.wishlist ?? [],
      adminSummary: data?.admin ?? { pendingOrders: 0, unreadMessages: 0 },
    };
  }, [data, error, ready, refresh]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

// ---- Same hooks as the website ----

export function useSettings() {
  const { settings, rawSettings, colors, stripe, refresh } = useStore();
  async function saveSection(key, value) {
    await api(`/api/admin/settings/${key}`, { method: "PUT", body: value });
    await refresh();
  }
  async function resetSection(key) {
    await api(`/api/admin/settings/${key}`, { method: "DELETE" });
    await refresh();
  }
  return { settings, rawSettings, colors, stripe, saveSection, resetSection };
}

// Payment methods switched on by the super admin, plus card payments when Stripe is set up.
export function usePaymentMethods() {
  const { settings, stripe } = useStore();
  const { methods, stripeEnabled, stripeTitle, stripeText } = settings.payments;
  const card = stripe?.ready && stripeEnabled ? [{ id: "stripe", title: stripeTitle, text: stripeText, details: [] }] : [];
  return [...methods.filter((m) => m.enabled), ...card];
}

export function useColors() {
  return useStore().colors;
}

export function useReviews() {
  const { ratings } = useStore();
  // The product's starting rating counts as one review (same as the website).
  function getRating(product) {
    const stats = ratings[product.id] ?? { sum: 0, count: 0 };
    const base = Number(product.rating) || 0;
    const total = stats.sum + base;
    const count = stats.count + (base ? 1 : 0);
    return { average: count ? total / count : 0, count: stats.count };
  }
  return { getRating };
}

export function useProducts() {
  const { products, categories, refresh } = useStore();
  const getProduct = (id) => products.find((p) => p.id === id);
  const getCategory = (name) => categories.find((c) => c.name === name);
  async function change(path, method, body) {
    const result = await api(path, { method, body });
    await refresh();
    return result;
  }
  async function safe(fn) {
    try {
      await fn();
      return {};
    } catch (err) {
      return { error: err.message };
    }
  }
  return {
    products,
    categories,
    getProduct,
    getCategory,
    // Products: these throw an Error with a readable message if something fails.
    addProduct: async (body) => (await change("/api/admin/products", "POST", body)).id,
    updateProduct: (id, body) => change(`/api/admin/products/${encodeURIComponent(id)}`, "PUT", body),
    setProductFlags: (id, flags) => change(`/api/admin/products/${encodeURIComponent(id)}`, "PATCH", flags),
    deleteProduct: (id) => change(`/api/admin/products/${encodeURIComponent(id)}`, "DELETE"),
    resetProducts: () => change("/api/admin/products/reset", "POST"),
    // Categories: these return { error } instead of throwing.
    addCategory: (body) => safe(() => change("/api/admin/categories", "POST", body)),
    updateCategory: (originalName, body) => safe(() => change("/api/admin/categories", "PUT", { ...body, originalName })),
    deleteCategory: (name) => safe(() => change("/api/admin/categories", "DELETE", { name })),
    resetCategories: () => safe(() => change("/api/admin/categories/reset", "POST")),
  };
}

// Guest orders placed on this phone are added to the account at the next login (like the website).
export async function rememberGuestOrder(id, key) {
  const list = await loadJson(GUEST_ORDERS_KEY, []);
  await saveJson(GUEST_ORDERS_KEY, [...list.filter((o) => o.id !== id), { id, key }].slice(-50));
}

async function claimGuestOrders() {
  const orders = await loadJson(GUEST_ORDERS_KEY, []);
  if (!orders.length) return;
  try {
    await api("/api/account/orders", { method: "POST", body: { orders } });
    await saveJson(GUEST_ORDERS_KEY, []);
  } catch {
    // keep them for the next login
  }
}

export function useAuth() {
  const { user, adminSummary, refresh } = useStore();
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = isSuperAdmin || user?.role === "admin";

  async function start(path, body, afterLogin) {
    try {
      const result = await api(path, { method: "POST", body });
      if (result.token) {
        setApiToken(result.token);
        await secureStore.set(TOKEN_KEY, result.token);
      }
      await Promise.all([afterLogin?.(), claimGuestOrders()]);
      await refresh();
      return result;
    } catch (err) {
      return { error: err.message };
    }
  }

  return {
    user,
    isAdmin,
    isSuperAdmin,
    adminSummary,
    // afterLogin: e.g. move the guest wishlist into the account
    login: (identifier, password, afterLogin) => start("/api/auth/login", { login: identifier, password }, afterLogin),
    register: (name, email, password, afterLogin) => start("/api/auth/register", { name, email, password }, afterLogin),
    async changePassword(current, next) {
      try {
        return await api("/api/account/password", { method: "POST", body: { current, next } });
      } catch (err) {
        return { error: err.message };
      }
    },
    async logout() {
      await api("/api/auth/logout", { method: "POST" }).catch(() => {});
      setApiToken(null);
      await secureStore.remove(TOKEN_KEY);
      await refresh();
    },
  };
}
