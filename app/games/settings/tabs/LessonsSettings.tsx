import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView, // 1. Added ScrollView for the main page layout
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetFlatList, // 2. Imported native sheet FlatList
} from "@gorhom/bottom-sheet";
import { IconPlus, IconXboxX } from "@tabler/icons-react-native";
import { AddNewWorldForm } from "@/components/AddNewWordForm";
import { AddNewLessonForm } from "@/components/AddNewLessonForm";
import { useData } from "@/context/DataContext";
import { GameStage, GameText, WordPair } from "@/types";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useGame } from "@/context/gameContext";


export function LessonsSettings() {
  const { mode } = useGame();
  const { gameVocabulary, gameText, deleteWordPair } = useData();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const selectedLesson = gameVocabulary.find((l) => l.id === selectedLessonId);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%", "80%"], []);

  function handleOpenLesson(lesson: GameStage) {
    setSelectedLessonId(lesson.id);
    requestAnimationFrame(() => {
      bottomSheetRef.current?.present();
    });
  }

  function handleCloseSheet() {
    bottomSheetRef.current?.close();
  }

  function renderLessonItem({ item }: { item: GameStage }) {
    return (
      <TouchableOpacity style={[styles.lessonCard,
        mode === "dark"?({backgroundColor: "#333"}):({backgroundColor: "#F7F7F7"})
      ]} 
       onPress={() => handleOpenLesson(item)}>
        <ThemedText style={styles.lessonTitle}>{item.lessonTitle}</ThemedText>
        <ThemedView style={styles.rightSection}>
          <ThemedText style={styles.countText}>{item.wordPairs.length} mots</ThemedText>
          <IconPlus size={20} color="#333" />
        </ThemedView>
      </TouchableOpacity>
    );
  }

  function renderTextItem({ item }: { item: GameText }) {
    return (
      <ThemedView style={styles.lessonCard} darkColor="#333" lightColor="#F7F7F7">
        <ThemedText style={styles.lessonTitle}>{item.title}</ThemedText>
        <ThemedView style={styles.rightSection}>
          <ThemedText style={styles.countText}>Texte</ThemedText>
          <IconPlus size={20} color="#333" />
        </ThemedView>
      </ThemedView>
    );
  }

  function renderWordPairItem({ item }: { item: WordPair }) {
    return (
      <ThemedView darkColor="#232121" lightColor="#F7F7F7" style={styles.wordCard}>
        <ThemedText style={styles.wordText}>{item.fr}</ThemedText>
        <TouchableOpacity onPress={() => deleteWordPair(item.id)}>
          <IconXboxX size={22} color="#D11A2A" />
        </TouchableOpacity>
      </ThemedView>
    );
  }

  useEffect(() => {
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0);
    }, 1000);
  }, []);

  return (
    <ThemedView style={styles.container}>
      {/* Main container wrapped in ScrollView so the entire page can scroll */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* ADD LESSON FORM */}
        <AddNewLessonForm />

        {/* VOCABULARY SECTION */}
        <ThemedText style={styles.sectionTitle}>Vocabulary</ThemedText>
        <FlatList
          data={gameVocabulary}
          keyExtractor={(item) => item.id}
          renderItem={renderLessonItem}
          scrollEnabled={false} // Disable inner scrolling so it plays nice with parent ScrollView
          contentContainerStyle={styles.listContent}
        />

        {/* TEXT SECTION */}
        <ThemedText style={styles.sectionTitle}>Textes</ThemedText>
        <FlatList
          data={gameText}
          keyExtractor={(item) => item.id}
          renderItem={renderTextItem}
          scrollEnabled={false} // Disable inner scrolling
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>

      {/* BOTTOM SHEET */}
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={ mode === "dark"
            ? { backgroundColor: "#333" }: 
            { backgroundColor: "#F7F7F7" }}
        handleIndicatorStyle={
          mode === "dark"
            ? { backgroundColor: "#333" }: 
            { backgroundColor: "#F7F7F7" }}
      >
        {/* Removed fixed-height BottomSheetView to let the FlatList dictate structure */}
        <ThemedView darkColor="#333" lightColor="#F7F7F7" style={styles.sheetHeaderWrapper}>
          <ThemedView  darkColor="#333" lightColor="#F7F7F7" style={styles.sheetHeader}>
            <ThemedText style={styles.sheetTitle}>
              {selectedLesson?.lessonTitle || "Lesson"}
            </ThemedText>
            <Pressable onPress={handleCloseSheet}>
              <IconXboxX size={24} color={Colors[mode].icon} />
            </Pressable>
          </ThemedView>
          <AddNewWorldForm selectedLessonId={selectedLesson?.id || ""} />
        </ThemedView>

        {/* CRITICAL FIX: Use BottomSheetFlatList instead of standard FlatList */}
        <BottomSheetFlatList
          data={selectedLesson?.wordPairs || []}
          keyExtractor={(item) => item.id}
          renderItem={renderWordPairItem}
          contentContainerStyle={[styles.modalListContent]}
        />
      </BottomSheetModal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#FFF",
  },
  scrollContainer: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 8,
  },
  listContent: {
    // Removed flex: 1 which was destroying the height constraints
  },
  lessonCard: {
    //backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lessonTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "transparent"
  },
  countText: {
    fontSize: 14,
    color: "#666",
  },
  wordCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordText: {
    fontSize: 16,
    fontWeight: "500",
  },
  sheetHeaderWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalListContent: {
    padding: 16,
    paddingBottom: 40, // Extra padding ensures last items aren't cut off at the bottom
  },
});
