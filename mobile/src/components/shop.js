import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatPrice } from "@shared/data/products";
import { PAYMENT_ICONS, whatsappLink } from "@shared/data/siteContent";
import { formatDate } from "@shared/lib/format";
import { useCart } from "@/context/CartContext";
import { useColors, useProducts, useReviews, useSettings } from "@/context/StoreContext";
import { useWishlist } from "@/context/WishlistContext";
import { absoluteUrl } from "@/lib/config";
import { radius } from "@/lib/theme";
import { Inline } from "./RichText";
import { Card, Row, T } from "./ui";

// Price with the original price struck through when the product is on sale.
export function Price({ product, size = "md" }) {
  const colors = useColors();
  const onSale = product.compareAt > product.price;
  const big = size === "lg";
  return (
    <Row gap={8} style={{ flexWrap: "wrap", alignItems: "baseline" }}>
      <T weight="extrabold" size={big ? 26 : 16}>
        {formatPrice(product.price)}
      </T>
      {onSale && (
        <T size={big ? 16 : 12.5} color={colors.grey[400]} style={{ textDecorationLine: "line-through" }}>
          {formatPrice(product.compareAt)}
        </T>
      )}
      {onSale && big && (
        <View style={{ backgroundColor: colors.brand500, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 2 }}>
          <T weight="extrabold" size={12}>
            Save {Math.round((1 - product.price / product.compareAt) * 100)}%
          </T>
        </View>
      )}
    </Row>
  );
}

export function Stars({ value, size = 14 }) {
  const colors = useColors();
  const rounded = Math.round(value * 2) / 2;
  return (
    <T size={size} accessibilityLabel={`Rated ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <T key={n} size={size} color={n <= rounded ? colors.star : n - 0.5 === rounded ? "#FCD34D" : colors.grey[200]}>
          ★
        </T>
      ))}
    </T>
  );
}

export function StarInput({ value, onChange }) {
  const colors = useColors();
  return (
    <Row gap={2} accessibilityRole="radiogroup" accessibilityLabel="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} accessibilityRole="radio" accessibilityState={{ checked: value === n }} accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`} hitSlop={4}>
          <T size={34} color={n <= value ? colors.star : colors.grey[200]}>
            ★
          </T>
        </Pressable>
      ))}
    </Row>
  );
}

// A product's photo, or its emoji on the brand's soft green when it has no photos.
export function ProductImage({ product, src, size, style, children }) {
  const colors = useColors();
  const [failed, setFailed] = useState(false);
  const url = absoluteUrl(src ?? product.images?.[0]);
  const box = size ? { width: size, height: size, borderRadius: size < 60 ? 10 : 14 } : { width: "100%", aspectRatio: 1.1 };
  return (
    <View style={[styles.imageBox, { backgroundColor: colors.brand50 }, box, style]}>
      {url && !failed ? (
        <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} onError={() => setFailed(true)} alt={product.name} accessibilityLabel={product.name} />
      ) : (
        <T size={size ? size * 0.5 : 52} accessibilityLabel={product.name}>
          {product.emoji || "📦"}
        </T>
      )}
      {children}
    </View>
  );
}

function ProductBadge({ product }) {
  const colors = useColors();
  let label = null;
  let filled = false;
  if (product.stock < 1) label = "Sold out";
  else if (product.compareAt > product.price) {
    label = `-${Math.round((1 - product.price / product.compareAt) * 100)}%`;
    filled = true;
  } else if (product.isNew) label = "New";
  else if (product.featured) {
    label = "Popular";
    filled = true;
  }
  if (!label) return null;
  return (
    <View style={[styles.badge, filled ? { backgroundColor: colors.brand500 } : { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.ink }]}>
      <T weight="extrabold" size={11}>
        {label}
      </T>
    </View>
  );
}

