import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Newsletter from "@/components/Newsletter";
import { Inline } from "@/components/RichText";
import { AnnouncementBar, CategoryTiles, Logo, ProductGrid, WhatsAppButton } from "@/components/shop";
import { Button, Row, Screen, SectionHeading, T } from "@/components/ui";
import { useColors, useProducts, useSettings, useStore } from "@/context/StoreContext";
import { radius } from "@/lib/theme";

// "featured": marked featured; "new": marked new (or the latest added); "sale": discounted.
function pick(products, mode, limit) {
  const marked = products.filter((p) => p.isNew);
  const list =
    mode === "new"
      ? marked.length > 0
        ? [...marked].reverse()
        : products.slice(-limit).reverse()
      : mode === "sale"
        ? products.filter((p) => p.compareAt > p.price)
        : products.filter((p) => p.featured);
  return list.slice(0, limit);
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const { settings } = useSettings();
  const { products } = useProducts();
  const { refresh } = useStore();
  const { home, announcement } = settings;
  const [refreshing, setRefreshing] = useState(false);
  const scroll = useRef(null);
  const popularY = useRef(0);
  const dark = announcement.enabled && !!announcement.text;

  const promoStyles = [
    { bg: colors.ink, title: colors.white, text: colors.grey[400], strong: colors.brand500, button: "primary" },
    { bg: colors.brand500, title: colors.ink, text: colors.brand900, strong: colors.ink, button: "dark" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      {focused && <StatusBar style={dark ? "light" : "dark"} />}
      <View style={{ backgroundColor: dark ? colors.ink : colors.white, paddingTop: insets.top }}>
        <AnnouncementBar />
      </View>
      <Row style={{ justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.grey[200], backgroundColor: colors.white }}>
        <Logo />
        <Row gap={6}>
          <Pressable onPress={() => router.push("/track-order")} accessibilityRole="link" hitSlop={8} style={{ padding: 6 }}>
            <T weight="bold" size={13.5}>
              Track Order
            </T>
          </Pressable>
          <Pressable onPress={() => router.push("/products?focus=search")} accessibilityRole="button" accessibilityLabel="Open search" hitSlop={8} style={{ padding: 6 }}>
            <Ionicons name="search" size={22} color={colors.ink} />
          </Pressable>
        </Row>
      </Row>

      <Screen
        ref={scroll}
        padded={false}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await refresh();
          setRefreshing(false);
        }}
        contentStyle={{ paddingBottom: 96 }}
      >
        <View style={{ backgroundColor: colors.brand50, borderBottomWidth: 1, borderBottomColor: colors.grey[200], padding: 16, paddingVertical: 28, gap: 14 }}>
          {!!home.heroBadge && (
            <View style={{ alignSelf: "flex-start", borderWidth: 1, borderColor: colors.grey[200], backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 }}>
              <T weight="bold" size={13} color={colors.grey[700]}>
                {home.heroBadge}
              </T>
            </View>
          )}
          <T weight="black" size={32} style={{ lineHeight: 38 }}>
            {home.heroTitle}{" "}
            <T weight="black" size={32} color={colors.brand600} style={{ lineHeight: 38 }}>
              {home.heroHighlight}
            </T>
          </T>
          <T size={16} color={colors.grey[700]}>
            {home.heroText}
          </T>
          <Row gap={10} style={{ flexWrap: "wrap" }}>
            <Button title={home.primaryButton} onPress={() => router.push("/products")} />
            <Button title={home.secondaryButton} variant="outline" onPress={() => scroll.current?.scrollTo({ y: popularY.current, animated: true })} />
          </Row>
          <Row gap={14} style={{ flexWrap: "wrap" }}>
            {home.trustItems.map((item, i) => (
              <T key={i} weight="medium" size={13.5} color={colors.grey[700]}>
                {item}
              </T>
            ))}
          </Row>
          <View style={{ marginTop: 8 }}>
            <CategoryTiles />
          </View>
        </View>

        <View style={{ padding: 16, paddingTop: 32 }} onLayout={(e) => (popularY.current = e.nativeEvent.layout.y)}>
          <SectionHeading eyebrow={home.popularEyebrow} title={home.popularTitle} text={home.popularText} />
          <ProductGrid products={pick(products, "featured", 8)} />
        </View>

        {home.promos.length > 0 && (
          <View style={{ padding: 16, gap: 14 }}>
            {home.promos.map((promo, i) => {
              const style = promoStyles[i % promoStyles.length];
              return (
                <View key={i} style={{ backgroundColor: style.bg, borderRadius: radius.panel, padding: 24, gap: 10, alignItems: "flex-start" }}>
                  <T weight="extrabold" size={22} color={style.title}>
                    {promo.title}
                  </T>
                  <Inline text={promo.text} color={style.text} strongColor={style.strong} />
                  {!!promo.button && <Button title={promo.button} variant={style.button} onPress={() => router.push(promo.link || "/products")} />}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ padding: 16, paddingTop: 28 }}>
          <SectionHeading eyebrow={home.newEyebrow} title={home.newTitle} />
          <ProductGrid products={pick(products, "new", 4)} />
        </View>

        <View style={{ padding: 16, paddingTop: 20 }}>
          <Row style={{ justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap" }}>
            <SectionHeading eyebrow={home.saleEyebrow} title={home.saleTitle} />
            <Pressable onPress={() => router.push("/products?filter=sale")} accessibilityRole="link" style={{ marginBottom: 18 }}>
              <T weight="extrabold" size={14} color={colors.brand700}>
                View all deals →
              </T>
            </Pressable>
          </Row>
          <ProductGrid products={pick(products, "sale", 4)} />
        </View>

        {home.features.length > 0 && (
          <View style={{ padding: 16, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {home.features.map((f, i) => (
              <View key={i} style={{ flexGrow: 1, flexBasis: "45%", backgroundColor: colors.grey[50], borderWidth: 1, borderColor: colors.grey[200], borderRadius: radius.card, padding: 16, alignItems: "center", gap: 4 }}>
                <T size={26}>{f.icon}</T>
                <T weight="extrabold" size={14.5} center>
                  {f.title}
                </T>
                <T size={13} color={colors.grey[500]} center>
                  {f.text}
                </T>
              </View>
            ))}
          </View>
        )}

        <View style={{ padding: 16 }}>
          <Newsletter title={home.newsletterTitle} text={home.newsletterText} />
        </View>
      </Screen>
      <WhatsAppButton />
    </View>
  );
}
