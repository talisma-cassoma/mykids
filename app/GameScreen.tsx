import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "@/context/gameContext";
import { EndScreen } from "@/components/Games/EndScreen";
import { Header } from "@/components/Header";
import { StartScreen } from "@/components/Games/StartScreen";

export default function GameScreen() {
  const { stages, currentStageIndex, status } = useGame();
  const stageComponent = stages[currentStageIndex]?.component;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Header />

        {status === "idle" && <StartScreen />}

        {status === "playing" && stageComponent}

        {status === "finished" && <EndScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff"
  },
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom:30
    //overflowY: "scroll"
  },
});