import React, { useEffect, useMemo, useState } from "react";

import {
  View,
  StyleSheet,
} from "react-native";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import {FillinTheBlanks} from "@/components/FillinTheBlanks";
import { SentenceItem, SentenceData, GameText, GameStage } from "@/types"
import { Header } from "@/components/Header";
import {
  TimerConverter,
} from "@/utils/lessons";
import { useGame } from "@/context/gameContext";
import { Colors } from "@/constants/Colors";
import { useData } from "@/context/DataContext";
import { splitIntoSentences, normalizeArabic } from "@/utils/lessons";

const gameVocabulary: GameStage[] = [
  {
    "id": "v1",
    "lessonTitle": "Mots cibles à trou",
    "wordPairs": [
      // === أسماء الإشارة (Pronoms Démonstratifs) ===
      { "id": "1", "fr": "Ce / Ceci (m. singulier)", "ar": "هَذَا" },
      { "id": "2", "fr": "Cette / Ceci (f. singulier)", "ar": "هَذِهِ" },
      { "id": "3", "fr": "Ces deux (m. duel)", "ar": "هَذَانِ" },
      { "id": "4", "fr": "Ces deux (f. duel)", "ar": "هَاتَانِ" },
      { "id": "5", "fr": "Ces (Pluriel - humains)", "ar": "هَؤُلَاءِ" },

      // === الأسماء الموصولة (Pronoms Relatifs) ===
      { "id": "6", "fr": "Qui / Que (m. singulier)", "ar": "الَّذِي" },
      { "id": "7", "fr": "Qui / Que (f. singulier)", "ar": "الَّتِي" },
      { "id": "8", "fr": "Qui / Que (m. duel)", "ar": "اللَّذَانِ" },
      { "id": "9", "fr": "Qui / Que (f. duel)", "ar": "اللَّتَانِ" },
      { "id": "10", "fr": "Qui (m. pluriel)", "ar": "الَّذِينَ" },
      { "id": "11", "fr": "Qui (f. pluriel)", "ar": "اللَّوَاتِي" },

      // === صيغ التفضيل / المقارنة (Les Comparatifs) ===
      { "id": "12", "fr": "Plus vaste / Plus large", "ar": "أَوْسَعُ" },
      { "id": "13", "fr": "Plus fort", "ar": "أَقْوَى" },
      { "id": "14", "fr": "Plus grand", "ar": "أَكْبَرُ" },
      { "id": "15", "fr": "Plus rapide", "ar": "أَسْرَعُ" },

      // === مفردات أخرى وظروف المكان ===
      { "id": "16", "fr": "Devant", "ar": "أَمَامَ" },
      { "id": "17", "fr": "Derrière", "ar": "خَلْفَ" },
      { "id": "18", "fr": "Sur", "ar": "فَوْقَ" },
      { "id": "19", "fr": "Sous", "ar": "تَحْتَ" },
      { "id": "20", "fr": "Dans / À l'intérieur", "ar": "دَاخِلَ" }
    ]
  }
];

const selectedTexts: GameText[] = [
  {
    "id": "txt-1",
    "title": "Exercices de grammaire, de comparaison et d'espace",
    "content": {
      "arabic_text": "هَذَا أَسَدٌ قَوِيٌّ. هَذِهِ غَزَالَةٌ سَرِيعَةٌ. هَذَانِ الْوَلَدَانِ ذَكِيَّانِ. هَاتَانِ الْبِنْتَانِ نَظِيفَتَانِ. هَؤُلَاءِ الرِّجَالُ أَقْوِيَاءُ. هَذَا هُوَ الْكِتَابُ الَّذِي قَرَأْتُهُ. نَجَحَتِ التِّلْمِيذَةُ الَّتِي تَجْتَهِدُ. الْفَلَّاحُونَ الَّذِينَ يَزْرَعُونَ الأَرْضَ نَشِيطُونَ. النِّسَاءُ اللَّوَاتِي يَعْمَلْنَ مُجْتَهِدَاتٌ. الْبَحْرُ أَوْسَعُ مِنَ الْبُحَيْرَةِ. الأَسَدُ أَقْوَى مِنَ الزَّرَافَةِ. الْقِطَارُ أَسْرَعُ مِنَ الْحَافِلَةِ. الْعَصْفُورُ فَوْقَ الشَّجَرَةِ. الْكَلْبُ تَحْتَ السَّرِيرِ.",
      "french_translation": "Ce lion est puissant. Cette gazelle est rapide. Ces deux garçons sont intelligents. Ces deux filles sont propres. Ces hommes sont forts. C'est le livre que j'ai lu. L'élève (f) qui travaille dur a réussi. Les paysans qui cultivent la terre sont actifs. Les femmes qui travaillent sont assidues. La mer est plus vaste que le lac. Le lion est plus fort que la girafe. Le train est plus rapide que le bus. L'oiseau est sur l'arbre. Le chien dort sous le lit."
    }
  }
];

export default function CompleteTheSentenceGame() {
  const [time, setTime] = useState(0);
  const [isTimerRunning] = useState(true);
  const { nextStage, setGameScore, mode } = useGame();
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
      <ThemedSafeAreaView>
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
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 50,
  },
});