import { Stack } from "expo-router";
import { AdminOnly } from "@/components/admin";
import { useColors } from "@/context/StoreContext";
import { fonts } from "@/lib/theme";

// Admin dashboard (staff only), same sections as the website's /dashboard.
export default function DashboardLayout() {
  const colors = useColors();
  return (
    <AdminOnly>
      <Stack
        screenOptions={{
          headerTitleStyle: { fontFamily: fonts.extrabold, fontSize: 18 },
          headerTintColor: colors.ink,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.white },
        }}
      />
    </AdminOnly>
  );
}
