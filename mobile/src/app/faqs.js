import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import InfoPage from "@/components/InfoPage";
import RichText from "@/components/RichText";
import { Button, Heading, T } from "@/components/ui";
import { useColors, useSettings } from "@/context/StoreContext";
import { radius } from "@/lib/theme";

function Question({ item }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ borderWidth: 1, borderColor: open ? colors.ink : colors.grey[200], borderRadius: radius.card, paddingHorizontal: 16, paddingVertical: 14 }}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <T weight="extrabold" style={{ flex: 1 }}>
          {item.question}
        </T>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: open ? colors.brand500 : colors.grey[100], alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={open ? "close" : "add"} size={18} color={colors.ink} />
        </View>
      </Pressable>
      {open && <RichText text={item.answer} style={{ marginTop: 10 }} />}
    </View>
  );
}

export default function FaqScreen() {
  const colors = useColors();
  const { faqs } = useSettings().settings;
  // Group questions by their group name, keeping the order they were entered in.
  const groups = [];
  for (const item of faqs.items) {
    const name = item.group?.trim() || "General";
    let group = groups.find((g) => g.name === name);
    if (!group) groups.push((group = { name, items: [] }));
    group.items.push(item);
  }
  return (
    <InfoPage eyebrow={faqs.eyebrow} title={faqs.title} intro={faqs.intro}>
      <Stack.Screen options={{ title: "FAQs" }} />
      <View style={{ gap: 26 }}>
        {groups.map((group) => (
          <View key={group.name} style={{ gap: 10 }}>
            <Heading size={20}>{group.name}</Heading>
            {group.items.map((item, i) => (
              <Question key={i} item={item} />
            ))}
          </View>
        ))}
        <View style={{ backgroundColor: colors.brand50, borderRadius: radius.panel, padding: 20, gap: 8, alignItems: "flex-start" }}>
          <T weight="extrabold" size={18}>
            Still have a question?
          </T>
          <T color={colors.grey[500]}>Our team is happy to help.</T>
          <Button title="Contact Us" onPress={() => router.push("/contact")} />
        </View>
      </View>
    </InfoPage>
  );
}
