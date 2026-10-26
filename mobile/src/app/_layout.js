import {
  Tajawal_300Light,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
  Tajawal_900Black,
  useFonts,
} from "@expo-google-fonts/tajawal";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, Empty, Screen } from "@/components/ui";
import { CartProvider } from "@/context/CartContext";
import { StoreProvider, useStore } from "@/context/StoreContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { fonts } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_300Light,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
    Tajawal_900Black,
  });
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <AppShell fontsReady={fontsLoaded || !!fontError} />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function AppShell({ fontsReady }) {
  const { ready, loaded, error, refresh, colors } = useStore();

  useEffect(() => {
    if (fontsReady && ready) SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady, ready]);

  if (!fontsReady || !ready) return null;

  // First start without a connection (nothing saved on the phone yet).
  if (!loaded) {
    return (
      <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <Empty emoji="📶" title="Can't load the store" text={error ?? "Please check your internet connection."} action={<Button title="Try again" onPress={refresh} />} />
      </Screen>
    );
  }

  return (
    <CartProvider>
      <WishlistProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTitleStyle: { fontFamily: fonts.extrabold, fontSize: 18 },
            headerTintColor: colors.ink,
            headerShadowVisible: false,
            headerBackButtonDisplayMode: "minimal",
            contentStyle: { backgroundColor: colors.white },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Home" }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        </Stack>
      </WishlistProvider>
    </CartProvider>
  );
}
