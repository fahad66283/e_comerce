import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, View } from "react-native";
import { SECTIONS } from "@shared/components/settingsSections";
import { defaultSettings } from "@shared/data/siteContent";
import { AdminOnly } from "@/components/admin";
import { Screen, T } from "@/components/ui";
import { useColors, useSettings } from "@/context/StoreContext";
import { radius } from "@/lib/theme";

// Super admin: list of editable sections ("website" content or store "settings").
export default function EditorScreen() {
  const colors = useColors();
  const { group = "website" } = useLocalSearchParams();
  const { rawSettings } = useSettings();
  const sections = SECTIONS.filter((s) => s.group === group);
  const customized = (key) => JSON.stringify(rawSettings[key]) !== JSON.stringify(defaultSettings[key]);

  return (
    <AdminOnly superOnly>
      <Screen>
        <Stack.Screen options={{ title: group === "settings" ? "Store Settings" : "Edit Website" }} />
        <T color={colors.grey[500]} style={{ marginBottom: 14 }}>
          {group === "settings" ? "Contact details, shipping, payment methods and stock alerts." : "Change any text, image or colour on the website and in the app. Write {storeName} to insert your store name."}
        </T>
        <View style={{ gap: 8 }}>
          {sections.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => router.push(`/dashboard/section?key=${s.key}`)}
              accessibilityRole="button"
              style={{ flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: colors.grey[200], borderRadius: radius.field, padding: 14 }}
            >
              <View style={{ flex: 1 }}>
                <T weight="extrabold">{s.title}</T>
                {!!s.description && (
                  <T size={12.5} color={colors.grey[500]}>
                    {s.description}
                  </T>
                )}
              </View>
              {customized(s.key) && <View accessibilityLabel="Customized" style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.brand600 }} />}
              <Ionicons name="chevron-forward" size={18} color={colors.grey[400]} />
            </Pressable>
          ))}
        </View>
      </Screen>
    </AdminOnly>
  );
}
