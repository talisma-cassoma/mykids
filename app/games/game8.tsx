import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { IconVolume } from "@tabler/icons-react-native";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { Header } from "@/components/Header";
import { useGame } from "@/context/gameContext";
import { Colors } from "@/constants/Colors";
import { TimerConverter, useSpeech } from "@/utils/lessons";

type CountingQuestion = {
    id: string;
    targetCount: number;
};

// Dynamic counting parameters
const MIN_NUMBER = 0;
const MAX_NUMBER = 10;
const TOTAL_QUESTIONS = MAX_NUMBER - MIN_NUMBER + 1;
const ROUND_TIME_MS = 10000; // Increased timer for kids learning

function shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
}

// Generate options containing the correct number + 3 reasonable distractors
function createOptions(correctAnswer: number, min: number, max: number) {
    const optionSet = new Set<number>([correctAnswer]);

    while (optionSet.size < 4) {
        // Distractors close to target answer
        const adjustment = Math.floor(Math.random() * 3) + 1;
        const direction = Math.random() < 0.5 ? -1 : 1;
        const candidate = correctAnswer + direction * adjustment;

        if (candidate >= min && candidate <= max + 3 && candidate !== correctAnswer) {
            optionSet.add(candidate);
            continue;
        }

        const fallback = Math.floor(Math.random() * (max + 3 - min)) + min;
        if (fallback !== correctAnswer && fallback >= 0) {
            optionSet.add(fallback);
        }
    }

    return shuffle(Array.from(optionSet));
}

