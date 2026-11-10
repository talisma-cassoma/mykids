import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useAyla } from "@/context/AylaContext";
import { router } from "expo-router";
import { IconArrowLeft } from "@tabler/icons-react-native";
import { Button } from "@/components/Button";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { Colors } from "@/constants/Colors";
import { EmojiHero } from "@/components/EmojiHero";
import { Settings } from "@/components/Settings";
import { useYachane } from "@/context/YachaneContext";

export default function StartScreen() {
  const { selectedGames } = useYachane();
  const [loading, setLoading] = useState(true);

  // If you use a custom hook like useTheme(), replace it here.
  const mode = "light"; // Change or connect to your theme hook/context if needed

  return (
    <ThemedSafeAreaView
      style={[
        { flex: 1, padding: 28, paddingTop: 80 },
        styles.container,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ width: 40, height: 40, backgroundColor: "transparent" }}
          onPress={() => router.replace("/select-profile")}
        >
          <IconArrowLeft
            color={Colors[mode].icon}
            style={{ alignSelf: "flex-start" }}
          />
        </TouchableOpacity>
        <View style={{
          flexDirection: "row",
          width: "auto",
          gap: 10,
          marginLeft: 'auto',
          alignSelf: "center",
        }}>
          <ThemeToggleButton />
          <Settings />
        </View>
      </View>

      <EmojiHero
        style={{
          height: 300,
          width: 300,
        }}
      />

      <TouchableOpacity
        onPress={() => {
          const firstGame = selectedGames[0];
          router.replace(
            firstGame?.href ?? "/games/ayla/settings/SettingsScreen"
          );
        }}
        style={{
          backgroundColor: "#4caf50",
          padding: 10,
          justifyContent: "center",
          alignItems: "center",
          width: 100,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff" }}>commencer</Text>
      </TouchableOpacity>

     <TouchableOpacity
        onPress={() => {
          router.replace( "/games/yachane/book"
          );
        }}
        style={{
          backgroundColor: "#4caf50",
          padding: 10,
          justifyContent: "center",
          alignItems: "center",
          width: 100,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff" }}>lessons du livre</Text>
      </TouchableOpacity>
      
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    paddingTop: 20,
    paddingHorizontal: 60,
    alignItems: "center",
    gap: 20,
    justifyContent: "flex-start",
  },
});