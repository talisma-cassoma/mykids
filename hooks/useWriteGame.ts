import { useEffect, useState } from "react";
import { useGame } from "@/context/gameContext";
import { gameData, WordPair, GameStage } from "@/utils/lessons";

export const useWriteGame = () => {
  const {
    setScore,
    nextStage,
    setIsTimerActive,
    status
  } = useGame();

  const [currentLesson, setCurrentLesson] = useState<GameStage | null>(null);
  const [currentWord, setCurrentWord] = useState<WordPair | null>(null);

  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 🎯 escolhe uma lesson aleatória (uma vez ou quando reiniciar o jogo)
  const pickRandomLesson = () => {
    return gameData[Math.floor(Math.random() * gameData.length)];
  };

  // 🎯 escolhe uma palavra aleatória da lesson atual
  const pickRandomWord = (lesson: GameStage) => {
    return lesson.wordPairs[
      Math.floor(Math.random() * lesson.wordPairs.length)
    ];
  };

  // 🚀 inicialização do jogo
  useEffect(() => {
    const lesson = pickRandomLesson();
    setCurrentLesson(lesson);
  }, []);

  // 🎯 sempre que muda a lesson, escolhe uma palavra
  useEffect(() => {
    if (!currentLesson) return;

    const word = pickRandomWord(currentLesson);

    setCurrentWord(word);
    setUserInput("");
    setIsCorrect(null);
    setIsTimerActive(false);
  }, [currentLesson]);

  // ✅ valida resposta
  const checkAnswer = () => {
    if (!currentWord) return;

    const isMatch = userInput.trim() === currentWord.ar;

    if (isMatch) {
      setIsCorrect(true);
      setScore("ecrire le mot: ", `${currentWord.ar}`);

      // opcional: próxima palavra
      //const nextWord = pickRandomWord(currentLesson!);

      //setTimeout(() => {
        //setCurrentWord(nextWord);
        //setUserInput("");
        setIsCorrect(true);
          // ✅ fim da fase
                if (status === "playing") {
                    setTimeout(() => {
                        nextStage();
                    }, 500);
                }
      //}, 300);
    } else {
      setIsCorrect(false);
    }
  };

  // 🔁 próxima palavra manual (opcional)
  const nextWord = () => {
    if (!currentLesson) return;

    const word = pickRandomWord(currentLesson);

    setCurrentWord(word);
    //setUserInput("");
    //setIsCorrect(null);
  };

  return {
    currentWord,
    userInput,
    setUserInput,
    checkAnswer,
    isCorrect,
    nextWord,
  };
};