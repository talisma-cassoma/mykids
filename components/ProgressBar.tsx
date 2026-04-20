import { Image, useColorScheme,Text, View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { ThemedText } from "./ThemedText";
import { useGame } from "@/context/gameContext";

export function ProgressBar() {
  const { currentStage, stages } = useGame();

  const totalStages = stages.length;

  // evita divisão por zero
  const progress = totalStages > 0
    ? (currentStage) / totalStages
    : 0;

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: `${percentage}%` }]} />
      <Text style={styles.progressText}>{percentage}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 20,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  progress: {
    height: "100%",
    backgroundColor: "#a5d6a7",
  },
  progressText: {
    position: "absolute",
    alignSelf: "center",
    color: "#fff",
    fontWeight: "bold",
  },
});