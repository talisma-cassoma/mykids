import React, { useMemo, useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Pressable,
    StyleSheet,
} from "react-native";
import {
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";

import { IconPlus, IconXboxX } from "@tabler/icons-react-native";

import { AddNewWorldForm } from "@/components/AddNewWordForm";
import { AddNewLessonForm } from "@/components/AddNewLessonForm";
import { useData } from "@/context/DataContext";

import { GameStage, GameText, WordPair } from "@/types";

export function LessonsSettings() {
    const {
        gameVocabulary,
        gameText,
        deleteWordPair,
    } = useData();

    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

    const selectedLesson = gameVocabulary.find(
        (l) => l.id === selectedLessonId
    );

    const bottomSheetRef = useRef<BottomSheetModal>(null);

    const snapPoints = useMemo(() => ["50%", "80%"], []);

    // OPEN vocabulary lesson
    function handleOpenLesson(lesson: GameStage) {
        setSelectedLessonId(lesson.id);

        requestAnimationFrame(() => {
            bottomSheetRef.current?.present();
        });
    }

    function handleCloseSheet() {
        bottomSheetRef.current?.close();
    }

    // VOCABULARY ITEM
    function renderLessonItem({ item }: { item: GameStage }) {
        return (
            <TouchableOpacity
                style={styles.lessonCard}
                onPress={() => handleOpenLesson(item)}
            >
                <Text style={styles.lessonTitle}>{item.lessonTitle}</Text>

                <View style={styles.rightSection}>
                    <Text style={styles.countText}>
                        {item.wordPairs.length} mots
                    </Text>

                    <IconPlus size={20} color="#333" />
                </View>
            </TouchableOpacity>
        );
    }

    // TEXT ITEM
    function renderTextItem({ item }: { item: GameText }) {
        return (
            <View style={styles.lessonCard}>
                <Text style={styles.lessonTitle}>{item.title}</Text>

                <View style={styles.rightSection}>
                    <Text style={styles.countText}>
                        Texte
                    </Text>

                    <IconPlus size={20} color="#333" />
                </View>
            </View>
        );
    }

    // WORD ITEM INSIDE VOCABULARY
    function renderWordPairItem({ item }: { item: WordPair }) {
        return (
            <View style={styles.wordCard}>
                <Text style={styles.wordText}>{item.fr}</Text>

                <TouchableOpacity onPress={() => deleteWordPair(item.id)}>
                    <IconXboxX size={22} color="#D11A2A" />
                </TouchableOpacity>
            </View>
        );
    }

    useEffect(() => {
        setTimeout(() => {
            bottomSheetRef.current?.snapToIndex(0);
        }, 1000);
    }, []);

    return (
        <View style={styles.container}>

            {/* ADD LESSON FORM */}
            <AddNewLessonForm />

            {/* ===================== */}
            {/* VOCABULARY SECTION */}
            {/* ===================== */}
            <Text style={styles.sectionTitle}>Vocabulary</Text>

            <FlatList
                data={gameVocabulary}
                keyExtractor={(item) => item.id}
                renderItem={renderLessonItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* ===================== */}
            {/* TEXT SECTION */}
            {/* ===================== */}
            <Text style={styles.sectionTitle}>Textes</Text>

            <FlatList
                data={gameText}
                keyExtractor={(item) => item.id}
                renderItem={renderTextItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* ===================== */}
            {/* BOTTOM SHEET (VOCAB ONLY) */}
            {/* ===================== */}
            <BottomSheetModal
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                enablePanDownToClose
                backgroundStyle={{ backgroundColor: "#fff" }}
                handleIndicatorStyle={{ backgroundColor: "#999" }}
            >
                <BottomSheetView style={styles.sheetContent}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>
                            {selectedLesson?.lessonTitle || "Lesson"}
                        </Text>

                        <Pressable onPress={handleCloseSheet}>
                            <IconXboxX size={24} color="#222" />
                        </Pressable>
                    </View>

                    <AddNewWorldForm
                        selectedLessonId={selectedLesson?.id || ""}
                    />

                    <FlatList
                        data={selectedLesson?.wordPairs || []}
                        keyExtractor={(item) => item.id}
                        renderItem={renderWordPairItem}
                    />
                </BottomSheetView>
            </BottomSheetModal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#FFF",
        gap: 12,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 10,
    },

    listContent: {
        paddingBottom: 20,
        minHeight: 220,
    },

    lessonCard: {
        backgroundColor: "#F7F7F7",
        borderRadius: 14,
        padding: 18,
        marginBottom: 12,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    lessonTitle: {
        fontSize: 17,
        fontWeight: "600",
    },

    rightSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    countText: {
        fontSize: 14,
        color: "#666",
    },

    wordCard: {
        backgroundColor: "#FAFAFA",
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    wordText: {
        fontSize: 16,
        fontWeight: "500",
    },

    sheetContent: {
        backgroundColor: "#FFF",
        paddingHorizontal: 16,
        paddingTop: 10,
        minHeight: 400,
    },

    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    sheetTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
});