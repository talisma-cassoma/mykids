import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSquareRoundedCheck, IconRefresh } from "@tabler/icons-react-native";
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
  useSpeech,
} from "@/utils/lessons";
import { useGame } from "@/context/gameContext";
import { Header } from "@/components/Header";

const screenWidth = Dimensions.get("window").width;

export default function MatchingWordsGameScreen() {
  const gameTitle = "glisser et déposer les mots";
  const { setGameScore, nextStage } = useGame();

  const { speak } = useSpeech();

  const [time, setTime] = useState(0);
  const [isTimerRunning] = useState(true);

  const [currentLesson, setCurrentLesson] = useState<GameStage | null>(null);

  /**
   * placements:
   * key = id da palavra FR
   * value = palavra AR colocada no dropZone
   */
  const [placements, setPlacements] = useState<
    Record<string, WordPair | null>
  >({});

  const [rightWords, setRightWords] = useState<WordPair[]>([]);
  const [phaseScore, setPhaseScore] = useState(0);
  const hasSavedScoreRef = useRef(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * gameData.length);
    setCurrentLesson(gameData[randomIndex]);
  }, []);

  const data = currentLesson?.wordPairs ?? [];
  const totalWords = data.length;

  /**
   * TIMER
   */
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  /**
   * INIT GAME
   */
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
    hasSavedScoreRef.current = false;
  }, [currentLesson]);

  /**
   * Remove item do dropZone e devolve para options drag
   */
  function removeFromDropZone(targetId: string) {
    setPlacements((prev) => ({
      ...prev,
      [targetId]: null,
    }));
  }

  /**
   * Drop logic
   *
   * Regras:
   * 1. Uma opção só pode existir em UM lugar
   * 2. Se soltar em dropZone ocupada -> volta para options drag
   * 3. Para trocar, precisa clicar primeiro na opção ocupada
   */
  function handleDrop(targetId: string, dragged: WordPair) {
    setPlacements((prev) => {
      const targetOccupied = prev[targetId];

      // regra 2:
      // se dropZone já estiver ocupada, não substitui
      // item permanece na área de options drag
      if (targetOccupied) {
        return prev;
      }

      // remove essa opção de qualquer outro lugar
      const updated = { ...prev };

      Object.keys(updated).forEach((key) => {
        if (updated[key]?.id === dragged.id) {
          updated[key] = null;
        }
      });

      // coloca no novo destino
      updated[targetId] = dragged;

      return updated;
    });
  }

  /**
   * CHECK ANSWERS
   */
  function checkAnswer() {
    const allPlaced = Object.values(placements).every((v) => v !== null);

    if (!allPlaced) return;

    const correct = Object.entries(placements).filter(
      ([key, value]) => value?.id === key
    );

    setPhaseScore(correct.length);

    if (correct.length === totalWords && !hasSavedScoreRef.current) {
      hasSavedScoreRef.current = true;

      setGameScore((prev) => [
        ...prev,
        {
          score: `${totalWords}/${totalWords}`,
          name: `${gameTitle}: ${currentLesson?.lessonTitle}`,
          duration: TimerConverter(time),
        },
      ]);

      nextStage();
    }
  }

  /**
   * opções disponíveis:
   * mostra apenas as que NÃO estão em nenhum dropZone
   */
  const availableOptions = rightWords.filter(
    (item) =>
      !Object.values(placements).some((value) => value?.id === item.id)
  );

  function restartGame() {
    if (!data.length) return;

    // re-embaralha mantendo a mesma lesson
    const reshuffled = [...data].sort(() => Math.random() - 0.5);

    const resetPlacements: Record<string, WordPair | null> = {};

    data.forEach((item) => {
      resetPlacements[item.id] = null;
    });

    setPlacements(resetPlacements);
    setRightWords(reshuffled);
    setPhaseScore(0);
    setTime(0);
    hasSavedScoreRef.current = false;
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
        <Button onPress={restartGame}>
          <Button.Icon icon={IconRefresh} />
        </Button>

        <Button onPress={checkAnswer} style={{ flexDirection: "row", gap: 6 }}>
          <Button.Title>Vérifier</Button.Title>
          <Button.Icon icon={IconSquareRoundedCheck} />
        </Button>
      </View>

      <DropProvider>
        <View style={styles.wrapper}>
          {/* SCROLL 1 -> OPTIONS DRAG */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsArea}
          >
            {availableOptions.map((item) => (
              <Draggable key={item.id} data={item}>
                <TouchableOpacity
                  onPress={speak.bind(null, item.ar, "ar-MA")}
                  style={styles.optionCard}>
                  <Text style={styles.dragText}>{item.ar}</Text>
                </TouchableOpacity>
              </Draggable>
            ))}
          </ScrollView>

          {/* SCROLL 2 -> MATCHING ROWS */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mainColumn}
          >
            {data.map((item) => (
              <View key={item.id} style={styles.rowCard}>
                <Text style={styles.leftText}>{item.fr}</Text>

                <Droppable
                  onDrop={(dragged: WordPair) =>
                    handleDrop(item.id, dragged)
                  }
                >
                  <View style={styles.dropZone}>
                    {placements[item.id] ? (
                      /**
                       * regra 3:
                       * clicar no item ocupado remove e devolve
                       * para options drag
                       */
                      <Pressable
                        onPress={() => removeFromDropZone(item.id)}
                        style={styles.dragFilled}
                      >
                        <Text style={styles.dragText}>
                          {placements[item.id]?.ar}
                        </Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.placeholder}>
                        laisse ici
                      </Text>
                    )}
                  </View>
                </Droppable>
              </View>
            ))}
          </ScrollView>
        </View>
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

  wrapper: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    maxWidth: 600,
    alignSelf: "center",
  },

  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
    marginBottom: 14,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },

  /**
   * LEFT SCROLL
   */
  optionsArea: {
    width: 190,
    gap: 10,
    paddingBottom: 40,
    zIndex: 999,
    elevation: 999,
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
    elevation: 20,
    zIndex: 9999,
  },

  /**
   * RIGHT SCROLL
   */
  mainColumn: {
    flexGrow: 1,
    gap: 12,
    paddingBottom: 40,
    zIndex: 1,
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
    overflow: "visible",
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
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#94A3B8",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },

  dragFilled: {
    width: "100%",
    minHeight: 42,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#DCE3EA",
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