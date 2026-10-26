import { Stack } from "expo-router";
import AuthForm from "@/components/AuthForm";

export default function SignupScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Sign Up" }} />
      <AuthForm mode="signup" />
    </>
  );
}
