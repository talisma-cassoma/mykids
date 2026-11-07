import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { router, type Href } from "expo-router";
import { GameStage as VocabularyStage, GameText, WordPair } from "@/types";
import { lessonRepository, initStorage } from "@/database/lessonRepository";
import { store } from "@/database/tinybase";
import { GameControlsContext } from "@/context/GameControlsContext";
import { classifyImage } from "@/utils/classifyImage";

interface LessonState {
  isDataInitialized: boolean;
  gameVocabulary: VocabularyStage[];
  gameText: GameText[];
  selectedVocaluries: VocabularyStage[];
  setSelectedVocaluries: (lessons: VocabularyStage[]) => void;
  selectedTexts: GameText[];
  setSelectedTexts: (texts: GameText[]) => void;
  currentGameText: GameText | null;
  currentGameVocabulary: VocabularyStage[];
  init: () => void;
  refreshData: () => void;
  addWordPair: (lessonId: string, fr: string, ar: string) => void;
  getAllLessons: () => Record<string, any>;
  getAllVocabularyLessons: () => any[];
  getAllTextLessons: () => any[];
  deleteWordPair: (id: string) => void;
  addLesson: (
    lessonTitle: string,
    type: "text" | "vocabulary",
    ar?: string,
    fr?: string
  ) => Promise<string>;
}

interface GameState {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  selectedGames: GameStage[];
  setSelectedGames: React.Dispatch<React.SetStateAction<GameStage[]>>;
  currentStage: number;
  progress: number;
  gameScore: GameScore[];
  setGameScore: React.Dispatch<React.SetStateAction<GameScore[]>>;
  nextStage: () => void;
  resetGame: () => void;
}

type YachaneContextType = LessonState & GameState;

export type GameStage = {
  name: string;
  href: Href;
};

interface GameScore {
  score: string;
  name: string;
  duration?: string;
}

type Mode = "dark" | "light";

export const stages: GameStage[] = [
  { name: "Mactching Words", href: "/games/yachane/game1" },
  { name: "Find the word", href: "/games/yachane/game2" },
  { name: "Complete the sentence", href: "/games/yachane/game3" },
  { name: "Drag the Word", href: "/games/yachane/game4" },
  { name: "Memory Game", href: "/games/yachane/game5" },
  { name: "Complete with words", href: "/games/yachane/game6" },
  { name: "Rapid-fire multiplication trainer", href: "/games/yachane/game7" },
];

const YachaneContext = createContext<YachaneContextType | null>(null);

type Props = {
  children: ReactNode;
};

