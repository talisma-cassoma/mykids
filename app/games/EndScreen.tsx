import React, { useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useGame } from "@/context/gameContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";

export default function EndScreen() {
  const { resetGame, gameScore } = useGame();
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.title}>C'est fini 🎮</Text>

        {gameScore.length === 0 ? (
          <Text style={styles.empty}>Nenhum score ainda</Text>
        ) : (
          gameScore.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.text}>Score: {item.score}</Text>
              <Text style={styles.text}>Duração: {item.duration}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={() => {
            setIsButtonLoading(true);
            resetGame();
          }}
          isLoading={isButtonLoading}
        >
          <Button.Title>avancer</Button.Title>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },
  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
});