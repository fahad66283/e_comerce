import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { formatPrice } from "@shared/data/products";
import { formatDate, ORDER_STATUSES, PAYMENT_STATUSES } from "@shared/lib/format";
import { useColors, useStore } from "@/context/StoreContext";
import { api } from "@/lib/api";
import { SearchBox, Tag } from "./admin";
import { OrderItems, StatusBadge } from "./shop";
import { Card, Notice, Pill, Row, T } from "./ui";

function OrderCard({ order: o, compact, onUpdate }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ padding: 14 }}>
      <Pressable onPress={() => !compact && setOpen((v) => !v)} accessibilityRole={compact ? undefined : "button"} accessibilityState={compact ? undefined : { expanded: open }} style={{ gap: 6 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T weight="extrabold">#{o.id}</T>
          <StatusBadge status={o.status} />
        </Row>
        <T size={12.5} color={colors.grey[500]}>
          {formatDate(o.createdAt, true)}
        </T>
        <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <T weight="bold">
              {o.customer.name} {o.guest && <T size={11} weight="bold" color={colors.grey[500]}>GUEST</T>} {o.demo && <T size={11} weight="bold" color={colors.grey[500]}>DEMO</T>}
            </T>
            <T size={12.5} color={colors.grey[500]}>
              {o.customer.phone} · {o.customer.city}
            </T>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <T weight="extrabold">{formatPrice(o.total)}</T>
            <T size={12} color={colors.grey[500]}>
              {o.items.reduce((n, i) => n + i.quantity, 0)} items{o.couponCode ? ` · ${o.couponCode}` : ""}
            </T>
          </View>
        </Row>
        <Row style={{ justifyContent: "space-between" }}>
          <T size={12.5} color={colors.grey[500]}>
            {o.payment.title}
          </T>
          <Tag bg={o.payment.status === "Paid" ? colors.brand100 : o.payment.status === "Pending" ? "#FEF3C7" : colors.grey[100]} color={o.payment.status === "Paid" ? colors.brand700 : o.payment.status === "Pending" ? "#92400E" : colors.grey[500]}>
            {o.payment.status}
          </Tag>
        </Row>
        {!compact && (
          <Row gap={4} style={{ justifyContent: "center" }}>
            <T size={12.5} weight="bold" color={colors.brand700}>
              {open ? "Hide details" : "Details & status"}
            </T>
            <Ionicons name={open ? "chevron-up" : "chevron-down"} size={14} color={colors.brand700} />
          </Row>
        )}
      </Pressable>

      {open && (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.grey[200], marginTop: 10, paddingTop: 10, gap: 10 }}>
          <View>
            <T weight="bold" size={13} color={colors.grey[700]} style={{ marginBottom: 6 }}>
              Order status
            </T>
            <Row gap={6} style={{ flexWrap: "wrap" }}>
              {ORDER_STATUSES.map((s) => (
                <Pill key={s} label={s} active={o.status === s} onPress={() => o.status !== s && onUpdate(o.id, { status: s })} style={{ paddingHorizontal: 12, paddingVertical: 6 }} />
              ))}
            </Row>
          </View>
          <View>
            <T weight="bold" size={13} color={colors.grey[700]} style={{ marginBottom: 6 }}>
              Payment status
            </T>
            <Row gap={6} style={{ flexWrap: "wrap" }}>
              {PAYMENT_STATUSES.map((s) => (
                <Pill key={s} label={s} active={o.payment.status === s} onPress={() => o.payment.status !== s && onUpdate(o.id, { paymentStatus: s })} style={{ paddingHorizontal: 12, paddingVertical: 6 }} />
              ))}
            </Row>
          </View>
          <OrderItems order={o} />
          <View style={{ gap: 2 }}>
            <T weight="extrabold" size={14}>
              Customer
            </T>
            <T size={14}>{o.customer.name}</T>
            <T size={14} color={colors.grey[500]}>
              {o.customer.address}, {o.customer.city}
            </T>
            <T size={14} color={colors.grey[500]} selectable>
              {o.customer.phone} · {o.customer.email}
            </T>
            {!!o.notes && (
              <T size={14} color={colors.grey[700]}>
                📝 {o.notes}
              </T>
            )}
            {!!o.payment.reference && (
              <T size={14} selectable>
                <T weight="extrabold" size={14}>
                  {o.payment.method === "stripe" ? "Stripe payment ID" : "Transaction ID"}:
                </T>{" "}
                {o.payment.reference}
              </T>
            )}
          </View>
          <View style={{ gap: 2 }}>
            <T weight="extrabold" size={14}>
              History
            </T>
            {(o.statusHistory ?? []).map((h, i) => (
              <T key={i} size={13} color={colors.grey[500]}>
                {h.status} · {formatDate(h.at, true)}
              </T>
            ))}
          </View>
          <Pressable onPress={() => router.push(`/order-confirmation?id=${encodeURIComponent(o.id)}`)} accessibilityRole="link">
            <T weight="bold" size={14} color={colors.brand700}>
              Open order page →
            </T>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

// Orders list with search and status filter. `compact` shows the latest few, read-only (overview).
export default function OrdersList({ orders, onChange, compact = false, limit }) {
  const colors = useColors();
  const { refresh } = useStore();
  const [failed, setFailed] = useState("");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  // Saves a status change, then reloads the orders (stock and badges refresh too).
  async function update(id, changes) {
    try {
      await api(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: changes });
      setFailed("");
    } catch (err) {
      setFailed(err.message);
    }
    onChange?.();
    refresh();
  }

  const q = search.trim().toLowerCase();
  let list = orders.filter(
    (o) =>
      (status === "All" || o.status === status) &&
      (!q || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.email.includes(q) || o.customer.phone.includes(q))
  );
  if (limit) list = list.slice(0, limit);

  return (
    <View>
      <Notice tone="error" style={{ marginBottom: 12 }}>
        {failed}
      </Notice>
      {!compact && (
        <>
          <SearchBox value={search} onChangeText={setSearch} placeholder="Search by order ID, name, email or phone" label="Search orders" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, marginBottom: 12 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {["All", ...ORDER_STATUSES].map((s) => (
              <Pill key={s} label={`${s} (${s === "All" ? orders.length : orders.filter((o) => o.status === s).length})`} active={status === s} onPress={() => setStatus(s)} style={{ paddingHorizontal: 13, paddingVertical: 6 }} />
            ))}
          </ScrollView>
        </>
      )}
      {list.length === 0 ? (
        <Card style={{ padding: 24 }}>
          <T center color={colors.grey[500]}>
            {orders.length === 0 ? "No orders yet." : "No orders match this filter."}
          </T>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {list.map((o) => (
            <OrderCard key={o.id} order={o} compact={compact} onUpdate={update} />
          ))}
        </View>
      )}
    </View>
  );
}
