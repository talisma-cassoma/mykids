import { store } from './tinybase';
import * as SQLite from "expo-sqlite";
import { useCreatePersister } from "tinybase/ui-react";
import { createExpoSqlitePersister } from "tinybase/persisters/persister-expo-sqlite";
import { useEffect } from 'react';
import { get } from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';
import { gameData, gameText } from "@/utils/lessons";


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
                type: "vocabulary",
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

        //adiciona texto
        gameText.forEach((text) => {
            const lessonId = Date.now().toString() + Math.random();

            // cria lesson
            store.setRow('lessons', lessonId, {
                lessonTitle: text.title,
                type: "text",
            });

            // cria wordPairs
            const wordpair = store.setRow('wordPairs', `${lessonId}-1`, {
                lessonId,
                fr: text.content.french_translation,
                ar: text.content.arabic_text,
            });
        });
    },

    getLessonByTitle(title: string) {
        const lessons = store.getTable('lessons');

        return Object.entries(lessons).find(
            ([_, lesson]: any) => lesson.lessonTitle === title
        );
    },

    getAllLessons() {
        return store.getTable('lessons');
    },

    getAllWordPairs() {
        return store.getTable('wordPairs');
    },

    addWordPair(lessonId: string, fr: string, ar: string) {
        const id = Date.now().toString();

        store.setRow('wordPairs', id, {
            lessonId,
            fr,
            ar,
        });

        return id;
    },

    async addLesson(
        lessonTitle: string,
        type: "text" | "vocabulary",
        ar?: string,
        fr?: string
    ) {
        const id = Date.now().toString();

        store.setRow('lessons', id, {
            lessonTitle,
            type,
        });

        // TEXT = 1 único conteúdo (wordPair)
        if (type === "text" && ar && fr) {
            this.addWordPair(id, fr, ar);
        }

        return id;
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