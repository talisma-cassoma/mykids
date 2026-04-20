import { Text, View, StyleSheet } from "react-native";
import { useGame } from "@/context/gameContext";


export function Score({ score, total }: { score: number; total: number }) {

  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}> Points: {score} / {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff8f8",
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