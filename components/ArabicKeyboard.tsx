import React from "react";
import { View, Text, TouchableOpacity } from "react-native";


export const ARABIC_KEYS = [
  "ا", "أ", "إ", "ب", "ت", "ث", "ج", "ح", "خ",
  "د", "ذ", "ر", "ز", "س", "ش", "ص",
  "ض", "ط", "ظ", "ع", "غ", "ف", "ق",
  "ك", "ل", "م", "ن", "ه", "و", "ي",
  "ء", "ؤ", "ئ", "ى", "ة", " "
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
