import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { whatsappLink } from "@shared/data/siteContent";
import ProductReviews from "@/components/ProductReviews";
import { Inline } from "@/components/RichText";
import { Price, ProductGrid, ProductImage, QuantityStepper, Stars } from "@/components/shop";
import { Button, Empty, Heading, Row, Screen, T } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { useColors, useProducts, useReviews, useSettings } from "@/context/StoreContext";
import { useWishlist } from "@/context/WishlistContext";
import { radius } from "@/lib/theme";

function Gallery({ product }) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const size = Math.min(width, 700) - 32;
  const images = product.images ?? [];
  const [index, setIndex] = useState(0);
  if (images.length <= 1) return <ProductImage product={product} style={{ width: size, aspectRatio: 1, borderRadius: radius.panel }} />;
  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / size))}
        style={{ width: size, borderRadius: radius.panel }}
      >
        {images.map((src) => (
          <ProductImage key={src} product={product} src={src} style={{ width: size, aspectRatio: 1 }} />
        ))}
      </ScrollView>
      <Row gap={6} style={{ justifyContent: "center", marginTop: 10 }}>
        {images.map((src, i) => (
          <View key={src} accessibilityLabel={`Image ${i + 1} of ${images.length}`} style={{ width: i === index ? 18 : 7, height: 7, borderRadius: 4, backgroundColor: i === index ? colors.ink : colors.grey[200] }} />
        ))}
      </Row>
    </View>
  );
}

export default function ProductScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const { products, getProduct } = useProducts();
  const { getRating } = useReviews();
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const { isWished, toggleWish } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const product = getProduct(id);

  if (!product) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Product" }} />
        <Empty emoji="🤷" title="Product not found" text="This product may have been removed." action={<Button title="Back to Shop" onPress={() => router.replace("/products")} />} />
      </Screen>
    );
  }

  const { average, count } = getRating(product);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const wished = isWished(product.id);

  function add() {
    addToCart(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: product.name }} />
      <Gallery product={product} />
      <View style={{ marginTop: 18, gap: 8 }}>
        <T weight="extrabold" size={12} color={colors.brand700} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
          {product.category}
        </T>
        <Heading size={26}>{product.name}</Heading>
        <Row gap={6}>
          <Stars value={average} />
          <T size={14} color={colors.grey[500]}>
            {average.toFixed(1)} · {count} {count === 1 ? "review" : "reviews"}
          </T>
        </Row>
        <Price product={product} size="lg" />
        <T color={colors.grey[500]}>{product.description}</T>
        {product.stock > 0 ? (
          <>
            <T weight="bold" size={14} color={colors.brand700}>
              ✓ In stock ({product.stock} available)
            </T>
            <Row gap={12} style={{ marginTop: 6 }}>
              <QuantityStepper value={quantity} onChange={setQuantity} max={product.stock} />
              <Button title={added ? "Added ✓" : "Add to Cart"} variant={added ? "dark" : "primary"} onPress={add} style={{ flex: 1 }} />
            </Row>
          </>
        ) : (
          <T weight="bold" color={colors.red}>
            Out of stock
          </T>
        )}
        <Row gap={10} style={{ flexWrap: "wrap", marginTop: 4 }}>
          <Button
            size="sm"
            variant="outline"
            title={wished ? "♥ In Wishlist" : "♡ Add to Wishlist"}
            onPress={() => toggleWish(product.id)}
            accessibilityLabel={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          />
          {!!settings.contact.whatsapp && (
            <Pressable
              onPress={() => Linking.openURL(whatsappLink(settings.contact.whatsapp, `Hi ${settings.general.storeName}! I'd like to order: ${product.name} (${product.id})`)).catch(() => {})}
              accessibilityRole="link"
              style={{ backgroundColor: "#25D366", borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 10 }}
            >
              <T weight="extrabold" size={14} color="#FFFFFF">
                Order on WhatsApp
              </T>
            </Pressable>
          )}
        </Row>
        {settings.productPage.highlights.length > 0 && (
          <View style={{ borderTopWidth: 1, borderTopColor: colors.grey[200], marginTop: 14, paddingTop: 14, gap: 6 }}>
            {settings.productPage.highlights.map((h, i) => (
              <Inline key={i} text={h} size={14} color={colors.grey[700]} />
            ))}
          </View>
        )}
      </View>

      <ProductReviews product={product} />

      {related.length > 0 && (
        <View style={{ marginTop: 32 }}>
          <Heading style={{ marginBottom: 14 }}>You may also like</Heading>
          <ProductGrid products={related} />
        </View>
      )}
    </Screen>
  );
}
