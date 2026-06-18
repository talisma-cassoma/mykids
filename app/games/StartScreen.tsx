import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Image,
  ActivityIndicator
} from "react-native";
import { useState } from "react";
import { useGame } from "@/context/gameContext";
import { router } from "expo-router";
import { IconArrowLeft } from "@tabler/icons-react-native";
import { Button } from "@/components/Button";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";


export default function StartScreen() {
  const { selectedGames} = useGame();
  const [loading, setLoading] = useState(true);
  const { mode } = useGame();


  return (
    <ThemedView style={styles.container}>
      <View style={{ height: "auto", width: "100%" }} >
        <View style={{  padding: 40,flexDirection: "row", width: "100%", justifyContent: "space-between" }}>
        <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: "transparent", alignItems: "center", justifyContent: "center"}}
          onPress={() => router.replace("/")}>
          <IconArrowLeft color={Colors[mode].icon}/>
        </TouchableOpacity>
        <ThemeToggleButton />
        </View>
      </View>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#4caf50"
          style={{ position: "absolute", top: 200 }}
        />
      )}

      <Image
        source={require("@/assets/images/startAnimation.gif")}
        style={{
          height: 300,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
        }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      {!loading && (
        <TouchableOpacity
          onPress={() => router.replace(selectedGames[0].href)}
          style={{
            position: "absolute",
            top: 330,
            marginTop: 20,
            backgroundColor: "#4caf50",
            padding: 10,
            justifyContent: "center",
            alignItems: "center",
            width: 100,
            borderRadius: 8
          }}
        >
          <Text style={{ color: "#fff" }}>commencer</Text>
        </TouchableOpacity>
      )}

  </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 60,
    alignItems: "center",
    justifyContent: "flex-start",
  }
});