import { useEffect, useState } from "react";
import { useGame } from "@/context/gameContext";
import { gameData, GameStage, WordPair } from "@/utils/lessons";

export const useMatchingGame = () => {
  const {
    setScore,
    nextStage,
    status,
    startTimer,
    pauseTimer,
    setTimerMode,
    setIsTimerActive,
    stages,
    currentStageIndex,
  } = useGame();

  console.log("useMatchingGame")

  const currentStage = stages[currentStageIndex];
  const stageId = currentStage?.id;

  // 🎲 fase aleatória fixa
  const [currentLesson, setCurrentLesson] = useState<GameStage | null>(null);

  const [matched, setMatched] = useState<string[]>([]);
  const [phaseScore, setPhaseScore] = useState(0);

  const [leftWords, setLeftWords] = useState<WordPair[]>([]);
  const [rightWords, setRightWords] = useState<WordPair[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<WordPair | null>(null);
  const [selectedRight, setSelectedRight] = useState<WordPair | null>(null);

  // 🎲 escolhe UMA fase apenas no início
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * gameData.length);
    setCurrentLesson(gameData[randomIndex]);
  }, []);

  // 📦 dados seguros
  const data = currentLesson?.wordPairs ?? [];
  const totalWords = data.length;
  const isPhaseCompleted = matched.length === totalWords;

  // 🔀 init da fase
  useEffect(() => {
    if (!data.length) return;

    const shuffled = [...data].sort(() => Math.random() - 0.5);

    setLeftWords(data);
    setRightWords(shuffled);

    setMatched([]);
    setPhaseScore(0);
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [currentLesson]);

  // ⏱ timer
  useEffect(() => {
    if (status !== "playing") return;

    setIsTimerActive(true);
    setTimerMode("decreasing");
    startTimer();

    return () => {
      pauseTimer();
    };
  }, []);

  // 🎯 lógica de match
  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;

    const isMatch = selectedLeft.id === selectedRight.id;

    if (isMatch && !matched.includes(selectedLeft.id)) {
      const newScore = phaseScore + 1;

      setMatched((prev) => [...prev, selectedLeft.id]);
      setPhaseScore(newScore);

      if (stageId) {
        setScore("trouvez les mots equivalent", `${newScore/totalWords}`);
      }
    }

    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
    }, 200);
  }, [selectedLeft, selectedRight]);

  // // ✅ fim da fase
  // useEffect(() => {
  //   if (isPhaseCompleted && status === "playing") {
  //     setTimeout(() => {
  //       nextStage();
  //     }, 500);
  //   }
  // }, [isPhaseCompleted, status]);

  return {
    leftWords,
    rightWords,
    selectedLeft,
    selectedRight,
    setSelectedLeft,
    setSelectedRight,
    matched,
    phaseScore,
    isPhaseCompleted,
    lessonTitle: currentLesson?.lessonTitle,
  };
};