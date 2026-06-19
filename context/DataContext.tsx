import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { GameStage, GameText, WordPair } from '@/types';
import { lessonRepository, initStorage } from '@/database/lessonRepository';
import { store } from '@/database/tinybase';
import { router } from 'expo-router';

interface DataContextType {
  gameVocabulary: GameStage[];
  gameText: GameText[];

  selectedVocaluries: GameStage[];
  setSelectedVocaluries: (lessons: GameStage[]) => void;

  selectedTexts: GameText[];
  setSelectedTexts: (texts: GameText[]) => void;

  currentGameText: GameText | null;

  currentGameVocabulary: GameStage[];


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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameVocabulary, setGameVocabulary] = useState<GameStage[]>([]);
  const [gameText, setGameText] = useState<GameText[]>([]);

  const [selectedVocaluries, setSelectedVocaluries] = useState<GameStage[]>([]);
  const [selectedTexts, setSelectedTexts] = useState<GameText[]>([]);
  const [currentGameText, setCurrentGameText] = useState<GameText | null>(null);
  const [currentGameVocabulary, setCurrentGameVocabulary] = useState<GameStage[]>([]);

  function refreshData() {
    const lessons = lessonRepository.getAllLessons();
    const wordPairs = lessonRepository.getAllWordPairs();

    const vocab: GameStage[] = [];
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
    //console.log("vocab", JSON.stringify(vocab));
    setSelectedVocaluries(vocab[0] ? [vocab[0]] : []);
    setGameText(texts);
    //console.log("texts", texts);
    setSelectedTexts(texts[0] ? [texts[0]] : []);
    setCurrentGameText(selectedTexts[Math.floor(Math.random() * setSelectedTexts.length)])
    setCurrentGameVocabulary([...selectedVocaluries].sort(() => 0.5 - Math.random()).slice(0, 10))
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
      .map(([id, lesson]: any) => ({ id, ...lesson }));
  }

  function getAllTextLessons() {
    const lessons = lessonRepository.getAllLessons();

    return Object.entries(lessons)
      .filter(([_, lesson]: any) => lesson.type === "text")
      .map(([id, lesson]: any) => ({ id, ...lesson }));
  }

  async function addLesson(
    lessonTitle: string,
    type: "text" | "vocabulary",
    ar?: string,
    fr?: string
  ) {
    const id = await lessonRepository.addLesson(
      lessonTitle,
      type,
      ar,
      fr
    );

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

    const l1 = store.addTableCellIdsListener('lessons', refreshData);
    const l2 = store.addTableCellIdsListener('wordPairs', refreshData);

    return () => {
      store.delListener(l1);
      store.delListener(l2);
    };
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (selectedVocaluries.length === 0 || selectedTexts.length === 0) {
      Alert.alert(
        "Attention",
        "selectionne au moins une leçon de vocabulaire et un texte pour jouer",
        [{ text: "OK" }]
      );

      router.replace("/games/settings/SettingsScreen");
    }
  }, [selectedVocaluries, selectedTexts]);

  return (
    <DataContext.Provider
      value={{
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error('useData must be used inside DataProvider');
  }

  return context;
}