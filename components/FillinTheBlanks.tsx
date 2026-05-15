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
} from "react-native";

import {
    DropProvider,
    Draggable,
    Droppable,
} from "react-native-reanimated-dnd";

import { Button } from "@/components/Button";
import { IconSquareRoundedCheck } from "@tabler/icons-react-native";
import { useSpeech, sentenceToText } from "@/utils/lessons";
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
    const [isSpeaking, setIsSpeaking] = useState(false);
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
                    placements[item.id] !== item.answer
                ) {
                    correct = false;
                }
            }
        });

        onValidate?.(correct);
    }

    useEffect(() => {
        const interval = setInterval(async () => {
            await speak(
                arabicSentence,
                "ar-MA"
            );
        }, 4000);
        return () => clearInterval(interval);
    }, [sentence, translation]);

    return (
        <DropProvider>
            <View style={styles.container}>
                <View style={styles.sentenceContainer}>
                    <View style={styles.sentenceRow}>
                        {sentence.map((item, index) => {
                            if (item.type === "word") {
                                return (
                                    <Text
                                        key={index}
                                        style={styles.word}
                                    >
                                        {item.value}
                                    </Text>
                                );
                            }
                            return (
                                <Droppable
                                    key={item.id}
                                    onDrop={(word: string) =>
                                        handleDrop(item.id, word)
                                    }
                                >
                                    <View style={styles.dropZone}>
                                        {placements[item.id] ? (
                                            <Pressable
                                                onPress={() =>
                                                    removeWord(item.id)
                                                }
                                            >
                                                <Text
                                                    style={styles.dropWord}
                                                >
                                                    {placements[item.id]}
                                                </Text>
                                            </Pressable>
                                        ) : (
                                            <Text
                                                style={styles.placeholder}
                                            >
                                                _____
                                            </Text>
                                        )}
                                    </View>
                                </Droppable>
                            );
                        })}
                    </View>

                    {/* Tradução */}
                    <Text style={styles.translation}>
                        {translation}
                    </Text>
                </View>

                <View style={styles.bank}>
                    {availableWords.map((word) => (
                        <Draggable
                            key={word}
                            data={word}
                        >
                            <View style={styles.card}>
                                <Text style={styles.cardText}>
                                    {word}
                                </Text>
                            </View>
                        </Draggable>
                    ))}
                </View>
                <Button onPress={() => validate()} style={{ flexDirection: "row", gap: 6 }}>
                    <Button.Title>Vérifier</Button.Title>
                    <Button.Icon icon={IconSquareRoundedCheck} />
                </Button>
            </View>
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
        width:"auto"
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
        backgroundColor: "#e2e8f0",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },

    cardText: {
        fontSize: 18,
        fontWeight: "600",
    },

    checkButton: {
        backgroundColor: "#111",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
});