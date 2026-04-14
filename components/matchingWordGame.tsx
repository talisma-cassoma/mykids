import React from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text} from "react-native";
import {  WordPair, useWordPairGame } from "@/context/gameContext";
import { useMatchingGame } from "@/hooks/useMatchingGame";


interface MatchingWordsGameProps {
  renderLeft: ({ item }: {
    item: WordPair;
  }) => React.JSX.Element,
  renderRight: ({ item }: {
    item: WordPair;
  }) => React.JSX.Element
}
export function MactchingWordsGame() {
  const {
    leftWords,
    rightWords,
    matched,
    selectedLeft,
    setSelectedLeft,
    selectedRight,
    setSelectedRight,
  } = useMatchingGame();

  const { speak } = useWordPairGame();


  const renderLeft = ({ item }: { item: WordPair }) => {
    const isMatched = matched.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.card,
          isMatched && styles.matched,
          selectedLeft?.id === item.id && styles.selected,
        ]}
        onPress={() => {
          if (!isMatched) {
            setSelectedLeft(item);
            speak(item.fr, 'fr-FR');; // 🔊 lecture FR
          }
        }}
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
        onPress={() => {
          if (!isMatched) {
            setSelectedRight(item);
            speak(item.ar, 'ar-MA'); // 🔊 lecture AR
          }
        }}
      >
        <Text style={styles.text}>{item.ar}</Text>
      </TouchableOpacity>
    );
  };

  return (
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
  )
}


const styles = StyleSheet.create({
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

