import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
import * as Speech from 'expo-speech';
import { Celebrate } from "@/components/Celebrate";
import { Score } from "@/components/Score";
import { ProgressBar } from "@/components/ProgressBar";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWordPairGame, gameData } from "@/context/wordPairGameContext";
import { usePlayer } from "@/context/playerContext";
import { PlayAndPauseToggleButton } from "@/components/PlayAndPauseToggleButton";

interface WordPair {
  id: string;
  fr: string;
  ar: string;
}
interface GameStage {
  phase: string;
  wordPairs: WordPair[];
}
export default function MatchingWordGameScreen() {

  const {
    currentPhaseIndex,
    timeLeft,
    showCelebrate,
    incrementScore,
    score,
    totalWords,
    setPhaseCompleted,
  } = useWordPairGame();

  const [leftWords, setLeftWords] = useState<WordPair[]>([]);
  const [rightWords, setRightWords] = useState<WordPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<WordPair | null>(null);
  const [selectedRight, setSelectedRight] = useState<WordPair | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  //const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const currentPhase = gameData[currentPhaseIndex];

  const { isPlay } = usePlayer();
  const isPhaseComplete = matched.length === currentPhase.wordPairs.length;
  const totalOfWordPairs = gameData.reduce((total, stage) => {
    return total + stage.wordPairs.length;
  }, 0);

  const completedWordsBefore = gameData
    .slice(0, currentPhaseIndex)
    .reduce((sum, phase) => sum + phase.wordPairs.length, 0);

  const currentProgress = completedWordsBefore + matched.length;

  const progressPercent = (currentProgress / totalOfWordPairs) * 100;

  const speak = (text: string, lang: string) => {
    Speech.stop(); // évite les conflits audio

    Speech.speak(text, {
      language: lang,
      pitch: 1,
      rate: 0.9,
    });
  };

  useEffect(() => {
    if (matched.length === currentPhase.wordPairs.length) {
      setPhaseCompleted(true); // 🔥 TRÈS IMPORTANT
    }
  }, [matched]);

  useEffect(() => {

    if (selectedLeft && selectedRight) {
      if (selectedLeft.id === selectedRight.id) {
        setMatched((prev) => [...prev, selectedLeft.id]);
        incrementScore();
        // speak(selectedLeft.fr, 'fr-FR');
        // setTimeout(() => speak(selectedRight.ar, 'ar-MA'), 500);
      }
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [selectedLeft, selectedRight]);

  useEffect(() => {
    const shuffledRight = [...currentPhase.wordPairs]
      .map((item) => ({ ...item }))
      .sort(() => Math.random() - 0.5);

    setLeftWords(currentPhase.wordPairs);
    setRightWords(shuffledRight);
    setMatched([]);

    setSelectedLeft(null);   // 🔥 ajout
    setSelectedRight(null);  // 🔥 ajout
  }, [currentPhaseIndex]);

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
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {showCelebrate ? <Celebrate /> : (
        <View style={styles.container}>
          <View style={styles.header}>
            <PlayAndPauseToggleButton />
            <ProgressBar progress={Math.round(progressPercent)} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <Score score={score} total={totalWords} />
              <CountdownTimer timeInSeconds={timeLeft} />
            </View>
          </View>
          <Text style={styles.title}>trouvez le mot correspondant</Text>
          <Text style={[styles.title, {textDecorationLine: 'underline', fontStyle: 'italic'}]}>{currentPhase.phase}</Text>
          {isPlay ? (
           
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
          ) : (
             <View style={{ flex: 1, justifyContent: "center", alignItems: "center", }}>
              <Image
                source={require("@/assets/images/celebrate.gif")}
                style={{
                  width: 100,
                  height: 100, }}
              />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
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