export default function CountingGameScreen() {
    const { nextStage, setGameScore, mode } = useGame();
    const { speak } = useSpeech();

    const [currentNumber, setCurrentNumber] = useState(MIN_NUMBER);
    const [score, setScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [question, setQuestion] = useState<CountingQuestion | null>(null);
    const [options, setOptions] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME_MS);
    const [isPaused, setIsPaused] = useState(false);
    const [hasFinished, setHasFinished] = useState(false);
    const [statusText, setStatusText] = useState<string>("Ready?");
    const [answerLocked, setAnswerLocked] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [revealAnswer, setRevealAnswer] = useState(false);

    const startTimeRef = useRef<number | null>(null);

    const gameTitle = useMemo(() => `Apprendre à compter: ${MIN_NUMBER} à ${MAX_NUMBER}`, []);

    const resetTimer = useCallback(() => {
        startTimeRef.current = Date.now();
        setTimeLeft(ROUND_TIME_MS);
    }, []);

    const speakCurrentNumber = useCallback(async (num: number) => {
        await speak(`${num}`, "fr-FR");
    }, [speak]);

    const loadQuestionForNumber = useCallback(async (num: number) => {
        if (num > MAX_NUMBER) {
            return;
        }

        const nextQuestion: CountingQuestion = {
            id: `count-${num}`,
            targetCount: num,
        };

        setQuestion(nextQuestion);
        setOptions(createOptions(num, MIN_NUMBER, MAX_NUMBER));
        setStatusText("Combien?");
        setAnswerLocked(false);
        setSelectedAnswer(null);
        setRevealAnswer(false);
        resetTimer();

        await speakCurrentNumber(num);
    }, [resetTimer, speakCurrentNumber]);

    useEffect(() => {
        if (!question || isPaused || hasFinished) {
            return;
        }

        const interval = setInterval(() => {
            if (!startTimeRef.current) {
                startTimeRef.current = Date.now();
            }

            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, ROUND_TIME_MS - elapsed);
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                handleTimeout();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [question, isPaused, hasFinished]);

    useEffect(() => {
        if (!question) {
            loadQuestionForNumber(MIN_NUMBER);
        }
    }, [loadQuestionForNumber, question]);

    const finishGame = useCallback((finalScore: number) => {
        if (hasFinished) {
            return;
        }

        setHasFinished(true);
        setGameScore((prev) => [
            ...prev,
            {
                score: `${finalScore}/${TOTAL_QUESTIONS} · erreurs: ${wrongAnswers}`,
                name: gameTitle,
                duration: TimerConverter(Math.max(1, Math.round(finalScore * 4))),
            },
        ]);
        nextStage();
    }, [gameTitle, hasFinished, nextStage, setGameScore, wrongAnswers]);

    const handleAnswer = useCallback(async (value: number) => {
        if (!question || answerLocked || hasFinished) {
            return;
        }

        setAnswerLocked(true);
        setSelectedAnswer(value);
        setRevealAnswer(true);

        const isCorrect = value === question.targetCount;

        if (isCorrect) {
            const nextScore = score + 1;
            const nextNum = currentNumber + 1;
            
            setStatusText("Bravo!");
            await speak("Bravo!", "fr-FR");
            setScore(nextScore);

            if (nextNum > MAX_NUMBER) {
                finishGame(nextScore);
                return;
            }

            setCurrentNumber(nextNum);
            setTimeout(() => {
                setStatusText("Suivant!");
                loadQuestionForNumber(nextNum);
            }, 800);
            return;
        }

        setStatusText("Essaie encore!");
        setWrongAnswers((prev) => prev + 1);
        await speak("Faux", "fr-FR");

        // Repeat the same number on mistake so the child masters sequence
        setTimeout(() => {
            loadQuestionForNumber(currentNumber);
        }, 800);
    }, [answerLocked, currentNumber, finishGame, hasFinished, loadQuestionForNumber, question, score, speak]);

    const handleTimeout = useCallback(async () => {
        if (!question || answerLocked || hasFinished) {
            return;
        }

        setAnswerLocked(true);
        setSelectedAnswer(null);
        setRevealAnswer(true);
        setStatusText("Temps écoulé!");
        setWrongAnswers((prev) => prev + 1);
        await speak("Oops", "fr-FR");

        setTimeout(() => {
            loadQuestionForNumber(currentNumber);
        }, 350);
    }, [answerLocked, currentNumber, hasFinished, loadQuestionForNumber, question, speak]);

    const handleToggle = () => {
        setIsPaused((prev) => !prev);
        if (isPaused) {
            resetTimer();
        }
    };

    if (!question) {
        return (
            <ThemedSafeAreaView>
                <Header
                    gameDescription={gameTitle}
                    playAndPauseButton={{
                        isActive: true,
                        resumeStatus: isPaused ? "paused" : "playing",
                        onToggle: handleToggle,
                    }}
                    timer={{
                        isActive: true,
                        mode: "decreasing",
                        time: Math.ceil(timeLeft / 1000),
                    }}
                    score={{
                        isActive: true,
                        current: score,
                        total: TOTAL_QUESTIONS,
                    }}
                />
            </ThemedSafeAreaView>
        );
    }

    return (
        <ThemedSafeAreaView>
            <Header
                gameDescription={gameTitle}
                playAndPauseButton={{
                    isActive: true,
                    resumeStatus: isPaused ? "paused" : "playing",
                    onToggle: handleToggle,
                }}
                timer={{
                    isActive: true,
                    mode: "decreasing",
                    time: Math.ceil(timeLeft / 1000),
                }}
                score={{
                    isActive: true,
                    current: score,
                    total: TOTAL_QUESTIONS,
                }}
            />

            <View style={styles.board}>
                <View style={styles.questionCard}>
                    <View style={styles.promptContainer}>
                        <Text style={[styles.prompt, { color: Colors[mode].text }]}>
                            {/* {question.targetCount} */}
                        </Text>
                        <TouchableOpacity
                            style={styles.volumeButton}
                            activeOpacity={0.7}
                            onPress={() => speakCurrentNumber(question.targetCount)}
                        >
                            <IconVolume size={36} color={Colors[mode].text} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.statusText, { color: Colors[mode].text }]}>
                        {statusText}
                    </Text>
                    <Text style={[styles.mistakeText, { color: Colors[mode].text }]}>
                        Erreurs: {wrongAnswers}
                    </Text>
                </View>

                <View style={styles.optionsGrid}>
                    {options.map((value) => {
                        const isCorrectOption = revealAnswer && value === question.targetCount;
                        const isSelectedWrong = revealAnswer && selectedAnswer === value && !isCorrectOption;

                        return (
                            <TouchableOpacity
                                key={`${question.id}-${value}`}
                                activeOpacity={0.8}
                                style={[
                                    styles.optionButton,
                                    {
                                        backgroundColor: Colors[mode].background,
                                        borderColor: isCorrectOption
                                            ? "#22c55e"
                                            : isSelectedWrong
                                                ? "#ef4444"
                                                : "rgba(255,255,255,0.2)",
                                        borderWidth: isCorrectOption || isSelectedWrong ? 3 : 1,
                                    },
                                ]}
                                onPress={() => handleAnswer(value)}
                                disabled={answerLocked || isPaused || hasFinished}
                            >
                                <Text style={[styles.optionText, { color: Colors[mode].text }]}>
                                    {value}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    board: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    questionCard: {
        width: "100%",
        maxWidth: 520,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 20,
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: "center",
        marginBottom: 24,
    },
    promptContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
    },
    prompt: {
        fontSize: 64,
        fontWeight: "800",
        textAlign: "center",
    },
    volumeButton: {
        padding: 10,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    statusText: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: "600",
        opacity: 0.8,
    },
    mistakeText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: "700",
        opacity: 0.9,
    },
    optionsGrid: {
        width: "100%",
        maxWidth: 520,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 12,
    },
    optionButton: {
        width: "46%",
        minHeight: 64,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
    },
    optionText: {
        fontSize: 32,
        fontWeight: "700",
    },
});