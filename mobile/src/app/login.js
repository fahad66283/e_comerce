import { Stack } from "expo-router";
import AuthForm from "@/components/AuthForm";

export default function LoginScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Login" }} />
      <AuthForm mode="login" />
    </>
  );
}
