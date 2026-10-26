import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import OrdersList from "@/components/OrdersList";
import { Loading, Notice, Screen } from "@/components/ui";
import { useApiData } from "@/lib/api";

export default function OrdersScreen() {
  const { data, error, loading, reload } = useApiData("/api/admin/orders");
  const [refreshing, setRefreshing] = useState(false);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );
  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        reload();
        setTimeout(() => setRefreshing(false), 600);
      }}
    >
      <Stack.Screen options={{ title: "Orders" }} />
      <Notice tone="error">{error}</Notice>
      {loading && !data ? <Loading label="Loading orders..." /> : <OrdersList orders={data?.orders ?? []} onChange={reload} />}
    </Screen>
  );
}
