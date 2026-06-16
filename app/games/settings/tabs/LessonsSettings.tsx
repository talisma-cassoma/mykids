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

export function LessonsSettings() {
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
      <TouchableOpacity style={styles.lessonCard} onPress={() => handleOpenLesson(item)}>
        <Text style={styles.lessonTitle}>{item.lessonTitle}</Text>
        <View style={styles.rightSection}>
          <Text style={styles.countText}>{item.wordPairs.length} mots</Text>
          <IconPlus size={20} color="#333" />
        </View>
      </TouchableOpacity>
    );
  }

  function renderTextItem({ item }: { item: GameText }) {
    return (
      <View style={styles.lessonCard}>
        <Text style={styles.lessonTitle}>{item.title}</Text>
        <View style={styles.rightSection}>
          <Text style={styles.countText}>Texte</Text>
          <IconPlus size={20} color="#333" />
        </View>
      </View>
    );
  }

  function renderWordPairItem({ item }: { item: WordPair }) {
    return (
      <View style={styles.wordCard}>
        <Text style={styles.wordText}>{item.fr}</Text>
        <TouchableOpacity onPress={() => deleteWordPair(item.id)}>
          <IconXboxX size={22} color="#D11A2A" />
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Main container wrapped in ScrollView so the entire page can scroll */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* ADD LESSON FORM */}
        <AddNewLessonForm />

        {/* VOCABULARY SECTION */}
        <Text style={styles.sectionTitle}>Vocabulary</Text>
        <FlatList
          data={gameVocabulary}
          keyExtractor={(item) => item.id}
          renderItem={renderLessonItem}
          scrollEnabled={false} // Disable inner scrolling so it plays nice with parent ScrollView
          contentContainerStyle={styles.listContent}
        />

        {/* TEXT SECTION */}
        <Text style={styles.sectionTitle}>Textes</Text>
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
        backgroundStyle={{ backgroundColor: "#fff" }}
        handleIndicatorStyle={{ backgroundColor: "#999" }}
      >
        {/* Removed fixed-height BottomSheetView to let the FlatList dictate structure */}
        <View style={styles.sheetHeaderWrapper}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {selectedLesson?.lessonTitle || "Lesson"}
            </Text>
            <Pressable onPress={handleCloseSheet}>
              <IconXboxX size={24} color="#222" />
            </Pressable>
          </View>
          <AddNewWorldForm selectedLessonId={selectedLesson?.id || ""} />
        </View>

        {/* CRITICAL FIX: Use BottomSheetFlatList instead of standard FlatList */}
        <BottomSheetFlatList
          data={selectedLesson?.wordPairs || []}
          keyExtractor={(item) => item.id}
          renderItem={renderWordPairItem}
          contentContainerStyle={styles.modalListContent}
        />
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
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
    backgroundColor: "#F7F7F7",
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
  },
  countText: {
    fontSize: 14,
    color: "#666",
  },
  wordCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
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
