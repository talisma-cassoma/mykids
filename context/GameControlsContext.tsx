import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Href } from "expo-router";

export interface GameRoute {
  name: string;
  href: Href;
}

export interface GameControls {
  mode: "dark" | "light";
  setMode: Dispatch<SetStateAction<"dark" | "light">>;
  selectedGames: GameRoute[];
  currentStage: number;
}

export const GameControlsContext = createContext<GameControls | null>(null);

export function useGameControls() {
  const context = useContext(GameControlsContext);
  if (!context) {
    throw new Error("useGameControls must be used inside a game provider");
  }
  return context;
}