export function WishlistButton({ product, size = 36, style }) {
  const colors = useColors();
  const { isWished, toggleWish } = useWishlist();
  const wished = isWished(product.id);
  return (
    <Pressable
      onPress={() => toggleWish(product.id)}
      accessibilityRole="button"
      accessibilityLabel={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      hitSlop={6}
      style={[styles.round, { width: size, height: size, backgroundColor: colors.white }, style]}
    >
      <Ionicons name={wished ? "heart" : "heart-outline"} size={size * 0.55} color={wished ? colors.red : colors.ink} />
    </Pressable>
  );
}

function AddToCartIcon({ product }) {
  const colors = useColors();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock < 1;
  return (
    <Pressable
      disabled={soldOut}
      onPress={() => {
        addToCart(product.id, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      accessibilityRole="button"
      accessibilityLabel={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
      style={[styles.round, { width: 36, height: 36, backgroundColor: soldOut ? colors.grey[200] : added ? colors.brand500 : colors.ink }]}
    >
      <T weight="bold" size={20} color={soldOut ? colors.grey[400] : added ? colors.ink : colors.white} style={{ lineHeight: 22 }}>
        {added ? "✓" : "+"}
      </T>
    </Pressable>
  );
}

export function ProductCard({ product, width }) {
  const colors = useColors();
  const { getRating } = useReviews();
  const { average, count } = getRating(product);
  const open = () => router.push(`/products/${encodeURIComponent(product.id)}`);
  return (
    <Card style={{ width }}>
      <Pressable onPress={open} accessibilityRole="link" accessibilityLabel={`View ${product.name}`}>
        <ProductImage product={product}>
          <ProductBadge product={product} />
        </ProductImage>
      </Pressable>
      <WishlistButton product={product} size={34} style={{ position: "absolute", top: 10, right: 10, ...styles.shadow }} />
      <View style={{ padding: 12, gap: 4, flex: 1 }}>
        <T weight="extrabold" size={11} color={colors.brand700} style={{ textTransform: "uppercase", letterSpacing: 0.4 }} numberOfLines={1}>
          {product.category}
        </T>
        <Pressable onPress={open}>
          <T weight="extrabold" size={15} numberOfLines={2}>
            {product.name}
          </T>
        </Pressable>
        <Row gap={4}>
          <Stars value={average} size={12} />
          <T size={12} color={colors.grey[500]}>
            {average.toFixed(1)}
            {count > 0 ? ` (${count})` : ""}
          </T>
        </Row>
        <Row style={{ justifyContent: "space-between", marginTop: 4 }}>
          <View style={{ flex: 1 }}>
            <Price product={product} />
          </View>
          <AddToCartIcon product={product} />
        </Row>
      </View>
    </Card>
  );
}

// Two products per row on phones, more on tablets.
export function ProductGrid({ products, empty = "No products to show yet." }) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const gap = 12;
  const itemWidth = (Math.min(width, 1200) - 32 - gap * (columns - 1)) / columns;
  if (products.length === 0) return <T color={colors.grey[500]}>{empty}</T>;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} width={itemWidth} />
      ))}
    </View>
  );
}

export function QuantityStepper({ value, onChange, min = 1, max = Infinity, small }) {
  const colors = useColors();
  const box = small ? 30 : 38;
  const button = (label, next, a11y) => (
    <Pressable onPress={() => onChange(next)} accessibilityRole="button" accessibilityLabel={a11y} style={{ width: box, height: box, alignItems: "center", justifyContent: "center" }}>
      <T weight="bold" size={small ? 17 : 20}>
        {label}
      </T>
    </Pressable>
  );
  return (
    <Row gap={0} style={{ borderWidth: 1.5, borderColor: colors.grey[200], borderRadius: radius.pill, alignSelf: "flex-start" }}>
      {button("−", Math.max(min, value - 1), "Decrease quantity")}
      <T weight="extrabold" size={small ? 14 : 16} style={{ minWidth: small ? 22 : 30, textAlign: "center" }}>
        {value}
      </T>
      {button("+", Math.min(max, value + 1), "Increase quantity")}
    </Row>
  );
}

