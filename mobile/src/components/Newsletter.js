import { useState } from "react";
import { View } from "react-native";
import { useColors } from "@/context/StoreContext";
import { api } from "@/lib/api";
import { radius } from "@/lib/theme";
import { Button, Field, T } from "./ui";

export default function Newsletter({ title, text }) {
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function subscribe() {
    setBusy(true);
    setError("");
    try {
      await api("/api/newsletter", { method: "POST", body: { email } });
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <View style={{ backgroundColor: colors.ink, borderRadius: radius.panel, padding: 24, gap: 6 }}>
      <T weight="extrabold" size={20} color={colors.white}>
        {title}
      </T>
      <T color={colors.grey[400]}>{text}</T>
      {done ? (
        <T weight="bold" color={colors.brand500} style={{ marginTop: 8 }}>
          ✓ Subscribed successfully!
        </T>
      ) : (
        <View style={{ marginTop: 8 }}>
          <Field
            value={email}
            onChangeText={setEmail}
            placeholder="Your email address"
            accessibilityLabel="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            inputStyle={{ backgroundColor: "#161616", borderColor: "#333333", color: colors.white, borderRadius: radius.pill }}
            style={{ marginBottom: 10 }}
          />
          <Button title="Subscribe" onPress={subscribe} loading={busy} disabled={!email.trim()} />
          {!!error && (
            <T weight="bold" size={13.5} color="#FBBF24" style={{ marginTop: 8 }}>
              {error}
            </T>
          )}
        </View>
      )}
    </View>
  );
}
