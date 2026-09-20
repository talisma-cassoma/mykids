import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { Header } from "@/components/Header";
import { useGame } from "@/context/gameContext";
import { Colors } from "@/constants/Colors";
import { TimerConverter, useSpeech } from "@/utils/lessons";

type Question = {
    id: string;
    left: number;
    right: number;
    answer: number;
};

type QuestionSource = "original" | "mistake";

const ROUND_TIME_MS = 5000;
const TOTAL_QUESTIONS_GOAL = 20;
const MULTIPLICATION_LIMIT = 12;

const allQuestions: Question[] = Array.from(
    { length: (MULTIPLICATION_LIMIT + 1) ** 2 },
    (_, index) => {
        const left = Math.floor(index / (MULTIPLICATION_LIMIT + 1));
        const right = index % (MULTIPLICATION_LIMIT + 1);
        return {
            id: `${left}x${right}`,
            left,
            right,
            answer: left * right,
        };
    }
);

function shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
}

function createInitialPool(): Question[] {
    return shuffle(allQuestions).slice(0, TOTAL_QUESTIONS_GOAL);
}

function createOptions(correctAnswer: number) {
    const optionSet = new Set<number>([correctAnswer]);

    while (optionSet.size < 4) {
        const adjustment = Math.floor(Math.random() * 12) + 1;
        const direction = Math.random() < 0.5 ? -1 : 1;
        const candidate = correctAnswer + direction * adjustment;

        if (candidate >= 0 && candidate <= 144 && candidate !== correctAnswer) {
            optionSet.add(candidate);
            continue;
        }

        const fallback = Math.floor(Math.random() * 145);
        if (fallback !== correctAnswer) {
            optionSet.add(fallback);
        }
    }

    return shuffle(Array.from(optionSet)).slice(0, 4);
}

