import { Redirect, useLocalSearchParams } from "expo-router";

// Stripe's return link when the checkout screen wasn't waiting for it (e.g. the app restarted).
export default function PaymentReturn() {
  const { result, id, key, session_id: sessionId } = useLocalSearchParams();
  if (!id || !key) return <Redirect href="/" />;
  const q = (v) => encodeURIComponent(String(v));
  return result === "success" ? (
    <Redirect href={`/order-confirmation?id=${q(id)}&key=${q(key)}${sessionId ? `&session_id=${q(sessionId)}` : ""}`} />
  ) : (
    <Redirect href={`/checkout?cancelled=${q(id)}&key=${q(key)}`} />
  );
}
