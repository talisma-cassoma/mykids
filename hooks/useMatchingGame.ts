import { useEffect, useState } from "react";
import { useWordPairGame,  WordPair } from "@/context/gameContext";


export const useMatchingGame = () => {
  const { currentPhase, matched, setMatched, incrementScore, saveStageScore } = useWordPairGame();

  const [leftWords, setLeftWords] = useState<WordPair[]>([]);
  const [rightWords, setRightWords] = useState<WordPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<WordPair | null>(null);
  const [selectedRight, setSelectedRight] = useState<WordPair | null>(null);

  // 🔀 Inicialização da fase
  useEffect(() => {
    const shuffled = [...currentPhase.wordPairs].sort(() => Math.random() - 0.5);

    setLeftWords(currentPhase.wordPairs);
    setRightWords(shuffled);

    setSelectedLeft(null);
    setSelectedRight(null);
  }, [currentPhase]);

  // 🎯 Verificar match
  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;

    const isMatch = selectedLeft.id === selectedRight.id;

    if (isMatch) {
      setMatched((prev) => [...prev, selectedLeft.id]);
      incrementScore();
    }

    // reset seleção sempre
    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
    }, 200); // pequeno delay melhora UX
  }, [selectedLeft, selectedRight]);

  useEffect(() => {
  if (matched.length === currentPhase.wordPairs.length) {
    saveStageScore();
  }
}, [matched]);

  return {
    leftWords,
    rightWords,
    selectedLeft,
    selectedRight,
    setSelectedLeft,
    setSelectedRight,
    matched,
  };
};