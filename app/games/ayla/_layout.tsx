import { Stack } from "expo-router";
import { AylaProvider } from "@/context/AylaContext";

export default function AylaLayout() {
  return (
    <AylaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AylaProvider>
  );
}