import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, TextInput } from "react-native";
import * as Speech from 'expo-speech';
import { Celebrate } from "@/components/Celebrate";
import { Score } from "@/components/Score";
import { ProgressBar } from "@/components/ProgressBar";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWordPairGame, gameData, WordPair } from "@/context/wordPairGameContext";
import { usePlayer } from "@/context/playerContext";
import { PlayAndPauseToggleButton } from "@/components/PlayAndPauseToggleButton";
import { WriteTheWordsGame } from "@/components/writeTheWordsGame";
import { MactchingWordsGame } from "@/components/matchingWordGame";

export default function GameScreen() {
  const {
    currentPhase,
    currentPhaseIndex,
    showCelebrate,
    incrementScore,
    phaseScore,   
    totalWords,
    matched,
    setMatched,
    stageScores,
    gameType,
    setGameType
  } = useWordPairGame();

  const [leftWords, setLeftWords] = useState<WordPair[]>([]);
  const [rightWords, setRightWords] = useState<WordPair[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<WordPair | null>(null);
  const [selectedRight, setSelectedRight] = useState<WordPair | null>(null);


  const { isPlay } = usePlayer();
  const totalOfWordPairs = useMemo(() =>
    gameData.reduce((total, stage) => total + stage.wordPairs.length, 0)
    , []);

  const completedWordsBefore = useMemo(() =>
    gameData
      .slice(0, currentPhaseIndex)
      .reduce((sum, phase) => sum + phase.wordPairs.length, 0)
    , [currentPhaseIndex]);

  const currentProgress = completedWordsBefore + matched.length;

  const progressPercent = (currentProgress / totalOfWordPairs) * 100;

  const speak = useCallback((text: string, lang: string) => {
    Speech.stop();
    Speech.speak(text, { language: lang, pitch: 1, rate: 0.9 });
  }, []);


  const isMatch = selectedLeft?.id === selectedRight?.id;

  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;

    if (isMatch) {
      setMatched((prev) => [...prev, selectedLeft.id]);
      incrementScore();
    }

    setSelectedLeft(null);
    setSelectedRight(null);
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
  const randomGame = () => {
    return Math.random() < 0.5 ? (
      <WriteTheWordsGame />
    ) : (
      <MactchingWordsGame renderLeft={renderLeft} renderRight={renderRight} />
    );
  }


  useEffect(() => {
    const random = Math.random() < 0.5 ? "write" : "match";
    setGameType(random);
  }, [currentPhaseIndex]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {showCelebrate ? <Celebrate /> : (
        <View style={styles.container}>
          <View style={styles.header}>
            <PlayAndPauseToggleButton />
            <ProgressBar progress={Math.round(progressPercent)} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <Score score={phaseScore} total={totalWords} />
              <CountdownTimer />
            </View>
          </View>
          <Text style={styles.title}>trouvez le mot correspondant</Text>
          <Text style={[styles.title, { textDecorationLine: 'underline', fontStyle: 'italic' }]}>{currentPhase.phase}</Text>
          {isPlay ? (
            gameType === "write" ? (
              <WriteTheWordsGame />
            ) : (
              <MactchingWordsGame renderLeft={renderLeft} renderRight={renderRight} />
            )
          ) : (
            <View style={{ flex: 1, justifyContent: "flex-start", alignItems: "center", width: "100%" }}>
              <Image
                source={require("@/assets/images/flame.png")}
                style={{
                  width: 100,
                  height: 100
                }}
              />
              <Text>
                pause
              </Text>
                  <View style={{flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
            {stageScores.map((stage, i) => (
                <Text key={i}>
                    {stage.phaseName} ({stage.gameType}) : {stage.score} / {stage.total}
                </Text>
            ))}
            </View>
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

