import React from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";
import { useMatchingGame } from "@/hooks/useMatchingGame";
import * as Speech from "expo-speech";
import { Button } from "@/components/Button";
import { PauseScreen } from "@/components/Games/PauseScreen";
import { useGame } from "@/context/gameContext";

export interface WordPair {
  id: string;
  fr: string;
  ar: string;
}

export function MactchingWordsGameScreen() {
  const { status } = useGame();

  const {
    leftWords,
    rightWords,
    matched,
    selectedLeft,
    setSelectedLeft,
    selectedRight,
    setSelectedRight,
    isPhaseCompleted,
  } = useMatchingGame();

  console.log("useMacthGameScreen");

  const speak = React.useCallback((text: string, lang: string) => {
    Speech.stop();
    Speech.speak(text, { language: lang, pitch: 1, rate: 0.9 });
  }, []);

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
            speak(item.fr, "fr-FR");
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
            speak(item.ar, "ar-MA");
          }
        }}
      >
        <Text style={styles.text}>{item.ar}</Text>
      </TouchableOpacity>
    );
  };

  // ✅ PAUSED STATE PRIMEIRO (mais limpo)
  if (status === "paused") {
    return <PauseScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={{
    flex: 1,
    flexDirection: "row",
    gap: 12,
    padding: 10,
   maxWidth:500,
   minHeight:400,
   justifyContent: "space-around",
   alignSelf: "center",
  }}>
      <FlatList
        data={leftWords}
        renderItem={renderLeft}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <FlatList
        data={rightWords}
        renderItem={renderRight}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      </View>

      {isPhaseCompleted
       && (
        <View style={styles.buttonContainer}>
          <Button />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    height: "auto",
    flexDirection:'column',
    gap:10,
    justifyContent: "space-around"
  },

  list: {
    //flex: 1,
    paddingBottom: 20,
    height: "auto",
    width: 100
    //justifyContent: "space-around",
  },

  card: {
    backgroundColor: "#fff8f8",
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    //maxWidth: 150,
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

  buttonContainer: {
    margin: 20,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
});