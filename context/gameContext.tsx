import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as Speech from "expo-speech";
import { usePlayer } from "@/context/playerContext";

// ================== TYPES ==================

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
  currentPhaseIndex: number;
  setCurrentPhaseIndex: React.Dispatch<React.SetStateAction<number>>;

  currentPhase: GameStage;
  totalWords: number;

  matched: string[];
  setMatched: React.Dispatch<React.SetStateAction<string[]>>;

  phaseScore: number;
  incrementScore: () => void;

  timeLeft: number;
  showCelebrate: boolean;

  stageScores: StageScore[];
  saveStageScore: (score?: number) => void;

  gameType: "match" | "write";

  speak: (text: string, lang: string) => void;
}

// ================== DATA ==================

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

// ================== CONTEXT ==================

const WordPairGameContext = createContext<WordPairGameContextType | null>(null);

export const useWordPairGame = () => {
  const context = useContext(WordPairGameContext);
  if (!context) {
    throw new Error("useWordPairGame must be used inside provider");
  }
  return context;
};

// ================== PROVIDER ==================

export const WordPairGameProvider = ({ children }: { children: React.ReactNode }) => {
  const { isPlay } = usePlayer();

  // ---------- STATE GLOBAL ----------
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [matched, setMatched] = useState<string[]>([]);
  const [phaseScore, setPhaseScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [stageScores, setStageScores] = useState<StageScore[]>([]);
  const [gameType, setGameType] = useState<"match" | "write">("match");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const saveStageScore = (score?: number) => {

    if (gameType === "write") {
      setStageScores((prev) => [
        ...prev,
        {
          phaseIndex: currentPhaseIndex,
          phaseName: currentPhase.phase,
          score: score ?? 0,
          total: 1,
          gameType,
        },
      ]);

      if (currentPhaseIndex < gameData.length - 1) {
        goToNextPhase();
      } else {
        handleGameEnd();
      }
    }

    if (gameType === "match") {
      setStageScores((prev) => [
        ...prev,
        {
          phaseIndex: currentPhaseIndex,
          phaseName: currentPhase.phase,
          score: phaseScore,
          total: totalWords,
          gameType,
        },
      ]);
    }
  };

  // ---------- DERIVADOS ----------
  const currentPhase = gameData[currentPhaseIndex];
  const totalWords = currentPhase.wordPairs.length;
  const isPhaseCompleted = (() => {
    if (gameType === "match") {
      console.log("match matched:", matched)
      return matched.length === totalWords;
    }

    return false;
  })();

  // ---------- HELPERS ----------
  const resetPhase = () => {
    setMatched([]);
    setPhaseScore(0);
    setTimeLeft(INITIAL_TIME);
    setIsTransitioning(false); // 🔥 importante
  };

  const resetGame = () => {
    console.log("resetGame");
    setCurrentPhaseIndex(0);
    setStageScores([]);
    resetPhase();
  };

  const goToNextPhase = () => {
    console.log("goToNextPhase");
    setCurrentPhaseIndex((prev) => prev + 1);
  };

  const handleGameEnd = () => {
    console.log("handleGameEnd");
    setShowCelebrate(true);

    setTimeout(() => {
      setShowCelebrate(false);
      resetGame();
    }, 5000);
  };

  const incrementScore = () => {
    console.log("phaseScore");
    setPhaseScore((prev) => prev + 1);
  };

  const speak = useCallback((text: string, lang: string) => {
    Speech.stop();
    Speech.speak(text, { language: lang, pitch: 1, rate: 0.9 });
  }, []);

  // ---------- GAME TYPE (centralizado) ----------
  useEffect(() => {
    const random = Math.random() < 0.5 ? "write" : "match";
    setGameType(random);
  }, [currentPhaseIndex]);

  // ---------- PROGRESSÃO ----------
  useEffect(() => {
    if (!isPhaseCompleted || isTransitioning) return;

    setIsTransitioning(true);

    saveStageScore();

    if (currentPhaseIndex < gameData.length - 1) {
      goToNextPhase();
    } else {
      handleGameEnd();
    }

    setIsTransitioning(false); //
  }, [isPhaseCompleted, currentPhaseIndex, isTransitioning]);

  // ---------- RESET AO MUDAR FASE ----------
  useEffect(() => {
    resetPhase();
  }, [currentPhaseIndex]);

  // ---------- TIMER ----------
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

  return (
    <WordPairGameContext.Provider
      value={{
        currentPhaseIndex,
        setCurrentPhaseIndex,

        currentPhase,
        totalWords,

        matched,
        setMatched,

        phaseScore,
        incrementScore,

        timeLeft,
        showCelebrate,

        stageScores,
        saveStageScore,
        gameType,

        speak,
      }}
    >
      {children}
    </WordPairGameContext.Provider>
  );
};