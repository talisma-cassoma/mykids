import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { useData } from "@/context/DataContext";
import { GameStage, GameText } from "@/types";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

function Checkbox({ selected }: { selected: boolean }) {
  return (
    <View style={{
      width: 30,
      height: 30,
      borderRadius: "100%",
      borderWidth: 2,
      borderColor: "#333",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: selected ? "#000" : "transparent",
    }}>
      {selected && (
        <Text style={{ color: "#fff" }}>✓</Text>
      )}
    </View>
  );
}


export function SelectedLessonsSettings() {
  const {
    gameVocabulary,
    gameText,

    selectedVocaluries,
    setSelectedVocaluries,

    selectedTexts,
    setSelectedTexts,
  } = useData();

  // ======================
  // TOGGLE VOCABULARY
  // ======================
  function toggleVocabulary(item: GameStage) {
    const exists = selectedVocaluries.some(
      lesson => lesson.id === item.id
    );

    if (exists) {
      setSelectedVocaluries(
        selectedVocaluries.filter(
          lesson => lesson.id !== item.id
        )
      );
    } else {
      setSelectedVocaluries([...selectedVocaluries, item]);
    }
  }

  // ======================
  // TOGGLE TEXT
  // ======================
  function toggleText(item: GameText) {
    const exists = selectedTexts.some(
      lesson => lesson.id === item.id
    );

    if (exists) {
      setSelectedTexts(
        selectedTexts.filter(
          lesson => lesson.id !== item.id
        )
      );
    } else {
      setSelectedTexts([...selectedTexts, item]);
    }
  }

  // ======================
  // VOCAB ITEM
  // ======================
  function renderVocabularyItem({ item }: { item: GameStage }) {
    const selected = selectedVocaluries.some(
      lesson => lesson.id === item.id
    );

    return (
      <ThemedView darkColor="#333" lightColor="#F7F7F7" style={{ borderRadius: 14 }}>
      <TouchableOpacity
        onPress={() => toggleVocabulary(item)}
        style={styles.card}
      >
        <View>
          <ThemedText style={styles.title}>
            {item.lessonTitle}
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            {item.wordPairs.length} mots
          </ThemedText>
        </View>

        <Checkbox selected={selected} />
      </TouchableOpacity>
      </ThemedView>
    );
  }

  // ======================
  // TEXT ITEM
  // ======================
  function renderTextItem({ item }: { item: GameText }) {
    const selected = selectedTexts.some(
      lesson => lesson.id === item.id
    );

    return (
      <ThemedView darkColor="#333" lightColor="#F7F7F7" style={{ borderRadius: 14 }}>
        <TouchableOpacity
          onPress={() => toggleText(item)}
          style={styles.card}
        >
          <ThemedView darkColor="transparent" lightColor="transparent">
            <ThemedText style={styles.title}>
              {item.title}
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              Texte
            </ThemedText>
          </ThemedView>

          <Checkbox selected={selected} />
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, gap: 30 }}>
      {/* ================= VOCABULARY ================= */}
      <View style={styles.listSection}>
        <ThemedText style={styles.sectionTitle}>
          Vocabulary
        </ThemedText>

        <FlatList
          data={gameVocabulary}
          keyExtractor={(item) => item.id}
          renderItem={renderVocabularyItem}
          contentContainerStyle={styles.list}
        />
      </View>

      {/* ================= TEXT ================= */}
      <ThemedView style={styles.listSection}>
        <ThemedText style={styles.sectionTitle}>
          Textes
        </ThemedText>

        <FlatList
          data={gameText}
          keyExtractor={(item) => item.id}
          renderItem={renderTextItem}
          contentContainerStyle={styles.list}
        />
      </ThemedView>
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
  listSection: { flex: 1, minHeight: 100 },
  list: {
    padding: 16,
    minHeight: 240,
    maxHeight: "auto",
    width: "auto",
    gap: 10,
  },

  card: {
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
    //color: "#666",
  },
});