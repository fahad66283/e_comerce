import { router, Stack } from "expo-router";
import { Pressable, View } from "react-native";
import { ProductGrid } from "@/components/shop";
import { Heading, Row, Screen, SectionHeading, T } from "@/components/ui";
import { useColors, useProducts, useSettings } from "@/context/StoreContext";
import { radius } from "@/lib/theme";

export default function CategoriesScreen() {
  const colors = useColors();
  const { products, categories } = useProducts();
  const { listings } = useSettings().settings;
  const show = (name) => router.push(`/products?category=${encodeURIComponent(name)}`);

  return (
    <Screen>
      <Stack.Screen options={{ title: "Categories" }} />
      <SectionHeading eyebrow={listings.categoriesEyebrow} title={listings.categoriesTitle} text={listings.categoriesText} />
      <View style={{ gap: 12 }}>
        {categories.map(({ name, icon, description }) => {
          const count = products.filter((p) => p.category === name).length;
          return (
            <Pressable key={name} onPress={() => show(name)} accessibilityRole="link" style={{ borderWidth: 1.5, borderColor: colors.grey[200], borderRadius: radius.panel, padding: 18, flexDirection: "row", gap: 14, alignItems: "center" }}>
              <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: colors.brand100, alignItems: "center", justifyContent: "center" }}>
                <T size={26}>{icon}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T weight="extrabold" size={17}>
                  {name}
                </T>
                {!!description && (
                  <T size={13.5} color={colors.grey[500]}>
                    {description}
                  </T>
                )}
                <T weight="bold" size={13.5} color={colors.brand700} style={{ marginTop: 4 }}>
                  {count} {count === 1 ? "product" : "products"}
                </T>
              </View>
              <T size={20} color={colors.grey[400]}>
                →
              </T>
            </Pressable>
          );
        })}
      </View>

      {categories.map(({ name, icon }) => {
        const items = products.filter((p) => p.category === name).slice(0, 4);
        if (items.length === 0) return null;
        return (
          <View key={name} style={{ marginTop: 32 }}>
            <Row style={{ justifyContent: "space-between", marginBottom: 14 }}>
              <Heading size={21}>
                {icon} {name}
              </Heading>
              <Pressable onPress={() => show(name)} accessibilityRole="link">
                <T weight="extrabold" size={14} color={colors.brand700}>
                  View all →
                </T>
              </Pressable>
            </Row>
            <ProductGrid products={items} />
          </View>
        );
      })}
    </Screen>
  );
}
