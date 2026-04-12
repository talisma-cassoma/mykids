import React, { createContext, useContext, useEffect, useState } from "react";

interface WordPair {
  id: string;
  fr: string;
  ar: string;
}

interface GameStage {
  phase: string;
  wordPairs: WordPair[];
}

interface WordPairGameContextType {
  currentPhaseIndex: number;
  setCurrentPhaseIndex: React.Dispatch<React.SetStateAction<number>>;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  showCelebrate: boolean;
  setShowCelebrate: React.Dispatch<React.SetStateAction<boolean>>;
  phaseCompleted: boolean;
  setPhaseCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  score: number;
  //setScore: React.Dispatch<React.SetStateAction<number>>;
  totalWords: number;
  incrementScore: () => void;
}

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
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [phaseCompleted, setPhaseCompleted] = useState(false);

  const [score, setScore] = useState(0); // ✅ score par phase

  const currentPhase = gameData[currentPhaseIndex];
  
 const totalWords = currentPhase.wordPairs.length;

  // ✅ seule fonction pour changer de phase
  const handleNextPhase = () => {
    setCurrentPhaseIndex((prev) => {
      if (prev < gameData.length - 1) {
        return prev + 1;
      } else {
        setShowCelebrate(true);
        setTimeout(() => {
          setShowCelebrate(false);
          resetGame();
        }, 2000);
        return prev;
      }
    });
  };

  // ✅ quand phase complétée (par matching)
  useEffect(() => {
    if (phaseCompleted) {
      handleNextPhase();
    }
  }, [phaseCompleted]);

  // ⏱️ timer
  useEffect(() => {
    setTimeLeft(60);

    setPhaseCompleted(false);
    setScore(0); // 🔥 reset score à chaque phase

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    //setTotalWords(currentPhase.wordPairs.length); // 🔥 update totalWords à chaque phase
    return () => clearInterval(timer);
  }, [currentPhaseIndex]);

  // 🔄 reset complet
  const resetGame = () => {
    setCurrentPhaseIndex(0);
    setTimeLeft(60);
    setScore(0);
  };

  // ✅ fonction propre pour ajouter des points
  const incrementScore = () => {
    setScore((prev) => prev + 1);
  };

  return (
    <WordPairGameContext.Provider
      value={{
        currentPhaseIndex,
        setCurrentPhaseIndex,
        timeLeft,
        setTimeLeft,
        showCelebrate,
        setShowCelebrate,
        phaseCompleted,
        setPhaseCompleted,

        // 🎯 SCORE CLEAN
        score,
        totalWords,
        incrementScore, // 🔥 UI ne touche pas setScore directement
      }}
    >
      {children}
    </WordPairGameContext.Provider>
  );
};
