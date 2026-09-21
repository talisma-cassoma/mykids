import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { IconRefresh, IconVolume } from "@tabler/icons-react-native";
import { DropProvider, Draggable, Droppable } from "react-native-reanimated-dnd";

import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGame } from "@/context/gameContext";
import { TimerConverter, useSpeech } from "@/utils/lessons";

const MIN_NUMBER = 1;
const MAX_NUMBER = 10;
const TOTAL_NUMBERS = MAX_NUMBER - MIN_NUMBER + 1;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function createFullPool(): number[] {
  return shuffle(
    Array.from({ length: TOTAL_NUMBERS }, (_, index) => MIN_NUMBER + index)
  );
}

export default function CountingDragGameScreen() {
  const { nextStage, setGameScore, mode } = useGame();
  const { speak } = useSpeech();

  const [dragPool, setDragPool] = useState<number[]>(() => createFullPool());
  const [placedNumbers, setPlacedNumbers] = useState<number[]>([]);
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("Glisse les nombres dans l'ordre de 1 à 10");
  const [time, setTime] = useState<number>(0);
  const [hasFinished, setHasFinished] = useState<boolean>(false);

  const gameTitle = useMemo(() => "Compte et glisse le bon nombre", []);

  const currentExpectedNumber = MIN_NUMBER + placedNumbers.length;

  const finishGame = useCallback(
    (finalMistakes: number) => {
      if (hasFinished) return;

      setHasFinished(true);
      setGameScore((prev) => [
        ...prev,
        {
          score: `${TOTAL_NUMBERS}/${TOTAL_NUMBERS} · erreurs: ${finalMistakes}`,
          name: gameTitle,
          duration: TimerConverter(Math.max(1, time)),
        },
      ]);
      nextStage();
    },
    [gameTitle, hasFinished, nextStage, setGameScore, time]
  );

  const resetGameSession = useCallback(() => {
    setDragPool(createFullPool());
    setPlacedNumbers([]);
    setMistakeCount(0);
    setTime(0);
    setHasFinished(false);
    setStatusText("Glisse les nombres dans l'ordre de 1 à 10");
    void speak(`${MIN_NUMBER}`, "fr-FR");
  }, [speak]);

  useEffect(() => {
    void speak(`${MIN_NUMBER}`, "fr-FR");
  }, [speak]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const replayNumber = useCallback(() => {
    if (currentExpectedNumber <= MAX_NUMBER) {
      void speak(`${currentExpectedNumber}`, "fr-FR");
    }
  }, [currentExpectedNumber, speak]);

  const handleDrop = useCallback(
    (draggedValue: number) => {
      if (hasFinished || currentExpectedNumber > MAX_NUMBER) return;

      const isCorrect = draggedValue === currentExpectedNumber;

      if (isCorrect) {
        setStatusText("Bravo !");
        void speak("Bravo", "fr-FR");

        const updatedPlaced = [...placedNumbers, draggedValue];
        setPlacedNumbers(updatedPlaced);

        setDragPool((prev) => prev.filter((val) => val !== draggedValue));

        if (updatedPlaced.length >= TOTAL_NUMBERS) {
          finishGame(mistakeCount);
          return;
        }

        const nextNumber = currentExpectedNumber + 1;
        setTimeout(() => {
          setStatusText(`Écoute et glisse le nombre ${nextNumber}`);
          void speak(`${nextNumber}`, "fr-FR");
        }, 800);
      } else {
        setStatusText("Oups ! Ce n'est pas le bon ordre.");
        void speak("Faux", "fr-FR");
        setMistakeCount((prev) => prev + 1);
      }
    },
    [
      currentExpectedNumber,
      finishGame,
      hasFinished,
      mistakeCount,
      placedNumbers,
      speak,
    ]
  );

  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      <Header
        gameDescription={gameTitle}
        timer={{
          isActive: true,
          mode: "increasing",
          time,
        }}
        score={{
          isActive: true,
          current: placedNumbers.length,
          total: TOTAL_NUMBERS,
        }}
      />

      {/* ScrollView Vertical Principal envolvendo todo o jogo */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={true}
      >
        <ThemedView style={styles.controlPanel} darkColor="#0F172A" lightColor="#F8FAFC">
          <ThemedText style={styles.statusText}>{statusText}</ThemedText>

          <Button onPress={replayNumber} style={styles.replayButton}>
            <Button.Icon icon={IconVolume} />
            <Button.Title>Réécouter ({currentExpectedNumber})</Button.Title>
          </Button>
        </ThemedView>

        <DropProvider>
          <ThemedView style={styles.gameBody} darkColor="#0F172A" lightColor="#F8FAFC">
            {/* Grade de Arraste (Drag Zone) com flexWrap */}
            <View style={styles.dragZoneGrid}>
              {dragPool.map((value) => (
                <Draggable key={`draggable-${value}`} data={value}>
                  <TouchableOpacity
                    onPress={() => void speak(`${value}`, "fr-FR")}
                    style={[
                      styles.optionCard,
                      mode === "dark"
                        ? { backgroundColor: "#1E293B" }
                        : { backgroundColor: "#FFFFFF" },
                    ]}
                  >
                    <ThemedText style={styles.numberText}>{value}</ThemedText>
                  </TouchableOpacity>
                </Draggable>
              ))}
            </View>

            {/* Área de Depósito (Drop Zone) */}
            <Droppable onDrop={(dragged: number) => handleDrop(Number(dragged))}>
              <ThemedView
                style={styles.dropZone}
                darkColor="#111827"
                lightColor="#E2E8F0"
              >
                {placedNumbers.length === 0 ? (
                  <ThemedText style={styles.placeholderText}>
                    Dépose le nombre {currentExpectedNumber} ici
                  </ThemedText>
                ) : (
                  <View style={styles.sequenceGrid}>
                    {placedNumbers.map((num, idx) => (
                      <View key={`placed-${num}-${idx}`} style={styles.placedBadge}>
                        <ThemedText style={styles.dropNumber}>{num}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </ThemedView>
            </Droppable>
          </ThemedView>
        </DropProvider>
      </ScrollView>

      <Button onPress={resetGameSession} style={styles.resetButton}>
        <Button.Icon icon={IconRefresh} />
        <Button.Title>Recommencer</Button.Title>
      </Button>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  mainScrollView: {
    flex: 1,
    marginVertical: 10,
  },
  mainScrollContent: {
    paddingBottom: 16,
    gap: 16,
  },
  controlPanel: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    gap: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  replayButton: {
    flexDirection: "row",
    gap: 8,
    marginTop: 0,
  },
  gameBody: {
    borderRadius: 24,
    padding: 16,
    gap: 20,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  dragZoneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  optionCard: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#94A3B8",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  numberText: {
    fontSize: 24,
    fontWeight: "800",
  },
  dropZone: {
    minHeight: 120,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#94A3B8",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  sequenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  placedBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  dropNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  placeholderText: {
    fontSize: 15,
    color: "#94A3B8",
    fontWeight: "600",
    textAlign: "center",
  },
  resetButton: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
    marginBottom: 10,
  },
});