import React, { useMemo, useState } from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import {
  FillinTheBlanks,
  SentenceItem,
  SentenceData,
} from "@/components/FillinTheBlanks";

import { useGame } from "@/context/gameContext";

const vocabulary = [
  "يكون",
  "جميل",
  "كبير",
  "وسيم",
  "أخضر",
  "سريع",
  "صغير",
];

const text = {
  title: "الحيوانات",

  sentences: [
    {
      translation:
        "Mon chat est beau",

      sentence: [
        {
          type: "word",
          value: "قطي",
        },

        {
          type: "drop",
          id: "drop-1",
          answer: "يكون",
        },

        {
          type: "drop",
          id: "drop-2",
          answer: "جميل",
        },
      ],
    },

    {
      translation:
        "Le chien est grand",

      sentence: [
        {
          type: "word",
          value: "الكلب",
        },

        {
          type: "drop",
          id: "drop-1",
          answer: "يكون",
        },

        {
          type: "drop",
          id: "drop-2",
          answer: "كبير",
        },
      ],
    },
  ] as SentenceData[],
};

export default function SentenceGame() {
  const { nextStage, setGameScore } = useGame();
  const gameTitle = "Remplir les Mots Manquants";

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const currentSentence =
    text.sentences[currentIndex];

  const current =
    text.sentences[currentIndex];

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
      text.sentences.length - 1;

    if (isLast) {
      setGameScore((prev) => [
        ...prev,
        {
          score: `100%`,
          name: `${gameTitle}`,
        },
      ]);
      nextStage();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }

  return (
    <View style={styles.container}>
      <FillinTheBlanks
        sentence={current.sentence}
        translation={current.translation}
        draggableWords={draggableWords}
        onValidate={handleValidation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 50,
    backgroundColor: "#fff",

  },
});