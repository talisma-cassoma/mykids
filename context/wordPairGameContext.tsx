import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePlayer } from "@/context/playerContext";
import * as Speech from 'expo-speech';

export interface WordPair {
  id: string;
  fr: string;
  ar: string;
}

export interface GameStage {
  phase: string;
  wordPairs: WordPair[];
}

export interface StageScore {
  phaseIndex: number;
  phaseName: string;
  score: number;
  total: number;
  gameType: "match" | "write";
}

interface WordPairGameContextType {

  setCurrentPhaseIndex: React.Dispatch<React.SetStateAction<number>>;
  currentPhaseIndex: number;
  timeLeft: number;
  showCelebrate: boolean;
  phaseScore: number;
  totalWords: number;
  currentPhase: GameStage;
  incrementScore: () => void;
  matched: string[];
  setMatched: React.Dispatch<React.SetStateAction<string[]>>;
  speak: (text: string, lang: string) => void;
  stageScores: StageScore[];
  setStageScores: React.Dispatch<React.SetStateAction<StageScore[]>>;
  gameType: "match" | "write";
  setGameType: React.Dispatch<React.SetStateAction<"match" | "write">>;
}

const INITIAL_TIME = 10;

// Example JSON data (can be moved to a separate file)
export const gameData: GameStage[] = [
  {
    phase: "salutations",
    wordPairs: [
      { id: "1", fr: "Bonjour", ar: "مرحبا" },
      { id: "2", fr: "Merci", ar: "شكرا" },
      { id: "3", fr: "Chat", ar: "قط" },
      { id: "4", fr: "Maison", ar: "منزل" },
    ],
  },
  {
    phase: "verbe ecrire au présent",
    wordPairs: [
      { id: "5", fr: "j'écris", ar: "أكتب" },
      { id: "6", fr: "tu écris (m)", ar: "تكتب" },
      { id: "7", fr: "tu écris (f)", ar: "تكتبين" },
      { id: "8", fr: "il écrit", ar: "يكتب" },
      { id: "9", fr: "elle écrit", ar: "تكتب" },
      { id: "10", fr: "nous écrivons", ar: "نكتب" },
      { id: "11", fr: "vous écrivez (m)", ar: "تكتبون" },
      { id: "12", fr: "vous écrivez (f)", ar: "تكتبن" },
      { id: "13", fr: "ils écrivent", ar: "يكتبون" },
      { id: "14", fr: "elles écrivent", ar: "يكتبن" },
    ],
  },
  {
    phase: "verbe ecrire au passé composé",
    wordPairs: [
      { id: "15", fr: "j'ai écrit", ar: "كتبت" },
      { id: "16", fr: "tu as écrit (m)", ar: "كتبت" },
      { id: "17", fr: "tu as écrit (f)", ar: "كتبتين" },
      { id: "18", fr: "il a écrit", ar: "كتب" },
      { id: "19", fr: "elle écrit", ar: "تكتب" },
      { id: "20", fr: "nous écrivons", ar: "نكتب" },
      { id: "21", fr: "vous écrivez (m)", ar: "تكتبون" },
      { id: "22", fr: "vous écrivez (f)", ar: "تكتبن" },
      { id: "23", fr: "ils écrivent", ar: "يكتبون" },
      { id: "24", fr: "elles écrivent", ar: "يكتبن" },
    ],
  },
];

const WordPairGameContext = createContext<WordPairGameContextType | null>(null);

export const useWordPairGame = () => {
  const context = useContext(WordPairGameContext);
  if (!context) {
    throw new Error("useWordPairGame must be used inside provider");
  }
  return context;
};

