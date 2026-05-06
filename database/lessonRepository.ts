import { store } from './tinybase';
import * as SQLite from "expo-sqlite";
import { useCreatePersister } from "tinybase/ui-react";
import { createExpoSqlitePersister } from "tinybase/persisters/persister-expo-sqlite";
import { useEffect } from 'react';
import { get } from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';
import { gameData } from "@/utils/lessons";


export async function initStorage() {
  const db = SQLite.openDatabaseSync("app.db");
  const persister = createExpoSqlitePersister(store, db);

  await persister.load(); // carrega os dados do banco para a store
  persister.startAutoSave();
}

export const lessonRepository = {
    initializeIfEmpty() {
        const lessons = store.getTable('lessons');

        //console.log("Checking if lessons table is empty. Current lessons:", lessons);
        // se já tem dados, não faz nada
        if (Object.keys(lessons).length > 0) {
            return;
        }

        console.log("Seeding database...");

        gameData.forEach((stage) => {
            const lessonId = Date.now().toString() + Math.random();

            // cria lesson
            store.setRow('lessons', lessonId, {
                lessonTitle: stage.lessonTitle,
            });

            // cria wordPairs
            const wordpair = stage.wordPairs.map((pair) => {
                const id = `${lessonId}-${pair.id}`;
                store.setRow('wordPairs', id, {
                    lessonId,
                    fr: pair.fr,
                    ar: pair.ar,
                });
            });

            //console.log("Word pairs:", wordpair);
        });
    },
    getLessonByTitle(title: string) {
        const lessons = store.getTable('lessons');

        return Object.entries(lessons).find(
            ([_, lesson]) => lesson.lessonTitle === title
        );
    },
    getAllLessons() {
        return store.getTable('lessons');
    },

    getAllWordPairs() {
        return store.getTable('wordPairs');
    },

    addLesson(lessonTitle: string) {
        const id = Date.now().toString();

        store.setRow('lessons', id, {
            lessonTitle,
        });
        return id;
    },


    addWordPair(lessonId: string, fr: string, ar: string) {
        console.log("Adding word pair to lessonId:", lessonId);
        const id = Date.now().toString();

        return store.setRow('wordPairs', id, {
            lessonId,
            fr,
            ar,
        });
    },

    updateWordPair(id: string, fr: string, ar: string) {
        store.setPartialRow('wordPairs', id, {
            fr,
            ar,
        });
    },

    deleteWordPair(id: string) {
        store.delRow('wordPairs', id);
    },
};