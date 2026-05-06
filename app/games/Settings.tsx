import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { BottomSheetModal, BottomSheetView, BottomSheetFlatList, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router } from "expo-router"
import { IconPlus, IconXboxX, IconArrowLeft } from "@tabler/icons-react-native";
import { AddNewWorldForm } from "@/components/AddNewWordForm";
import { AddNewLessonForm } from "@/components/AddNewLessonForm";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/Button";


interface WordPair {
  id: string;
  fr: string;
  ar: string;
}

interface GameStage {
  id: string;
  lessonTitle: string;
  wordPairs: WordPair[];
}

export default function SettingsScreen() {
  const {
    gameData,
    deleteWordPair,
  } = useData();

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const selectedLesson = gameData.find(
    (l) => l.id === selectedLessonId
  );

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
      <TouchableOpacity
        style={styles.lessonCard}
        onPress={() => handleOpenLesson(item)}
      >
        <Text style={styles.lessonTitle}>{item.lessonTitle}</Text>

        <View style={styles.rightSection}>
          <Text style={styles.countText}>
            {item.wordPairs.length} mots
          </Text>

          <IconPlus size={20} color="#333" />
        </View>
      </TouchableOpacity>
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
      <Text style={styles.screenTitle}>Settings</Text>
      <View style={{ height: 40, width: "100%" }} >
        <Button style={{ width: 40, height: 40, marginBottom: 40, backgroundColor: "transparent", justifyContent: "flex-start" }} 
          onPress={() => router.replace("/")}>
          <Button.Icon icon={IconArrowLeft} color="#333" />
        </Button>
      </View>

      <AddNewLessonForm />

      <FlatList
        data={gameData}
        keyExtractor={(item) => item.lessonTitle}
        renderItem={renderLessonItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />


      <BottomSheetModal
        ref={bottomSheetRef}
        index={0} // Changed to 0 because present() triggers it
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "#fff" }}
        handleIndicatorStyle={{ backgroundColor: "#999" }}
      >
        {/* Wrap content in BottomSheetView for better height calculation */}
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{selectedLesson?.lessonTitle || "Lesson"}</Text>
            <Pressable onPress={() => bottomSheetRef.current?.dismiss()}>
              <IconXboxX size={24} color="#222" />
            </Pressable>
          </View>

          <AddNewWorldForm selectedLessonId={selectedLesson?.id || ""} />

          <FlatList
            data={selectedLesson?.wordPairs || []}
            keyExtractor={(item) => item.id}
            renderItem={renderWordPairItem}
          // Important: BottomSheet scrolls better if you use the library's FlatList
          // but for now, let's just get it appearing.
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
  },

  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  listContent: {
    paddingBottom: 120,
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

  sheetContent: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    minHeight: 400,
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
});