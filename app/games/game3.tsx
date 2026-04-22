
import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { ArabicKeyboard } from "@/components/ArabicKeyboard";
import { useGame } from "@/context/gameContext";
import { speak, TimerConverter } from "@/utils/lessons";

const data = {
    id: "txt_002",
    title: "قطة متضامنة",
    content: {
        arabic_text:
            "لسارة قطة لطيفة، تحبها كثيرًا، وتقدم لها الطعام بانتظام، وتعتني بصحتها. وبعد مدة لاحظت سارة أن قطتها أصبحت تأخذ الطعام وتختفي بسرعة، دون أن تتناول منه شيئًا. قررت سارة أن تكتشف السرّ. وعندما حان وقت الطعام، قدمت لقطتها سمكة؛ فأخذتها، وانطلقت كالسهم تعدو. تبعتها سارة، وهي تتجه نحو مكان مهجور، فرأتها تضع السمكة أمام قطة أخرى، ولدت حديثًا قطيطات. تعجبت سارة، وأصبحت منذ ذلك اليوم، تقدم لقطتها مزيدًا من الطعام.",
        french_translation:
            "Sara a une gentille chatte qu’elle aime beaucoup. Elle lui donne régulièrement de la nourriture et prend soin de sa santé. Après quelque temps, Sara remarqua que sa chatte prenait la nourriture et disparaissait rapidement sans rien manger. Sara décida de découvrir le secret. Quand l’heure du repas arriva, elle donna un poisson à sa chatte ; celle-ci le prit et partit en courant comme une flèche. Sara la suivit vers un endroit abandonné et la vit poser le poisson devant une autre chatte qui venait de mettre bas à de petits chatons. Sara fut étonnée, et depuis ce jour-là, elle donna davantage de nourriture à sa chatte.",
    },

    generated_questions: {
        q1_main_idea: {
            question: "De quoi parle le texte ?",
            correct_answer: "Une chatte solidaire",
            options: [
                "Une chatte solidaire",
                "Un oiseau blessé",
                "Une école abandonnée",
            ],
        },

        q2_listening_word: {
            question: "Sélectionne le mot que tu entends",
            audio_word: "قطة",
            correct_answer: "قطة",
            options: ["عصفور", "قطة", "سمكة"],
        },

        q3_write_word: {
            question: "Écris ce mot",
            target_word: "سمكة",
        },

        q4_complete_sentence: {
            question: "Complète la phrase",
            sentence: "لسارة ____ لطيفة",
            correct_answer: "قطة",
            options: ["سيارة", "قطة", "مدرسة"],
        },
    },
};

