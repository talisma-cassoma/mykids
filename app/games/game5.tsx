import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Image,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from 'react-native-linear-gradient'

import { ArabicKeyboard } from "@/components/ArabicKeyboard";
import { useGame } from "@/context/gameContext";

import {
    useSpeech,
    GameStage,
    WordPair,
    TimerConverter,
} from "@/utils/lessons";

const gameData: GameStage[] = [
    {
        lessonTitle: "salutations",
        wordPairs: [
            { id: "1", fr: "Bonjour", ar: "مرحبا" },
            { id: "2", fr: "Merci", ar: "شكرا" },
            // { id: "3", fr: "Chat", ar: "قط" },
            // { id: "4", fr: "Maison", ar: "منزل" },
        ],
    },
];

type EmojiEmotion = "defy" | "correct" | "wrong" | "wait";

export default function WriteTheWordsIfRememberGameScreen() {
    const gameTitle = "écris le mot en arabe";

    const { speak } = useSpeech();

    const [time, setTime] = useState(0);
    const [emojiEmotion, setEmojiEmotion] =
        useState<EmojiEmotion>("defy");

    const { nextStage, setGameScore } = useGame();

    const [currentLesson, setCurrentLesson] =
        useState<GameStage | null>(null);

    const [userInput, setUserInput] = useState("");
    const [isCorrect, setIsCorrect] =
        useState<boolean | null>(null);

    const wordPairsIndex = useRef(0);

    const [currentWord, setCurrentWord] =
        useState<WordPair | null>(
            gameData[0].wordPairs[wordPairsIndex.current]
        );

    // Init lesson
    useEffect(() => {
        setCurrentLesson(gameData[0]);
    }, []);

    // Speak current Arabic word
    useEffect(() => {
        if (!currentWord) return;
        speak(currentWord.ar, "ar-MA");
    }, [currentWord]);

    const nextWord = () => {
        if (
            wordPairsIndex.current <
            gameData[0].wordPairs.length - 1
        ) {
            wordPairsIndex.current += 1;
            setCurrentWord(
                gameData[0].wordPairs[wordPairsIndex.current]
            );
            setUserInput("");
            setIsCorrect(null);
        }
    };

    const checkAnswer = () => {
        if (!currentWord) return;

        const isMatch = userInput.trim() === currentWord.ar;

        if (isMatch) {
            setIsCorrect(true);
            setEmojiEmotion("correct");

            setTimeout(() => {
                setEmojiEmotion("wait");
                nextWord();
            }, 1500);
        } else {
            setIsCorrect(false);
            setEmojiEmotion("wrong");

            setTimeout(() => {
                setEmojiEmotion("wait");
            }, 1500);
        }
    };

    const isLastWord =
        wordPairsIndex.current ===
        gameData[0].wordPairs.length - 1;

    /**
      * AUTO SPEAK Q2
      */
    useEffect(() => {
        const interval = setInterval(() => {
            if (!currentWord) return;
            speak(
                currentWord?.ar,
                "ar-MA"
            );
        }, 7000);

        return () => clearInterval(interval);
    }, [currentWord]);

    return (
        //    <LinearGradient 
        //    start={{ x: 0, y: 0 }}
        //    end={{ x: 1, y: 1 }}
        //    colors={[
        //             "#6f8f9f",
        //             "#87a8b8",
        //             "#9abacb",
        //             "#9abacb",
        //         ]}
        //         style={{ flex: 1 }}
        //     >
        <SafeAreaView style={styles.safeArea}>
            <Text style={styles.text}>
                Écris ce que tu entends
            </Text>
            <Image
                source={
                    emojiEmotion === "correct"
                        ? require("@/assets/images/emoji_correct.gif")
                        : emojiEmotion === "wrong"
                            ? require("@/assets/images/emoji_wrong.gif")
                            : emojiEmotion === "wait"
                                ? require("@/assets/images/emoji_wait.gif")
                                : require("@/assets/images/emoji_defy1.gif")
                }
                style={styles.emoji}
            />

            <ScrollView
                contentContainerStyle={styles.container}
            >
                {isLastWord && isCorrect === true ? (
                    <TouchableOpacity
                        onPress={() => {
                            setGameScore((prev) => [
                                ...prev,
                                {
                                    score: "validé",
                                    name: gameTitle,

                                },
                            ]);

                            nextStage();
                        }}
                        style={styles.validateBtn}
                    >
                        <Text style={styles.btnText}>
                            Avancer
                        </Text>
                    </TouchableOpacity>
                ) : (

                    <View style={styles.inputArea}>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <TextInput
                                value={userInput}
                                editable={false}
                                style={[
                                    styles.input,
                                    isCorrect === false && {
                                        borderColor: "crimson",
                                    },
                                ]}
                            />
                            <TouchableOpacity
                                onPress={checkAnswer}
                                style={styles.validateBtn}
                            >
                                <Text style={styles.btnText}>
                                    Valider
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* <Text style={styles.answerPreview}>
                            {currentWord?.ar}
                        </Text> */}

                        <ArabicKeyboard
                            value={userInput}
                            onChange={setUserInput}
                        />

                        <TouchableOpacity
                            onPress={() => setUserInput("")}
                            style={styles.clearBtn}
                        >
                            <Text style={styles.btnText}>
                                Nettoyer
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
        // </LinearGradient>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#9abacb",
        padding: 20,
        alignItems: "center",
        justifyContent: "space-between",
    },

    emoji: {
        flex: 1,
        minWidth: 250,
        minHeight: 250,
        resizeMode: "contain",
    },

    container: {
        alignItems: "center",
        justifyContent: "space-around",
        maxWidth: 400,
        alignSelf: "center",
        width: "100%",
    },

    text: {
        fontSize: 22,
        marginBottom: 20,
        fontWeight: "600",
    },

    inputArea: {
        flexDirection: "column",
        gap: 10,
        marginBottom: 20,
        width: "100%",
        alignItems: "center",
    },

    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        textAlign: "right",
        fontSize: 20,
        borderRadius: 8,
        backgroundColor: "#eee",
    },

    validateBtn: {
        backgroundColor: "#4caf50",
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        borderRadius: 8,
    },

    clearBtn: {
        marginTop: 20,
        padding: 12,
        backgroundColor: "#999",
        borderRadius: 8,
    },

    btnText: {
        color: "#fff",
        fontWeight: "600",
    },

    answerPreview: {
        fontSize: 18,
        marginBottom: 20,
    },
});