import { router } from "expo-router";
import { ProductGrid } from "@/components/shop";
import { Button, Empty, Panel, Screen, SectionHeading } from "@/components/ui";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistScreen() {
  const { items } = useWishlist();
  return (
    <Screen>
      <SectionHeading eyebrow="Wishlist" title="Your saved products" text="Tap the ♡ on any product to save it here for later." />
      {items.length === 0 ? (
        <Panel>
          <Empty emoji="♡" title="Your wishlist is empty." action={<Button title="Browse Products" onPress={() => router.push("/products")} />} />
        </Panel>
      ) : (
        <ProductGrid products={items} />
      )}
    </Screen>
  );
}
