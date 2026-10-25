import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { matchesSearch } from "@shared/lib/search";
import { ProductGrid, WhatsAppButton } from "@/components/shop";
import { Pill, Row, Screen, SectionHeading, T } from "@/components/ui";
import { useColors, useProducts, useReviews, useSettings, useStore } from "@/context/StoreContext";
import { fonts, radius } from "@/lib/theme";

const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
];

// Shop: category and filter pills, search and sort (same as the website's /products page).
export default function ShopScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const { products, categories } = useProducts();
  const { getRating } = useReviews();
  const { listings } = useSettings().settings;
  const { refresh } = useStore();
  const [sort, setSort] = useState("featured");
  const [showSort, setShowSort] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const searchBox = useRef(null);

  // Category, filter and search live in the screen's address, so links from the home screen work.
  const category = categories.some((c) => c.name === params.category) ? params.category : "All";
  const filter = params.filter;
  const search = typeof params.q === "string" ? params.q : "";
  const update = (changes) => router.setParams(Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v || undefined])));

  useEffect(() => {
    if (params.focus === "search") {
      setTimeout(() => searchBox.current?.focus(), 300);
      router.setParams({ focus: undefined });
    }
  }, [params.focus]);

  let list = products.filter(
    (p) => (category === "All" || p.category === category) && (filter !== "sale" || p.compareAt > p.price) && (filter !== "new" || p.isNew) && matchesSearch(p, search)
  );
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "rating") list = [...list].sort((a, b) => getRating(b).average - getRating(a).average);

  return (
    <View style={{ flex: 1 }}>
      <Screen
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await refresh();
          setRefreshing(false);
        }}
        contentStyle={{ paddingBottom: 96 }}
      >
        <SectionHeading eyebrow={listings.shopEyebrow} title={listings.shopTitle} text={listings.shopText} />

        <Row style={{ borderWidth: 1.5, borderColor: colors.grey[200], borderRadius: radius.pill, paddingHorizontal: 14, marginBottom: 12 }}>
          <Ionicons name="search" size={18} color={colors.grey[500]} />
          <TextInput
            ref={searchBox}
            value={search}
            onChangeText={(q) => update({ q })}
            placeholder="Search products..."
            placeholderTextColor={colors.grey[400]}
            accessibilityLabel="Search products"
            returnKeyType="search"
            style={{ flex: 1, paddingVertical: 11, fontFamily: fonts.regular, fontSize: 16, color: colors.ink }}
          />
          {!!search && (
            <Pressable onPress={() => update({ q: "" })} accessibilityLabel="Clear search" hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.grey[400]} />
            </Pressable>
          )}
        </Row>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {[{ name: "All", icon: "🛍️" }, ...categories].map((c) => (
            <Pill key={c.name} label={`${c.icon} ${c.name}`} active={category === c.name} onPress={() => update({ category: c.name === "All" ? "" : c.name })} />
          ))}
          {[
            { key: "sale", label: "🏷️ On Sale" },
            { key: "new", label: "✨ New Arrivals" },
          ].map((f) => (
            <Pill key={f.key} label={f.label} active={filter === f.key} onPress={() => update({ filter: filter === f.key ? "" : f.key })} />
          ))}
        </ScrollView>

        <Row style={{ justifyContent: "space-between", marginTop: 14, marginBottom: 14 }}>
          <T size={14} color={colors.grey[500]}>
            {list.length} products found
          </T>
          <Pressable onPress={() => setShowSort((s) => !s)} accessibilityRole="button" accessibilityLabel="Sort products" style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <T weight="bold" size={14}>
              Sort: {SORTS.find((s) => s.key === sort).label}
            </T>
            <Ionicons name={showSort ? "chevron-up" : "chevron-down"} size={16} color={colors.ink} />
          </Pressable>
        </Row>
        {showSort && (
          <Row gap={8} style={{ flexWrap: "wrap", marginBottom: 14 }}>
            {SORTS.map((s) => (
              <Pill
                key={s.key}
                label={s.label}
                active={sort === s.key}
                onPress={() => {
                  setSort(s.key);
                  setShowSort(false);
                }}
              />
            ))}
          </Row>
        )}

        <ProductGrid products={list} empty="No products match your search. Try another word or category." />
      </Screen>
      <WhatsAppButton />
    </View>
  );
}
