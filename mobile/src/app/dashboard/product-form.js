import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { pickAndUploadImages, SwitchRow } from "@/components/admin";
import { ProductImage } from "@/components/shop";
import { Button, Field, Heading, Notice, Panel, Pill, Row, Screen, T } from "@/components/ui";
import { useColors, useProducts } from "@/context/StoreContext";
import { deleteUploads } from "@/lib/api";

const emptyProduct = { name: "", price: "", compareAt: "", category: "", emoji: "📦", rating: "4.5", stock: "10", featured: false, isNew: true, description: "", images: [] };

// Add or edit a product (up to 5 photos), like the website's product form.
export default function ProductFormScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const { categories, getProduct, addProduct, updateProduct } = useProducts();
  const product = id ? getProduct(id) : null;
  const [form, setForm] = useState(() =>
    product
      ? { ...emptyProduct, ...product, price: String(product.price), compareAt: product.compareAt ? String(product.compareAt) : "", rating: String(product.rating), stock: String(product.stock), images: product.images ?? [] }
      : { ...emptyProduct, category: categories[0]?.name ?? "" }
  );
  const [uploaded, setUploaded] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function addPhotos() {
    setUploading(true);
    setError("");
    try {
      const urls = await pickAndUploadImages({ max: 5 - form.images.length });
      setUploaded((prev) => [...prev, ...urls]);
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, 5) }));
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  }

  function move(index, step) {
    setForm((f) => {
      const images = [...f.images];
      [images[index], images[index + step]] = [images[index + step], images[index]];
      return { ...f, images };
    });
  }

  async function save() {
    const price = Number(form.price);
    const compareAt = form.compareAt === "" ? null : Number(form.compareAt);
    if (!form.name.trim()) return setError("Product name is required.");
    if (!(price > 0)) return setError("Please enter a price.");
    if (compareAt !== null && compareAt <= price) return setError("The original price must be higher than the sale price, or left empty.");
    if (!form.description.trim()) return setError("Description is required.");
    setSaving(true);
    setError("");
    const data = {
      ...form,
      name: form.name.trim(),
      emoji: form.emoji.trim() || "📦",
      description: form.description.trim(),
      price,
      compareAt,
      rating: Number(form.rating),
      stock: Number(form.stock),
    };
    try {
      if (product) await updateProduct(product.id, data);
      else await addProduct(data);
      // Photos uploaded here but removed again before saving.
      deleteUploads(uploaded.filter((url) => !form.images.includes(url)));
      router.back();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  function cancel() {
    deleteUploads(uploaded);
    router.back();
  }

  if (id && !product) {
    return (
      <Screen>
        <Notice tone="error">This product no longer exists.</Notice>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <Screen>
        <Stack.Screen options={{ title: product ? `Edit: ${product.name}` : "Add New Product" }} />
        <Panel style={{ marginBottom: 14 }}>
          <Heading size={16}>Product Photos (up to 5)</Heading>
          <T size={12.5} color={colors.grey[500]} style={{ marginBottom: 10 }}>
            The first photo is the main image. Products without photos show their emoji.
          </T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {form.images.map((src, i) => (
              <View key={src} style={{ width: 96 }}>
                <ProductImage product={form} src={src} size={96} />
                {i === 0 && (
                  <View style={{ position: "absolute", top: 4, left: 4, backgroundColor: colors.ink, borderRadius: 6, paddingHorizontal: 6 }}>
                    <T weight="bold" size={10} color="#FFFFFF">
                      Main
                    </T>
                  </View>
                )}
                <Row gap={0} style={{ justifyContent: "space-between", marginTop: 4 }}>
                  <Pressable disabled={i === 0} onPress={() => move(i, -1)} accessibilityLabel="Move image left" hitSlop={6} style={{ opacity: i === 0 ? 0.3 : 1 }}>
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                  </Pressable>
                  <Pressable onPress={() => set("images")(form.images.filter((x) => x !== src))} accessibilityLabel={`Remove image ${i + 1}`} hitSlop={6}>
                    <Ionicons name="trash-outline" size={19} color={colors.red} />
                  </Pressable>
                  <Pressable disabled={i === form.images.length - 1} onPress={() => move(i, 1)} accessibilityLabel="Move image right" hitSlop={6} style={{ opacity: i === form.images.length - 1 ? 0.3 : 1 }}>
                    <Ionicons name="chevron-forward" size={20} color={colors.ink} />
                  </Pressable>
                </Row>
              </View>
            ))}
            {form.images.length < 5 && (
              <Pressable onPress={addPhotos} disabled={uploading} accessibilityRole="button" accessibilityLabel="Add photos" style={{ width: 96, height: 96, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.grey[400], alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Ionicons name={uploading ? "hourglass-outline" : "camera-outline"} size={26} color={colors.grey[500]} />
                <T size={12} weight="bold" color={colors.grey[500]}>
                  {uploading ? "Uploading..." : "Add photos"}
                </T>
              </Pressable>
            )}
          </ScrollView>
        </Panel>

        <Panel style={{ marginBottom: 14 }}>
          <Field label="Product Name" value={form.name} onChangeText={set("name")} />
          <Row gap={10} style={{ alignItems: "flex-start" }}>
            <Field label="Price (Rs.)" value={form.price} onChangeText={set("price")} keyboardType="number-pad" style={{ flex: 1 }} />
            <Field label="Original Price" value={form.compareAt} onChangeText={set("compareAt")} keyboardType="number-pad" placeholder="optional" style={{ flex: 1 }} />
          </Row>
          <Row gap={10} style={{ alignItems: "flex-start" }}>
            <Field label="Stock" value={form.stock} onChangeText={set("stock")} keyboardType="number-pad" style={{ flex: 1 }} />
            <Field label="Starting Rating (0–5)" value={form.rating} onChangeText={set("rating")} keyboardType="decimal-pad" style={{ flex: 1 }} />
          </Row>
          <T weight="bold" size={13.5} color={colors.grey[700]}>
            Category
          </T>
          <Row gap={8} style={{ flexWrap: "wrap", marginTop: 6, marginBottom: 14 }}>
            {categories.map((c) => (
              <Pill key={c.name} label={`${c.icon} ${c.name}`} active={form.category === c.name} onPress={() => set("category")(c.name)} style={{ paddingHorizontal: 12, paddingVertical: 6 }} />
            ))}
          </Row>
          <Field label="Emoji (shown when there are no photos)" value={form.emoji} onChangeText={set("emoji")} />
          <Field label="Description" value={form.description} onChangeText={set("description")} multiline />
          <SwitchRow label="Featured (shown in “Most popular” on the home screen)" on={form.featured} onChange={set("featured")} />
          <SwitchRow label="New arrival (shown in “New at the store” with a New badge)" on={form.isNew} onChange={set("isNew")} />
        </Panel>

        <Notice tone="error" style={{ marginBottom: 12 }}>
          {error}
        </Notice>
        <Row gap={10}>
          <Button title={saving ? "Saving..." : product ? "Save Changes" : "Add Product"} onPress={save} loading={saving} disabled={uploading} style={{ flex: 1 }} />
          <Button title="Cancel" variant="outline" onPress={cancel} />
        </Row>
      </Screen>
    </KeyboardAvoidingView>
  );
}