export default function TextInterpretationGameScreen() {
    const gameTitle = "interpretation du texte";
    //const [score, setScore] = useState(0);
    const scrollRef = useRef<ScrollView>(null);


    const [time, setTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    const { nextStage, setGameScore } = useGame();

    /**
     * Q1
     */
    const [selectedQ1, setSelectedQ1] = useState<string | null>(null);
    const [q1Correct, setQ1Correct] = useState<boolean | null>(null);

    /**
     * Q2
     */
    const [selectedQ2, setSelectedQ2] = useState<string | null>(null);
    const [q2Correct, setQ2Correct] = useState<boolean | null>(null);

    /**
     * Q3
     */
    const [userInput, setUserInput] = useState("");
    const [q3Correct, setQ3Correct] = useState<boolean | null>(null);

    /**
     * Q4
     */
    const [selectedQ4, setSelectedQ4] = useState<string | null>(null);
    const [q4Correct, setQ4Correct] = useState<boolean | null>(null);

    const [isButtonLoading, setIsButtonLoading] = useState(false);

    /**
     * TIMER
     */
    useEffect(() => {
        if (!isTimerRunning) return;

        const interval = setInterval(() => {
            setTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerRunning]);

    /**
     * AUTO SPEAK Q2
     */
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         speak(
    //             data.generated_questions.q2_listening_word.audio_word,
    //             "ar-MA"
    //         );
    //     }, 7000);

    //     return () => clearInterval(interval);
    // }, []);


    const getOptionStyle = (
        option: string,
        selected: string | null,
        isCorrect: boolean | null,
        correctAnswer: string
    ) => ({
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        borderColor:
            isCorrect === false && option === selected
                ? 'crimson'
                : isCorrect === true && option === correctAnswer
                    ? '#16A34A'
                    : selected === option
                        ? '#2563EB'
                        : '#DDD',
        backgroundColor:
            selected === option ? '#EFF6FF' : '#FFF',
    });

    // Scroll para próxima seção
    const goNextQuestion = (y: number) => {
        setTimeout(() => {
            scrollRef.current?.scrollTo({
                y,
                animated: true,
            });
        }, 500);
    };


    /**
     * Q1 VALIDATION
     */
    const validateQ1 = () => {
        const correct =
            selectedQ1 ===
            data.generated_questions.q1_main_idea.correct_answer;

        setQ1Correct(correct);
        console.log(` la reponse choisit ${selectedQ1} est ${correct}`);

        // if (correct) {
        //     setScore((prev) => prev + 25);
        //     goNextQuestion(500);
        // }
    };

    /**
     * Q2 VALIDATION
     */
    const validateQ2 = () => {
        const correct =
            selectedQ2 ===
            data.generated_questions.q2_listening_word.correct_answer;

        setQ2Correct(correct);
        console.log(` la reponse choisit ${selectedQ2} est ${correct}`);
    };

    /**
     * Q3 VALIDATION
     * reaproveitando sua lógica original
     */
    const validateQ3 = () => {
        const correct =
            userInput.trim() ===
            data.generated_questions.q3_write_word.target_word;

        setQ3Correct(correct);
        console.log(` la reponse choisit ${userInput} est ${correct}`);
    };

    /**
     * Q4 VALIDATION
     */
    const validateQ4 = () => {
        const correct =
            selectedQ4 ===
            data.generated_questions.q4_complete_sentence.correct_answer;

        setQ4Correct(correct);
        console.log(` la reponse choisit ${selectedQ4} est ${correct}`);
    };

    const finishGame = () => {
        setIsButtonLoading(true);
        const gScore = [q1Correct, q2Correct, q3Correct, q4Correct]
        const totalScore = gScore.reduce((acc, val) => acc + (val ? 1 : 0), 0);

        setGameScore((prev) => [
            ...prev,
            {
                score: `${totalScore}/${gScore.length}`,
                name: gameTitle,
                duration: TimerConverter(time),
            },
        ]);

        nextStage();
    };

   const allAnswered =
    selectedQ1 !== null &&
    selectedQ2 !== null &&
    userInput.trim() !== "" &&
    selectedQ4 !== null;

    return (
        <SafeAreaView style={styles.safe}>
            <Header
                gameDescription={gameTitle}
                timer={{
                    isActive: true,
                    mode: "increasing",
                    time,
                }}
            />

            <ScrollView contentContainerStyle={styles.container}>
                {/* TEXTO */}
                <TouchableOpacity style={styles.card}
                    onPress={() =>
                        speak(
                            data.content.arabic_text,
                            "ar-MA"
                        )
                    }
                >
                    <Text style={styles.arabicText}>
                        {data.content.arabic_text}
                    </Text>

                    <Text style={styles.frenchText}>
                        {data.content.french_translation}
                    </Text>
                </TouchableOpacity>

                {/* Q1 */}
                <View style={styles.card}>
                    <Text style={styles.question}>
                        {data.generated_questions.q1_main_idea.question}
                    </Text>

                    {data.generated_questions.q1_main_idea.options.map((item) => (
                        <TouchableOpacity
                            key={item}
                            disabled={q1Correct !== null}
                            style={getOptionStyle(
                                item,
                                selectedQ1,
                                q1Correct,
                                data.generated_questions.q1_main_idea.correct_answer
                            )}
                            onPress={() => setSelectedQ1(item)}
                        >
                            <Text>{item}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        onPress={validateQ1}
                        disabled={q1Correct !== null}
                        style={styles.validateBtn}
                    >
                        <Text style={styles.btnText}>Valider</Text>
                    </TouchableOpacity>
                </View>

                {/* Q2 */}
                <View style={styles.card}>
                    <Text style={styles.question}>
                        {data.generated_questions.q2_listening_word.question}
                    </Text>

                    <TouchableOpacity
                        style={styles.listenBtn}
                        onPress={() =>
                            speak(
                                data.generated_questions.q2_listening_word.audio_word,
                                "ar-MA"
                            )
                        }
                    >
                        <Text style={styles.btnText}>🔊 Écouter</Text>
                    </TouchableOpacity>

                    {data.generated_questions.q2_listening_word.options.map(
                        (item) => (
                            <TouchableOpacity
                                key={item}
                                disabled={q2Correct !== null}
                                style={getOptionStyle(
                                    item,
                                    selectedQ2,
                                    q2Correct,
                                    data.generated_questions.q2_listening_word.correct_answer
                                )}
                                onPress={() => setSelectedQ2(item)}
                            >
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        )
                    )}

                    <TouchableOpacity
                        onPress={validateQ2}
                        disabled={q2Correct !== null}
                        style={styles.validateBtn}
                    >
                        <Text style={styles.btnText}>Valider</Text>
                    </TouchableOpacity>
                </View>

                {/* Q3 */}
                <View style={styles.card}>
                    <Text style={styles.question}>
                        {data.generated_questions.q3_write_word.question}
                    </Text>

                    <Text style={{ marginBottom: 10 }}>
                        Mot à écrire:
                    </Text>

                    <Text style={styles.targetWord}>
                        {data.generated_questions.q3_write_word.target_word}
                    </Text>

                    <TextInput
                        value={userInput}
                        editable={false}
                        style={[
                            styles.input,
                            q3Correct === false && {
                                borderColor: "crimson",
                            },
                        ]}
                    />

                    <ArabicKeyboard
                        value={userInput}
                        onChange={setUserInput}
                    />

                    <View style={styles.row}>
                        <TouchableOpacity
                            onPress={() => setUserInput("")}
                            style={styles.clearBtn}
                        >
                            <Text style={styles.btnText}>Nettoyer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={validateQ3}
                            style={styles.validateBtn}
                        >
                            <Text style={styles.btnText}>Valider</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Q4 */}
                <View style={styles.card}>
                    <Text style={styles.question}>
                        {data.generated_questions.q4_complete_sentence.question}
                    </Text>

                    <Text style={styles.sentence}>
                        {
                            data.generated_questions.q4_complete_sentence
                                .sentence
                        }
                    </Text>

                    {/* aqui pode depois trocar por drag and drop real */}
                    {data.generated_questions.q4_complete_sentence.options.map(
                        (item) => (
                            <TouchableOpacity
                                key={item}
                                disabled={q4Correct !== null}
                                style={getOptionStyle(
                                    item,
                                    selectedQ4,
                                    q4Correct,
                                    data.generated_questions.q4_complete_sentence.correct_answer
                                )}
                                onPress={() => setSelectedQ4(item)}
                            >
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        )
                    )}

                    <TouchableOpacity
                        onPress={validateQ4}
                        disabled={q4Correct !== null}
                        style={styles.validateBtn}
                    >
                        <Text style={styles.btnText}>Valider</Text>
                    </TouchableOpacity>
                </View>

                {allAnswered && (
                    <Button
                        onPress={finishGame}
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
    safe: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },

    container: {
        flexGrow: 1,
        gap: 20,
        paddingBottom: 40,
    },

    card: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },

    arabicText: {
        fontSize: 22,
        textAlign: "right",
        lineHeight: 34,
    },

    frenchText: {
        fontSize: 16,
        color: "#444",
    },

    question: {
        fontSize: 18,
        fontWeight: "600",
    },

    option: {
        borderWidth: 1,
        borderColor: "#DDD",
        padding: 12,
        borderRadius: 8,
    },

    validateBtn: {
        backgroundColor: "#4CAF50",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },

    listenBtn: {
        backgroundColor: "#2563EB",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },

    clearBtn: {
        backgroundColor: "#999",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },

    btnText: {
        color: "#fff",
        fontWeight: "600",
    },

    input: {
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 8,
        padding: 12,
        fontSize: 22,
        textAlign: "right",
    },

    row: {
        flexDirection: "row",
        gap: 10,
    },

    targetWord: {
        fontSize: 24,
        textAlign: "right",
    },

    sentence: {
        fontSize: 20,
        textAlign: "right",
    },
});

