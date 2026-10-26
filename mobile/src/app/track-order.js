import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import OrderDetails from "@/components/OrderDetails";
import { Button, Field, Notice, Panel, Screen, SectionHeading } from "@/components/ui";
import { useAuth } from "@/context/StoreContext";
import { api } from "@/lib/api";

export default function TrackOrderScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [id, setId] = useState(typeof params.id === "string" ? params.id : "");
  const [contact, setContact] = useState(user?.email ?? "");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function track() {
    setBusy(true);
    try {
      const data = await api("/api/orders/track", { method: "POST", body: { id: id.trim().replace(/^#/, ""), contact: contact.trim() } });
      setOrder(data.order);
      setError("");
    } catch (err) {
      setOrder(null);
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Track Order" }} />
      <SectionHeading eyebrow="Order Tracking" title="Track your order" text="Enter your order ID and the email or phone number you used at checkout." />
      <Panel style={{ marginBottom: 16 }}>
        <Field label="Order ID" value={id} onChangeText={setId} placeholder="HAK-261021-XXXX" autoCapitalize="characters" autoCorrect={false} />
        <Field label="Email or Phone" value={contact} onChangeText={setContact} autoCapitalize="none" autoCorrect={false} onSubmitEditing={track} />
        <Button title={busy ? "Searching..." : "Track"} onPress={track} loading={busy} disabled={!id.trim() || !contact.trim()} />
      </Panel>
      <Notice tone="error">{error}</Notice>
      {order && (
        <View>
          <OrderDetails order={order} showCustomer={false} />
        </View>
      )}
    </Screen>
  );
}