// Home screen tiles: the first four categories plus "On Sale" and "All Categories".
export function CategoryTiles() {
  const colors = useColors();
  const { categories } = useProducts();
  const { width } = useWindowDimensions();
  const tiles = [
    ...categories.slice(0, 4).map((c) => ({ label: c.name, icon: c.icon, href: `/products?category=${encodeURIComponent(c.name)}` })),
    { label: "On Sale", icon: "🏷️", href: "/products?filter=sale" },
    { label: "All Categories", icon: "🛍️", href: "/categories" },
  ];
  const tileWidth = (Math.min(width, 600) - 32 - 20) / 3;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {tiles.map((t) => (
        <Pressable key={t.label} onPress={() => router.push(t.href)} accessibilityRole="link" style={[styles.tile, { width: tileWidth, borderColor: colors.grey[200] }]}>
          <View style={[styles.round, { width: 44, height: 44, backgroundColor: colors.brand100 }]}>
            <T size={21}>{t.icon}</T>
          </View>
          <T weight="extrabold" size={13} center numberOfLines={2}>
            {t.label}
          </T>
        </Pressable>
      ))}
    </View>
  );
}

// The super admin's uploaded logo, or the HAK logo.
export function Logo({ light = false, height = 28 }) {
  const { settings } = useSettings();
  const { general } = settings;
  const uploaded = light ? general.logoLight ?? general.logo : general.logo;
  const [failed, setFailed] = useState(false);
  if (uploaded && !failed) {
    return (
      <View style={light && !general.logoLight ? { backgroundColor: "#FFFFFF", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 } : null}>
        <Image source={{ uri: absoluteUrl(uploaded) }} style={{ height, width: height * 4 }} contentFit="contain" contentPosition="left" onError={() => setFailed(true)} alt={general.storeName} accessibilityLabel={general.storeName} />
      </View>
    );
  }
  return <Image source={light ? require("../../assets/logo-light.png") : require("../../assets/logo.png")} style={{ height, width: height * 3.3 }} contentFit="contain" alt={general.storeName} accessibilityLabel={general.storeName} />;
}

export function AnnouncementBar() {
  const colors = useColors();
  const { announcement } = useSettings().settings;
  if (!announcement.enabled || !announcement.text) return null;
  return (
    <View style={{ backgroundColor: colors.ink, paddingHorizontal: 16, paddingVertical: 8 }}>
      <Inline text={announcement.text} size={13.5} color={colors.white} strongColor={colors.brand500} linkColor={colors.brand500} center />
    </View>
  );
}

// Floating "chat on WhatsApp" button (customer screens).
export function WhatsAppButton({ bottom = 16 }) {
  const { whatsapp, whatsappMessage } = useSettings().settings.contact;
  if (!whatsapp) return null;
  return (
    <Pressable
      onPress={() => Linking.openURL(whatsappLink(whatsapp, whatsappMessage)).catch(() => {})}
      accessibilityRole="link"
      accessibilityLabel="Chat with us on WhatsApp"
      style={[styles.round, styles.shadow, { position: "absolute", right: 16, bottom, width: 56, height: 56, backgroundColor: "#25D366" }]}
    >
      <Ionicons name="logo-whatsapp" size={30} color="#FFFFFF" />
    </Pressable>
  );
}

const statusColors = {
  Processing: ["#FEF3C7", "#92400E"],
  Shipped: ["#E0F2FE", "#075985"],
  Delivered: null,
  Cancelled: ["#FEE2E2", "#B91C1C"],
};

export function StatusBadge({ status }) {
  const colors = useColors();
  const [bg, fg] = statusColors[status] ?? [colors.brand100, colors.brand700];
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 3, alignSelf: "flex-start" }}>
      <T weight="extrabold" size={12} color={fg}>
        {status}
      </T>
    </View>
  );
}

// Payment method, status and reference for an order.
export function PaymentInfo({ order }) {
  const colors = useColors();
  const { payment } = order;
  const pending = payment.method === "cod" ? "Pay on delivery" : payment.method === "stripe" ? "Waiting for card payment" : "Awaiting payment confirmation";
  const statusColor = { Pending: colors.amber, Paid: colors.brand700, Refunded: colors.grey[500] }[payment.status];
  return (
    <View style={{ gap: 2 }}>
      <T color={colors.grey[700]}>
        {PAYMENT_ICONS[payment.method] ?? "💳"} {payment.title}
      </T>
      <T weight="bold" color={statusColor}>
        {payment.status === "Pending" ? pending : payment.status}
      </T>
      {!!payment.reference && (
        <T size={12.5} color={colors.grey[500]}>
          {payment.method === "stripe" ? "Stripe payment ID" : "Transaction ID"}: {payment.reference}
        </T>
      )}
    </View>
  );
}

