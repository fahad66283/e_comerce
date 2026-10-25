import "server-only";
import crypto from "node:crypto";
import { ApiError } from "../api";
import { query, queryOne, transaction } from "../db";
import { siteUrl, stripeConfig, stripeRequest, toMinorUnits } from "../stripe";
import { updateOrderStatus } from "./orders";
import { getSiteSettings } from "./settings";

// Card payments with Stripe Checkout: the order is saved first (stock reserved, payment Pending),
// then the customer pays on Stripe's page. The payment is confirmed by the webhook, by the return
// to the confirmation page, or – if both were missed – when an admin opens the orders list.

// App return addresses: the app's own scheme, or Expo Go's while testing. Never web addresses.
export const APP_RETURN = /^(hakstore|exps?):\/\/[A-Za-z0-9._~:\/@%+-]{0,200}$/;

const findOrder = (orderNumber) =>
  queryOne("SELECT id, order_number, access_key, status, payment_method, payment_status, stripe_session_id, total, customer_email FROM orders WHERE order_number = ?", [
    String(orderNumber ?? "").trim().toUpperCase(),
  ]);

// Removes an order that never reached Stripe and puts its items back in stock.
async function discardOrder(orderId) {
  await transaction(async (tx) => {
    const items = await tx.query("SELECT product_id, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL", [orderId]);
    for (const item of items) await tx.query("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
    await tx.query("DELETE FROM orders WHERE id = ?", [orderId]);
  });
}

// Creates the Stripe Checkout page for a new card order and returns its address.
// app: the order came from the mobile app, so Stripe's return links lead back into the app
// (appReturn: the app's own return address, e.g. exp://... while testing in Expo Go).
export async function startStripeCheckout({ id, key }, request, { app = false, appReturn } = {}) {
  const config = stripeConfig();
  const order = await findOrder(id);
  const items = await query("SELECT product_name, quantity FROM order_items WHERE order_id = ? ORDER BY id", [order.id]);
  const { storeName } = (await getSiteSettings()).general;
  const site = siteUrl(request);
  const to = APP_RETURN.test(appReturn ?? "") ? `&to=${encodeURIComponent(appReturn)}` : "";
  try {
    const session = await stripeRequest(
      "POST",
      "/checkout/sessions",
      {
        mode: "payment",
        // One line with the order total, so discounts and shipping always match the order.
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: config.currency,
              unit_amount: toMinorUnits(Number(order.total), config.currency),
              product_data: {
                name: `${storeName} order ${id}`,
                description: items.map((i) => `${i.product_name} × ${i.quantity}`).join(", ").slice(0, 500),
              },
            },
          },
        ],
        customer_email: order.customer_email,
        client_reference_id: id,
        metadata: { order_number: id },
        payment_intent_data: { description: `${storeName} order ${id}`, metadata: { order_number: id } },
        success_url: app
          ? `${site}/api/stripe/app-return?result=success&id=${encodeURIComponent(id)}&key=${key}&session_id={CHECKOUT_SESSION_ID}${to}`
          : `${site}/order-confirmation?id=${encodeURIComponent(id)}&key=${key}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: app
          ? `${site}/api/stripe/app-return?result=cancel&id=${encodeURIComponent(id)}&key=${key}${to}`
          : `${site}/checkout?cancelled=${encodeURIComponent(id)}&key=${key}`,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // unpaid orders are cancelled after an hour
      },
      { idempotencyKey: `checkout-${id}` }
    );
    await query("UPDATE orders SET stripe_session_id = ? WHERE id = ?", [session.id, order.id]);
    return session.url;
  } catch (err) {
    console.error("[stripe] could not start checkout:", err.message);
    await discardOrder(order.id);
    throw new ApiError(502, "Card payment couldn't be started right now. Please try again or choose another payment method.");
  }
}

// Updates an order from a Stripe Checkout session (from the webhook or fetched from Stripe).
// failed: a delayed payment method (e.g. a bank debit) was declined after checkout.
export async function applyStripeSession(session, { failed = false } = {}) {
  const order = await findOrder(session?.metadata?.order_number ?? session?.client_reference_id);
  if (!order || order.stripe_session_id !== session.id) return "unknown";
  if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
    await query("UPDATE orders SET payment_status = 'Paid', payment_reference = ? WHERE id = ? AND payment_status = 'Pending'", [
      String(session.payment_intent?.id ?? session.payment_intent ?? session.id).slice(0, 120),
      order.id,
    ]);
    return "paid";
  }
  if (order.payment_status === "Pending" && order.status === "Processing" && (session.status === "expired" || failed)) {
    await updateOrderStatus(order.order_number, "Cancelled"); // puts the items back in stock
    return "cancelled";
  }
  return "pending";
}

const getSession = (sessionId, options) => stripeRequest("GET", `/checkout/sessions/${encodeURIComponent(sessionId)}`, null, options);

// Confirmation page after paying: check the session with Stripe straight away.
export async function refreshStripeOrder(orderNumber, sessionId) {
  const order = await findOrder(orderNumber);
  if (!stripeConfig() || !order || order.payment_status !== "Pending" || !sessionId || order.stripe_session_id !== sessionId) return;
  try {
    await applyStripeSession(await getSession(sessionId));
  } catch (err) {
    console.error("[stripe] could not check payment:", err.message);
  }
}

// The customer pressed "back" on Stripe's page: close the payment page and cancel the order.
export async function cancelStripeOrder(orderNumber, key) {
  const order = await findOrder(orderNumber);
  const keyOk = order?.access_key && typeof key === "string" && key.length === order.access_key.length &&
    crypto.timingSafeEqual(Buffer.from(key), Buffer.from(order.access_key));
  if (!keyOk) throw new ApiError(404, "Order not found.");
  if (order.payment_method !== "stripe" || order.payment_status !== "Pending" || order.status !== "Processing" || !order.stripe_session_id) {
    return { status: order.payment_status === "Paid" ? "paid" : "unchanged" };
  }
  try {
    return { status: await applyStripeSession(await stripeRequest("POST", `/checkout/sessions/${encodeURIComponent(order.stripe_session_id)}/expire`)) };
  } catch {
    // Already paid or Stripe unreachable: go by what Stripe says now.
    try {
      return { status: await applyStripeSession(await getSession(order.stripe_session_id)) };
    } catch (err) {
      console.error("[stripe] could not cancel payment:", err.message);
      return { status: "pending" };
    }
  }
}

// Catch up on card orders still waiting for payment (in case a webhook was missed).
export async function reconcileStripeOrders() {
  if (!stripeConfig()) return;
  const rows = await query(
    `SELECT stripe_session_id FROM orders
      WHERE payment_method = 'stripe' AND payment_status = 'Pending' AND status = 'Processing' AND stripe_session_id IS NOT NULL
        AND created_at < UTC_TIMESTAMP() - INTERVAL 2 MINUTE
      ORDER BY created_at DESC LIMIT 10`
  );
  await Promise.allSettled(rows.map(async (row) => applyStripeSession(await getSession(row.stripe_session_id, { timeoutMs: 8000 }))));
}
