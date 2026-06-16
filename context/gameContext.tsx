// GameContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { router, Href } from "expo-router";

type GameContextType = {

  selectedGames: { name: string, href: Href }[];
  setSelectedGames: React.Dispatch<React.SetStateAction<{ name: string, href: Href }[]>>;
  currentStage: number;
  progress: number;
  gameScore: gameScoreProps[];
  setGameScore: React.Dispatch<React.SetStateAction<gameScoreProps[]>>;
  nextStage: () => void;
  resetGame: () => void;
};

export type GameStage = {
  name: string;
  href: Href;
};

export const stages: GameStage[] = [
  { name: "Mactching Words", href: "/games/game1" },
  { name: "Find the word", href: "/games/game2" },
  { name: "Complete the sentence", href: "/games/game3" },
  { name: "Drag the Word", href: "/games/game4" },
  { name: "Memory Game", href: "/games/game5" },
  { name: "Complete with words", href: "/games/game6" },
];

const GameContext = createContext<GameContextType | null>(null);

type Props = {
  children: ReactNode;
};

interface gameScoreProps {
  score: string;
  name: string;
  duration?: string;
}
export function GameProvider({ children }: Props) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gameScore, setGameScore] = useState<gameScoreProps[]>([]);
  const [selectedGames, setSelectedGames] = useState<{ name: string, href: Href }[]>([ 
    { name: "Mactching Words", href: "/games/game1" }]);

  const nextStage = () => {
    const current = currentStage + 1;

    console.log("currentStage: ", current);
    console.log("stages length: ", stages.length);

    setCurrentStage(current);
    setProgress(current);

    if (current >= selectedGames.length) {
      //console.log("max stage", stages.length)
      router.replace("/games/EndScreen")
      return;
    }

    router.replace(selectedGames[current].href);
  };

  const resetGame = () => {
    setCurrentStage(0);
    setProgress(0);
    router.replace("/games/StartScreen");
  };

  return (
    <GameContext.Provider
      value={{
        currentStage,
        progress,
        gameScore,
        setGameScore,
        nextStage,
        resetGame,
        selectedGames,
        setSelectedGames,
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