import "server-only";
import crypto from "node:crypto";
import { shippingFor } from "@/data/siteContent";
import { evaluateCoupon, normalizeCode } from "@/lib/coupons";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/format";
import { ApiError, email, number, text } from "../api";
import { isStaff } from "../auth";
import { query, queryOne, transaction } from "../db";
import { getSiteSettings } from "./settings";


const iso = (d) => (d instanceof Date ? d.toISOString() : d ? new Date(d).toISOString() : null);

// Readable unique order number: HAK-YYMMDD-XXXX (no look-alike characters).
function makeOrderNumber() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const d = new Date();
  const date = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const suffix = Array.from(crypto.randomBytes(4), (b) => alphabet[b % alphabet.length]).join("");
  return `HAK-${date}-${suffix}`;
}

function toOrder(row, items, history) {
  return {
    id: row.order_number,
    createdAt: iso(row.created_at),
    status: row.status,
    statusHistory: history.map((h) => ({ status: h.status, at: iso(h.created_at) })),
    items: items.map((i) => ({
      id: i.slug ?? null,
      name: i.product_name,
      price: Number(i.unit_price),
      quantity: i.quantity,
      emoji: i.product_emoji ?? "📦",
      category: i.category_name ?? null,
      image: i.product_image ?? null,
    })),
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    couponCode: row.coupon_code,
    shipping: Number(row.shipping),
    total: Number(row.total),
    notes: row.notes ?? "",
    guest: !!row.is_guest,
    demo: !!row.is_demo,
    payment: { method: row.payment_method, title: row.payment_title, status: row.payment_status, reference: row.payment_reference },
    customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone, city: row.city, address: row.address },
  };
}

async function withDetails(rows) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [items, history] = await Promise.all([
    query("SELECT oi.*, p.slug FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id IN (?) ORDER BY oi.id", [ids]),
    query("SELECT order_id, status, created_at FROM order_status_history WHERE order_id IN (?) ORDER BY created_at, id", [ids]),
  ]);
  return rows.map((row) =>
    toOrder(
      row,
      items.filter((i) => i.order_id === row.id),
      history.filter((h) => h.order_id === row.id)
    )
  );
}

// ---------------- Checkout ----------------
export async function placeOrder(input, user) {
  const customer = {
    name: text(input.customer?.name, "Full name", { max: 120 }),
    email: email(input.customer?.email),
    phone: text(input.customer?.phone, "Phone number", { max: 40 }),
    city: text(input.customer?.city, "City", { max: 100 }),
    address: text(input.customer?.address, "Address", { max: 255 }),
  };
  if (customer.phone.replace(/\D/g, "").length < 7) throw new ApiError(400, "Please enter a valid phone number.");
  const notes = text(input.notes, "Order notes", { max: 2000, required: false });

  // Merge duplicate lines and validate quantities.
  const wanted = new Map();
  for (const item of Array.isArray(input.items) ? input.items.slice(0, 50) : []) {
    const slug = text(item?.id, "Product", { max: 160 });
    const qty = number(item?.quantity, "Quantity", { min: 1, max: 99, integer: true });
    wanted.set(slug, (wanted.get(slug) ?? 0) + qty);
  }
  if (wanted.size === 0) throw new ApiError(400, "Your cart is empty.");

  const settings = await getSiteSettings();
  const method = settings.payments.methods.find((m) => m.enabled && m.id === input.payment?.method);
  if (!method) throw new ApiError(400, "Please choose a payment method.");
  const reference = method.details?.length
    ? text(input.payment?.reference, "Transaction ID", { min: 4, max: 120 })
    : null;

  return transaction(async (tx) => {
    const products = await tx.query(
      `SELECT p.id, p.slug, p.name, p.price, p.stock, p.emoji, c.name AS category,
              (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image
         FROM products p LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.slug IN (?) AND p.status = 'active' FOR UPDATE`,
      [[...wanted.keys()]]
    );
    const lines = [...wanted].map(([slug, quantity]) => {
      const product = products.find((p) => p.slug === slug);
      if (!product) throw new ApiError(409, "A product in your cart is no longer available. Please update your cart.");
      if (quantity > product.stock) {
        throw new ApiError(409, product.stock > 0 ? `Only ${product.stock} × ${product.name} left in stock. Please update your cart.` : `${product.name} is sold out.`);
      }
      return { product, quantity, price: Number(product.price) };
    });
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

    let discount = 0;
    let couponCode = null;
    if (input.couponCode) {
      const code = normalizeCode(input.couponCode);
      const row = await tx.query("SELECT * FROM coupons WHERE code = ?", [code]);
      const coupon = row[0] && { type: row[0].type, value: Number(row[0].value), minOrder: Number(row[0].min_order), active: !!row[0].is_active };
      const result = evaluateCoupon(coupon, subtotal);
      if (result.error) throw new ApiError(400, result.error);
      discount = result.discount;
      couponCode = code;
    }
    const shipping = shippingFor(subtotal - discount, settings.shipping);
    const total = subtotal - discount + shipping;

    let orderNumber = makeOrderNumber();
    while ((await tx.query("SELECT 1 FROM orders WHERE order_number = ?", [orderNumber])).length) orderNumber = makeOrderNumber();
    const accessKey = crypto.randomBytes(16).toString("hex");

    const result = await tx.query(
      `INSERT INTO orders (order_number, access_key, user_id, is_guest, customer_name, customer_email, customer_phone, city, address, notes,
                           subtotal, discount, coupon_code, shipping, total, status, payment_method, payment_title, payment_status, payment_reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing', ?, ?, 'Pending', ?)`,
      [orderNumber, accessKey, user?.id ?? null, !user, customer.name, customer.email, customer.phone, customer.city, customer.address,
       notes || null, subtotal, discount, couponCode, shipping, total, method.id, method.title, reference]
    );
    for (const l of lines) {
      await tx.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_emoji, product_image, category_name, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [result.insertId, l.product.id, l.product.name, l.product.emoji, l.product.image, l.product.category, l.price, l.quantity, l.price * l.quantity]
      );
      await tx.query("UPDATE products SET stock = stock - ? WHERE id = ?", [l.quantity, l.product.id]);
    }
    await tx.query("INSERT INTO order_status_history (order_id, status) VALUES (?, 'Processing')", [result.insertId]);
    return { id: orderNumber, key: accessKey };
  });
}

