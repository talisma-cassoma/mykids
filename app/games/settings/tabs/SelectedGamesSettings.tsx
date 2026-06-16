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

function Checkbox({ selected }: { selected: boolean }) {
  return (
    <View style={{
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: "#333",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: selected ? "#333" : "transparent",
    }}>
      {selected && (
        <Text style={{ color: "#fff" }}>✓</Text>
      )}
    </View>
  );
}

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
      <TouchableOpacity
        onPress={() => toggleGame(item)}
        style={styles.card}
      >
        <View>
          <Text style={styles.title}>
            {item.name}
          </Text>
        </View>

        <Checkbox selected={selected} />
      </TouchableOpacity>
    );
  }


  return (
    <View style={{ flex: 1, gap: 30 }}>
      {/* ================= Game ================= */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          Games
        </Text>

        <FlatList
          data={stages}
          keyExtractor={(item) => item.name}
          renderItem={renderGameItem}
          contentContainerStyle={styles.list}
        />
      </View>
    </View>
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
  },

  card: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
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