export default function MultiplicationGameScreen() {
    const { nextStage, setGameScore, mode } = useGame();
    const { speak } = useSpeech();

    // Pools Principais
    const [originalPool, setOriginalPool] = useState<Question[]>(() => createInitialPool());
    const [mistakePool, setMistakePool] = useState<Question[]>([]);
    const [correctPool, setCorrectPool] = useState<Question[]>([]);

    const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [currentSource, setCurrentSource] = useState<QuestionSource | null>(null);
    const [options, setOptions] = useState<number[]>([]);
    
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME_MS);
    const [isPaused, setIsPaused] = useState(false);
    const [hasFinished, setHasFinished] = useState(false);
    const [statusText, setStatusText] = useState<string>("Ready?");
    const [answerLocked, setAnswerLocked] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [revealAnswer, setRevealAnswer] = useState(false);
    
    const startTimeRef = useRef<number | null>(null);
    const gameTitle = useMemo(() => "Rapid-fire multiplication trainer", []);

    // A fonte da verdade para o Score é o tamanho da correctPool
    const score = correctPool.length;

    const resetTimer = useCallback(() => {
        startTimeRef.current = Date.now();
        setTimeLeft(ROUND_TIME_MS);
    }, []);

    const finishGame = useCallback((finalCorrectCount: number, finalWrongCount: number) => {
        if (hasFinished) return;

        setHasFinished(true);
        setGameScore((prev) => [
            ...prev,
            {
                score: `${finalCorrectCount}/${TOTAL_QUESTIONS_GOAL} · erros: ${finalWrongCount}`,
                name: gameTitle,
                duration: TimerConverter(Math.max(1, Math.round(finalCorrectCount * 4))),
            },
        ]);
        nextStage();
    }, [gameTitle, hasFinished, nextStage, setGameScore]);

    // Seleção com base nas 3 Pools
    const selectNextQuestion = useCallback(() => {
        if (correctPool.length >= TOTAL_QUESTIONS_GOAL) {
            finishGame(correctPool.length, wrongAnswersCount);
            return;
        }

        const hasOriginal = originalPool.length > 0;
        const hasMistakes = mistakePool.length > 0;

        if (!hasOriginal && !hasMistakes) {
            finishGame(correctPool.length, wrongAnswersCount);
            return;
        }

        // Regra dos 25% de chance para mistake pool (se ambas existirem)
        let source: QuestionSource = "original";
        if (hasOriginal && hasMistakes) {
            source = Math.random() < 0.25 ? "mistake" : "original";
        } else if (hasMistakes) {
            source = "mistake";
        }

        const targetPool = source === "original" ? originalPool : mistakePool;
        const randomIndex = Math.floor(Math.random() * targetPool.length);
        const selected = targetPool[randomIndex];

        setCurrentQuestion(selected);
        setCurrentSource(source);
        setOptions(createOptions(selected.answer));
        setStatusText("Solve it!");
        setAnswerLocked(false);
        setSelectedAnswer(null);
        setRevealAnswer(false);
        resetTimer();

        speak(`${selected.left} fois ${selected.right}`, "fr-FR");
    }, [correctPool.length, originalPool, mistakePool, wrongAnswersCount, finishGame, resetTimer, speak]);

    // Loop inicial quando não há questão carregada
    useEffect(() => {
        if (!currentQuestion && !hasFinished) {
            selectNextQuestion();
        }
    }, [currentQuestion, hasFinished, selectNextQuestion]);

    // Timer Interval
    useEffect(() => {
        if (!currentQuestion || isPaused || hasFinished || answerLocked) {
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
    }, [currentQuestion, isPaused, hasFinished, answerLocked]);

    const processAnswer = useCallback(async (isCorrect: boolean, value: number | null) => {
        if (!currentQuestion || answerLocked || hasFinished) return;

        setAnswerLocked(true);
        setSelectedAnswer(value);
        setRevealAnswer(true);

        if (isCorrect) {
            setStatusText("Correct!");
            await speak("Correct!", "fr-FR");

            // Mover para a correctPool e remover de onde veio
            setCorrectPool((prev) => [...prev, currentQuestion]);

            if (currentSource === "original") {
                setOriginalPool((prev) => prev.filter((q) => q.id !== currentQuestion.id));
            } else {
                setMistakePool((prev) => prev.filter((q) => q.id !== currentQuestion.id));
            }

            // Checar condição de vitória imediata
            if (correctPool.length + 1 >= TOTAL_QUESTIONS_GOAL) {
                finishGame(TOTAL_QUESTIONS_GOAL, wrongAnswersCount);
                return;
            }
        } else {
            setStatusText(value === null ? "Time's up!" : "Oops!");
            setWrongAnswersCount((prev) => prev + 1);
            await speak(value === null ? "Oops" : "Faux", "fr-FR");

            // Se veio da original, remove da original e adiciona na mistakePool
            if (currentSource === "original") {
                setOriginalPool((prev) => prev.filter((q) => q.id !== currentQuestion.id));
                setMistakePool((prev) => 
                    prev.some((q) => q.id === currentQuestion.id) ? prev : [...prev, currentQuestion]
                );
            }
            // Se veio da mistake, permanece na mistakePool
        }

        setTimeout(() => {
            selectNextQuestion();
        }, 800);
    }, [currentQuestion, answerLocked, hasFinished, currentSource, correctPool.length, wrongAnswersCount, speak, finishGame, selectNextQuestion]);

    const handleAnswer = (value: number) => {
        if (!currentQuestion) return;
        processAnswer(value === currentQuestion.answer, value);
    };

    const handleTimeout = () => {
        processAnswer(false, null);
    };

    const handleToggle = () => {
        setIsPaused((prev) => !prev);
        if (isPaused) {
            resetTimer();
        }
    };

    if (!currentQuestion) {
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
                        total: TOTAL_QUESTIONS_GOAL,
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
                    total: TOTAL_QUESTIONS_GOAL,
                }}
            />

            <View style={styles.board}>
                <View style={styles.questionCard}>
                    <Text style={[styles.prompt, { color: Colors[mode].text }]}>
                        {currentQuestion.left} × {currentQuestion.right}
                    </Text>
                    <Text style={[styles.statusText, { color: Colors[mode].text }]}>{statusText}</Text>
                    <Text style={[styles.mistakeText, { color: Colors[mode].text }]}>
                        Erreurs: {wrongAnswersCount}
                    </Text>
                </View>

                <View style={styles.optionsGrid}>
                    {options.map((value) => {
                        const isCorrectOption = revealAnswer && value === currentQuestion.answer;
                        const isSelectedWrong = revealAnswer && selectedAnswer === value && !isCorrectOption;

                        return (
                            <TouchableOpacity
                                key={`${currentQuestion.id}-${value}`}
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
                                <Text style={[styles.optionText, { color: Colors[mode].text }]}>{value}</Text>
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
    prompt: {
        fontSize: 52,
        fontWeight: "800",
        textAlign: "center",
    },
    statusText: {
        marginTop: 12,
        fontSize: 16,
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
        fontSize: 28,
        fontWeight: "700",
    },
});