// ---------------- Looking up orders ----------------
const findRow = (orderNumber) => queryOne("SELECT * FROM orders WHERE order_number = ?", [String(orderNumber ?? "").trim().toUpperCase()]);

// Confirmation page: needs the secret key from the checkout, or the owner's / an admin's login.
export async function getOrderForViewer(orderNumber, key, user) {
  const row = await findRow(orderNumber);
  if (!row) return null;
  const keyOk = typeof key === "string" && row.access_key && key.length === row.access_key.length &&
    crypto.timingSafeEqual(Buffer.from(key), Buffer.from(row.access_key));
  const owner = user && row.user_id === user.id;
  if (!keyOk && !owner && !isStaff(user)) return null;
  return (await withDetails([row]))[0];
}

// Order tracking: order number + the email or phone used at checkout.
export async function trackOrder(orderNumber, contact) {
  const row = await findRow(orderNumber);
  if (!row) return null;
  const value = String(contact ?? "").trim().toLowerCase();
  const digits = (s) => String(s).replace(/\D/g, "");
  const phoneOk = digits(value).length >= 7 && digits(row.customer_phone).endsWith(digits(value).slice(-7));
  if (row.customer_email !== value && !phoneOk) return null;
  return (await withDetails([row]))[0];
}

// Only orders placed while logged in, or guest orders claimed with their secret key (see claimGuestOrders).
// Matching on email alone would show a stranger's orders to anyone who signs up with that address.
export async function listOrdersForUser(user) {
  const rows = await query("SELECT * FROM orders WHERE user_id = ? AND is_demo = 0 ORDER BY created_at DESC, id DESC", [user.id]);
  return withDetails(rows);
}

// Guest orders placed in this browser are added to the account when the customer logs in or signs up.
export async function claimGuestOrders(user, list) {
  for (const { id, key } of list.slice(0, 50)) {
    if (typeof id !== "string" || typeof key !== "string" || !/^[0-9a-f]{32}$/.test(key)) continue;
    await query("UPDATE orders SET user_id = ? WHERE order_number = ? AND access_key = ? AND user_id IS NULL", [user.id, id.trim().toUpperCase(), key]);
  }
}

export async function listAllOrders() {
  return withDetails(await query("SELECT * FROM orders ORDER BY created_at DESC, id DESC"));
}

export async function countPendingOrders() {
  const row = await queryOne("SELECT COUNT(*) AS count FROM orders WHERE status = 'Processing'");
  return Number(row.count);
}

