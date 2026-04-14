import { useEffect, useState } from "react";
import { useWordPairGame, WordPair } from "@/context/gameContext";

export const useWriteGame = () => {
  const { currentPhase, matched, setMatched, incrementScore, saveStageScore } = useWordPairGame();

  const [currentWord, setCurrentWord] = useState<WordPair | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 🎯 Escolher primeira palavra
  useEffect(() => {
    if (currentPhase.wordPairs.length > 0) {
      setCurrentWord(currentPhase.wordPairs[0]);
    }
  }, [currentPhase]);

  const getRemainingWords = (updatedMatched: string[]) => {
    return currentPhase.wordPairs.filter(
      (w) => !updatedMatched.includes(w.id)
    );
  };

  const pickNextWord = (remaining: WordPair[]) => {
    if (remaining.length === 0) return null;
    return remaining[Math.floor(Math.random() * remaining.length)];
  };

  const checkAnswer = () => {
    if (!currentWord) return;

    const isMatch = userInput.trim() === currentWord.ar;
    console.log("isMatch: ", isMatch);

    if (
      isMatch
    ) {
      setIsCorrect(true);
      saveStageScore(1)
      setUserInput("");
    } else {
      setIsCorrect(false);
    }
  };


  return {
    currentWord,
    userInput,
    setUserInput,
    checkAnswer,
    isCorrect,
  };
};