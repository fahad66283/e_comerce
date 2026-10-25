import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { formatPrice } from "@shared/data/products";
import { StatTile } from "@/components/admin";
import OrdersList from "@/components/OrdersList";
import { Heading, Notice, Row, Screen, SectionHeading, T } from "@/components/ui";
import { useAuth, useColors, useProducts, useSettings, useStore } from "@/context/StoreContext";
import { useApiData } from "@/lib/api";
import { radius } from "@/lib/theme";

function Alert({ tone, icon, text, action, href }) {
  const colors = useColors();
  const tones = { red: ["#FEF2F2", "#FECACA", "#991B1B"], amber: ["#FFFBEB", "#FDE68A", "#78350F"], blue: ["#F0F9FF", "#BAE6FD", "#0C4A6E"] }[tone];
  return (
    <Pressable onPress={() => router.push(href)} accessibilityRole="button" style={{ backgroundColor: tones[0], borderColor: tones[1], borderWidth: 1, borderRadius: radius.card, padding: 12, gap: 6 }}>
      <T weight="bold" size={14} color={tones[2]}>
        {icon} {text}
      </T>
      <T weight="extrabold" size={13.5} color={tones[2]} style={{ textDecorationLine: "underline" }}>
        {action}
      </T>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const { user, isSuperAdmin, adminSummary } = useAuth();
  const { products } = useProducts();
  const { settings } = useSettings();
  const { refresh } = useStore();
  const lowStockAt = settings.inventory.lowStock;
  const { data, error, reload } = useApiData("/api/admin/orders");
  const orders = data?.orders ?? [];
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === "Processing");
  const toVerify = orders.filter((o) => !["cod", "stripe"].includes(o.payment.method) && o.payment.status === "Pending" && o.status !== "Cancelled");
  const outOfStock = products.filter((p) => p.stock < 1);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= lowStockAt);
  const customerCount = new Set(orders.filter((o) => !o.demo).map((o) => o.customer.email)).size;

  const sections = [
    { href: "/dashboard/orders", icon: "receipt", label: "Orders", badge: pending.length },
    { href: "/dashboard/products", icon: "cube", label: "Products", badge: outOfStock.length + lowStock.length },
    { href: "/dashboard/categories", icon: "albums", label: "Categories" },
    { href: "/dashboard/coupons", icon: "pricetags", label: "Coupons" },
    { href: "/dashboard/reviews", icon: "star", label: "Reviews" },
    { href: "/dashboard/customers", icon: "people", label: "Customers" },
    { href: "/dashboard/messages", icon: "mail", label: "Messages", badge: adminSummary.unreadMessages },
    { href: "/dashboard/reports", icon: "bar-chart", label: "Reports" },
  ];
  const superSections = [
    { href: "/dashboard/editor?group=website", icon: "color-palette", label: "Website" },
    { href: "/dashboard/editor?group=settings", icon: "settings", label: "Settings" },
    { href: "/dashboard/users", icon: "person-add", label: "Users" },
    { href: "/dashboard/backup", icon: "cloud-download", label: "Backup" },
  ];

  const tile = (s) => (
    <Pressable key={s.href} onPress={() => router.push(s.href)} accessibilityRole="button" accessibilityLabel={`${s.label}${s.badge ? `, ${s.badge} to check` : ""}`} style={{ flexBasis: "30%", flexGrow: 1, borderWidth: 1.5, borderColor: colors.grey[200], borderRadius: radius.card, paddingVertical: 14, alignItems: "center", gap: 6 }}>
      <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.brand100, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={s.icon} size={20} color={colors.brand700} />
      </View>
      <T weight="extrabold" size={13}>
        {s.label}
      </T>
      {s.badge > 0 && (
        <View style={{ position: "absolute", top: 8, right: 8, backgroundColor: colors.red, borderRadius: 10, minWidth: 20, paddingHorizontal: 6, alignItems: "center" }}>
          <T weight="extrabold" size={11} color="#FFFFFF">
            {s.badge}
          </T>
        </View>
      )}
    </Pressable>
  );

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        reload();
        await refresh();
        setRefreshing(false);
      }}
    >
      <Stack.Screen options={{ title: isSuperAdmin ? "Super Admin Dashboard" : "Dashboard" }} />
      <SectionHeading
        eyebrow="Admin"
        title={`Welcome, ${user.name}`}
        text={isSuperAdmin ? "Manage the store, edit every part of the website, and control who has access." : "Track sales and manage orders, products, categories and customers."}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>{sections.map(tile)}</View>
      {isSuperAdmin && (
        <>
          <T weight="extrabold" size={12} color={colors.grey[400]} style={{ textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
            Super admin
          </T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>{superSections.map(tile)}</View>
        </>
      )}

      <Heading size={20} style={{ marginBottom: 10 }}>
        Notifications
      </Heading>
      {pending.length + toVerify.length + outOfStock.length + lowStock.length === 0 ? (
        <Notice tone="plain">✓ All caught up. No alerts right now.</Notice>
      ) : (
        <View style={{ gap: 8 }}>
          {outOfStock.length > 0 && <Alert tone="red" icon="⛔" text={`${outOfStock.length} out of stock: ${outOfStock.map((p) => p.name).join(", ")}`} action="Restock" href="/dashboard/products?filter=out" />}
          {lowStock.length > 0 && <Alert tone="amber" icon="⚠️" text={`${lowStock.length} running low (≤ ${lowStockAt} left): ${lowStock.map((p) => `${p.name} (${p.stock})`).join(", ")}`} action="View" href="/dashboard/products?filter=low" />}
          {pending.length > 0 && <Alert tone="blue" icon="🧾" text={`${pending.length} new ${pending.length === 1 ? "order" : "orders"} waiting to be processed`} action="Process" href="/dashboard/orders" />}
          {toVerify.length > 0 && <Alert tone="amber" icon="💳" text={`${toVerify.length} online ${toVerify.length === 1 ? "payment" : "payments"} to verify`} action="Verify" href="/dashboard/orders" />}
        </View>
      )}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
        <StatTile label="Revenue" value={formatPrice(revenue)} />
        <StatTile label="Orders" value={orders.length} />
        <StatTile label="Products" value={products.length} />
        <StatTile label="Customers" value={customerCount} />
      </View>

      <Row style={{ justifyContent: "space-between", marginTop: 24, marginBottom: 10 }}>
        <Heading size={20}>Recent Orders</Heading>
        <Pressable onPress={() => router.push("/dashboard/orders")} accessibilityRole="link">
          <T weight="extrabold" size={14} color={colors.brand700}>
            View all →
          </T>
        </Pressable>
      </Row>
      <Notice tone="error">{error && `Could not load orders: ${error}`}</Notice>
      <OrdersList orders={orders} compact limit={5} />
    </Screen>
  );
}
