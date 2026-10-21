"use client";

import { createContext, useContext } from "react";
import { createLocalStore } from "@/lib/localStore";

// DEMO ONLY: orders are saved in this browser's localStorage until a backend exists.
const ordersStore = createLocalStore("orders", []);

export const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];
export const PAYMENT_STATUSES = ["Pending", "Paid", "Refunded"];

const OrdersContext = createContext(null);

// Unique, readable order id: HAK-YYMMDD-XXXX (date + 4 random characters, no look-alikes).
function makeOrderId(existing) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const d = new Date();
  const date = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  let id;
  do {
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    const suffix = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
    id = `HAK-${date}-${suffix}`;
  } while (existing.some((o) => o.id === id));
  return id;
}

// Orders saved by an older version stored payment as plain text and had no status history.
function upgradeOrder(order) {
  if (typeof order.payment === "object" && order.statusHistory) return order;
  return {
    ...order,
    payment:
      typeof order.payment === "object"
        ? order.payment
        : { method: "cod", title: order.payment ?? "Cash on Delivery", reference: null, status: "Pending" },
    statusHistory: order.statusHistory ?? [{ status: order.status, at: order.createdAt }],
    discount: order.discount ?? 0,
  };
}

export function OrdersProvider({ children }) {
  const orders = ordersStore.useValue().map(upgradeOrder);

  function getOrder(id) {
    return orders.find((o) => o.id === id.trim().toUpperCase());
  }

  function getOrdersByEmail(email) {
    const target = email.trim().toLowerCase();
    return orders.filter((o) => o.customer.email === target);
  }

  // Order tracking: the order id plus the email or phone used at checkout.
  function findOrderForTracking(id, contact) {
    const order = getOrder(id);
    if (!order) return null;
    const value = contact.trim().toLowerCase();
    const digits = (s) => s.replace(/\D/g, "");
    const phoneMatch = digits(value).length >= 7 && digits(order.customer.phone).endsWith(digits(value).slice(-7));
    return order.customer.email === value || phoneMatch ? order : null;
  }

  // order: { items, subtotal, discount, couponCode, shipping, total, customer, payment, notes }
  function placeOrder(order) {
    const id = makeOrderId(orders);
    const now = new Date().toISOString();
    const saved = {
      ...order,
      id,
      customer: { ...order.customer, email: order.customer.email.trim().toLowerCase() },
      status: "Processing",
      statusHistory: [{ status: "Processing", at: now }],
      createdAt: now,
    };
    ordersStore.set((prev) => [saved, ...prev]);
    return id;
  }

  function updateOrderStatus(id, status) {
    ordersStore.set((prev) =>
      prev.map(upgradeOrder).map((o) =>
        o.id === id && o.status !== status
          ? {
              ...o,
              status,
              statusHistory: [...(o.statusHistory ?? []), { status, at: new Date().toISOString() }],
            }
          : o
      )
    );
  }

  function updatePaymentStatus(id, status) {
    ordersStore.set((prev) =>
      prev.map(upgradeOrder).map((o) => (o.id === id ? { ...o, payment: { ...o.payment, status } } : o))
    );
  }

  // Demo data for the sales report, so charts have something to show.
  function addOrders(list) {
    ordersStore.set((prev) => [...list, ...prev].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  function removeDemoOrders() {
    ordersStore.set((prev) => prev.filter((o) => !o.demo));
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        getOrder,
        getOrdersByEmail,
        findOrderForTracking,
        placeOrder,
        updateOrderStatus,
        updatePaymentStatus,
        addOrders,
        removeDemoOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders must be used inside OrdersProvider");
  return context;
}

export function formatDate(iso, withTime = false) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
}
