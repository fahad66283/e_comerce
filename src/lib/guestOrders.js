"use client";

import { api } from "./api";
import { createLocalStore } from "./localStore";

// Orders placed while logged out in this browser ({ id, key }), added to the account at the next login.
const store = createLocalStore("guest-orders", []);

export function rememberGuestOrder(id, key) {
  store.set((prev) => [...prev.filter((o) => o.id !== id), { id, key }].slice(-50));
}

export async function claimGuestOrders() {
  const orders = store.get();
  if (!orders.length) return;
  try {
    await api("/api/account/orders", { method: "POST", body: { orders } });
    store.set([]);
  } catch {
    // keep them for the next login
  }
}
