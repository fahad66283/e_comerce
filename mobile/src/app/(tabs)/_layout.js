import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router/js-tabs";
import { useCart } from "@/context/CartContext";
import { useAuth, useColors } from "@/context/StoreContext";
import { useWishlist } from "@/context/WishlistContext";
import { fonts } from "@/lib/theme";

const icon = (name) =>
  function TabIcon({ color, focused, size }) {
    return <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />;
  };

// Bottom tabs: the website's main menu (Home, Shop, Wishlist, Cart, My Account).
export default function TabsLayout() {
  const colors = useColors();
  const { count } = useCart();
  const { count: wished } = useWishlist();
  const { isAdmin, adminSummary } = useAuth();
  const staffBadge = isAdmin ? adminSummary.pendingOrders + adminSummary.unreadMessages : 0;
  const badgeStyle = { backgroundColor: colors.brand500, color: colors.ink, fontFamily: fonts.extrabold, fontSize: 11 };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.grey[400],
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11.5 },
        tabBarStyle: { borderTopColor: colors.grey[200] },
        headerTitleStyle: { fontFamily: fonts.extrabold, fontSize: 18 },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.white },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", headerShown: false, tabBarIcon: icon("home") }} />
      <Tabs.Screen name="products" options={{ title: "Shop", tabBarIcon: icon("grid") }} />
      <Tabs.Screen name="wishlist" options={{ title: "Wishlist", tabBarIcon: icon("heart"), tabBarBadge: wished || undefined, tabBarBadgeStyle: badgeStyle }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", tabBarIcon: icon("cart"), tabBarBadge: count || undefined, tabBarBadgeStyle: badgeStyle }} />
      <Tabs.Screen
        name="account"
        options={{ title: "Account", tabBarIcon: icon("person"), tabBarBadge: staffBadge || undefined, tabBarBadgeStyle: { ...badgeStyle, backgroundColor: colors.red, color: colors.white } }}
      />
    </Tabs>
  );
}
