import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useWriteGame } from "@/hooks/useWriteGame";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { ArabicKeyboard } from "@/components/ArabicKeyboard";

import { ScrollView } from "react-native";

export function WriteTheWordsGameScreen() {
    const {
        currentWord,
        userInput,
        setUserInput,
        checkAnswer,
        isCorrect
    } = useWriteGame();

    if (!currentWord) {
        return (
            <View style={styles.container}>
                <Text>no current word</Text>
            </View>
        )
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.text}>{currentWord.fr}</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10, marginBottom: 20 }}>
                <TextInput
                    value={userInput}
                    editable={false}
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

                <TouchableOpacity onPress={checkAnswer} style={{
                    marginTop: 20,
                    backgroundColor: "#a5d6a7",
                    padding: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    width: 100,
                    borderRadius: 8
                }}>
                    <Text style={{ color: "#fff" }}>Valider</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.text, { margin: 10 }]}>{currentWord.ar}</Text>

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
            {isCorrect
                && <Button />}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1, //importante para ScrollView
        alignItems: "center",
        justifyContent: "space-around",
        maxWidth: 400,
        maxHeight: 800,
        alignSelf: "center",
        marginBottom:20
    },
    text: {
        fontSize: 16,
    }
});
