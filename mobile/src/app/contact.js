import { Stack } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { whatsappLink } from "@shared/data/siteContent";
import { WhatsAppButton } from "@/components/shop";
import { Button, Field, Heading, Notice, Panel, Row, Screen, SectionHeading, T } from "@/components/ui";
import { useAuth, useColors, useSettings } from "@/context/StoreContext";
import { api } from "@/lib/api";
import { radius } from "@/lib/theme";

function ContactForm() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", subject: "", message: "" });
  const [status, setStatus] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function send() {
    setBusy(true);
    try {
      await api("/api/contact", { method: "POST", body: form });
      setForm((f) => ({ ...f, subject: "", message: "" }));
      setStatus({ text: "✓ Your message has been sent. We'll get back to you soon.", error: false });
    } catch (err) {
      setStatus({ text: err.message, error: true });
    }
    setBusy(false);
  }

  return (
    <Panel>
      <Heading size={18} style={{ marginBottom: 12 }}>
        Send us a message
      </Heading>
      <Field label="Full Name" value={form.name} onChangeText={set("name")} autoComplete="name" />
      <Field label="Email" value={form.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Field label="Subject" value={form.subject} onChangeText={set("subject")} />
      <Field label="Your Message" value={form.message} onChangeText={set("message")} multiline />
      <Button title={busy ? "Sending..." : "Send Message"} onPress={send} loading={busy} />
      {!!status.text && (
        <Notice tone={status.error ? "error" : "success"} style={{ marginTop: 12 }}>
          {status.text}
        </Notice>
      )}
    </Panel>
  );
}

export default function ContactScreen() {
  const colors = useColors();
  const { contact } = useSettings().settings;
  const info = [
    contact.phone && { icon: "📞", title: "Call Us", text: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, "")}` },
    contact.whatsapp && { icon: "💬", title: "WhatsApp", text: "Chat with us", href: whatsappLink(contact.whatsapp, contact.whatsappMessage) },
    contact.email && { icon: "✉️", title: "Email", text: contact.email, href: `mailto:${contact.email}` },
    contact.address && { icon: "📍", title: "Address", text: contact.address },
    contact.hours && { icon: "🕐", title: "Working Hours", text: contact.hours },
  ].filter(Boolean);

  return (
    <View style={{ flex: 1 }}>
      <Screen contentStyle={{ paddingBottom: 96 }}>
        <Stack.Screen options={{ title: "Contact Us" }} />
        <SectionHeading eyebrow={contact.eyebrow} title={contact.title} text={contact.text} />
        <View style={{ gap: 10, marginBottom: 18 }}>
          {info.map((item) => (
            <Pressable
              key={item.title}
              disabled={!item.href}
              onPress={() => Linking.openURL(item.href).catch(() => {})}
              accessibilityRole={item.href ? "link" : undefined}
              style={{ flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: colors.grey[200], backgroundColor: colors.grey[50], borderRadius: radius.card, padding: 16 }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.grey[200], backgroundColor: colors.white, alignItems: "center", justifyContent: "center" }}>
                <T size={20}>{item.icon}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T weight="extrabold" size={14.5}>
                  {item.title}
                </T>
                <T size={14} color={colors.grey[500]}>
                  {item.text}
                </T>
              </View>
            </Pressable>
          ))}
        </View>
        <ContactForm />
      </Screen>
      <WhatsAppButton />
    </View>
  );
}
