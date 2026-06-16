import React, { useEffect, useMemo, useState } from "react";

import {
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {FillinTheBlanks} from "@/components/FillinTheBlanks";
import { SentenceItem, SentenceData, GameText, GameStage } from "@/types"
import { Header } from "@/components/Header";
import {
  TimerConverter,
} from "@/utils/lessons";
import { useGame } from "@/context/gameContext";
import { useData } from "@/context/DataContext";
import { splitIntoSentences, normalizeArabic } from "@/utils/lessons";


const gameVocabulary : GameStage[] = [
{
  "id": "v1",
  "lessonTitle": "Mots cibles à trou",
  "wordPairs": [
    { "id": "1", "fr": "Ce", "ar": "هذا" },
    { "id": "2", "fr": "Cette", "ar": "هذه" },
    { "id": "3", "fr": "Qui / Que (m)", "ar": "الذي" },
    { "id": "4", "fr": "Qui / Que (f)", "ar": "التي" },
    { "id": "5", "fr": "Devant", "ar": "أمام" },
    { "id": "6", "fr": "Derrière", "ar": "خلف" },
    { "id": "7", "fr": "Sur", "ar": "فوق" },
    { "id": "8", "fr": "Sous", "ar": "تحت" },
    { "id": "9", "fr": "Dans", "ar": "داخل" }
  ]
}
]
 const selectedTexts: GameText[] = [
{
  "id": "txt-1",
  "title": "Exercices de grammaire et d'espace",
  "content": {
    "arabic_text": "هذا أسد قوي. هذه غزالة سريعة. يقع المعلم أمام التلاميذ. ينام الكلب تحت السرير. هذا هو الكتاب الذي قرأته. نجحت البنت التي درست. الأسد داخل القفص. العصفور فوق الشجرة.",
    "french_translation": "Ce lion est puissant. Cette gazelle est rapide. L'enseignant se tient devant les élèves. Le chien dort sous le lit. C'est le livre que j'ai lu. La fille qui a étudié a réussi. Le lion est à l'intérieur de la cage. L'oiseau est sur l'arbre."
  }
}
]
export default function CompleteTheSentenceGame() {
  const [time, setTime] = useState(0);
  const [isTimerRunning] = useState(true);
  const { nextStage, setGameScore } = useGame();
  const gameTitle = "Remplir les Mots Manquants";

  //console.log("selectedTexts", selectedTexts);

  const vocabularySet = useMemo(() => {
    return new Set(
      gameVocabulary.flatMap(stage =>
        stage.wordPairs.map(pair =>
          normalizeArabic(pair.ar)
        )
      )
    );
  }, [gameVocabulary]);

  //console.log("Vocabulary Set", vocabularySet);

 const sentences: SentenceData[] = useMemo(() => {
  const all: SentenceData[] = [];
  
  selectedTexts.forEach((item) => {
    const pairs = splitIntoSentences(
      item.content.arabic_text,
      item.content.french_translation
    );
    
    pairs.forEach((p, sentenceIndex) => {
      const words = p.arabic.split(" ");
      
      const sentence: SentenceData = {
        translation: p.french,
        sentence: words.map((w, i) => {
          const normalized = normalizeArabic(w);
          const isVocabularyWord = vocabularySet.has(normalized);
          
          // 1. Encontra o par correspondente no vocabulário para pegar o FR
          const vocabularyMatch = gameVocabulary
            .flatMap(stage => stage.wordPairs)
            .find(pair => normalizeArabic(pair.ar) === normalized);

          return isVocabularyWord 
            ? { 
                type: "drop", 
                id: `drop-${sentenceIndex}-${i}`, 
                arabic: normalized,
                french: vocabularyMatch ? vocabularyMatch.fr : "" // 2. Injeta o FR aqui
              } 
            : { 
                type: "word", 
                value: normalized, 
              };
        }),
      };
      all.push(sentence);
    });
  });
  
  return all.slice(0, 20);
}, [selectedTexts, vocabularySet]);



  //console.log("selectedTexts", selectedTexts);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const current = sentences[currentIndex];

const vocabularyIndex = useMemo(() => {
  const normalizedWords =
    gameVocabulary.flatMap(stage =>
      stage.wordPairs.map(pair =>
        normalizeArabic(pair.ar)
      )
    );

  return [...new Set(normalizedWords)];
}, [gameVocabulary]);

 const draggableWords = useMemo(() => {
  if (!current) return [];

  // palavras corretas
  const correctWords = current.sentence
    .filter(
      (item): item is SentenceItem & {
        type: "drop";
      } => item.type === "drop"
    )
    .map((item) => item.arabic);

  // mínimo desejado
  const MIN_WORDS = 2;

  // quantidade de falsas necessárias
  const fakeNeeded = Math.max(
    0,
    MIN_WORDS - correctWords.length
  );

  // palavras falsas
  const fakeWords = vocabularyIndex
    .filter(
      (word) =>
        !correctWords.includes(word)
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, fakeNeeded);

  // mistura tudo
  return [
    ...correctWords,
    ...fakeWords,
  ].sort(() => Math.random() - 0.5);

}, [current, vocabularyIndex]);

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
        score={{
          isActive: true,
          current: currentIndex,
          total: sentences.length,
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