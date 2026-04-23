import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSquareRoundedCheckFilled } from "@tabler/icons-react-native";
import {
  DropProvider,
  Draggable,
  Droppable,
} from "react-native-reanimated-dnd";

import { Button } from "@/components/Button";
import {
  gameData,
  GameStage,
  WordPair,
  TimerConverter,
} from "@/utils/lessons";
import { useGame } from "@/context/gameContext";
import { Header } from "@/components/Header";

const screenWidth = Dimensions.get("window").width;

export default function MatchingWordsGameScreen() {
  const gameTitle = "drag & match";
  const { setGameScore } = useGame();

  const [time, setTime] = useState(0);
  const [isTimerRunning] = useState(true);

  const [currentLesson, setCurrentLesson] = useState<GameStage | null>(null);
  const [placements, setPlacements] = useState<Record<string, WordPair | null>>({});
  const [rightWords, setRightWords] = useState<WordPair[]>([]);
  const [phaseScore, setPhaseScore] = useState(0);
  const [hasSavedScore, setHasSavedScore] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * gameData.length);
    setCurrentLesson(gameData[randomIndex]);
  }, []);

  const data = currentLesson?.wordPairs ?? [];
  const totalWords = data.length;

  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (!data.length) return;

    const shuffled = [...data].sort(() => Math.random() - 0.5);

    const initial: Record<string, WordPair | null> = {};
    data.forEach((item) => {
      initial[item.id] = null;
    });

    setPlacements(initial);
    setRightWords(shuffled);
    setPhaseScore(0);
    setHasSavedScore(false);
  }, [currentLesson]);

  function checkAnswer() {
    const allPlaced = Object.values(placements).every((v) => v !== null);
    if (!allPlaced) return;

    const correct = Object.entries(placements).filter(
      ([key, value]) => value?.id === key
    );

    setPhaseScore(correct.length);

    if (correct.length === totalWords && !hasSavedScore) {
      setHasSavedScore(true);

      setGameScore((prev) => [
        ...prev,
        {
          score: `${totalWords}/${totalWords}`,
          name: `${gameTitle}: ${currentLesson?.lessonTitle}`,
          duration: TimerConverter(time),
        },
      ]);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        gameDescription={gameTitle}
        timer={{
          isActive: true,
          mode: "increasing",
          time,
        }}
        score={{
          isActive: true,
          current: phaseScore,
          total: totalWords,
        }}
      />

      <View style={styles.buttonWrapper}>
        <Button onPress={checkAnswer}>
          <Button.Icon icon={IconSquareRoundedCheckFilled} />
        </Button>
      </View>

      <DropProvider>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          {/* options drag */}
          <View style={styles.optionsArea}>
            {rightWords.map((item) => {
              const alreadyPlaced = Object.values(placements).some(
                (value) => value?.id === item.id
              );

              if (alreadyPlaced) return null;

              return (
                <Draggable key={item.id} data={item}>
                  <View style={styles.optionCard}>
                    <Text style={styles.dragText}>{item.ar}</Text>
                  </View>
                </Draggable>
              );
            })}
          </View>

          {/* matching rows */}
          <View style={styles.mainColumn}>
            {data.map((item) => (
              <View key={item.id} style={styles.rowCard}>
                <Text style={styles.leftText}>{item.fr}</Text>

                <Droppable
                  onDrop={(dragged: WordPair) => {
                    const alreadyUsed = Object.entries(placements).find(
                      ([key, value]) => value?.id === dragged.id && key !== item.id
                    );

                    // impede que a mesma opção fique em dois campos
                    if (alreadyUsed) {
                      return;
                    }

                    setPlacements((prev) => ({
                      ...prev,
                      [item.id]: dragged,
                    }));
                  }}
                >
                  <View style={styles.dropZone}>
                    {placements[item.id] ? (
                      <Draggable data={placements[item.id]}>
                        <View style={styles.dragFilled}>
                          <Text style={styles.dragText}>
                            {placements[item.id]?.ar}
                          </Text>
                        </View>
                      </Draggable>
                    ) : (
                      <Text style={styles.placeholder}>laisse ici</Text>
                    )}
                  </View>
                </Droppable>
              </View>
            ))}
          </View>
        </ScrollView>
      </DropProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  container: {
    paddingBottom: 40,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 24,
    flexGrow: 1,
  },

  buttonWrapper: {
    alignItems: "flex-end",
    marginTop: 10,
    marginBottom: 14,
  },

  optionsArea: {
    width: 190,
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 10,
    zIndex: 1,
    marginTop: 0,
  },

  optionCard: {
    minWidth: 140,
    maxWidth: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#DCE3EA",
    alignItems: "center",
    elevation: 4,
    zIndex: 999,
  },

  mainColumn: {
    flex: 1,
    maxWidth: 650,
    gap: 12,
    zIndex: 0,
  },

  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },

  leftText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  dropZone: {
    width: screenWidth < 400 ? 140 : 170,
    minHeight: 56,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#94A3B8",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
    overflow: "visible",
  },

  dragFilled: {
    width: "100%",
    minHeight: 42,
    backgroundColor: "#EEF6FF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  placeholder: {
    fontSize: 14,
    color: "#94A3B8",
  },

  dragText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
  },
});
