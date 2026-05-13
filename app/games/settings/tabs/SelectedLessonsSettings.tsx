
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";

import { useData } from "@/context/DataContext";
import { GameStage } from "@/types";

export function SelectedLessonsSettings() {
  const {
    gameData,
    selectedLessons,
    setSelectedLessons,
  } = useData();

  function toggleLesson(item: GameStage) {
    const alreadySelected = selectedLessons.some(
      lesson => lesson.id === item.id
    );

    if (alreadySelected) {
      setSelectedLessons(
        selectedLessons.filter(
          lesson => lesson.id !== item.id
        )
      );

      return;
    }

    setSelectedLessons([
      ...selectedLessons,
      item,
    ]);
  }

  function renderLessonItem({
    item,
  }: {
    item: GameStage;
  }) {
    const selected = selectedLessons.some(
      lesson => lesson.id === item.id
    );

    return (
      <TouchableOpacity
        onPress={() => toggleLesson(item)}
        style={{
          padding: 16,
          marginBottom: 12,
          borderRadius: 12,
          backgroundColor: "#fff",

          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Infos */}
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {item.lessonTitle}
          </Text>

          <Text
            style={{
              marginTop: 4,
              color: "#666",
            }}
          >
            {item.wordPairs.length} mots
          </Text>
        </View>

        {/* Checkbox */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: "#333",

            justifyContent: "center",
            alignItems: "center",

            backgroundColor: selected
              ? "#333"
              : "transparent",
          }}
        >
          {selected && (
            <Text style={{ color: "#fff" }}>
              ✓
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <FlatList
      data={gameData}
      keyExtractor={(item) => item.id}
      renderItem={renderLessonItem}
      contentContainerStyle={{
        padding: 16,
      }}
    />
  );
}