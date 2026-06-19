import React, { useState } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { useGame } from "@/context/gameContext";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { Button } from "@/components/Button";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function EndScreen() {
  const { resetGame, gameScore, mode } = useGame();
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  return (
   <ThemedSafeAreaView>
      <ScrollView style={{ flex: 1 }}>
        <ThemedText style={styles.title}>C'est fini 🎮</ThemedText>

        {gameScore.length === 0 ? (
          <ThemedText style={styles.empty}>Nenhum score ainda</ThemedText>
        ) : (
          gameScore.map((item, index) => (
            <ThemedView key={index} darkColor="#333" lightColor="#f5f5f5" style={styles.card}>
              <ThemedText style={styles.name}>{item.name}</ThemedText>
              <ThemedText style={styles.text}>Score: {item.score}</ThemedText>
              <ThemedText style={styles.text}>Duração: {item.duration}</ThemedText>
            </ThemedView>
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
    </ThemedSafeAreaView>
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
    //backgroundColor: "#f5f5f5",
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