const steps = [
  { status: "Processing", label: "Order placed", icon: "🧾" },
  { status: "Shipped", label: "Shipped", icon: "🚚" },
  { status: "Delivered", label: "Delivered", icon: "📦" },
];

// Processing → Shipped → Delivered (or Cancelled), like the website.
export function OrderTimeline({ order }) {
  const colors = useColors();
  const history = order.statusHistory ?? [{ status: order.status, at: order.createdAt }];
  const when = (status) => [...history].reverse().find((h) => h.status === status)?.at;
  if (order.status === "Cancelled") {
    return (
      <View style={{ backgroundColor: colors.redSoft, borderRadius: radius.card, padding: 14, borderWidth: 1, borderColor: "#FECACA" }}>
        <T weight="extrabold" color="#B91C1C">
          ✕ This order was cancelled
        </T>
        {!!when("Cancelled") && <T color="#B91C1C">on {formatDate(when("Cancelled"), true)}</T>}
      </View>
    );
  }
  const current = steps.findIndex((s) => s.status === order.status);
  return (
    <View style={{ flexDirection: "row" }}>
      {steps.map((step, i) => {
        const done = i <= current;
        const at = i === 0 ? order.createdAt : when(step.status);
        return (
          <View key={step.status} style={{ flex: 1, alignItems: "center" }} accessibilityLabel={`${step.label}: ${done ? "completed" : "not yet"}`}>
            {i > 0 && <View style={{ position: "absolute", top: 18, right: "50%", width: "100%", height: 4, backgroundColor: i <= current ? colors.brand500 : colors.grey[200] }} />}
            <View style={[styles.round, { width: 40, height: 40, backgroundColor: done ? colors.brand500 : colors.grey[100] }]}>
              <T size={18} style={{ opacity: done ? 1 : 0.4 }}>
                {step.icon}
              </T>
            </View>
            <T weight="extrabold" size={13} color={done ? colors.ink : colors.grey[400]} style={{ marginTop: 6 }}>
              {step.label}
            </T>
            <T size={11.5} color={colors.grey[500]}>
              {done && at ? formatDate(at) : i === current + 1 ? "Next" : " "}
            </T>
          </View>
        );
      })}
    </View>
  );
}

// Line items and totals of a saved order.
export function OrderItems({ order }) {
  const colors = useColors();
  const line = (label, value, style) => (
    <Row style={{ justifyContent: "space-between", paddingVertical: 3 }}>
      <T color={style?.color ?? colors.grey[500]} weight={style?.weight}>
        {label}
      </T>
      <T color={style?.color ?? colors.grey[500]} weight={style?.weight} size={style?.size}>
        {value}
      </T>
    </Row>
  );
  return (
    <View>
      {order.items.map((item, i) => (
        <Row key={`${item.id}-${i}`} gap={12} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.grey[200] }}>
          <ProductImage product={{ name: item.name, emoji: item.emoji, images: item.image ? [item.image] : [] }} size={50} />
          <T weight="bold" style={{ flex: 1 }}>
            {item.name} <T color={colors.grey[500]}>× {item.quantity}</T>
          </T>
          <T weight="extrabold">{formatPrice(item.price * item.quantity)}</T>
        </Row>
      ))}
      <View style={{ marginTop: 8 }}>
        {line("Subtotal", formatPrice(order.subtotal))}
        {order.discount > 0 && line(`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `−${formatPrice(order.discount)}`, { color: colors.brand700 })}
        {line("Shipping", order.shipping === 0 ? "Free" : formatPrice(order.shipping))}
        {line("Total", formatPrice(order.total), { color: colors.ink, weight: "extrabold", size: 17 })}
      </View>
    </View>
  );
}

// Space at the bottom of tab screens so the floating WhatsApp button never covers content.
export function useFloatingButtonSpace() {
  const insets = useSafeAreaInsets();
  return 80 + insets.bottom;
}

const styles = StyleSheet.create({
  imageBox: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  badge: { position: "absolute", top: 10, left: 10, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  round: { borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  tile: { alignItems: "center", gap: 8, borderWidth: 1.5, borderRadius: radius.card, backgroundColor: "#FFFFFF", paddingVertical: 16, paddingHorizontal: 6 },
  shadow: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
});
