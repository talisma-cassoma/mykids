import React, {  useMemo } from "react";
import { View, Text, StyleSheet, Image, } from "react-native";
import { Celebrate } from "@/components/Celebrate";
import { Score } from "@/components/Score";
import { ProgressBar } from "@/components/ProgressBar";
import { CountdownTimer } from "@/components/CountdownTimer";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWordPairGame, gameData, WordPair } from "@/context/gameContext";
import { usePlayer } from "@/context/playerContext";
import { PlayAndPauseToggleButton } from "@/components/PlayAndPauseToggleButton";
import { WriteTheWordsGame } from "@/components/writeTheWordsGame";
import { MactchingWordsGame } from "@/components/matchingWordGame";

export default function GameScreen() {
  const {
    currentPhase,
    currentPhaseIndex,
    showCelebrate,
    phaseScore,
    totalWords,
    matched,
    stageScores,
    gameType,
  } = useWordPairGame();

  const { isPlay } = usePlayer();

  const totalOfWordPairs = useMemo(
    () =>
      gameData.reduce((total, stage) => total + stage.wordPairs.length, 0),
    []
  );

  const completedWordsBefore = useMemo(
    () =>
      gameData
        .slice(0, currentPhaseIndex)
        .reduce((sum, phase) => sum + phase.wordPairs.length, 0),
    [currentPhaseIndex]
  );

  const currentProgress = completedWordsBefore + matched.length;
  const progressPercent = (currentProgress / totalOfWordPairs) * 100;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      {showCelebrate ? (
        <Celebrate />
      ) : (
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <PlayAndPauseToggleButton />
            <ProgressBar progress={Math.round(progressPercent)} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <Score score={phaseScore} total={totalWords} />
              <CountdownTimer />
            </View>
          </View>

          {/* TITULO */}
          <Text style={styles.title}>trouvez le mot correspondant</Text>
          <Text style={[styles.title, { textDecorationLine: "underline", fontStyle: "italic" }]}>
            {currentPhase.phase}
          </Text>

          {/* JOGO */}
          {isPlay ? (
            gameType === "write" ? (
              <WriteTheWordsGame />
            ) : (
              <MactchingWordsGame />
            )
          ) : (
            <View style={{ flex: 1, alignItems: "center" }}>
              <Image
                source={require("@/assets/images/flame.png")}
                style={{ width: 100, height: 100 }}
              />

              <Text>pause</Text>

              <View style={{ alignItems: "center" }}>
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

