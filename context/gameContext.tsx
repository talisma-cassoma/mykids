// GameContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { router, Href } from "expo-router";

type GameContextType = {
  stages: Href[];
  currentStage: number;
  progress: number;
  gameScore: gameScoreProps[];
  setGameScore: React.Dispatch<React.SetStateAction<gameScoreProps[]>>;
  nextStage: () => void;
  resetGame: () => void;
};

const stages: Href[] = [
  "/games/game1",
  "/games/game2",
  "/games/game1",
  "/games/game1",
  "/games/game2",
  "/games/game2",];

const GameContext = createContext<GameContextType | null>(null);

type Props = {
  children: ReactNode;
};

interface gameScoreProps {
  score: string;
  name: string;
  duration: string;
}
export function GameProvider({ children }: Props) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gameScore, setGameScore] = useState<gameScoreProps[]>([]);

  const nextStage = () => {
    const current = currentStage + 1;

    console.log("currentStage: ", current);
    console.log("stages length: ", stages.length);

    setCurrentStage(current);
    setProgress(current);

    if (current >= stages.length) {
      //console.log("max stage", stages.length)
      router.replace("/games/EndScreen")
      return;
    }

    router.replace(stages[current]);
  };

  const resetGame = () => {
    setCurrentStage(0);
    setProgress(0);
    router.replace("/games/StartScreen");
  };

  return (
    <GameContext.Provider
      value={{
        stages,
        currentStage,
        progress,
        gameScore,
        setGameScore,
        nextStage,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }

  return context;
}