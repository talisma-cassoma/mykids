import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
    DropProvider,
    Draggable,
    Droppable,
} from "react-native-reanimated-dnd";

import { Button } from "@/components/Button";
import { IconSquareRoundedCheck } from "@tabler/icons-react-native";
import { useSpeech, sentenceToText } from "@/utils/lessons";
import { IconVolume, IconRefreshDot } from "@tabler/icons-react-native";
import { SentenceItem } from "@/types";


type Props = {
    sentence: SentenceItem[];

    translation: string;

    draggableWords: string[];

    onValidate?: (
        correct: boolean
    ) => void;
};

export function FillinTheBlanks({
    sentence,
    translation,
    draggableWords,
    onValidate,
}: Props) {
    const { speak } = useSpeech();
    const [isSpeaking, setIsSpeaking] = useState(true);
    const [availableWords, setAvailableWords] =
        useState(draggableWords);
    const arabicSentence =
        sentenceToText(sentence);

    const initialPlacements = useMemo(() => {
        const obj: Record<string, string | null> =
            {};

        sentence.forEach((item) => {
            if (item.type === "drop") {
                obj[item.id] = null;
            }
        });

        return obj;
    }, [sentence]);

    const [placements, setPlacements] =
        useState(initialPlacements);

    useEffect(() => {
        setPlacements(initialPlacements);
        setAvailableWords(draggableWords);
    }, [sentence]);

    function handleDrop(
        dropId: string,
        word: string
    ) {
        setPlacements((prev) => {
            const updated = { ...prev };

            Object.keys(updated).forEach((key) => {
                if (updated[key] === word) {
                    updated[key] = null;
                }
            });

            updated[dropId] = word;

            return updated;
        });

        setAvailableWords((prev) =>
            prev.filter((w) => w !== word)
        );
    }

    function removeWord(dropId: string) {
        const word = placements[dropId];

        if (!word) return;

        setPlacements((prev) => ({
            ...prev,
            [dropId]: null,
        }));

        setAvailableWords((prev) => [
            ...prev,
            word,
        ]);
    }

    function validate() {
        let correct = true;

        sentence.forEach((item) => {
            if (item.type === "drop") {
                if (
                    placements[item.id] !== item.arabic
                ) {
                    correct = false;
                }
            }
        });

        onValidate?.(correct);
    }

    useEffect(() => {
        const interval = async () => {
            await speak(
                arabicSentence,
                "ar-MA"
            );
            setIsSpeaking(false);
        };

        interval()
    }, [sentence, translation]);

    return (
        <DropProvider >
            <ThemedView style={styles.container}>
                <ThemedView style={styles.sentenceContainer}>
                    <TouchableOpacity
                        onPress={() =>
                            speak(
                                arabicSentence,
                                "ar-MA"
                            )
                        }
                    >
                        <IconRefreshDot
                            size={24}
                            color="#666"
                        />

                    </TouchableOpacity>
                    <ThemedView style={styles.sentenceRow}>
                        {sentence.map((item, index) => {
                            if (item.type === "word") {
                                return (
                                    <ThemedText
                                        key={index}
                                        style={styles.word}
                                    >
                                        {item.value}
                                    </ThemedText>
                                );
                            }
                            return (
                                <Droppable
                                    key={item.id}
                                    onDrop={(word: string) =>
                                        handleDrop(item.id, word)
                                    }
                                >

                                    <ThemedView style={styles.dropZone}>
                                        <TouchableOpacity
                                            onPress={() =>
                                                speak(
                                                    item.arabic,
                                                    "ar-MA"
                                                )
                                            }
                                        >
                                            <IconVolume
                                                size={24}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                        {placements[item.id] ? (
                                            <Pressable
                                                onPress={() =>
                                                    removeWord(item.id)
                                                }
                                            >
                                                <ThemedText
                                                    style={styles.dropWord}
                                                >
                                                    {placements[item.id]}
                                                </ThemedText>
                                            </Pressable>
                                        ) : (
                                            <ThemedText
                                                style={styles.placeholder}
                                            >
                                                _____
                                            </ThemedText>
                                        )}
                                            <ThemedText>
                                                {item.french}
                                            </ThemedText>
                                    </ThemedView>
                                </Droppable>
                            );
                        })}
                    </ThemedView>

                    {/* Tradução */}
                    <ThemedText style={styles.translation}>
                        {translation}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.bank}>
                    {availableWords.map((word) => (
                        <Draggable
                            key={word}
                            data={word}
                        >
                            <ThemedView style={styles.card} darkColor="#333" lightColor="#e2e8f0">
                                <ThemedText style={styles.cardText}>
                                    {word}
                                </ThemedText>
                            </ThemedView>
                        </Draggable>
                    ))}
                </ThemedView>
                <Button
                    disabled={isSpeaking}
                    onPress={() => validate()} style={{ flexDirection: "row", gap: 6 }}>
                    <Button.Title>Vérifier</Button.Title>
                    <Button.Icon icon={IconSquareRoundedCheck} />
                </Button>
            </ThemedView>
        </DropProvider>
    );
}

const styles = StyleSheet.create({
    sentenceContainer: {
        gap: 14,
        
    },

    sentenceRow: {
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
    },

    translation: {
        fontSize: 18,
        color: "#666",
        textAlign: "right",
        fontStyle: "italic",
        //alignSelf: "flex-end",
        width: "auto"
    },
    container: {
        gap: 30,
    },
    word: {
        fontSize: 24,
        fontWeight: "600",
        writingDirection: "rtl",
        
    },

    dropZone: {
        minWidth: 80,
        minHeight: 45,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#999",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
    },

    placeholder: {
        color: "#999",
    },

    dropWord: {
        fontSize: 22,
        fontWeight: "700",
        writingDirection: "rtl",
    },

    bank: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },

    card: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
    },

    cardText: {
        fontSize: 18,
        fontWeight: "600",
    },

    checkButton: {
        //backgroundColor: "#111",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
});