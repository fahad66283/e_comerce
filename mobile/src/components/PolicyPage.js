import { Stack } from "expo-router";
import { View } from "react-native";
import { useColors, useSettings } from "@/context/StoreContext";
import { radius } from "@/lib/theme";
import InfoPage from "./InfoPage";
import RichText from "./RichText";
import { T } from "./ui";

// Privacy Policy, Terms & Conditions and Return Policy, all editable by the super admin.
export default function PolicyPage({ section }) {
  const colors = useColors();
  const page = useSettings().settings[section];
  return (
    <InfoPage eyebrow="Policies" title={page.title} intro={page.intro} updated={page.updated}>
      <Stack.Screen options={{ title: page.title }} />
      {page.highlights.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          {page.highlights.map((c, i) => (
            <View key={i} style={{ flexBasis: "30%", flexGrow: 1, borderWidth: 1, borderColor: colors.grey[200], backgroundColor: colors.grey[50], borderRadius: radius.card, padding: 14, alignItems: "center" }}>
              <T size={22}>{c.icon}</T>
              <T weight="extrabold" center>
                {c.title}
              </T>
              <T size={13} color={colors.grey[500]} center>
                {c.text}
              </T>
            </View>
          ))}
        </View>
      )}
      {page.sections.map((s, i) => (
        <View key={i} style={{ borderBottomWidth: i < page.sections.length - 1 ? 1 : 0, borderBottomColor: colors.grey[200], paddingVertical: 18 }}>
          <T weight="extrabold" size={18} style={{ marginBottom: 8 }}>
            {s.title}
          </T>
          <RichText text={s.body} />
        </View>
      ))}
    </InfoPage>
  );
}