// ---------------- Admin updates ----------------
export async function updateOrderStatus(orderNumber, status) {
  if (!ORDER_STATUSES.includes(status)) throw new ApiError(400, "Unknown status.");
  await transaction(async (tx) => {
    const [row] = await tx.query("SELECT id, status FROM orders WHERE order_number = ? FOR UPDATE", [orderNumber]);
    if (!row) throw new ApiError(404, "Order not found.");
    if (row.status === status) return;
    // Cancelling puts the items back in stock; un-cancelling takes them out again.
    const items = await tx.query("SELECT product_id, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL", [row.id]);
    const isDemo = (await tx.query("SELECT is_demo FROM orders WHERE id = ?", [row.id]))[0].is_demo;
    if (!isDemo && (status === "Cancelled" || row.status === "Cancelled")) {
      const sign = status === "Cancelled" ? 1 : -1;
      for (const item of items) {
        await tx.query("UPDATE products SET stock = GREATEST(0, CAST(stock AS SIGNED) + ?) WHERE id = ?", [sign * item.quantity, item.product_id]);
      }
    }
    await tx.query("UPDATE orders SET status = ? WHERE id = ?", [status, row.id]);
    await tx.query("INSERT INTO order_status_history (order_id, status) VALUES (?, ?)", [row.id, status]);
  });
}

export async function updatePaymentStatus(orderNumber, status) {
  if (!PAYMENT_STATUSES.includes(status)) throw new ApiError(400, "Unknown payment status.");
  const result = await query("UPDATE orders SET payment_status = ? WHERE order_number = ?", [status, orderNumber]);
  if (result.affectedRows === 0) throw new ApiError(404, "Order not found.");
}

// ---------------- Sample orders for the sales report ----------------
const demoNames = ["Ayesha Malik", "Bilal Ahmed", "Sana Riaz", "Usman Tariq", "Hira Shah", "Zain Ali", "Fatima Noor", "Hamza Iqbal"];
const demoCities = ["Lahore", "Karachi", "Islamabad", "Faisalabad", "Multan", "Peshawar"];

export async function addDemoOrders() {
  const settings = await getSiteSettings();
  const products = await query("SELECT p.id, p.name, p.price, p.emoji, c.name AS category FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.status = 'active'");
  const methods = settings.payments.methods.filter((m) => m.enabled);
  if (products.length === 0 || methods.length === 0) throw new ApiError(400, "Add products and payment methods first.");
  const pick = (list) => list[crypto.randomInt(list.length)];
  await transaction(async (tx) => {
    const [{ count }] = await tx.query("SELECT COUNT(*) AS count FROM orders WHERE is_demo = 1");
    for (let n = 0; n < 40; n++) {
      const created = new Date(Date.now() - crypto.randomInt(30 * 24 * 60) * 60 * 1000);
      const lines = Array.from({ length: 1 + crypto.randomInt(3) }, () => ({ product: pick(products), quantity: 1 + crypto.randomInt(2) }));
      const subtotal = lines.reduce((s, l) => s + Number(l.product.price) * l.quantity, 0);
      const shipping = shippingFor(subtotal, settings.shipping);
      const status = pick(["Delivered", "Delivered", "Delivered", "Shipped", "Processing", "Cancelled"]);
      const method = pick(methods);
      const name = pick(demoNames);
      const result = await tx.query(
        `INSERT INTO orders (order_number, user_id, is_guest, customer_name, customer_email, customer_phone, city, address, subtotal, discount,
                             shipping, total, status, payment_method, payment_title, payment_status, is_demo, created_at)
         VALUES (?, NULL, 1, ?, ?, '0300 0000000', ?, 'Demo address', ?, 0, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [`DEMO-${String(Number(count) + n + 1).padStart(3, "0")}`, name, `${name.split(" ")[0].toLowerCase()}@example.com`, pick(demoCities),
         subtotal, shipping, subtotal + shipping, status, method.id, method.title, status === "Delivered" ? "Paid" : "Pending", created]
      );
      for (const l of lines) {
        await tx.query(
          "INSERT INTO order_items (order_id, product_id, product_name, product_emoji, category_name, unit_price, quantity, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [result.insertId, l.product.id, l.product.name, l.product.emoji, l.product.category, l.product.price, l.quantity, Number(l.product.price) * l.quantity]
        );
      }
      await tx.query("INSERT INTO order_status_history (order_id, status, created_at) VALUES (?, 'Processing', ?)", [result.insertId, created]);
      if (status !== "Processing") {
        await tx.query("INSERT INTO order_status_history (order_id, status, created_at) VALUES (?, ?, ?)", [result.insertId, status, created]);
      }
    }
  });
}

export async function removeDemoOrders() {
  await query("DELETE FROM orders WHERE is_demo = 1");
}
