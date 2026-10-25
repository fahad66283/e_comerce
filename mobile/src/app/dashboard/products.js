import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { formatPrice } from "@shared/data/products";
import { matchesSearch } from "@shared/lib/search";
import { confirmAction, SearchBox, StatTile, Switch, Tag } from "@/components/admin";
import { ProductImage } from "@/components/shop";
import { Button, Card, Notice, Pill, Row, Screen, T } from "@/components/ui";
import { useColors, useProducts, useSettings } from "@/context/StoreContext";

const makeFilters = (lowStock) => [
  { key: "all", label: "All", test: () => true },
  { key: "low", label: "Low stock", test: (p) => p.stock > 0 && p.stock <= lowStock },
  { key: "out", label: "Out of stock", test: (p) => p.stock < 1 },
  { key: "featured", label: "Featured", test: (p) => p.featured },
  { key: "new", label: "New", test: (p) => p.isNew },
  { key: "sale", label: "On sale", test: (p) => p.compareAt > p.price },
];

export default function ProductsAdminScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const { products, categories, setProductFlags, deleteProduct, resetProducts } = useProducts();
  const lowStock = useSettings().settings.inventory.lowStock;
  const filters = makeFilters(lowStock);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(filters.some((f) => f.key === params.filter) ? params.filter : "all");
  const [message, setMessage] = useState({ text: "", error: false });

  async function run(action, done) {
    try {
      await action();
      setMessage({ text: done, error: false });
    } catch (err) {
      setMessage({ text: err.message, error: true });
    }
  }

  const activeFilter = filters.find((f) => f.key === filter);
  const shown = products.filter((p) => activeFilter.test(p) && matchesSearch(p, search));

  return (
    <Screen>
      <Stack.Screen options={{ title: "Products" }} />
      <Row gap={10} style={{ marginBottom: 14 }}>
        <Button title="+ Add Product" size="sm" disabled={categories.length === 0} onPress={() => router.push("/dashboard/product-form")} />
        <Button
          title="Reset to Default"
          size="sm"
          variant="outline"
          onPress={() => confirmAction("Reset all products to the original list? Your products and their photos will be replaced.", () => run(resetProducts, "Products were reset to the original list."), { yes: "Reset" })}
        />
      </Row>
      {categories.length === 0 && <Notice tone="warning">Add a category first.</Notice>}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <StatTile label="Total Products" value={products.length} style={{ flexBasis: "30%" }} />
        <StatTile label="Items in Stock" value={products.reduce((s, p) => s + p.stock, 0)} style={{ flexBasis: "30%" }} />
        <StatTile label="Out of Stock" value={products.filter((p) => p.stock < 1).length} style={{ flexBasis: "30%" }} />
      </View>

      {!!message.text && (
        <Notice tone={message.error ? "error" : "success"} style={{ marginBottom: 12 }}>
          {message.text}
        </Notice>
      )}

      <SearchBox value={search} onChangeText={setSearch} placeholder="Search products..." label="Search products" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, marginBottom: 12 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {filters.map((f) => (
          <Pill key={f.key} label={`${f.label} (${products.filter(f.test).length})`} active={filter === f.key} onPress={() => setFilter(f.key)} style={{ paddingHorizontal: 13, paddingVertical: 6 }} />
        ))}
      </ScrollView>

      <View style={{ gap: 10 }}>
        {shown.map((p) => (
          <Card key={p.id} style={{ padding: 12, gap: 10 }}>
            <Row gap={12}>
              <ProductImage product={p} size={52} />
              <View style={{ flex: 1 }}>
                <Pressable onPress={() => router.push(`/products/${encodeURIComponent(p.id)}`)}>
                  <T weight="extrabold" numberOfLines={1}>
                    {p.name}
                  </T>
                </Pressable>
                <T size={13} color={colors.grey[500]}>
                  {p.category}
                </T>
                <Row gap={6}>
                  <T weight="bold" size={14}>
                    {formatPrice(p.price)}
                  </T>
                  {p.compareAt > p.price && (
                    <T size={12} color={colors.grey[400]} style={{ textDecorationLine: "line-through" }}>
                      {formatPrice(p.compareAt)}
                    </T>
                  )}
                </Row>
              </View>
              {p.stock < 1 ? (
                <Tag bg="#FEE2E2" color="#B91C1C">
                  Out of stock
                </Tag>
              ) : p.stock <= lowStock ? (
                <Tag bg="#FEF3C7" color="#92400E">
                  Low · {p.stock}
                </Tag>
              ) : (
                <T weight="bold" size={14}>
                  {p.stock} in stock
                </T>
              )}
            </Row>
            <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <Row gap={14}>
                <Row gap={6}>
                  <T size={13} weight="bold" color={colors.grey[700]}>
                    Featured
                  </T>
                  <Switch on={p.featured} label={`Featured: ${p.name}`} onPress={() => run(() => setProductFlags(p.id, { featured: !p.featured }), `"${p.name}" was updated.`)} />
                </Row>
                <Row gap={6}>
                  <T size={13} weight="bold" color={colors.grey[700]}>
                    New
                  </T>
                  <Switch on={p.isNew} label={`New arrival: ${p.name}`} onPress={() => run(() => setProductFlags(p.id, { isNew: !p.isNew }), `"${p.name}" was updated.`)} />
                </Row>
              </Row>
              <Row gap={16}>
                <Pressable onPress={() => router.push(`/dashboard/product-form?id=${encodeURIComponent(p.id)}`)} accessibilityRole="button" accessibilityLabel={`Edit ${p.name}`} hitSlop={6}>
                  <T weight="bold" size={14}>
                    Edit
                  </T>
                </Pressable>
                <Pressable
                  onPress={() => confirmAction(`Delete "${p.name}"? This cannot be undone.`, () => run(() => deleteProduct(p.id), `"${p.name}" was deleted.`))}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${p.name}`}
                  hitSlop={6}
                >
                  <T weight="bold" size={14} color={colors.red}>
                    Delete
                  </T>
                </Pressable>
              </Row>
            </Row>
          </Card>
        ))}
        {shown.length === 0 && (
          <T color={colors.grey[500]} center style={{ padding: 20 }}>
            No products match.
          </T>
        )}
      </View>
    </Screen>
  );
}
