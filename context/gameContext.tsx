import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';
type TimerMode = 'increasing' | 'decreasing';

type Stage = {
  id: string;
  component: React.JSX.Element;
};

type Scores = Record<string, string>;

type TimerProps = {
  isActive: boolean;
  mode: TimerMode;
};

type GameContextType = {
  status: GameStatus;
  currentStageIndex: number;
  stages: Stage[];
  scores: Scores;

  // GAME
  startGame: (stages: Stage[]) => void;
  restartGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  nextStage: () => void;
  setScore: (stageId: string, score: string) => void;

  gameDescription: string;
  setGameDescription: (description: string) => void;

  // TIMER
  time: number;
  isRunning: boolean;
  timerMode: TimerMode;
  isTimerActive: boolean;
  setIsTimerActive: (isActive: boolean) => void;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (newTime?: number) => void;
  setTimerMode: (mode: TimerMode) => void;
};

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // GAME STATE
  const [status, setStatus] = useState<GameStatus>('idle');
  const [stages, setStages] = useState<Stage[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [scores, setScores] = useState<Scores>({});
  const [gameDescription, setGameDescription] = useState<string>('');

  // TIMER STATE
  const [time, setTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>('increasing');
  const [isTimerActive, setIsTimerActive]= useState(true);


  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // TIMER EFFECT
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (timerMode === 'increasing') return prev + 1;

        if (timerMode === 'decreasing') {
          if (prev <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        }

        return prev;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timerMode]);

  // GAME ACTIONS
  function startGame(newStages: Stage[]) {
    if (!newStages.length) return;

    setStages(newStages);
    setScores({});
    setCurrentStageIndex(0);
    setStatus('playing');
    setIsRunning(true);
  }

  function restartGame() {
  setStatus('idle');
  setStages([]);
  setScores({});
  setCurrentStageIndex(0);
  setGameDescription('');

  // timer
  setIsRunning(false);
  setTime(0);
  //setTimerMode('increasing');
  setIsTimerActive(false);
}

  function pauseGame() {
    setStatus('paused');
    setIsRunning(false);
  }

  function resumeGame() {
    setStatus('playing');
    setIsRunning(true);
  }

  function nextStage() {
    setCurrentStageIndex((prev) => {
      const next = prev + 1;

      if (next >= stages.length) {
        setStatus('finished');
        setIsRunning(false);
        return prev;
      }

      return next;
    });
  }

  function setScore(stageId: string, score: string) {
    setScores((prev) => ({
      ...prev,
      [stageId]: score,
    }));
  }

  // TIMER ACTIONS
  function startTimer() {
    setIsRunning(true);
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  function resetTimer(newTime = 0) {
    setIsRunning(false);
    setTime(newTime);
  }

  return (
    <GameContext.Provider
      value={{
        // GAME
        status,
        currentStageIndex,
        stages,
        scores,
        startGame,
        restartGame,
        pauseGame,
        resumeGame,
        nextStage,
        setScore,
        gameDescription,
        setGameDescription,

        // TIMER
        time,
        isRunning,
        timerMode,
        startTimer,
        pauseTimer,
        resetTimer,
        setTimerMode,
        isTimerActive,
        setIsTimerActive,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}