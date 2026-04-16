import { TouchableOpacity, Text, View, StyleSheet } from "react-native"
import { useGame } from "@/context/gameContext";


export function EndScreen() {
  const { scores, restartGame } = useGame();

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>
        Fin du jeu 🎮
      </Text>

      {Object.entries(scores).length === 0 ? (
        <Text>Aucun score enregistré</Text>
      ) : (
        Object.entries(scores).map(([stageId, score]) => (
          <Text key={stageId} style={{ fontSize: 16, width:"auto" }}>
            {stageId}: {score}
          </Text>
        ))
      )}

      <TouchableOpacity
        onPress={restartGame}
        style={styles.button}
      >
        <Text style={{ color: "#fff" }}>Restart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 150,
    paddingHorizontal: 60,
    alignItems: "center",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#a5d",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 120,
    borderRadius: 8,
  },
});