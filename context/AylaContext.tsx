import React, { createContext, useContext, useState, type ReactNode } from "react";
import { router, type Href } from "expo-router";
import { GameControlsContext } from "@/context/GameControlsContext";
import { classifyImage } from "@/utils/classifyImage";

export interface AylaGame {
  name: string;
  href: Href;
}

export interface AylaScore {
  score: string;
  name: string;
  duration?: string;
}

interface AylaContextValue {
  mode: "dark" | "light";
  setMode: React.Dispatch<React.SetStateAction<"dark" | "light">>;
  selectedGames: AylaGame[];
  setSelectedGames: React.Dispatch<React.SetStateAction<AylaGame[]>>;
  currentStage: number;
  progress: number;
  gameScore: AylaScore[];
  setGameScore: React.Dispatch<React.SetStateAction<AylaScore[]>>;
  nextStage: () => void;
  resetGame: () => void;
}

export const aylaStages: AylaGame[] = [
  { name: "Chante avec titounis", href: "/games/ayla/game1" },
  { name: "Apprendre à compter", href: "/games/ayla/game2" },
  { name: "Compte et glisse le bon nombre", href: "/games/ayla/game3" },
  { name: "Tracer les chiffres", href: "/games/ayla/game4" },
  { name: "Écrire les chiffres", href: "/games/ayla/game5" },
];

const AylaContext = createContext<AylaContextValue | null>(null);

export function AylaProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"dark" | "light">("dark");
  const [selectedGames, setSelectedGames] = useState<AylaGame[]>(aylaStages);
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gameScore, setGameScore] = useState<AylaScore[]>([]);

  const nextStage = () => {
    const next = currentStage + 1;
    setCurrentStage(next);
    setProgress(next);

    if (next >= selectedGames.length) {
      router.replace("/games/ayla/EndScreen");
      return;
    }

    router.replace(selectedGames[next].href);
  };

  const resetGame = () => {
    setCurrentStage(0);
    setProgress(0);
    router.replace("/games/ayla/StartScreen");
  };

  const value = {
    mode,
    setMode,
    selectedGames,
    setSelectedGames,
    currentStage,
    progress,
    gameScore,
    setGameScore,
    nextStage,
    resetGame,
  };

  return (
    <AylaContext.Provider value={value}>
      <GameControlsContext.Provider
        value={{ mode, setMode, selectedGames, currentStage, classifyImage }}
      >
        {children}
      </GameControlsContext.Provider>
    </AylaContext.Provider>
  );
}

export function useAyla() {
  const context = useContext(AylaContext);
  if (!context) {
    throw new Error("useAyla must be used inside AylaProvider");
  }
  return context;
}
