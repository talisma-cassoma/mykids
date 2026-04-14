import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {  WordPair } from "@/context/wordPairGameContext";
import { useMatchingGame } from "@/context/wordPairGameContext";

interface MatchingWordsGameProps {
  renderLeft: ({ item }: {
    item: WordPair;
  }) => React.JSX.Element,
  renderRight: ({ item }: {
    item: WordPair;
  }) => React.JSX.Element
}
export function MactchingWordsGame({ renderLeft, renderRight }: MatchingWordsGameProps) {
  const {
    leftWords,
    rightWords,
  } = useMatchingGame();

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

