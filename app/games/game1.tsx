import React, { use, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { gameData, GameStage, WordPair, speak, TimerConverter } from "@/utils/lessons";
import { useGame } from "@/context/gameContext";
import { Header } from "@/components/Header";


export default function MactchingWordsGameScreen() {

  const { nextStage, setGameScore } = useGame();
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false)
  const [isMacthActive, setIsMactchActive] = useState<boolean>(true)

  //pause and play
  const [resumeStatus, setResumeStatus] = useState<"playing" | "paused">("paused");
  const handleToggle = () => {

    setIsTimerRunning(prev => !prev) //pause or play
    setIsMactchActive(prev => !prev) //able or disable match

    setResumeStatus(prev => prev === "playing" ? "paused" : "playing");
  };

  //timer 
  const [time, setTime] = useState(60); //60s
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  useEffect(() => {
    if (!isTimerRunning) return; //pause time
    
    const interval = setInterval(() => {
      setTime(prev => {
        if (prev === 1) { //if time ends -> nextstage
          setGameScore(prev => [...prev, {
            score: `${phaseScore}/${totalWords}`,
            name: "mactch les mots",
            duration: TimerConverter(time),
          }])
          nextStage()
          return 0;
        }
        return prev > 0 ? prev - 1 : 0
      })

      // else  return prev + 1 
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);



  const [currentLesson, setCurrentLesson] = useState<GameStage | null>(null);

  const [matched, setMatched] = useState<string[]>([]);
  const [phaseScore, setPhaseScore] = useState(0);

  const [leftWords, setLeftWords] = useState<WordPair[]>([]);
  const [rightWords, setRightWords] = useState<WordPair[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<WordPair | null>(null);
  const [selectedRight, setSelectedRight] = useState<WordPair | null>(null);
  

  // 🎲 escolhe UMA fase apenas no início
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * gameData.length);
    setCurrentLesson(gameData[randomIndex]);
  }, []);

  // 📦 dados seguros
  const data = currentLesson?.wordPairs ?? [];
  const totalWords = data.length;
  const isPhaseCompleted = matched.length === totalWords;

  // 🔀 init da fase
  useEffect(() => {
    if (!data.length) return;

    const shuffled = [...data].sort(() => Math.random() - 0.5);

    setLeftWords(data);
    setRightWords(shuffled);

    setMatched([]);
    setPhaseScore(0);
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [currentLesson]);


  // 🎯 lógica de match
  useEffect(() => {
    if (!selectedLeft || !selectedRight) return;

    const isMatch = selectedLeft.id === selectedRight.id;

    if (isMatch && !matched.includes(selectedLeft.id)) {
      const newScore = phaseScore + 1;

      setMatched((prev) => [...prev, selectedLeft.id]);
      setPhaseScore(newScore);
    }

    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
    }, 200);
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

        disabled={!isMacthActive}
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
        disabled={!isMacthActive}
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 20, paddingBottom: 50 }}>
      <Header gameDescription="Match the words"
        playAndPauseButton={{
          isActive: true,
          resumeStatus,
          onToggle: handleToggle
        }}
        timer={{
          isActive: true,
          mode: "decreasing",
          time: time,
        }}
        score={{
          isActive: true,
          current: phaseScore,
          total: totalWords,
        }} />
      <View style={{ flex: 1, flexDirection: 'row', gap: 10, maxWidth: 500, alignSelf: "center", marginTop:20 }}>

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

      {true//isPhaseCompleted
        && (
          <View style={{
            marginTop: 20,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            maxHeight: 100
          }}>
            <Button onPress={() => {
              setIsButtonLoading(true)
              setGameScore(prev => [...prev, {
                score: `${phaseScore}/${totalWords}`,
                name: "mactch les mots",
                duration: TimerConverter(time),
              }])
              nextStage()
            }
            }
              isLoading={isButtonLoading}>
              <Button.Title>avancer</Button.Title>
            </Button>
          </View>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    height: "auto",
    flexDirection: 'column',
    gap: 10,
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

});