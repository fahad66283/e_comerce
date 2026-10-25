import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useAuth, useColors } from "@/context/StoreContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button, Eyebrow, Field, Heading, Notice, Panel, Screen, T } from "./ui";

// Only go back to screens in the app (e.g. "/checkout").
const safeNext = (value) => (typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : null);

export default function AuthForm({ mode }) {
  const colors = useColors();
  const isSignup = mode === "signup";
  const { login, register } = useAuth();
  const { mergeGuestWishlist } = useWishlist();
  const next = safeNext(useLocalSearchParams().next);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    setError("");
    if (isSignup && form.password !== form.confirm) return setError("Passwords do not match.");
    setBusy(true);
    const result = isSignup
      ? await register(form.name, form.email, form.password, mergeGuestWishlist)
      : await login(form.email, form.password, mergeGuestWishlist);
    setBusy(false);
    if (result.error) return setError(result.error);
    const staff = result.user.role === "admin" || result.user.role === "superadmin";
    router.dismissTo(next ?? (staff ? "/dashboard" : "/account"));
  }

  const switchHref = `${isSignup ? "/login" : "/signup"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <Panel>
          <View style={{ alignItems: "center" }}>
            <Eyebrow>{isSignup ? "Sign Up" : "Login"}</Eyebrow>
            <Heading>{isSignup ? "Create an account" : "Welcome back"}</Heading>
            <T size={14} color={colors.grey[500]} style={{ marginTop: 4, marginBottom: 18 }}>
              {isSignup ? "Sign up to track your orders" : "Login to your account"}
            </T>
          </View>
          <Notice tone="error" style={{ marginBottom: 14 }}>
            {error}
          </Notice>
          {isSignup && <Field label="Full Name" value={form.name} onChangeText={set("name")} autoComplete="name" textContentType="name" />}
          <Field
            label={isSignup ? "Email" : "Email or Username"}
            value={form.email}
            onChangeText={set("email")}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={isSignup ? "email-address" : "default"}
            autoComplete={isSignup ? "email" : "username"}
            textContentType={isSignup ? "emailAddress" : "username"}
          />
          <Field
            label="Password"
            value={form.password}
            onChangeText={set("password")}
            secureTextEntry
            autoComplete={isSignup ? "new-password" : "current-password"}
            textContentType={isSignup ? "newPassword" : "password"}
            onSubmitEditing={isSignup ? undefined : submit}
          />
          {isSignup && <Field label="Confirm Password" value={form.confirm} onChangeText={set("confirm")} secureTextEntry autoComplete="new-password" textContentType="newPassword" />}
          {isSignup && (
            <T size={12.5} color={colors.grey[500]} style={{ marginBottom: 6 }}>
              By signing up you agree to our{" "}
              <T size={12.5} weight="bold" style={{ textDecorationLine: "underline" }} onPress={() => router.push("/terms")}>
                Terms & Conditions
              </T>{" "}
              and{" "}
              <T size={12.5} weight="bold" style={{ textDecorationLine: "underline" }} onPress={() => router.push("/privacy-policy")}>
                Privacy Policy
              </T>
              .
            </T>
          )}
          <Button title={busy ? "Please wait..." : isSignup ? "Sign Up" : "Login"} onPress={submit} loading={busy} style={{ marginTop: 10 }} />
          <T size={14} color={colors.grey[500]} center style={{ marginTop: 18 }}>
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <T size={14} weight="extrabold" color={colors.brand700} onPress={() => router.replace(switchHref)}>
              {isSignup ? "Login" : "Sign Up"}
            </T>
          </T>
        </Panel>
      </Screen>
    </KeyboardAvoidingView>
  );
}
