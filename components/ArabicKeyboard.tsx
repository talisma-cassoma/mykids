import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ARABIC_KEYS = [
  "ا","ب","ت","ث","ج","ح","خ",
  "د","ذ","ر","ز","س","ش","ص",
  "ض","ط","ظ","ع","غ","ف","ق",
  "ك","ل","م","ن","ه","و","ي",
  "ء","◌"," "
];

// variações (long press)
const KEY_VARIANTS: Record<string, string[]> = {
  "ا": ["ا","أ","إ","آ"],
  "ي": ["ي","ى","ئ"],
  "و": ["و","ؤ"],
  "ه": ["ه","ة"],
  "ء": ["ء","ئ","ؤ"],

  // diacríticos
  "◌": ["َ","ِ","ُ","ْ","ّ","ً","ٍ","ٌ"],
};

export function ArabicKeyboard({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [variants, setVariants] = useState<string[] | null>(null);

  function handlePress(key: string) {
    onChange(value + key);
  }

  function handleLongPress(key: string) {
    if (KEY_VARIANTS[key]) {
      setVariants(KEY_VARIANTS[key]);
    }
  }

  function handleVariantPress(v: string) {
    onChange(value + v);
    setVariants(null);
  }

  function handleBackspace() {
    onChange(value.slice(0, -1));
  }

  return (
    <View style={styles.container}>
      
      {/* teclado */}
      <View style={styles.keyboard}>
        {ARABIC_KEYS.map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => handlePress(key)}
            onLongPress={() => handleLongPress(key)}
            style={styles.key}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}

        {/* botão apagar */}
        <TouchableOpacity onPress={handleBackspace} style={styles.key}>
          <Text style={styles.keyText}>⌫</Text>
        </TouchableOpacity>
      </View>

      {/* popup de variantes */}
      {variants && (
        <View style={styles.popup}>
          {variants.map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => handleVariantPress(v)}
              style={styles.variantKey}
            >
              <Text style={styles.variantText}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  keyboard: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  key: {
    padding: 10,
    margin: 4,
    backgroundColor: "#eee",
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
  },
  keyText: {
    fontSize: 18,
  },
  popup: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  variantKey: {
    padding: 10,
    margin: 4,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  variantText: {
    fontSize: 20,
  },
});