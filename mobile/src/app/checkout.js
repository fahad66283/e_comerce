import * as Linking from "expo-linking";
import { router, Stack, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { formatPrice } from "@shared/data/products";
import { PAYMENT_ICONS } from "@shared/data/siteContent";
import OrderSummary from "@/components/OrderSummary";
import { Button, Empty, Field, Heading, Loading, Notice, Panel, Row, Screen, SectionHeading, T } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { rememberGuestOrder, useAuth, useColors, usePaymentMethods, useStore } from "@/context/StoreContext";
import { api } from "@/lib/api";
import { paymentState } from "@/lib/payment";
import { radius } from "@/lib/theme";

const fields = [
  { name: "fullName", label: "Full Name", autoComplete: "name", textContentType: "name" },
  { name: "phone", label: "Phone Number", autoComplete: "tel", textContentType: "telephoneNumber", keyboardType: "phone-pad", placeholder: "03XX XXXXXXX" },
  { name: "email", label: "Email", autoComplete: "email", textContentType: "emailAddress", keyboardType: "email-address", autoCapitalize: "none" },
  { name: "city", label: "City", autoComplete: "postal-address-locality", textContentType: "addressCity" },
  { name: "address", label: "Full Address", autoComplete: "street-address", textContentType: "fullStreetAddress" },
];

// Cancels an unpaid card order; returns the server's answer ("paid" if it was paid after all) or null.
async function cancelOnServer(id, key) {
  try {
    return (await api(`/api/orders/${encodeURIComponent(id)}/cancel`, { method: "POST", body: { key } })).status;
  } catch {
    return null;
  }
}

export default function CheckoutScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const { items, discount, couponCode, total, loaded, clearCart } = useCart();
  const { user } = useAuth();
  const { refresh, stripe } = useStore();
  const methods = usePaymentMethods();
  const [form, setForm] = useState({ fullName: user?.name ?? "", phone: "", email: user?.email ?? "", city: "", address: "", notes: "", reference: "" });
  const [method, setMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [placing, setPlacing] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  // Falls back to the first enabled method if the chosen one was switched off.
  const selected = methods.find((m) => m.id === method) ?? methods[0];
  const isManual = selected?.details.length > 0;

  // The customer left Stripe's page without paying: cancel that order and keep the cart.
  async function cancelCardOrder(id, key) {
    showCancelResult(id, key, await cancelOnServer(id, key));
  }

  function showCancelResult(id, key, status) {
    if (status === "paid") return finishCardOrder(id, key);
    setNotice(status ? "Card payment was cancelled, so your order wasn't placed. Your cart is still here." : "Card payment was cancelled. Your cart is still here.");
    refresh(); // stock was put back
  }

  function finishCardOrder(id, key, sessionId) {
    clearCart();
    refresh();
    router.replace(`/order-confirmation?id=${encodeURIComponent(id)}&key=${key}${sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : ""}`);
  }

  // Opened from Stripe's cancel link after an app restart (see app/payment.js).
  useEffect(() => {
    if (!params.cancelled || !params.key) return;
    const [id, key] = [String(params.cancelled), String(params.key)];
    router.setParams({ cancelled: undefined, key: undefined });
    cancelOnServer(id, key).then((status) => showCancelResult(id, key, status));
  }, [params.cancelled]); // eslint-disable-line react-hooks/exhaustive-deps

  async function payByCard(order) {
    setPlacing("Opening secure card payment...");
    const returnUrl = Linking.createURL("payment");
    paymentState.waiting = true;
    let result;
    try {
      result = await WebBrowser.openAuthSessionAsync(order.redirect, returnUrl);
    } finally {
      paymentState.waiting = false;
    }
    setPlacing("");
    setSubmitting(false);
    if (result.type === "success" && result.url) {
      const back = Linking.parse(result.url).queryParams ?? {};
      if (back.result === "success") return finishCardOrder(order.id, order.key, back.session_id);
    }
    // Cancelled on Stripe's page, or the payment window was closed.
    await cancelCardOrder(order.id, order.key);
  }

  async function placeOrder() {
    const tooMany = items.find(({ quantity, product }) => quantity > product.stock);
    if (tooMany) return setError(`Only ${tooMany.product.stock} × ${tooMany.product.name} left in stock. Please update your cart.`);
    if (!selected) return setError("No payment method is available right now. Please contact us.");
    const missing = fields.find((f) => !form[f.name].trim());
    if (missing) return setError(`${missing.label} is required.`);
    if (isManual && form.reference.trim().length < 4) return setError("Please enter the transaction ID / reference.");
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      // The server checks stock, prices and the coupon again, and saves the order in MySQL.
      const order = await api("/api/orders", {
        method: "POST",
        body: {
          client: "app",
          appReturn: Linking.createURL("payment"),
          items: items.map(({ id, quantity }) => ({ id, quantity })),
          couponCode: discount > 0 ? couponCode : null,
          notes: form.notes,
          payment: { method: selected.id, reference: isManual ? form.reference : null },
          customer: { name: form.fullName, phone: form.phone, email: form.email, city: form.city, address: form.address },
        },
      });
      if (!user) rememberGuestOrder(order.id, order.key);
      if (order.redirect) return payByCard(order);
      setPlacing("Placing your order...");
      clearCart();
      refresh(); // stock levels changed
      router.replace(`/order-confirmation?id=${encodeURIComponent(order.id)}&key=${order.key}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (placing) return <Loading label={placing} />;
  if (!loaded) return <Loading />;
  if (items.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Checkout" }} />
        <Notice tone="warning">{notice}</Notice>
        <Empty emoji="🛒" title="Your cart is empty" action={<Button title="Go to Shop" onPress={() => router.replace("/products")} />} />
      </Screen>
    );
  }

  const options = stripe?.ready ? methods : [...methods, { id: "card", title: "Credit / Debit Card", text: "Coming soon", disabled: true }];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <Screen>
        <Stack.Screen options={{ title: "Checkout" }} />
        <SectionHeading eyebrow="Checkout" title="Shipping & payment details" />
        <Notice tone="warning" style={{ marginBottom: 14 }}>
          {notice}
        </Notice>

        {!user && (
          <View style={{ borderWidth: 1.5, borderColor: colors.brand500, backgroundColor: colors.brand50, borderRadius: radius.panel, padding: 16, gap: 8, marginBottom: 16 }}>
            <T weight="extrabold">Checking out as a guest</T>
            <T size={14} color={colors.grey[700]}>
              No account needed. You can track your order with its order ID and your email or phone.
            </T>
            <Button title="Login instead" variant="outline" size="sm" onPress={() => router.push("/login?next=/checkout")} style={{ alignSelf: "flex-start" }} />
          </View>
        )}

        <Panel style={{ marginBottom: 16 }}>
          <Heading size={17} style={{ marginBottom: 12 }}>
            Delivery Information
          </Heading>
          {fields.map((f) => (
            <Field key={f.name} label={f.label} value={form[f.name]} onChangeText={set(f.name)} autoComplete={f.autoComplete} textContentType={f.textContentType} keyboardType={f.keyboardType} autoCapitalize={f.autoCapitalize} placeholder={f.placeholder} />
          ))}
          <Field label="Order Notes (optional)" value={form.notes} onChangeText={set("notes")} multiline />
        </Panel>

        <Panel style={{ marginBottom: 16 }}>
          <Heading size={17} style={{ marginBottom: 12 }}>
            Payment Method
          </Heading>
          <View style={{ gap: 10 }}>
            {options.map((opt) => {
              const active = selected?.id === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  disabled={opt.disabled}
                  onPress={() => setMethod(opt.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active, disabled: !!opt.disabled }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5, borderColor: active ? colors.ink : colors.grey[200], backgroundColor: active ? colors.grey[50] : colors.white, borderRadius: radius.field, padding: 13, opacity: opt.disabled ? 0.5 : 1 }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: active ? colors.ink : colors.grey[400], alignItems: "center", justifyContent: "center" }}>
                    {active && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink }} />}
                  </View>
                  <T size={21}>{PAYMENT_ICONS[opt.id] ?? "💳"}</T>
                  <View style={{ flex: 1 }}>
                    <T weight="bold" size={14.5}>
                      {opt.title}
                    </T>
                    <T size={12.5} color={colors.grey[500]}>
                      {opt.text}
                    </T>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {isManual && (
            <View style={{ marginTop: 14, borderWidth: 1, borderColor: colors.grey[200], backgroundColor: colors.grey[50], borderRadius: radius.field, padding: 14 }}>
              <T weight="bold" size={14}>
                Send {formatPrice(total)} to the account below, then enter your transaction ID:
              </T>
              <View style={{ marginTop: 8, gap: 4 }}>
                {selected.details.map(({ label, value }) => (
                  <Row key={label} style={{ justifyContent: "space-between" }}>
                    <T size={14} color={colors.grey[500]}>
                      {label}
                    </T>
                    <T size={14} weight="bold" selectable>
                      {value}
                    </T>
                  </Row>
                ))}
              </View>
              <Field key={selected.id} label="Transaction ID / Reference" value={form.reference} onChangeText={set("reference")} autoCapitalize="characters" style={{ marginTop: 12, marginBottom: 6 }} />
              <T size={12.5} color={colors.grey[500]}>
                We&apos;ll confirm your payment and then ship your order.
              </T>
            </View>
          )}
        </Panel>

        <OrderSummary showItems>
          {!!error && (
            <View accessibilityRole="alert" style={{ marginTop: 12, backgroundColor: "rgba(239,68,68,0.15)", borderRadius: radius.field, paddingHorizontal: 12, paddingVertical: 8 }}>
              <T weight="bold" size={14} color="#FCA5A5">
                {error}
              </T>
            </View>
          )}
          <Button
            title={submitting ? "Placing order..." : selected?.id === "stripe" ? `Pay ${formatPrice(total)} by Card` : "Place Order"}
            onPress={placeOrder}
            loading={submitting}
            style={{ marginTop: 16 }}
          />
          <T size={12.5} color={colors.grey[400]} center style={{ marginTop: 12 }}>
            By placing your order you agree to our{" "}
            <T size={12.5} color={colors.grey[400]} style={{ textDecorationLine: "underline" }} onPress={() => router.push("/terms")}>
              Terms
            </T>{" "}
            and{" "}
            <T size={12.5} color={colors.grey[400]} style={{ textDecorationLine: "underline" }} onPress={() => router.push("/return-policy")}>
              Return Policy
            </T>
            .
          </T>
        </OrderSummary>
      </Screen>
    </KeyboardAvoidingView>
  );
}