export const WordPairGameProvider = ({ children }: { children: React.ReactNode }) => {
  const { isPlay } = usePlayer();

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [matched, setMatched] = useState<string[]>([]);
  const [phaseScore, setPhaseScore] = useState(0);
  const [gameType, setGameType] = useState<"match" | "write">("match");

  const currentPhase = gameData[currentPhaseIndex];
  const totalWords = currentPhase.wordPairs.length;

  // ✅ Derivado (sem estado extra)
  const isPhaseCompleted = matched.length === totalWords;
  const [stageScores, setStageScores] = useState<StageScore[]>([]);

  const speak = useCallback((text: string, lang: string) => {
    Speech.stop();
    Speech.speak(text, { language: lang, pitch: 1, rate: 0.9 });
  }, []);

  // 🔄 Reset de fase (centralizado)
  const resetPhase = () => {
    setMatched([]);
    setPhaseScore(0);
    setTimeLeft(INITIAL_TIME);
  };

  // 🎯 Próxima fase
  const goToNextPhase = () => {
    setCurrentPhaseIndex((prev) => prev + 1);
  };

  // 🎉 Fim do jogo
  const handleGameEnd = () => {
    setShowCelebrate(true);
    setTimeout(() => {
      setShowCelebrate(false);
      resetGame();
    }, 2000);
  };

  // 🔄 Reset completo
  const resetGame = () => {
    setCurrentPhaseIndex(0);
    resetPhase();
  };

  // 🚀 Controle de progressão
  useEffect(() => {
    if (!isPhaseCompleted) return;
    // ✅ Save current phase score
    setStageScores(prev => [
      ...prev,
      {
        phaseIndex: currentPhaseIndex,
        phaseName: currentPhase.phase,
        score: phaseScore,
        total: totalWords,
        gameType: gameType ?? "match", //
      }
    ]);

    if (currentPhaseIndex < gameData.length - 1) {
      goToNextPhase();
    } else {
      handleGameEnd();
    }
  }, [isPhaseCompleted]);

  // 🔄 Reset ao mudar fase
  useEffect(() => {
    resetPhase();
  }, [currentPhaseIndex]);

  // ⏱️ Timer
  useEffect(() => {
    if (!isPlay) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          if (currentPhaseIndex < gameData.length - 1) {
            goToNextPhase();
          } else {
            handleGameEnd();
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlay, currentPhaseIndex]);

  // ⭐ Pontuação
  const incrementScore = () => {
    setPhaseScore((prev) => prev + 1);
  };

  return (
    <WordPairGameContext.Provider
      value={{
        currentPhase,
        currentPhaseIndex,
        setCurrentPhaseIndex,
        timeLeft,
        showCelebrate,
        phaseScore,
        totalWords,
        incrementScore,
        matched,
        setMatched,
        speak,
        stageScores,
        setStageScores,
        gameType,
        setGameType
      }}
    >
      {children}
    </WordPairGameContext.Provider>
  );
};

export const useMatchingGame = () => {
  const { currentPhase, matched, setMatched, incrementScore } = useWordPairGame();

  const [leftWords, setLeftWords] = useState<WordPair[]>([]);
  const [rightWords, setRightWords] = useState<WordPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<WordPair | null>(null);
  const [selectedRight, setSelectedRight] = useState<WordPair | null>(null);

  useEffect(() => {
    const shuffled = [...currentPhase.wordPairs].sort(() => Math.random() - 0.5);
    setLeftWords(currentPhase.wordPairs);
    setRightWords(shuffled);
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [currentPhase]);

  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;

    if (selectedLeft.id === selectedRight.id) {
      setMatched(prev => [...prev, selectedLeft.id]);
      incrementScore();
    }

    setSelectedLeft(null);
    setSelectedRight(null);
  }, [selectedLeft, selectedRight]);

  return {
    leftWords,
    rightWords,
    selectedLeft,
    selectedRight,
    setSelectedLeft,
    setSelectedRight,
    matched
  };
};

export const useWriteGame = () => {
  const { currentPhase, matched, setMatched, incrementScore } = useWordPairGame();

  const [currentWord, setCurrentWord] = useState<WordPair | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  useEffect(() => {
    const first = currentPhase.wordPairs[0];
    setCurrentWord(first);
  }, [currentPhase]);

  const checkAnswer = () => {
    if (!currentWord) return;

    if (userInput.trim() === currentWord.ar) {
      setMatched(prev => {
        const updated = [...prev, currentWord.id];

        const remaining = currentPhase.wordPairs.filter(
          w => !updated.includes(w.id)
        );

        if (remaining.length > 0) {
          setCurrentWord(remaining[Math.floor(Math.random() * remaining.length)]);
        }

        return updated;
      });
      incrementScore();

      const remaining = currentPhase.wordPairs.filter(
        w => !matched.includes(w.id)
      );

      if (remaining.length > 0) {
        setCurrentWord(remaining[Math.floor(Math.random() * remaining.length)]);
      }

      setUserInput("");
    } else {
      setIsMatch(false);
    }
  };

  return {
    currentWord,
    userInput,
    setUserInput,
    checkAnswer,
    isMatch
  };
};