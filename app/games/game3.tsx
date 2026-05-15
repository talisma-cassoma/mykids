import React, { useEffect, useMemo, useState } from "react";

import {
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FillinTheBlanks,
  SentenceItem,
  SentenceData,
} from "@/components/FillinTheBlanks";
import { Header } from "@/components/Header";
import {
  TimerConverter,
} from "@/utils/lessons";
import { useGame } from "@/context/gameContext";
import { useData } from "@/context/DataContext";
import { splitIntoSentences } from "@/utils/lessons";


export default function SentenceGame() {
  const [time, setTime] = useState(0);
  const [isTimerRunning] = useState(true);
  const { nextStage, setGameScore } = useGame();
  const gameTitle = "Remplir les Mots Manquants";
  const { selectedTexts, gameVocabulary } = useData();
  const vocabulary = useMemo(() => {
  const words = gameVocabulary.flatMap(stage =>
    stage.wordPairs.flatMap(pair => [pair.ar, pair.fr])
  );

  // remover duplicados
  return Array.from(new Set(words));
}, [gameVocabulary]);
  const sentences: SentenceData[] = useMemo(() => {
  const all: SentenceData[] = [];

  selectedTexts.forEach((item) => {
    const pairs = splitIntoSentences(
      item.content.arabic_text,
      item.content.french_translation
    );

    pairs.forEach((p) => {
      const words = p.arabic.split(" ");

      const sentence: SentenceData = {
        translation: p.french,
        sentence: words.map((w, i) => {
          // estratégia simples: transformar algumas palavras em "drop"
          const isDrop = i % 2 === 1; // alterna palavras

          return isDrop
            ? {
                type: "drop",
                id: `drop-${i}`,
                answer: w,
              }
            : {
                type: "word",
                value: w,
              };
        }),
      };

      all.push(sentence);
    });
  });

  // limitar a 20 frases
  return all.slice(0, 20);
}, [selectedTexts]);


  //console.log("selectedTexts", selectedTexts);

  const [currentIndex, setCurrentIndex] =
    useState(0);

 const current = sentences[currentIndex];

  const draggableWords = useMemo(() => {
    // palavras corretas da frase
    const correctWords = current.sentence
      .filter(
        (item) => item.type === "drop"
      )
      .map((item) => item.answer);

    // palavras falsas aleatórias
    const randomWords = vocabulary
      .filter(
        (word) =>
          !correctWords.includes(word)
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    // mistura tudo
    return [
      ...correctWords,
      ...randomWords,
    ].sort(() => Math.random() - 0.5);

  }, [current]);

  function handleValidation(
    correct: boolean
  ) {
    if (!correct) return;

    const isLast =
      currentIndex ===
      sentences.length - 1;

    if (isLast) {
      setGameScore((prev) => [
        ...prev,
        {
          score: `100%`,
          name: `${gameTitle}`,
          duration: TimerConverter(time),
        },
      ]);
      nextStage();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        gameDescription={gameTitle}
        timer={{
          isActive: true,
          mode: "increasing",
          time,
        }}
      />

      <View style={styles.container}>
        <FillinTheBlanks
          sentence={current.sentence}
          translation={current.translation}
          draggableWords={draggableWords}
          onValidate={handleValidation}
        />
      </View>
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
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 50,
    backgroundColor: "#fff",

  },
});