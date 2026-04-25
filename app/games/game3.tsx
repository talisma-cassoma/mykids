import React, { useEffect, useState } from "react";
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
import { useSpeech, TimerConverter } from "@/utils/lessons";
import { IconVolume } from "@tabler/icons-react-native";

const data = {
    id: "txt_002",
    title: "قطة متضامنة",
    content: {
        arabic_text:
            "لسارة قطة لطيفة، تحبها كثيرًا، وتقدم لها الطعام بانتظام، وتعتني بصحتها. وبعد مدة لاحظت سارة أن قطتها أصبحت تأخذ الطعام وتختفي بسرعة، دون أن تتناول منه شيئًا. قررت سارة أن تكتشف السرّ. وعندما حان وقت الطعام، قدمت لقطتها سمكة؛ فأخذتها، وانطلقت كالسهم تعدو. تبعتها سارة، وهي تتجه نحو مكان مهجور، فرأتها تضع السمكة أمام قطة أخرى، ولدت حديثًا قطيطات. تعجبت سارة، وأصبحت منذ ذلك اليوم، تقدم لقطتها مزيدًا من الطعام.",
        french_translation:
            "Sara a une gentille chatte qu’elle aime beaucoup. Elle lui donne régulièrement de la nourriture et prend soin de sa santé. Après quelque temps, Sara remarqua que sa chatte prenait la nourriture et disparaissait rapidement sans rien manger. Sara décida de découvrir le secret.",
    },

    generated_questions: {
        q1_main_idea: {
            question: "De quoi parle le texte ?",
            correct_answer: "Une chatte solidaire",
            options: ["Une chatte solidaire", "Un oiseau blessé", "Une école abandonnée"],
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

    const { nextStage, setGameScore } = useGame();
    const { speak } = useSpeech();
    const [step, setStep] = useState(0);
    const [time, setTime] = useState(0);

    const [isSpeaking, setIsSpeaking] = useState(false);

    /**
     * Q states
     */
    const [selectedQ1, setSelectedQ1] = useState<string | null>(null);
    const [q1Correct, setQ1Correct] = useState<boolean | null>(null);

    const [selectedQ2, setSelectedQ2] = useState<string | null>(null);
    const [q2Correct, setQ2Correct] = useState<boolean | null>(null);

    const [userInput, setUserInput] = useState("");
    const [q3Correct, setQ3Correct] = useState<boolean | null>(null);

    const [selectedQ4, setSelectedQ4] = useState<string | null>(null);
    const [q4Correct, setQ4Correct] = useState<boolean | null>(null);

    const [isButtonLoading, setIsButtonLoading] = useState(false);

    /**
     * TIMER
     */
    useEffect(() => {
        const interval = setInterval(() => {
            setTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    /**
     * STEP 0 → TEXT SPEAK
     */
    useEffect(() => {
        const run = async () => {
            if (step !== 0) return;

            setIsSpeaking(true);

            await speak(data.content.arabic_text, "ar-MA");

            setIsSpeaking(false);
        };

        run();
    }, [step]);

    const getOptionStyle = (
        option: string,
        selected: string | null,
        isCorrect: boolean | null,
        correctAnswer: string
    ) => ({
       
        "borderColor":
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

    /**
     * VALIDATIONS
     */
    const validateQ1 = () => {
        const correct =
            selectedQ1 === data.generated_questions.q1_main_idea.correct_answer;
        setQ1Correct(correct);
    };

    const validateQ2 = () => {
        const correct =
            selectedQ2 === data.generated_questions.q2_listening_word.correct_answer;
        setQ2Correct(correct);
    };

    const validateQ3 = () => {
        const correct =
            userInput.trim() === data.generated_questions.q3_write_word.target_word;
        setQ3Correct(correct);
    };

    const validateQ4 = () => {
        const correct =
            selectedQ4 === data.generated_questions.q4_complete_sentence.correct_answer;
        setQ4Correct(correct);
    };

    /**
     * FINISH GAME
     */
    const finishGame = () => {
        setIsButtonLoading(true);

        const gScore = [q1Correct, q2Correct, q3Correct, q4Correct];
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

    return (
        <SafeAreaView style={styles.safe}>
            <Header
                gameDescription={gameTitle}
                timer={{ isActive: true, mode: "increasing", time }}
            />

            <ScrollView contentContainerStyle={styles.container}>
                {/* ================= TEXT ================= */}
                {step === 0 && (
                    <View style={styles.card}>
                        <TouchableOpacity
                            disabled={isSpeaking}
                            onPress={() =>
                                speak(data.content.arabic_text, "ar-MA")
                            }
                        >
                            <Text style={styles.arabicText}>
                                {data.content.arabic_text}
                            </Text>

                            <Text style={styles.frenchText}>
                                {data.content.french_translation}
                            </Text>
                        </TouchableOpacity>

                        {!isSpeaking && (
                            <Button onPress={() => setStep(1)}>
                                <Button.Title>Avançar</Button.Title>
                            </Button>
                        )}
                    </View>
                )}

                {/* ================= Q1 ================= */}
                {step === 1 && (
                    <View style={styles.card}>
                        <Text>{data.generated_questions.q1_main_idea.question}</Text>
                        {data.generated_questions.q1_main_idea.options.map((item) => (
                            <TouchableOpacity key={item}
                                disabled={q1Correct !== null}
                                style={[getOptionStyle(
                                    item,
                                    selectedQ1,
                                    q1Correct,
                                    data.generated_questions.q1_main_idea.correct_answer
                                ), styles.option]}
                                onPress={() => setSelectedQ1(item)}>
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        ))}


                        {q1Correct !== null 
                        ?(

                                <Button onPress={() => setStep(2)}>
                                    <Button.Title>Avançar</Button.Title>
                                </Button>
                            )
                            :
                            (
                                <TouchableOpacity onPress={validateQ1}
                                    disabled={q1Correct !== null}
                                    style={styles.validateBtn}
                                >
                                    <Text style={styles.btnText}>Valider</Text>
                                </TouchableOpacity>
                            )}
                    </View>
                )}

                {/* ================= Q2 ================= */}
                {step === 2 && (
                    <View style={styles.card}>
                        <Text>{data.generated_questions.q2_listening_word.question}</Text>

                        <TouchableOpacity
                                style={{flexDirection:"row", gap:6, }}
                            onPress={() =>
                                speak(
                                    data.generated_questions.q2_listening_word.audio_word,
                                    "ar-MA"
                                )
                            }
                        >
                          
                            <Text>Écouter</Text>
                            <IconVolume size={18} color="grey"/>
                         
                        </TouchableOpacity>

                        {data.generated_questions.q2_listening_word.options.map((item) => (
                            <TouchableOpacity key={item}
                                disabled={q2Correct !== null}
                                style={[getOptionStyle(
                                    item,
                                    selectedQ2,
                                    q2Correct,
                                    data.generated_questions.q2_listening_word.correct_answer
                                ), styles.option]}
                                onPress={() => setSelectedQ2(item)}>
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        ))}

                        {q2Correct !== null ?
                            (

                                <Button onPress={() => setStep(3)}>
                                    <Button.Title>Avancer</Button.Title>
                                </Button>
                            )
                            :
                            (
                                <TouchableOpacity onPress={validateQ2}
                                    disabled={q2Correct !== null}
                                    style={styles.validateBtn}
                                >
                                    <Text style={styles.btnText}>Valider</Text>
                                </TouchableOpacity>
                            )}
                    </View>
                )}

                {/* ================= Q3 ================= */}
                {step === 3 && (
                    <View style={styles.card}>
                        <Text>{data.generated_questions.q3_write_word.question}</Text>

                        <Text>{data.generated_questions.q3_write_word.target_word}</Text>

                        <TextInput
                            value={userInput}
                            onChangeText={setUserInput}
                            style={styles.input}
                        />

                        <ArabicKeyboard value={userInput} onChange={setUserInput} />

                        {q3Correct !== null ? (
                            <Button onPress={() => setStep(4)}>
                                <Button.Title>Avançar</Button.Title>
                            </Button>
                        ) : (
                            <TouchableOpacity
                                style={styles.validateBtn}
                                onPress={validateQ3}>
                                <Text style={styles.btnText}>Valider</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* ================= Q4 ================= */}
                {step === 4 && (
                    <View style={styles.card}>
                        <Text>{data.generated_questions.q4_complete_sentence.question}</Text>

                        <Text>{data.generated_questions.q4_complete_sentence.sentence}</Text>

                        {data.generated_questions.q4_complete_sentence.options.map((item) => (
                            <TouchableOpacity key={item} 
                             disabled={q4Correct !== null}
                        style={[getOptionStyle(
                                    item,
                                    selectedQ4,
                                    q4Correct,
                                    data.generated_questions.q4_complete_sentence.correct_answer
                                ), styles.option]}
                            onPress={() => setSelectedQ4(item)}>
                                <Text>{item}</Text>
                            </TouchableOpacity>
                        ))}

                       

                        {q4Correct !== null ? (
                            <Button onPress={() => setStep(5)}>
                                <Button.Title>Terminer</Button.Title>
                            </Button>
                        ):(
                             <TouchableOpacity
                            style={styles.validateBtn}
                            onPress={validateQ4}>
                            <Text style={styles.btnText}>Valider</Text>
                        </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* ================= FINISH ================= */}
                {step === 5 && (
                    <Button onPress={finishGame} isLoading={isButtonLoading} style={{ alignSelf: "center" }}>
                        <Button.Title>Finaliser</Button.Title>
                    </Button>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

/**
 * STYLES
 */
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fff", padding: 20 },
    container: {
        flexGrow: 1,
        gap: 20,
        paddingBottom: 40,
        alignItems: "center",

    },
    card: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        gap: 12,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
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
        width:400,
    },

    validateBtn: {
        backgroundColor: "#4CAF50",
        padding: 12,
        borderRadius: 8,
        maxWidth: 140,
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
        width: 350,
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