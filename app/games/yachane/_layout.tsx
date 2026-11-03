import { useEffect } from "react";
import { Alert } from "react-native";
import { Stack, router, usePathname } from "expo-router";
import { useYachane } from "@/context/YachaneContext";

export default function YachaneLayout() {
  const pathname = usePathname();
  const {
    isDataInitialized,
    selectedVocaluries,
    selectedTexts,
  } = useYachane();

  useEffect(() => {
    if (
      !isDataInitialized ||
      pathname.startsWith("/games/yachane/settings/") ||
      (selectedVocaluries.length > 0 && selectedTexts.length > 0)
    ) {
      return;
    }

    Alert.alert(
      "Attention",
      "selectionne au moins une leçon de vocabulaire et un texte pour jouer",
      [{ text: "OK" }]
    );
    router.replace("/games/yachane/settings/SettingsScreen");
  }, [
    isDataInitialized,
    pathname,
    selectedTexts.length,
    selectedVocaluries.length,
  ]);

  return <Stack screenOptions={{ headerShown: false }} />;
}