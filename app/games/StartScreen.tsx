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

export default function StartScreen() {
  const { stages } = useGame();
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>

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
          onPress={() => router.replace(stages[0])}
          style={{
            position: "absolute",
            top: 320,
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
    paddingTop: 150,
    paddingHorizontal: 60,
    alignItems: "center",
    justifyContent: "flex-start",
  }
});