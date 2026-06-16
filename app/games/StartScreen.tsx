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

export default function StartScreen() {
  const { selectedGames} = useGame();
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      <View style={{ height: "auto", width: "100%" }} >
        <Button style={{ width: 40, height: 40, padding: 40, backgroundColor: "transparent", justifyContent: "flex-start" }}
          onPress={() => router.replace("/")}>
          <Button.Icon icon={IconArrowLeft} color="#333" />
        </Button>
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
            top: 290,
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

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 60,
    alignItems: "center",
    justifyContent: "flex-start",
  }
});