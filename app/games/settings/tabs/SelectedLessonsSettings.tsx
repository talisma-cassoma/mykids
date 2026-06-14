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
      <TouchableOpacity
        onPress={() => toggleVocabulary(item)}
        style={styles.card}
      >
        <View>
          <Text style={styles.title}>
            {item.lessonTitle}
          </Text>

          <Text style={styles.subtitle}>
            {item.wordPairs.length} mots
          </Text>
        </View>

        <Checkbox selected={selected} />
      </TouchableOpacity>
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
      <TouchableOpacity
        onPress={() => toggleText(item)}
        style={styles.card}
      >
        <View>
          <Text style={styles.title}>
            {item.title}
          </Text>

          <Text style={styles.subtitle}>
            Texte
          </Text>
        </View>

        <Checkbox selected={selected} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, gap: 30 }}>
      {/* ================= VOCABULARY ================= */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          Vocabulary
        </Text>

        <FlatList
          data={gameVocabulary}
          keyExtractor={(item) => item.id}
          renderItem={renderVocabularyItem}
          contentContainerStyle={styles.list}
        />
      </View>

      {/* ================= TEXT ================= */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          Textes
        </Text>

        <FlatList
          data={gameText}
          keyExtractor={(item) => item.id}
          renderItem={renderTextItem}
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