export function YachaneProvider({ children }: Props) {
  const [gameVocabulary, setGameVocabulary] = useState<VocabularyStage[]>([]);
  const [gameText, setGameText] = useState<GameText[]>([]);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [selectedVocaluries, setSelectedVocaluries] = useState<VocabularyStage[]>([]);
  const [selectedTexts, setSelectedTexts] = useState<GameText[]>([]);
  const [currentGameText, setCurrentGameText] = useState<GameText | null>(null);
  const [currentGameVocabulary, setCurrentGameVocabulary] = useState<VocabularyStage[]>([]);

  const [currentStage, setCurrentStage] = useState(0);
  const [mode, setMode] = useState<Mode>("dark");
  const [progress, setProgress] = useState(0);
  const [gameScore, setGameScore] = useState<GameScore[]>([]);
  const [selectedGames, setSelectedGames] = useState<GameStage[]>([
    { name: "Mactching Words", href: "/games/yachane/game1" },
  ]);

  function refreshData() {
    const lessons = lessonRepository.getAllLessons();
    const wordPairs = lessonRepository.getAllWordPairs();
    const vocab: VocabularyStage[] = [];
    const texts: GameText[] = [];

    Object.entries(lessons).forEach(([lessonId, lesson]: any) => {
      if (lesson.type === "vocabulary") {
        const pairs: WordPair[] = Object.entries(wordPairs)
          .filter(([_, pair]: any) => pair.lessonId === lessonId)
          .map(([id, pair]: any) => ({
            id,
            fr: pair.fr,
            ar: pair.ar,
          }));

        vocab.push({
          id: lessonId,
          lessonTitle: lesson.lessonTitle,
          wordPairs: pairs,
        });
      }

      if (lesson.type === "text") {
        const pair = Object.entries(wordPairs).find(
          ([_, p]: any) => p.lessonId === lessonId
        );

        if (pair) {
          const [_, p]: any = pair;
          texts.push({
            id: lessonId,
            title: lesson.lessonTitle,
            content: {
              arabic_text: p.ar,
              french_translation: p.fr,
            },
          });
        }
      }
    });

    setGameVocabulary(vocab);
    setSelectedVocaluries(vocab[0] ? [vocab[0]] : []);
    setGameText(texts);
    setSelectedTexts(texts[0] ? [texts[0]] : []);
    setCurrentGameText(selectedTexts[Math.floor(Math.random() * setSelectedTexts.length)]);
    setCurrentGameVocabulary(
      [...selectedVocaluries].sort(() => 0.5 - Math.random()).slice(0, 10)
    );
  }

  function addWordPair(lessonId: string, fr: string, ar: string) {
    lessonRepository.addWordPair(lessonId, fr, ar);
    refreshData();
  }

  function getAllLessons() {
    return lessonRepository.getAllLessons();
  }

  function getAllVocabularyLessons() {
    const lessons = lessonRepository.getAllLessons();
    return Object.entries(lessons)
      .filter(([_, lesson]: any) => lesson.type === "vocabulary")
      .map(([id, lesson]) => ({ id, ...lesson }));
  }

  function getAllTextLessons() {
    const lessons = lessonRepository.getAllLessons();
    return Object.entries(lessons)
      .filter(([_, lesson]: any) => lesson.type === "text")
      .map(([id, lesson]) => ({ id, ...lesson }));
  }

  async function addLesson(
    lessonTitle: string,
    type: "text" | "vocabulary",
    ar?: string,
    fr?: string
  ) {
    const id = await lessonRepository.addLesson(lessonTitle, type, ar, fr);
    refreshData();
    return id;
  }

  function deleteWordPair(id: string) {
    lessonRepository.deleteWordPair(id);
    refreshData();
  }

  async function init() {
    await initStorage();
    lessonRepository.initializeIfEmpty();
    refreshData();
    setIsDataInitialized(true);

    const l1 = store.addTableCellIdsListener("lessons", refreshData);
    const l2 = store.addTableCellIdsListener("wordPairs", refreshData);

    return () => {
      store.delListener(l1);
      store.delListener(l2);
    };
  }

  const nextStage = () => {
    const current = currentStage + 1;
    setCurrentStage(current);
    setProgress(current);

    if (current >= selectedGames.length) {
      router.replace("/games/yachane/EndScreen");
      return;
    }

    router.replace(selectedGames[current].href);
  };

  const resetGame = () => {
    setCurrentStage(0);
    setProgress(0);
    router.replace("/games/yachane/StartScreen");
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <GameControlsContext.Provider
      value={{ mode, setMode, selectedGames, currentStage, classifyImage }}
    >
      <YachaneContext.Provider
        value={{
          isDataInitialized,
          gameVocabulary,
          gameText,
          selectedVocaluries,
          setSelectedVocaluries,
          selectedTexts,
          setSelectedTexts,
          currentGameText,
          currentGameVocabulary,
          init,
          refreshData,
          addWordPair,
          getAllLessons,
          getAllVocabularyLessons,
          getAllTextLessons,
          deleteWordPair,
          addLesson,
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
        }}
      >
        {children}
      </YachaneContext.Provider>
    </GameControlsContext.Provider>
  );
}

export function useYachane() {
  const context = useContext(YachaneContext);
  if (!context) {
    throw new Error("Yachane hooks must be used inside YachaneProvider");
  }
  return context;
}

export function useData() {
  return useYachane();
}

export function useGame() {
  return useYachane();
}
