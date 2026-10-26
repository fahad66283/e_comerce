import { Stack } from "expo-router";
import { View } from "react-native";
import { formatPrice } from "@shared/data/products";
import { Tag } from "@/components/admin";
import { Card, Loading, Notice, Row, Screen, T } from "@/components/ui";
import { useColors } from "@/context/StoreContext";
import { useApiData } from "@/lib/api";

// Registered customers plus guests who ordered (from MySQL).
export default function CustomersScreen() {
  const colors = useColors();
  const { data, loading, error } = useApiData("/api/admin/customers");
  const rows = data?.customers ?? [];
  return (
    <Screen>
      <Stack.Screen options={{ title: "Customers" }} />
      {loading && !data ? (
        <Loading label="Loading customers..." />
      ) : error ? (
        <Notice tone="error">{error}</Notice>
      ) : rows.length === 0 ? (
        <T center color={colors.grey[500]} style={{ padding: 20 }}>
          No customers yet.
        </T>
      ) : (
        <View style={{ gap: 10 }}>
          {rows.map((c) => (
            <Card key={c.email} style={{ padding: 14, gap: 4 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <T weight="extrabold" style={{ flex: 1 }}>
                  {c.name}
                </T>
                <Tag bg={c.guest ? colors.grey[100] : colors.brand100} color={c.guest ? colors.grey[500] : colors.brand700}>
                  {c.guest ? "Guest" : "Registered"}
                </Tag>
              </Row>
              <T size={13.5} color={colors.grey[500]} selectable>
                {c.email}
              </T>
              <Row style={{ justifyContent: "space-between" }}>
                <T size={14}>{c.orders} orders</T>
                <T weight="extrabold" size={14}>
                  {formatPrice(c.spent)}
                </T>
              </Row>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
