import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";


interface WordPair {
  id: string;
  fr: string;
  ar: string;
}

// Example JSON data (can be moved to a separate file)
const wordPairs: WordPair[] = [
  { id: "1", fr: "Bonjour", ar: "مرحبا" },
  { id: "2", fr: "Merci", ar: "شكرا" },
  { id: "3", fr: "Chat", ar: "قط" },
  { id: "4", fr: "Maison", ar: "منزل" },
];

export default function MatchingWordGameScreen() {
  const [leftWords, setLeftWords] = useState<WordPair[]>([]);
  const [rightWords, setRightWords] = useState<WordPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<WordPair | null>(null);
  const [selectedRight, setSelectedRight] = useState<WordPair | null>(null);
  const [matched, setMatched] = useState<string[]>([]);

  useEffect(() => {
    const shuffledRight = [...wordPairs]
      .map((item) => ({ ...item }))
      .sort(() => Math.random() - 0.5);

    setLeftWords(wordPairs);
    setRightWords(shuffledRight);
  }, []);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft.id === selectedRight.id) {
        setMatched((prev) => [...prev, selectedLeft.id]);
      }
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [selectedLeft, selectedRight]);

  const renderLeft = ({ item }: { item: WordPair }) => {
    const isMatched = matched.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.card,
          isMatched && styles.matched,
          selectedLeft?.id === item.id && styles.selected,
        ]}
        onPress={() => !isMatched && setSelectedLeft(item)}
      >
        <Text style={styles.text}>{item.fr}</Text>
      </TouchableOpacity>
    );
  };

  const renderRight = ({ item }: { item: WordPair }) => {
    const isMatched = matched.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.card,
          isMatched && styles.matched,
          selectedRight?.id === item.id && styles.selected,
        ]}
        onPress={() => !isMatched && setSelectedRight(item)}
      >
        <Text style={styles.text}>{item.ar}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>trouvez le mot correspondant</Text>
      <View style={styles.row}>
        <FlatList
          data={leftWords}
          renderItem={renderLeft}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, width: 200, }}
        />
        <FlatList
          data={rightWords}
          renderItem={renderRight}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, width: 200 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",    
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    maxWidth: 500,
  },
  card: {
    backgroundColor: "#eee",
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    flex: 1,
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

// Separate JSON example (words.json)
/*
[
  { "id": "1", "fr": "Bonjour", "ar": "مرحبا" },
  { "id": "2", "fr": "Merci", "ar": "شكرا" },
  { "id": "3", "fr": "Chat", "ar": "قط" },
  { "id": "4", "fr": "Maison", "ar": "منزل" }
]
*/