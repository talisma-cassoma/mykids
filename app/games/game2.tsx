import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSwitchHorizontal } from "@tabler/icons-react-native"
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { ArabicKeyboard } from "@/components/ArabicKeyboard";
import { useGame } from "@/context/gameContext";

import { speak, gameData, GameStage, WordPair, TimerConverter } from "@/utils/lessons";

export default function WriteTheWordsGameScreen() {
    const gameTittle = "ecris le mot en arabe"

    const [time, setTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    // verification
    const [isDoubleCheck, setIsDoubleCheck] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const { nextStage, setGameScore } = useGame();

    const [currentLesson, setCurrentLesson] = useState<GameStage | null>(null);
    const [currentWord, setCurrentWord] = useState<WordPair | null>(null);

    const [userInput, setUserInput] = useState("");
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isButtonLoading, setIsButtonLoading] = useState(false);

    const isMatch = userInput.trim() === currentWord?.ar;

    // ⏱ Timer
    useEffect(() => {
        if (!isTimerRunning) return;

        const interval = setInterval(() => {
            setTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerRunning]);

    // 🎯 escolher lesson
    const pickRandomLesson = () => {
        return gameData[Math.floor(Math.random() * gameData.length)];

    };

    // 🎯 escolher palavra
    const pickRandomWord = (lesson: GameStage) => {
        return lesson.wordPairs[
            Math.floor(Math.random() * lesson.wordPairs.length)
        ];
    };

    // 🚀 init
    useEffect(() => {
        const lesson = pickRandomLesson();
        setCurrentLesson(lesson);
    }, []);

    // 🎯 nova palavra
   useEffect(() => {
    if (!currentLesson) return;

    const word = pickRandomWord(currentLesson);
    setCurrentWord(word);
    setUserInput("");
    setIsCorrect(null);
    setIsDoubleCheck(false); // 🔥 important
}, [currentLesson]);

    // 🔊 falar palavra
    useEffect(() => {
        if (!currentWord) return;
        speak(currentWord.ar, "ar-MA");
    }, [currentWord]);

    // ✅ validar
    const checkAnswer = () => {
        if (!currentWord) return;

        if (isMatch) {
            if (!isDoubleCheck) {
                // ✅ 1ère réussite → activer double check
                setIsDoubleCheck(true);
                setShowModal(true);
                setUserInput(""); // vider pour réécriture
            } else {
                // ✅ 2ème réussite → validation finale
                setIsCorrect(true);
            }
        } else {
            setIsCorrect(false);
        }
    };

    const pickAnotherWord = () => {
        if (!currentLesson) return;

        const newWord = pickRandomWord(currentLesson);
        setCurrentWord(newWord);
        setUserInput("");
        setIsCorrect(null);
    };

    //speak in each 5s
    useEffect(() => {
        if (!currentWord) return;

        const interval = setInterval(async () => {
            await speak(currentWord.ar, "ar-MA");
            await new Promise(resolve => setTimeout(resolve, 2000));
            await speak(currentWord.fr, "fr-FR");
        }, 7000);

        return () => clearInterval(interval);
    }, [currentWord]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
            <Header
                gameDescription={gameTittle}
                timer={{
                    isActive: true,
                    mode: "increasing",
                    time: time,
                }}
            />
            {/* <TouchableOpacity onPress={pickAnotherWord} style={styles.changeWordBtn}>
               <IconSwitchHorizontal size={24}  />
            </TouchableOpacity> */}
            <Modal visible={showModal} 
                transparent animationType="fade">
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    
                }}>
                    <View style={{
                        backgroundColor: "#fff",
                        padding: 20,
                        borderRadius: 10,
                        width: "80%",
                        height:"80%",
                        maxHeight: 300,
                        maxWidth:400,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 10
                    }}>
                          <Image
                                source={require("@/assets/images/celebration.gif")}
                                style={{
                                flex:1,
                                resizeMode: "contain"
                                }}
                              />
                        <Text style={{ fontSize: 18, marginBottom: 10 }}>
                            Maintenant, réécris le mot sans aide
                        </Text>

                        <TouchableOpacity
                            onPress={() => setShowModal(false)}
                            style={styles.validateBtn}
                        >
                            <Text style={{ color: "#fff" }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.text}>{currentWord?.fr}</Text>

                <View style={{ flexDirection: "row", gap: 10 }}>
                    <TextInput
                        value={userInput}
                        editable={false}
                        style={{
                            borderWidth: 1,
                            borderColor: isCorrect === false ? "crimson" : "#ccc",
                            padding: 10,
                            width: 200,
                            textAlign: "right",
                            fontSize: 20,
                            borderRadius: 8,
                        }}
                    />

                    <TouchableOpacity onPress={checkAnswer} style={styles.validateBtn}>
                        <Text style={{ color: "#fff" }}>Valider</Text>
                    </TouchableOpacity>
                </View>
                {!isDoubleCheck && (
                    <Text style={{ fontSize: 16 }}>
                        {currentWord?.ar}
                    </Text>
                )}
                <ArabicKeyboard value={userInput} onChange={setUserInput} />

                <View style={{ flexDirection: "row", marginTop: 10 }}>
                    <TouchableOpacity
                        onPress={() => setUserInput("")}
                        style={styles.clearBtn}
                    >
                        <Text style={{ color: "#fff" }}>Nettoyer</Text>
                    </TouchableOpacity>
                </View>

                {isCorrect
                    && (
                        <Button
                            onPress={() => {
                                setIsButtonLoading(true);
                                setGameScore(prev => [
                                    ...prev,
                                    {
                                        score: `a écrit ${currentWord?.ar}`,
                                        name: gameTittle,
                                        duration: TimerConverter(time),
                                    },
                                ]);
                                nextStage();
                            }}
                            isLoading={isButtonLoading}
                        >
                            <Button.Title>Avancer</Button.Title>
                        </Button>
                    )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "space-around",
        maxWidth: 400,
        alignSelf: "center",
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
    },
    validateBtn: {
        backgroundColor: "#4caf50",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        borderRadius: 8,
    },

    clearBtn: {
        padding: 10,
        backgroundColor: "#999",
        borderRadius: 8,
    },
    changeWordBtn: {
        marginTop: 10,
        //backgroundColor: "#2196f3",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        alignSelf: "flex-end"
    },
});