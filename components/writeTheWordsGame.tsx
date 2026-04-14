import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useWriteGame } from "@/hooks/useWriteGame";

export const ARABIC_KEYS = [
    "ا", "ب", "ت", "ث", "ج", "ح", "خ",
    "د", "ذ", "ر", "ز", "س", "ش", "ص",
    "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
    "ك", "ل", "م", "ن", "ه", "و", "ي",
    "ء", "ى", "ة", " "
];

export function ArabicKeyboard({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            {ARABIC_KEYS.map((key) => (
                <TouchableOpacity
                    key={key}
                    onPress={() => onChange(value + key)}
                    style={{
                        padding: 10,
                        margin: 4,
                        backgroundColor: "#eee",
                        borderRadius: 6,
                        minWidth: 35,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontSize: 18 }}>{key}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

export function WriteTheWordsGame() {
    const {
        currentWord,
        userInput,
        setUserInput,
        checkAnswer,
        isCorrect
    } = useWriteGame();

    return (
        <View style={styles.row}>
            {currentWord && (
                <View style={{ alignItems: "center", width: "100%" }}>

                    <Text style={styles.text}>{currentWord.fr}</Text>
                    <View style={{ flexDirection: "row", gap: 10, marginTop: 10, marginBottom: 20 }}>
                        <TextInput
                            value={userInput}
                            editable={false} // 👈 important (on force clavier custom)
                            style={{
                                borderWidth: 1,
                                borderColor: isCorrect === false ? "crimson" : "#ccc",
                                padding: 10,
                                marginTop: 20,
                                width: 200,
                                textAlign: "right",
                                fontSize: 20,
                                borderRadius: 8,
                            }}
                        />
                        <TouchableOpacity
                            onPress={checkAnswer}
                            style={{
                                marginTop: 20,
                                backgroundColor: "#a5d6a7",
                                padding: 10,
                                justifyContent: "center",
                                alignItems: "center",
                                width: 100,
                                borderRadius: 8
                            }}
                        >
                            <Text style={{ color: "#fff" }}>Valider</Text>
                        </TouchableOpacity>
                    </View>
                    {/* {isMatch === false && <Text style={{ color: "crimson" }}>c'est incorect</Text>} */}
                    <ArabicKeyboard
                        value={userInput}
                        onChange={setUserInput}
                    />
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={() => setUserInput((prev) => prev.slice(0, -1))}
                            style={{ padding: 10, backgroundColor: "#f55", marginRight: 10 }}
                        >
                            <Text style={{ color: "#fff" }}>⌫</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setUserInput("")}
                            style={{ padding: 10, backgroundColor: "#999" }}
                        >
                            <Text style={{ color: "#fff" }}>Nettoyer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 150,
        paddingHorizontal: 60,
        alignItems: "center",
        justifyContent: "flex-start",

    },
    header: {
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 20,
        height: "auto",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        //justifyContent: "space-between",
        gap: 20,
        maxWidth: 500,
    },
    card: {
        backgroundColor: "#fff8f8",
        padding: 15,
        marginVertical: 8,
        borderRadius: 12,
        flex: 1,
        borderWidth: 1,
        borderColor: "gray",
        borderBottomWidth: 5,
        //width: 140,
        alignItems: "center",
    },
    text: {
        fontSize: 16,
    },
    selected: {
        backgroundColor: "#cde1ff",
    },
    matched: {
        backgroundColor: "#a5d6a7",
    },
});
