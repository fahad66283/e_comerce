import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { formatPrice } from "@shared/data/products";
import { ROLE_LABELS } from "@shared/data/roles";
import { formatDate } from "@shared/lib/format";
import ChangePassword from "@/components/ChangePassword";
import StoreFooter from "@/components/StoreFooter";
import { OrderItems, StatusBadge } from "@/components/shop";
import { Button, Card, Empty, Heading, Loading, Notice, Panel, Row, Screen, SectionHeading, T } from "@/components/ui";
import { useAuth, useColors, useStore } from "@/context/StoreContext";
import { useApiData } from "@/lib/api";
import { radius } from "@/lib/theme";

const quickLinks = [
  { href: "/products", icon: "🛍️", label: "Continue Shopping" },
  { href: "/track-order", icon: "🚚", label: "Track Order" },
  { href: "/return-policy", icon: "🔄", label: "Return Policy" },
  { href: "/faqs", icon: "❓", label: "FAQs" },
  { href: "/contact", icon: "💬", label: "Contact Support" },
  { href: "/about", icon: "🏬", label: "About Us" },
];

function QuickLinks() {
  const colors = useColors();
  return (
    <Panel style={{ padding: 8 }}>
      {quickLinks.map((l) => (
        <Pressable key={l.href} onPress={() => router.push(l.href)} accessibilityRole="link" style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.field }, pressed && { backgroundColor: colors.grey[50] }]}>
          <T>{l.icon}</T>
          <T weight="bold" style={{ flex: 1 }}>
            {l.label}
          </T>
          <Ionicons name="chevron-forward" size={18} color={colors.grey[400]} />
        </Pressable>
      ))}
    </Panel>
  );
}

function OrderRow({ order }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ padding: 16 }}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ gap: 8 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T weight="extrabold">#{order.id}</T>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.grey[400]} />
        </Row>
        <T size={13.5} color={colors.grey[500]}>
          {formatDate(order.createdAt)} · {order.items.reduce((n, i) => n + i.quantity, 0)} items
        </T>
        <Row style={{ justifyContent: "space-between" }}>
          <StatusBadge status={order.status} />
          <T weight="extrabold">{formatPrice(order.total)}</T>
        </Row>
      </Pressable>
      {open && (
        <View style={{ borderTopWidth: 1, borderTopColor: colors.grey[200], marginTop: 12, paddingTop: 4 }}>
          <OrderItems order={order} />
          <T size={13.5} color={colors.grey[500]} style={{ marginTop: 10 }}>
            Delivering to {order.customer.address}, {order.customer.city} · {order.payment.title} ({order.payment.status})
          </T>
          <Pressable onPress={() => router.push(`/track-order?id=${encodeURIComponent(order.id)}`)} accessibilityRole="link" style={{ marginTop: 10 }}>
            <T weight="extrabold" size={14} color={colors.brand700}>
              Track this order →
            </T>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

export default function AccountScreen() {
  const colors = useColors();
  const { user, isAdmin, logout, adminSummary } = useAuth();
  const { refresh } = useStore();
  const { data, loading, error, reload } = useApiData(user ? `/api/account/orders?u=${user.id}` : null);
  const [refreshing, setRefreshing] = useState(false);

  // New orders appear when coming back to this tab.
  useFocusEffect(
    useCallback(() => {
      if (user) reload();
    }, [user, reload])
  );

  if (!user) {
    return (
      <Screen>
        <Panel>
          <Empty
            emoji="👤"
            title="Login to your account"
            text="View your orders and account details."
            action={
              <Row gap={10}>
                <Button title="Login" onPress={() => router.push("/login?next=/account")} />
                <Button title="Sign Up" variant="outline" onPress={() => router.push("/signup?next=/account")} />
              </Row>
            }
          />
        </Panel>
        <View style={{ marginTop: 16, gap: 16 }}>
          <QuickLinks />
          <StoreFooter />
        </View>
      </Screen>
    );
  }

  const orders = data?.orders ?? [];
  const totalSpent = orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0);

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await Promise.all([refresh(), reload()]);
        setRefreshing(false);
      }}
    >
      <SectionHeading eyebrow="My Account" title={`Welcome back, ${user.name}`} text="Manage your details and keep track of your orders." />
      <View style={{ gap: 16 }}>
        <Panel>
          <Row gap={14}>
            <View style={{ width: 54, height: 54, borderRadius: radius.pill, backgroundColor: colors.brand500, alignItems: "center", justifyContent: "center" }}>
              <T weight="black" size={21}>
                {user.name.charAt(0).toUpperCase()}
              </T>
            </View>
            <View style={{ flex: 1 }}>
              <T weight="extrabold" numberOfLines={1}>
                {user.name}
              </T>
              <T size={13.5} color={colors.grey[500]} numberOfLines={1}>
                {user.email}
              </T>
            </View>
          </Row>
          <Row gap={10} style={{ marginTop: 16 }}>
            {[
              ["Orders", String(orders.length)],
              ["Total Spent", formatPrice(totalSpent)],
            ].map(([label, value]) => (
              <View key={label} style={{ flex: 1, backgroundColor: colors.grey[50], borderRadius: radius.card, padding: 12, alignItems: "center" }}>
                <T weight="bold" size={12} color={colors.grey[500]}>
                  {label}
                </T>
                <T weight="black" size={17} color={colors.brand600}>
                  {value}
                </T>
              </View>
            ))}
          </Row>
          <T size={14} color={colors.grey[500]} style={{ marginTop: 12 }}>
            Account type: <T weight="extrabold">{ROLE_LABELS[user.role]}</T>
          </T>
          <View style={{ marginTop: 14, gap: 10 }}>
            {isAdmin && (
              <Button
                title={`Open Dashboard${adminSummary.pendingOrders + adminSummary.unreadMessages ? ` (${adminSummary.pendingOrders + adminSummary.unreadMessages})` : ""}`}
                variant="dark"
                size="sm"
                onPress={() => router.push("/dashboard")}
              />
            )}
            <Button title="Logout" variant="outline" size="sm" onPress={logout} />
          </View>
        </Panel>

        <ChangePassword />

        <View>
          <Heading size={20} style={{ marginBottom: 12 }}>
            My Orders
          </Heading>
          {loading && !data ? (
            <Loading label="Loading your orders..." />
          ) : error ? (
            <Notice tone="error">{error}</Notice>
          ) : orders.length === 0 ? (
            <Panel>
              <Empty emoji="📦" title="You haven't placed any orders yet." action={<Button title="Start Shopping" onPress={() => router.push("/products")} />} />
            </Panel>
          ) : (
            <View style={{ gap: 12 }}>
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </View>
          )}
          <T size={12.5} color={colors.grey[500]} style={{ marginTop: 10 }}>
            Orders you placed as a guest on this phone are added when you log in. For other orders, use Track Order.
          </T>
        </View>

        <QuickLinks />
        <StoreFooter />
      </View>
    </Screen>
  );
}
