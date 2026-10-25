import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { formatPrice } from "@shared/data/products";
import { useCart } from "@/context/CartContext";
import { useColors, useSettings } from "@/context/StoreContext";
import { fonts, radius } from "@/lib/theme";
import { Button, Row, T } from "./ui";

function CouponBox() {
  const colors = useColors();
  const { couponCode, couponError, discount, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function apply() {
    if (!code.trim()) return;
    setBusy(true);
    const result = await applyCoupon(code);
    setBusy(false);
    setError(result.error ?? "");
    if (!result.error) setCode("");
  }

  if (couponCode) {
    return (
      <View style={{ borderWidth: 1, borderColor: "#2A2A2A", borderRadius: radius.field, padding: 12, marginBottom: 12 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T color={colors.white}>
            🏷️ <T weight="extrabold" color={colors.brand500}>{couponCode}</T> {discount > 0 && <T color="#B8BBB6">applied</T>}
          </T>
          <Pressable onPress={removeCoupon} accessibilityRole="button" hitSlop={8}>
            <T weight="bold" size={13} color={colors.grey[400]}>
              Remove
            </T>
          </Pressable>
        </Row>
        {!!couponError && (
          <T size={12.5} color="#FBBF24" style={{ marginTop: 4 }}>
            {couponError}
          </T>
        )}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 12 }}>
      <Row>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          onSubmitEditing={apply}
          placeholder="Coupon code"
          placeholderTextColor={colors.grey[500]}
          accessibilityLabel="Coupon code"
          autoCapitalize="characters"
          style={{ flex: 1, borderWidth: 1.5, borderColor: "#333333", backgroundColor: "#161616", borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9, color: colors.white, fontFamily: fonts.regular, fontSize: 15 }}
        />
        <Button title={busy ? "..." : "Apply"} size="sm" onPress={apply} disabled={busy} />
      </Row>
      {!!error && (
        <T size={12.5} color="#FBBF24" style={{ marginTop: 6 }}>
          {error}
        </T>
      )}
    </View>
  );
}

// Dark summary box with coupon, subtotal, discount, shipping and total (like the website).
export default function OrderSummary({ showItems = false, children }) {
  const colors = useColors();
  const { items, subtotal, discount, shipping, total } = useCart();
  const { freeShippingMin } = useSettings().settings.shipping;
  const line = (label, value, color = "#B8BBB6") => (
    <Row style={{ justifyContent: "space-between", paddingVertical: 4 }}>
      <T color={color}>{label}</T>
      <T color={color}>{value}</T>
    </Row>
  );

  return (
    <View style={{ backgroundColor: colors.ink, borderRadius: radius.panel, padding: 20 }}>
      <T weight="extrabold" size={17} color={colors.white} style={{ marginBottom: 12 }}>
        Order Summary
      </T>
      {showItems && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: "#2A2A2A", paddingBottom: 10, marginBottom: 12 }}>
          {items.map(({ id, quantity, product }) => (
            <Row key={id} style={{ justifyContent: "space-between", paddingVertical: 3 }}>
              <T size={13.5} color="#B8BBB6" style={{ flex: 1 }}>
                {product.name} × {quantity}
              </T>
              <T size={13.5} color="#B8BBB6">
                {formatPrice(product.price * quantity)}
              </T>
            </Row>
          ))}
        </View>
      )}
      <CouponBox />
      {line("Subtotal", formatPrice(subtotal))}
      {discount > 0 && line("Discount", `−${formatPrice(discount)}`, colors.brand500)}
      {line("Shipping", shipping === 0 ? "Free" : formatPrice(shipping))}
      {shipping > 0 && freeShippingMin > 0 && (
        <T size={12.5} color={colors.grey[500]}>
          Add {formatPrice(freeShippingMin - (subtotal - discount))} more for free shipping.
        </T>
      )}
      <Row style={{ justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#2A2A2A", marginTop: 8, paddingTop: 12 }}>
        <T weight="extrabold" size={18} color={colors.white}>
          Total
        </T>
        <T weight="extrabold" size={18} color={colors.white}>
          {formatPrice(total)}
        </T>
      </Row>
      {children}
    </View>
  );
}
