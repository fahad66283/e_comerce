import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { formatPrice } from "@shared/data/products";
import { PAYMENT_ICONS } from "@shared/data/siteContent";
import { StatTile } from "@/components/admin";
import { StatusBadge } from "@/components/shop";
import { Button, Card, Heading, Loading, Notice, Pill, Row, Screen, T } from "@/components/ui";
import { useColors, useProducts } from "@/context/StoreContext";
import { api, useApiData } from "@/lib/api";
import { shareTextFile } from "@/lib/files";

const ranges = [
  { key: 7, label: "Last 7 days" },
  { key: 30, label: "Last 30 days" },
  { key: 90, label: "Last 90 days" },
  { key: 0, label: "All time" },
];
const DAY = 24 * 60 * 60 * 1000;

function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shortDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Daily revenue columns: one series, one hue, no legend. Tap a day to read its values;
// "Show as table" lists every day.
function RevenueChart({ days }) {
  const colors = useColors();
  const [showTable, setShowTable] = useState(false);
  const [selected, setSelected] = useState(null);
  const max = Math.max(...days.map((d) => d.revenue), 1);
  const picked = days.find((d) => d.key === selected);
  const height = 180;

  return (
    <Card style={{ padding: 14 }}>
      <Row style={{ justifyContent: "space-between", marginBottom: 8 }}>
        <Heading size={16}>Revenue per day</Heading>
        <Pressable onPress={() => setShowTable((v) => !v)} accessibilityRole="button" hitSlop={6}>
          <T weight="bold" size={13.5} color={colors.brand700}>
            {showTable ? "Show chart" : "Show as table"}
          </T>
        </Pressable>
      </Row>
      {showTable ? (
        <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
          {[...days].reverse().map((d) => (
            <Row key={d.key} style={{ justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.grey[200], paddingVertical: 6 }}>
              <T size={13.5} style={{ width: 70 }}>
                {shortDate(d.key)}
              </T>
              <T size={13.5} color={colors.grey[500]}>
                {d.orders} {d.orders === 1 ? "order" : "orders"}
              </T>
              <T size={13.5} weight="bold" style={{ width: 100, textAlign: "right" }}>
                {formatPrice(d.revenue)}
              </T>
            </Row>
          ))}
        </ScrollView>
      ) : (
        <>
          <View style={{ minHeight: 40, justifyContent: "center", marginBottom: 6 }}>
            {picked ? (
              <T size={13.5}>
                <T weight="extrabold" size={15}>
                  {formatPrice(picked.revenue)}
                </T>
                {"  "}
                {shortDate(picked.key)} · {picked.orders} {picked.orders === 1 ? "order" : "orders"}
              </T>
            ) : (
              <T size={13} color={colors.grey[500]}>
                Tap a day to see its revenue.
              </T>
            )}
          </View>
          <Row gap={6} style={{ alignItems: "stretch" }}>
            <View style={{ height, justifyContent: "space-between", width: 62 }}>
              {[max, max / 2, 0].map((v) => (
                <T key={v} size={10.5} color={colors.grey[500]} style={{ textAlign: "right" }}>
                  {formatPrice(Math.round(v))}
                </T>
              ))}
            </View>
            <View style={{ flex: 1, height }}>
              {/* recessive grid: max and half dashed, baseline solid */}
              <View style={{ position: "absolute", left: 0, right: 0, top: 0, borderTopWidth: 1, borderStyle: "dashed", borderColor: colors.grey[200] }} />
              <View style={{ position: "absolute", left: 0, right: 0, top: height / 2, borderTopWidth: 1, borderStyle: "dashed", borderColor: colors.grey[200] }} />
              <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 2, borderBottomWidth: 1, borderBottomColor: colors.grey[400] }}>
                {days.map((d) => (
                  <Pressable
                    key={d.key}
                    onPress={() => setSelected(d.key === selected ? null : d.key)}
                    accessibilityRole="button"
                    accessibilityLabel={`${shortDate(d.key)}: ${formatPrice(d.revenue)} from ${d.orders} orders`}
                    style={{ flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center" }}
                  >
                    <View
                      style={{
                        width: "100%",
                        maxWidth: 24,
                        height: `${(d.revenue / max) * 100}%`,
                        minHeight: d.revenue > 0 ? 3 : 0,
                        backgroundColor: colors.brand700,
                        opacity: selected && selected !== d.key ? 0.45 : 1,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      }}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          </Row>
          <Row style={{ justifyContent: "space-between", marginLeft: 68, marginTop: 4 }}>
            <T size={10.5} color={colors.grey[500]}>
              {shortDate(days[0].key)}
            </T>
            <T size={10.5} color={colors.grey[500]}>
              {shortDate(days[days.length - 1].key)}
            </T>
          </Row>
        </>
      )}
    </Card>
  );
}

// Horizontal bars for a breakdown (single hue = magnitude), values labelled directly.
function BarList({ rows, format = formatPrice }) {
  const colors = useColors();
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <View style={{ gap: 10 }}>
      {rows.map((r) => (
        <View key={r.label}>
          <Row style={{ justifyContent: "space-between", marginBottom: 4 }}>
            <T weight="bold" size={13.5} style={{ flex: 1 }}>
              {r.label}
            </T>
            <T size={13.5} color={colors.grey[700]}>
              {format(r.value)}
            </T>
          </Row>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.grey[100], overflow: "hidden" }}>
            <View style={{ height: "100%", borderRadius: 5, backgroundColor: colors.brand700, width: `${(r.value / max) * 100}%` }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function ReportsScreen() {
  const colors = useColors();
  const { products } = useProducts();
  const { data, loading, reload } = useApiData("/api/admin/orders");
  const orders = data?.orders ?? [];
  const [range, setRange] = useState(30);
  const [now] = useState(() => Date.now()); // fixed while the screen is open
  const [demoBusy, setDemoBusy] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  const inRange = orders.filter((o) => range === 0 || now - new Date(o.createdAt).getTime() <= range * DAY);
  const valid = inRange.filter((o) => o.status !== "Cancelled");
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const itemsSold = valid.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);
  const discounts = valid.reduce((s, o) => s + (o.discount ?? 0), 0);
  const hasDemo = orders.some((o) => o.demo);

  const chartDays = range === 0 ? 90 : range;
  const days = Array.from({ length: chartDays }, (_, i) => {
    const key = dayKey(now - (chartDays - 1 - i) * DAY);
    const dayOrders = valid.filter((o) => dayKey(o.createdAt) === key);
    return { key, orders: dayOrders.length, revenue: dayOrders.reduce((s, o) => s + o.total, 0) };
  });

  const byProduct = {};
  const byCategory = {};
  for (const o of valid) {
    for (const i of o.items) {
      const p = (byProduct[i.id ?? i.name] ??= { name: i.name, emoji: i.emoji, units: 0, revenue: 0 });
      p.units += i.quantity;
      p.revenue += i.price * i.quantity;
      const category = i.category ?? products.find((x) => x.id === i.id)?.category ?? "Other";
      byCategory[category] = (byCategory[category] ?? 0) + i.price * i.quantity;
    }
  }
  const topProducts = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const categoryRows = Object.entries(byCategory).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const paymentCounts = {};
  for (const o of inRange) {
    const key = `${PAYMENT_ICONS[o.payment.method] ?? "💳"} ${o.payment.title}`;
    paymentCounts[key] = (paymentCounts[key] ?? 0) + 1;
  }
  const paymentRows = Object.entries(paymentCounts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const statusCounts = ["Processing", "Shipped", "Delivered", "Cancelled"].map((s) => ({ status: s, count: inRange.filter((o) => o.status === s).length }));

  async function exportCsv() {
    const header = ["Order ID", "Date", "Customer", "Email", "Phone", "City", "Items", "Subtotal", "Discount", "Shipping", "Total", "Status", "Payment", "Payment Status"];
    const rows = inRange.map((o) => [
      o.id, new Date(o.createdAt).toISOString().slice(0, 10), o.customer.name, o.customer.email, o.customer.phone, o.customer.city,
      o.items.map((i) => `${i.name} x${i.quantity}`).join("; "), o.subtotal, o.discount ?? 0, o.shipping, o.total, o.status, o.payment.title, o.payment.status,
    ]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    try {
      await shareTextFile(`hak-orders-${dayKey(now)}.csv`, csv, "text/csv");
    } catch (err) {
      setMessage({ text: err.message, error: true });
    }
  }

  // Sample orders (stored with is_demo = 1) so the charts have something to show.
  async function demo(method) {
    setDemoBusy(true);
    try {
      await api("/api/admin/orders/demo", { method });
      setMessage({ text: method === "POST" ? "Demo orders added." : "Demo orders removed.", error: false });
    } catch (err) {
      setMessage({ text: err.message, error: true });
    }
    setDemoBusy(false);
    reload();
  }

  if (loading && !data) return <Loading label="Loading report..." />;

  return (
    <Screen>
      <Stack.Screen options={{ title: "Sales Report" }} />
      <Row gap={8} style={{ flexWrap: "wrap", marginBottom: 12 }}>
        {hasDemo ? (
          <Button title="Remove demo orders" size="sm" variant="outline" onPress={() => demo("DELETE")} loading={demoBusy} />
        ) : (
          <Button title="Add demo orders" size="sm" variant="outline" onPress={() => demo("POST")} loading={demoBusy} disabled={products.length === 0} />
        )}
        <Button title="Export CSV" size="sm" variant="dark" onPress={exportCsv} disabled={inRange.length === 0} />
      </Row>
      {!!message.text && (
        <Notice tone={message.error ? "error" : "success"} style={{ marginBottom: 12 }}>
          {message.text}
        </Notice>
      )}

      {/* Date range: one row above everything it scopes */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, marginBottom: 12 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} accessibilityRole="radiogroup">
        {ranges.map((r) => (
          <Pill key={r.key} label={r.label} active={range === r.key} onPress={() => setRange(r.key)} style={{ paddingHorizontal: 13, paddingVertical: 6 }} />
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <StatTile label="Revenue" value={formatPrice(revenue)} note="Excludes cancelled orders" />
        <StatTile label="Orders" value={inRange.length} note={`${valid.length} not cancelled`} />
        <StatTile label="Avg. Order Value" value={formatPrice(valid.length ? Math.round(revenue / valid.length) : 0)} />
        <StatTile label="Items Sold" value={itemsSold} />
        <StatTile label="Discounts Given" value={formatPrice(discounts)} style={{ flexBasis: "100%" }} />
      </View>

      {inRange.length === 0 ? (
        <Card style={{ padding: 20 }}>
          <T center color={colors.grey[500]}>
            No orders in this period yet. Use “Add demo orders” to preview the report with sample data.
          </T>
        </Card>
      ) : (
        <View style={{ gap: 14 }}>
          <RevenueChart days={days} />
          <Card style={{ padding: 14 }}>
            <Heading size={16} style={{ marginBottom: 10 }}>
              Top products
            </Heading>
            {topProducts.map((p) => (
              <Row key={p.name} style={{ borderTopWidth: 1, borderTopColor: colors.grey[200], paddingVertical: 8 }}>
                <T weight="bold" size={14} style={{ flex: 1 }}>
                  {p.emoji} {p.name}
                </T>
                <T size={14} color={colors.grey[500]} style={{ width: 54, textAlign: "right" }}>
                  ×{p.units}
                </T>
                <T weight="bold" size={14} style={{ width: 96, textAlign: "right" }}>
                  {formatPrice(p.revenue)}
                </T>
              </Row>
            ))}
          </Card>
          <Card style={{ padding: 14 }}>
            <Heading size={16} style={{ marginBottom: 10 }}>
              Sales by category
            </Heading>
            <BarList rows={categoryRows} />
          </Card>
          <Card style={{ padding: 14 }}>
            <Heading size={16} style={{ marginBottom: 10 }}>
              Orders by status
            </Heading>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {statusCounts.map((s) => (
                <Row key={s.status} style={{ flexBasis: "47%", flexGrow: 1, justifyContent: "space-between", backgroundColor: colors.grey[50], borderRadius: 10, padding: 10 }}>
                  <StatusBadge status={s.status} />
                  <T weight="black" size={18}>
                    {s.count}
                  </T>
                </Row>
              ))}
            </View>
          </Card>
          <Card style={{ padding: 14 }}>
            <Heading size={16} style={{ marginBottom: 10 }}>
              Payment methods
            </Heading>
            <BarList rows={paymentRows} format={(v) => `${v} ${v === 1 ? "order" : "orders"}`} />
          </Card>
        </View>
      )}
    </Screen>
  );
}
