import React, { createContext, useState, useContext, useEffect, use, } from 'react';
import { Alert } from 'react-native';
import { GameStage, WordPair } from '@/types';
import { lessonRepository, initStorage } from '@/database/lessonRepository';
import { store } from '@/database/tinybase';
import { router } from 'expo-router';


interface DataContextType {
  gameData: GameStage[];
  selectedLessons: GameStage[];
  setSelectedLessons: (lessons: GameStage[]) => void;
  refreshData: () => void;
  addWordPair: (lessonId: string, fr: string, ar: string) => void;
  getAllLessons: () => Record<string, any>;
  deleteWordPair: (id: string) => void;
  addLesson: (lessonTitle: string) => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameData, setGameData] = useState<GameStage[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<GameStage[]>([
    // {
    //   lessonTitle: "salutations",
    //   wordPairs: [
    //     { id: "1", fr: "Bonjour", ar: "مرحبا" },
    //     { id: "2", fr: "Merci", ar: "شكرا" },
    //     { id: "3", fr: "Chat", ar: "قط" },
    //     { id: "4", fr: "Maison", ar: "منزل" },
    //   ],
    // }
  ] as GameStage[]
  ); //selecionar quais lições aparecem no jogo

  function refreshData() {
    const lessons = lessonRepository.getAllLessons();
    const wordPairs = lessonRepository.getAllWordPairs();
    const data: GameStage[] = Object.entries(lessons).map(
      ([lessonId, lesson]: any) => {
        const pairs: WordPair[] = Object.entries(wordPairs)
          .filter(([_, pair]: any) => pair.lessonId === lessonId)
          .map(([id, pair]: any) => ({
            id,
            fr: pair.fr,
            ar: pair.ar,
          }));

        return {
          id: lessonId, // 👈 IMPORTANTE
          lessonTitle: lesson.lessonTitle,
          wordPairs: pairs,
        };
      }
    );

    setGameData(data);
  }

  function addWordPair(lessonId: string, fr: string, ar: string) {

    const data = lessonRepository.addWordPair(lessonId, fr, ar);
    refreshData();

  }

  function getAllLessons() {
    return lessonRepository.getAllLessons();
  }

  function addLesson(lessonTitle: string) {
    const id = lessonRepository.addLesson(lessonTitle);
    refreshData();
    return id;
  }

  function deleteWordPair(id: string) {
    lessonRepository.deleteWordPair(id);
    refreshData();
  }

  useEffect(() => {
    async function init() {
      await initStorage(); // 👈 espera carregar

      lessonRepository.initializeIfEmpty(); // 👈 agora sim

      refreshData();

      const l1 = store.addTableCellIdsListener('lessons', refreshData);
      const l2 = store.addTableCellIdsListener('wordPairs', refreshData);

      return () => {
        store.delListener(l1);
        store.delListener(l2);
      };
    }

    init();
  }, []);

useEffect(() => {
  console.log("Selected lessons updated:", selectedLessons);

  if (selectedLessons.length === 0) {
    Alert.alert(
      "Atention",
      "aucune leçon sélectionnée. Veuillez sélectionner au moins une leçon pour jouer.",
      [{ text: "OK" }]
    );
    router.replace("/games/settings/SettingsScreen"); // redireciona para a tela de configurações
  } 
},[selectedLessons])


  return (
    <DataContext.Provider
      value={{
        gameData,
        selectedLessons,
        setSelectedLessons,
        refreshData,
        addWordPair,
        getAllLessons,
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