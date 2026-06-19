import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { useData } from "@/context/DataContext";
import {  GameText } from "@/types";
import { useGame, GameStage, stages} from "@/context/gameContext";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { Checkbox } from "@/components/Checkbox";


export function SelectedGamesSettings() {
;
  const { selectedGames, setSelectedGames } = useGame();

  // ======================
  // TOGGLE Game
  // ======================
  function toggleGame(item: GameStage) {
    const exists = selectedGames.some(
      game => game.name === item.name
    );

    if (exists) {
      setSelectedGames(
        selectedGames.filter(
          game => game.name !== item.name
        )
      );
    } else {
      setSelectedGames([...selectedGames, item]);
    }
  }

  function renderGameItem({ item }: { item: GameStage }) {
    const selected = selectedGames.some(
    game => game.name === item.name
    );

    return (
      <ThemedView darkColor="#333" lightColor="#F7F7F7" style={{borderRadius: 14}}>
      <TouchableOpacity
        onPress={() => toggleGame(item)}
        style={[styles.card,
        ]}
      >
        <View>
          <ThemedText style={styles.title}>
            {item.name}
          </ThemedText>
        </View>

        <Checkbox selected={selected} />
      </TouchableOpacity>
      </ThemedView>
    );
  }


  return (
    <ThemedView style={{ flex: 1, gap: 30 }}>
      {/* ================= Game ================= */}
      <View style={styles.listSection}>
        <ThemedText style={styles.sectionTitle}>
          Games
        </ThemedText>

        <FlatList
          data={stages}
          keyExtractor={(item) => item.name}
          renderItem={renderGameItem}
          contentContainerStyle={styles.list}
        />
      </View>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    marginTop: 20,
  },
  listSection:{ flex: 1, minHeight: 100 },
  list: {
    padding: 16,
    minHeight: 240,
    maxHeight: "auto",
    width: "auto",
    gap: 10
  },

  card: {
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  subtitle: {
    marginTop: 4,
    color: "#666",
  },
});