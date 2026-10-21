"use client";

import { createContext, useContext } from "react";
import { createLocalStore } from "@/lib/localStore";

// DEMO ONLY: orders are saved in this browser's localStorage until a backend exists.
const ordersStore = createLocalStore("orders", []);

export const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const orders = ordersStore.useValue();

  function getOrder(id) {
    return orders.find((o) => o.id === id);
  }

  function getOrdersByEmail(email) {
    const target = email.trim().toLowerCase();
    return orders.filter((o) => o.customer.email === target);
  }

  // order: { items, subtotal, shipping, total, customer, payment }
  function placeOrder(order) {
    const id = `HAK-${Date.now().toString(36).toUpperCase()}`;
    const saved = {
      ...order,
      id,
      customer: { ...order.customer, email: order.customer.email.trim().toLowerCase() },
      status: "Processing",
      createdAt: new Date().toISOString(),
    };
    ordersStore.set((prev) => [saved, ...prev]);
    return id;
  }

  function updateOrderStatus(id, status) {
    ordersStore.set((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  return (
    <OrdersContext.Provider value={{ orders, getOrder, getOrdersByEmail, placeOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders must be used inside OrdersProvider");
  return context;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
