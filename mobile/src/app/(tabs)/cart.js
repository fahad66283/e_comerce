import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { formatPrice } from "@shared/data/products";
import OrderSummary from "@/components/OrderSummary";
import { ProductImage, QuantityStepper } from "@/components/shop";
import { Button, Card, Empty, Loading, Row, Screen, SectionHeading, T } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { useColors } from "@/context/StoreContext";

export default function CartScreen() {
  const colors = useColors();
  const { items, loaded, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!loaded) return <Loading label="Loading cart..." />;
  if (items.length === 0) {
    return (
      <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <Empty emoji="🛒" title="Your cart is empty" text="Looks like you haven't added anything yet." action={<Button title="Start Shopping" onPress={() => router.push("/products")} />} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Row style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <SectionHeading eyebrow="Cart" title="Your shopping cart" />
        <Pressable onPress={clearCart} accessibilityRole="button" style={{ marginBottom: 18 }}>
          <T weight="bold" size={14} color={colors.grey[500]}>
            Clear cart
          </T>
        </Pressable>
      </Row>
      <Card style={{ paddingHorizontal: 14, marginBottom: 18 }}>
        {items.map(({ id, quantity, product }, i) => (
          <Row key={id} gap={12} style={{ paddingVertical: 14, borderBottomWidth: i < items.length - 1 ? 1 : 0, borderBottomColor: colors.grey[200], alignItems: "flex-start" }}>
            <Pressable onPress={() => router.push(`/products/${encodeURIComponent(id)}`)}>
              <ProductImage product={product} size={60} />
            </Pressable>
            <View style={{ flex: 1, gap: 6 }}>
              <Pressable onPress={() => router.push(`/products/${encodeURIComponent(id)}`)}>
                <T weight="extrabold">{product.name}</T>
              </Pressable>
              <T size={13.5} color={colors.grey[500]}>
                {formatPrice(product.price)} each
              </T>
              <Row style={{ justifyContent: "space-between" }}>
                <QuantityStepper small value={quantity} min={0} max={product.stock} onChange={(q) => updateQuantity(id, q)} />
                <T weight="extrabold">{formatPrice(product.price * quantity)}</T>
              </Row>
            </View>
            <Pressable onPress={() => removeFromCart(id)} accessibilityRole="button" accessibilityLabel={`Remove ${product.name}`} hitSlop={8}>
              <Ionicons name="close" size={20} color={colors.grey[400]} />
            </Pressable>
          </Row>
        ))}
      </Card>
      <OrderSummary>
        <Button title="Proceed to Checkout" onPress={() => router.push("/checkout")} style={{ marginTop: 16 }} />
        <Pressable onPress={() => router.push("/products")} style={{ marginTop: 12, alignItems: "center" }}>
          <T size={14} color={colors.grey[400]}>
            Continue Shopping
          </T>
        </Pressable>
      </OrderSummary>
    </Screen>
  );
}
