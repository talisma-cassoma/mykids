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

const ROUND_TIME_MS = 4000;
const WIN_SCORE = 20;
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

function createRandomMainPool() {
    return shuffle(allQuestions).slice(0, 20);
}

function chooseQuestionFromQueues(randomPool: Question[], mistakePool: Question[]) {
    const hasMain = randomPool.length > 0;
    const hasMistakes = mistakePool.length > 0;

    if (!hasMain && !hasMistakes) {
        return null;
    }

    const useMainQueue = hasMain && (!hasMistakes || Math.random() < 0.75);
    const sourceQueue = useMainQueue ? randomPool : mistakePool;
    const selectedIndex = Math.floor(Math.random() * sourceQueue.length);
    const selectedQuestion = sourceQueue[selectedIndex];

    return {
        question: selectedQuestion,
        source: useMainQueue ? "main" : "mistake",
        index: selectedIndex,
    };
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
    const [score, setScore] = useState(0);
    const [question, setQuestion] = useState<Question | null>(null);
    const [options, setOptions] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME_MS);
    const [randomPool, setRandomPool] = useState<Question[]>(() => createRandomMainPool());
    const [mistakePool, setMistakePool] = useState<Question[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const [hasFinished, setHasFinished] = useState(false);
    const [statusText, setStatusText] = useState<string>("Ready?");
    const [answerLocked, setAnswerLocked] = useState(false);
    const startTimeRef = useRef<number | null>(null);

    const gameTitle = useMemo(() => "Rapid-fire multiplication trainer", []);

    const resetTimer = useCallback(() => {
        startTimeRef.current = Date.now();
        setTimeLeft(ROUND_TIME_MS);
    }, []);

    const generateNextQuestion = useCallback(() => {
        const selected = chooseQuestionFromQueues(randomPool, mistakePool);

        if (!selected) {
            const replacementQueue = createRandomMainPool();
            setRandomPool(replacementQueue);
            const fallbackQuestion = replacementQueue[0];

            if (!fallbackQuestion) {
                return;
            }

            setQuestion(fallbackQuestion);
            setOptions(createOptions(fallbackQuestion.answer));
            setStatusText("Solve it!");
            setAnswerLocked(false);
            resetTimer();
            return;
        }

        const { question: nextQuestion, source, index } = selected;

        if (source === "main") {
            setRandomPool((prev) => prev.filter((_, i) => i !== index));
        } else {
            setMistakePool((prev) => prev.filter((_, i) => i !== index));
        }

        setQuestion(nextQuestion);
        setOptions(createOptions(nextQuestion.answer));
        setStatusText("Solve it!");
        setAnswerLocked(false);
        resetTimer();
    }, [randomPool, mistakePool, resetTimer]);

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
            generateNextQuestion();
            return;
        }

        speak(`${question.left} fois ${question.right}`, "fr-FR");
    }, [question, generateNextQuestion, speak]);

    const finishGame = useCallback((finalScore: number) => {
        if (hasFinished) {
            return;
        }

        setHasFinished(true);
        setGameScore((prev) => [
            ...prev,
            {
                score: `${finalScore}/${WIN_SCORE}`,
                name: gameTitle,
                duration: TimerConverter(Math.max(1, Math.round(finalScore * 4))),
            },
        ]);
        nextStage();
    }, [gameTitle, hasFinished, nextStage, setGameScore]);

    const handleAnswer = useCallback((value: number) => {
        if (!question || answerLocked || hasFinished) {
            return;
        }

        setAnswerLocked(true);

        const isCorrect = value === question.answer;

        if (isCorrect) {
            const nextScore = score + 1;
            setStatusText("Correct!");
            speak("Correct!", "fr-FR");
            setRandomPool((prev) => prev.filter((item) => item.id !== question.id));
            setMistakePool((prev) => prev.filter((item) => item.id !== question.id));
            setScore(nextScore);

            if (nextScore >= WIN_SCORE) {
                finishGame(nextScore);
                return;
            }

            setTimeout(() => {
                setStatusText("Next!");
                generateNextQuestion();
            }, 300);
            return;
        }

        setStatusText("Oops!");
        speak("Faux", "fr-FR");
        setRandomPool((prev) => prev.filter((item) => item.id !== question.id));
        setMistakePool(prev =>
            prev.some(item => item.id === question.id)
                ? prev
                : [...prev, question]
        );

        setTimeout(() => {
            generateNextQuestion();
        }, 350);
    }, [answerLocked, generateNextQuestion, finishGame, hasFinished, question, score]);

    const handleTimeout = useCallback(() => {
        if (!question || answerLocked || hasFinished) {
            return;
        }

        setAnswerLocked(true);
        setStatusText("Time's up!");
        speak("Faux", "fr-FR");
        setRandomPool((prev) => prev.filter((item) => item.id !== question.id));
        setMistakePool(prev =>
            prev.some(item => item.id === question.id)
                ? prev
                : [...prev, question]
        );

        setTimeout(() => {
            generateNextQuestion();
        }, 350);
    }, [answerLocked, generateNextQuestion, hasFinished, question]);

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
                        total: WIN_SCORE,
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
                    total: WIN_SCORE,
                }}
            />

            <View style={styles.board}>
                <View style={styles.questionCard}>
                    <Text style={[styles.prompt, { color: Colors[mode].text }]}>{question.left} × {question.right}</Text>
                    <Text style={[styles.statusText, { color: Colors[mode].text }]}>{statusText}</Text>
                </View>

                <View style={styles.optionsGrid}>
                    {options.map((value) => (
                        <TouchableOpacity
                            key={`${question.id}-${value}`}
                            activeOpacity={0.8}
                            style={[
                                styles.optionButton,
                                { backgroundColor: Colors[mode].background },
                            ]}
                            onPress={() => handleAnswer(value)}
                            disabled={answerLocked || isPaused || hasFinished}
                        >
                            <Text style={[styles.optionText, { color: Colors[mode].text }]}>{value}</Text>
                        </TouchableOpacity>
                    ))}
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