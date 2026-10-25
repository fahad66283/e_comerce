import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import OrderDetails from "@/components/OrderDetails";
import { Button, Empty, Loading, Notice, Row, Screen, T } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { useAuth, useColors } from "@/context/StoreContext";
import { useApiData } from "@/lib/api";
import { radius } from "@/lib/theme";

export default function OrderConfirmationScreen() {
  const colors = useColors();
  const { id, key = "", session_id: sessionId } = useLocalSearchParams();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const query = `key=${encodeURIComponent(key)}${sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : ""}`;
  const { data, loading, reload } = useApiData(id ? `/api/orders/${encodeURIComponent(id)}?${query}` : null);
  const order = data?.order;
  const [checks, setChecks] = useState(0);
  const paidByCard = !!sessionId && order?.payment.method === "stripe";

  useEffect(() => {
    if (paidByCard && order.payment.status === "Paid") clearCart();
  }, [paidByCard, order?.payment.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stripe can take a few seconds to confirm: check again a few times.
  useEffect(() => {
    if (!paidByCard || order.payment.status !== "Pending" || order.status === "Cancelled" || checks >= 5) return;
    const timer = setTimeout(() => {
      setChecks((n) => n + 1);
      reload();
    }, 3000);
    return () => clearTimeout(timer);
  }, [paidByCard, order?.payment.status, order?.status, checks, reload]);

  const title = <Stack.Screen options={{ title: "Order Confirmed", headerBackVisible: false, gestureEnabled: false }} />;

  if (id && loading && !order) return <Loading label="Loading your order..." />;
  if (!order) {
    return (
      <Screen>
        {title}
        <Empty
          emoji="🔍"
          title="Order not found"
          text="Check the link from your confirmation, or use Track Order with your order ID and email or phone."
          action={
            <Row gap={10}>
              <Button title="Track Order" onPress={() => router.replace("/track-order")} />
              <Button title="Continue Shopping" variant="outline" onPress={() => router.dismissTo("/products")} />
            </Row>
          }
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {title}
      <View style={{ alignItems: "center", gap: 8, marginBottom: 18 }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.brand100, alignItems: "center", justifyContent: "center" }}>
          <T weight="black" size={36} color={colors.brand700}>
            ✓
          </T>
        </View>
        <T weight="extrabold" size={23} center>
          Thank you, your order has been received!
        </T>
        <T color={colors.grey[500]} center>
          We&apos;ll start preparing it right away. It should arrive within 2–5 working days.
        </T>
        <View style={{ borderWidth: 1.5, borderColor: colors.grey[200], backgroundColor: colors.grey[100], borderRadius: radius.pill, paddingHorizontal: 20, paddingVertical: 9 }}>
          <T weight="extrabold" selectable>
            #{order.id}
          </T>
        </View>
        {paidByCard && (
          <Notice tone={order.payment.status === "Paid" ? "success" : "warning"} style={{ alignSelf: "stretch" }}>
            {order.payment.status === "Paid"
              ? "✓ Your card payment was successful."
              : checks >= 5
                ? "We haven't received the payment confirmation yet. It will update automatically – you can track this order any time."
                : "Confirming your card payment..."}
          </Notice>
        )}
      </View>

      <OrderDetails order={order} />

      <T size={13} color={colors.grey[500]} center style={{ marginTop: 16 }}>
        Save your order ID #{order.id} to track your order any time.
      </T>
      <View style={{ marginTop: 16, gap: 10 }}>
        <Button title="Continue Shopping" onPress={() => router.dismissTo("/products")} />
        {user ? (
          <Button title="View My Orders" variant="outline" onPress={() => router.dismissTo("/account")} />
        ) : (
          <Button title="Create an Account" variant="outline" onPress={() => router.push("/signup?next=/account")} />
        )}
      </View>
    </Screen>
  );
}
