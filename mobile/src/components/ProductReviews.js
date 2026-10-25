import { useState } from "react";
import { View } from "react-native";
import { formatDate } from "@shared/lib/format";
import { useAuth, useColors, useReviews, useStore } from "@/context/StoreContext";
import { api, useApiData } from "@/lib/api";
import { radius } from "@/lib/theme";
import { StarInput, Stars } from "./shop";
import { Button, Card, Field, Heading, Notice, Panel, Row, T } from "./ui";

export default function ProductReviews({ product }) {
  const colors = useColors();
  const { getRating } = useReviews();
  const { user } = useAuth();
  const { refresh } = useStore();
  const { data, reload } = useApiData(`/api/reviews?product=${encodeURIComponent(product.id)}`);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false);
  const [busy, setBusy] = useState(false);

  const reviews = data?.reviews ?? [];
  const { average } = getRating(product);
  const breakdown = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));

  async function submit() {
    if (!rating) return setError("Please choose a star rating.");
    setBusy(true);
    try {
      // The server marks the review "Verified buyer" when this account ordered the product.
      await api("/api/reviews", { method: "POST", body: { product: product.id, name, rating, comment } });
      setRating(0);
      setComment("");
      setError("");
      setThanks(true);
      reload();
      refresh(); // update the average rating
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <View style={{ marginTop: 32, gap: 14 }}>
      <Heading>Customer reviews</Heading>
      <Panel>
        <Row gap={12}>
          <T weight="black" size={36}>
            {average.toFixed(1)}
          </T>
          <View>
            <Stars value={average} size={18} />
            <T size={13.5} color={colors.grey[500]}>
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </T>
          </View>
        </Row>
        <View style={{ marginTop: 12, gap: 6 }}>
          {breakdown.map(({ n, count }) => (
            <Row key={n}>
              <T size={13.5} color={colors.grey[500]} style={{ width: 26 }}>
                {n}★
              </T>
              <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.grey[100], overflow: "hidden" }}>
                <View style={{ height: "100%", borderRadius: 4, backgroundColor: colors.star, width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
              </View>
              <T size={13.5} color={colors.grey[500]} style={{ width: 22, textAlign: "right" }}>
                {count}
              </T>
            </Row>
          ))}
        </View>
      </Panel>

      <Panel>
        <T weight="extrabold" size={17}>
          Write a review
        </T>
        <View style={{ marginVertical: 8 }}>
          <StarInput value={rating} onChange={setRating} />
        </View>
        {!user && <Field label="Your Name" value={name} onChangeText={setName} maxLength={60} autoComplete="name" />}
        <Field label="Your Review" value={comment} onChangeText={setComment} multiline maxLength={1000} />
        <Notice tone="error">{error}</Notice>
        {thanks && <Notice>✓ Thanks for your review!</Notice>}
        <Button title={busy ? "Sending..." : "Submit Review"} onPress={submit} loading={busy} style={{ marginTop: 10 }} />
      </Panel>

      {reviews.length === 0 ? (
        <Card style={{ padding: 20 }}>
          <T center color={colors.grey[500]}>
            No reviews yet. Be the first to review this product!
          </T>
        </Card>
      ) : (
        reviews.map((r) => (
          <Card key={r.id} style={{ padding: 16, gap: 6 }}>
            <Row style={{ justifyContent: "space-between" }}>
              <Row gap={10}>
                <View style={{ width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.brand100, alignItems: "center", justifyContent: "center" }}>
                  <T weight="black" color={colors.brand700}>
                    {r.name.charAt(0).toUpperCase()}
                  </T>
                </View>
                <View>
                  <T weight="extrabold">{r.name}</T>
                  {r.verified && (
                    <T weight="bold" size={12} color={colors.brand700}>
                      ✓ Verified buyer
                    </T>
                  )}
                </View>
              </Row>
              <T size={12} color={colors.grey[500]}>
                {formatDate(r.createdAt)}
              </T>
            </Row>
            <Stars value={r.rating} />
            <T color={colors.grey[700]}>{r.comment}</T>
          </Card>
        ))
      )}
    </View>
  );
}
