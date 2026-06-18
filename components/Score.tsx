import { Text, View, StyleSheet } from "react-native";
import { useGame } from "@/context/gameContext";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export function Score({ score, total }: { score: number; total: number }) {

  const { mode } = useGame();

  return (
    <ThemedView style={[styles.container]}>
      <ThemedText style={[styles.scoreText]}> Points: {score} / {total}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 160,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});