import { router, usePathname } from "expo-router";
import { ScrollView } from "react-native";
import { Pill, Screen, SectionHeading, T } from "./ui";
import { useColors } from "@/context/StoreContext";

const helpLinks = [
  { href: "/faqs", label: "FAQs" },
  { href: "/return-policy", label: "Return Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

// Shared layout for FAQs and policy screens, with links between them (like the website).
export default function InfoPage({ eyebrow, title, intro, updated, children }) {
  const colors = useColors();
  const pathname = usePathname();
  return (
    <Screen>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, marginBottom: 16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {helpLinks.map((l) => (
          <Pill key={l.href} label={l.label} active={pathname === l.href} onPress={() => pathname !== l.href && router.replace(l.href)} />
        ))}
      </ScrollView>
      <SectionHeading eyebrow={eyebrow} title={title} text={intro} style={{ marginBottom: updated ? 4 : 16 }} />
      {!!updated && (
        <T size={13} color={colors.grey[400]} style={{ marginBottom: 16 }}>
          Last updated: {updated}
        </T>
      )}
      {children}
    </Screen>
  );
}
