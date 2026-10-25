import { Linking, Pressable, View } from "react-native";
import { PAYMENT_ICONS } from "@shared/data/siteContent";
import { useColors, usePaymentMethods, useSettings } from "@/context/StoreContext";
import { openLink } from "@/lib/links";
import { radius } from "@/lib/theme";
import { Logo } from "./shop";
import { T } from "./ui";

const groups = [
  { title: "Shop", links: [["/products", "All Products"], ["/categories", "Categories"], ["/products?filter=sale", "On Sale"]] },
  { title: "Company", links: [["/about", "About Us"], ["/contact", "Contact Us"], ["/faqs", "FAQs"], ["/track-order", "Track Order"]] },
  { title: "Policies", links: [["/return-policy", "Return Policy"], ["/privacy-policy", "Privacy Policy"], ["/terms", "Terms & Conditions"]] },
];
const socialNames = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };

// The website footer: logo, tagline, contact details, links, social pages and payment methods.
export default function StoreFooter() {
  const colors = useColors();
  const { footer, contact } = useSettings().settings;
  const methods = usePaymentMethods();
  const socials = Object.keys(socialNames).filter((key) => /^https?:\/\//i.test(footer[key] ?? ""));
  const muted = "#A8ACA4";
  return (
    <View style={{ backgroundColor: colors.ink, borderRadius: radius.panel, padding: 22, gap: 16 }}>
      <Logo light />
      <T size={14} color="#8C9088">
        {footer.tagline}
      </T>
      <View style={{ gap: 4 }}>
        {!!contact.phone && (
          <T size={14} color={muted} onPress={() => Linking.openURL(`tel:${contact.phone.replace(/[^\d+]/g, "")}`)}>
            📞 {contact.phone}
          </T>
        )}
        {!!contact.email && (
          <T size={14} color={muted} onPress={() => Linking.openURL(`mailto:${contact.email}`)}>
            ✉️ {contact.email}
          </T>
        )}
        {!!contact.address && (
          <T size={14} color={muted}>
            📍 {contact.address}
          </T>
        )}
      </View>
      {socials.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {socials.map((key) => (
            <Pressable key={key} onPress={() => Linking.openURL(footer[key])} accessibilityRole="link" style={{ borderWidth: 1, borderColor: "#333333", borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 }}>
              <T weight="bold" size={13} color={colors.white}>
                {socialNames[key]}
              </T>
            </Pressable>
          ))}
        </View>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 18 }}>
        {groups.map((group) => (
          <View key={group.title} style={{ minWidth: 130, flex: 1, gap: 8 }}>
            <T weight="extrabold" color={colors.white}>
              {group.title}
            </T>
            {group.links.map(([href, label]) => (
              <T key={href} size={14} color={muted} onPress={() => openLink(href)} accessibilityRole="link">
                {label}
              </T>
            ))}
          </View>
        ))}
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: "#2A2A2A", paddingTop: 14, gap: 10 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {methods.map((m) => (
            <View key={m.id} style={{ backgroundColor: "#1A1A1A", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
              <T size={12} color={muted}>
                {PAYMENT_ICONS[m.id] ?? "💳"} {m.title}
              </T>
            </View>
          ))}
        </View>
        <T size={12.5} color="#8C9088">
          {footer.copyright}
        </T>
      </View>
    </View>
  );
}
