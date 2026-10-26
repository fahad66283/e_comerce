import { router, Stack } from "expo-router";
import { Pressable, View } from "react-native";
import { formatDate } from "@shared/lib/format";
import { confirmAction } from "@/components/admin";
import { Stars } from "@/components/shop";
import { Card, Loading, Row, Screen, T } from "@/components/ui";
import { useColors, useStore } from "@/context/StoreContext";
import { api, useApiData } from "@/lib/api";

export default function ReviewsAdminScreen() {
  const colors = useColors();
  const { refresh } = useStore();
  const { data, reload, loading } = useApiData("/api/admin/reviews");
  const reviews = data?.reviews ?? [];
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  async function remove(id) {
    await api("/api/admin/reviews", { method: "DELETE", body: { id } }).catch(() => {});
    reload();
    refresh(); // update average ratings
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Customer Reviews" }} />
      {reviews.length > 0 && (
        <Row gap={6} style={{ marginBottom: 14 }}>
          <Stars value={average} />
          <T size={14} color={colors.grey[500]}>
            {average.toFixed(1)} average from {reviews.length} reviews
          </T>
        </Row>
      )}
      {loading && !data ? (
        <Loading />
      ) : reviews.length === 0 ? (
        <T center color={colors.grey[500]} style={{ padding: 20 }}>
          No reviews yet.
        </T>
      ) : (
        <View style={{ gap: 10 }}>
          {reviews.map((r) => (
            <Card key={r.id} style={{ padding: 14, gap: 6 }}>
              <Row style={{ flexWrap: "wrap" }} gap={6}>
                <Stars value={r.rating} />
                <T weight="extrabold">{r.name}</T>
                {r.verified && (
                  <T weight="bold" size={12} color={colors.brand700}>
                    ✓ Verified buyer
                  </T>
                )}
                <T size={12} color={colors.grey[500]}>
                  · {formatDate(r.createdAt)}
                </T>
              </Row>
              <T size={13.5} color={colors.grey[500]}>
                on{" "}
                {r.product ? (
                  <T size={13.5} weight="bold" onPress={() => router.push(`/products/${encodeURIComponent(r.product.id)}`)}>
                    {r.product.emoji} {r.product.name}
                  </T>
                ) : (
                  "a removed product"
                )}
              </T>
              <T color={colors.grey[700]}>{r.comment}</T>
              <Pressable onPress={() => confirmAction("Delete this review?", () => remove(r.id))} accessibilityRole="button" accessibilityLabel={`Delete review by ${r.name}`} style={{ alignSelf: "flex-end" }} hitSlop={6}>
                <T weight="bold" size={14} color={colors.red}>
                  Delete
                </T>
              </Pressable>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
