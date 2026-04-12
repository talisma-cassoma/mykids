// PlayerContext.tsx
import React, { createContext, useContext, useState } from "react";

type PlayerContextType = {
  isPlay: boolean;
  togglePlay: () => void;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPlay, setIsPlay] = useState(true);

  const togglePlay = () => {
    setIsPlay((prev) => !prev);
  };

  return (
    <PlayerContext.Provider value={{ isPlay, togglePlay }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};