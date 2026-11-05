import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PanResponder,
  GestureResponderEvent,
  ScrollView,
  Dimensions
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { IconVolume, IconArrowRight,  } from "@tabler/icons-react-native";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { GameHeader } from "@/components/Header";
import { useAyla } from "@/context/AylaContext";
import { TimerConverter, useSpeech } from "@/utils/lessons";


const { width } = Dimensions.get('window');
   
const isTablet = width >= 768;
const CANVAS_WIDTH = isTablet ? 280: 160;
const CANVAS_HEIGHT = isTablet? 280: 180;


type CountingQuestion = {
  id: string;
  targetCount: number;
};

// SVG stroke guide paths for numbers 0 to 9 scaled within a 200x260 viewbox
const NUMBER_GUIDE_PATHS: Record<number, string[]> = {
  0: ["M 100 40 C 50 40 50 220 100 220 C 150 220 150 40 100 40 Z"],
  1: ["M 70 80 L 100 40 L 100 220", "M 60 220 L 140 220"],
  2: [
    "M 60 80 C 60 30 140 30 140 80 C 140 130 60 170 60 220",
    "M 60 220 L 140 220",
  ],
  3: [
    "M 60 50 L 140 50 L 100 110",
    "M 100 110 C 150 110 150 210 60 210",
  ],
  4: ["M 130 40 L 60 150 L 150 150", "M 130 40 L 130 220"],
  5: ["M 140 50 L 80 50 L 70 120", "M 70 120 C 140 100 150 210 70 210"],
  6: ["M 130 60 C 60 60 50 220 100 220 C 140 220 140 140 70 140"],
  7: ["M 60 50 L 140 50 L 80 220"],
  8: [
    "M 100 40 C 60 40 60 120 100 130 C 140 140 140 220 100 220 C 60 220 60 140 100 130 C 140 120 140 40 100 40 Z",
  ],
  9: ["M 130 120 C 60 120 60 40 100 40 C 140 40 140 200 70 220"],
  10: [
    "M 45 80 L 65 40 L 65 220",
    "M 35 220 L 95 220",
    "M 145 40 C 110 40 110 220 145 220 C 180 220 180 40 145 40 Z",
  ],
};

const MIN_NUMBER = 0;
const MAX_NUMBER = 10;
const TOTAL_QUESTIONS = MAX_NUMBER - MIN_NUMBER + 1;
const ROUND_TIME_MS = 25000;

type Point = { x: number; y: number };
type PathSegment = Point[];

export default function NumberTracingGameScreen() {
  const { nextStage, setGameScore } = useAyla();
  const { speak } = useSpeech();

  const [currentNumber, setCurrentNumber] = useState(MIN_NUMBER);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [question, setQuestion] = useState<CountingQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_MS);
  const [isPaused, setIsPaused] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [statusText, setStatusText] = useState<string>("Trace le chiffre!");
  const [answerLocked, setAnswerLocked] = useState(false);

  // User drawn paths
  const [drawnPaths, setDrawnPaths] = useState<PathSegment[]>([]);
  const [currentPath, setCurrentPath] = useState<PathSegment>([]);

  // State to toggle ScrollView capability while drawing
  const [isDrawing, setIsDrawing] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const boardLayoutRef = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 300,
    height: 380,
  });

  const gameTitle = useMemo(() => `Écriture des chiffres: ${MIN_NUMBER} à ${MAX_NUMBER}`, []);

  const resetTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimeLeft(ROUND_TIME_MS);
  }, []);

  const speakCurrentNumber = useCallback(async (num: number) => {
    if (num === 8) {
      await speak("huit", "fr-FR");
    } else {
      await speak(`${num}`, "fr-FR");
    }
  }, [speak]);

  const clearCanvas = () => {
    setDrawnPaths([]);
    setCurrentPath([]);
  };

  const loadQuestionForNumber = useCallback(
    async (num: number) => {
      if (num > MAX_NUMBER) return;

      setQuestion({ id: `trace-${num}`, targetCount: num });
      setStatusText("Trace le chiffre!");
      setAnswerLocked(false);
      clearCanvas();
      resetTimer();

      await speakCurrentNumber(num);
    },
    [resetTimer, speakCurrentNumber]
  );

  useEffect(() => {
    if (!question || isPaused || hasFinished) return;

    const interval = setInterval(() => {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, ROUND_TIME_MS - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleTimeout();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [question, isPaused, hasFinished]);

  useEffect(() => {
    if (!question) {
      loadQuestionForNumber(MIN_NUMBER);
    }
  }, [loadQuestionForNumber, question]);

  const finishGame = useCallback(
    (finalScore: number) => {
      if (hasFinished) return;

      setHasFinished(true);
      setGameScore((prev) => [
        ...prev,
        {
          score: `${finalScore}/${TOTAL_QUESTIONS} · erreurs: ${wrongAnswers}`,
          name: gameTitle,
          duration: TimerConverter(Math.max(1, Math.round(finalScore * 4))),
        },
      ]);
      nextStage();
    },
    [gameTitle, hasFinished, nextStage, setGameScore, wrongAnswers]
  );

  const handleValidate = useCallback(async () => {
    if (!question || answerLocked || hasFinished) return;

    const totalPoints = drawnPaths.reduce((acc, p) => acc + p.length, 0) + currentPath.length;

    if (totalPoints < 12) {
      setStatusText("Remplis le tracé!");
      await speak("Essaie encore d'écrire le chiffre", "fr-FR");
      return;
    }

    setAnswerLocked(true);
    const nextScore = score + 1;
    const nextNum = currentNumber + 1;

    setStatusText("Bravo!");
    await speak("Très bien!", "fr-FR");
    setScore(nextScore);

    if (nextNum > MAX_NUMBER) {
      finishGame(nextScore);
      return;
    }

    setCurrentNumber(nextNum);
    setTimeout(() => {
      loadQuestionForNumber(nextNum);
    }, 1000);
  }, [answerLocked, currentNumber, currentPath, drawnPaths, finishGame, hasFinished, loadQuestionForNumber, question, score, speak]);

  const handleTimeout = useCallback(async () => {
    if (!question || answerLocked || hasFinished) return;

    setAnswerLocked(true);
    setStatusText("Temps écoulé!");
    setWrongAnswers((prev) => prev + 1);
    await speak("Oupsi", "fr-FR");

    setTimeout(() => {
      loadQuestionForNumber(currentNumber);
    }, 1000);
  }, [answerLocked, currentNumber, hasFinished, loadQuestionForNumber, question, speak]);

  // Touch tracking with scroll locking during draw
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !answerLocked,
        onMoveShouldSetPanResponder: () => !answerLocked,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          setIsDrawing(true);
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath([{ x: locationX, y: locationY }]);
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath((prev) => [...prev, { x: locationX, y: locationY }]);
        },
        onPanResponderRelease: () => {
          setIsDrawing(false);
          setCurrentPath((latestCurrent) => {
            if (latestCurrent.length > 0) {
              setDrawnPaths((prev) => [...prev, latestCurrent]);
            }
            return [];
          });
        },
        onPanResponderTerminate: () => {
          setIsDrawing(false);
        },
      }),
    [answerLocked]
  );

  const convertPointsToSvgPath = (points: Point[]) => {
    if (points.length === 0) return "";
    return points.reduce(
      (acc, pt, index) => (index === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
      ""
    );
  };

  const handleToggle = () => {
    setIsPaused((prev) => !prev);
    if (isPaused) {
      resetTimer();
    }
  };

  const commonHeader = (
    <GameHeader
      gameDescription={gameTitle}
      trophiesCount={12}
      coinsCount={45}
      settingsRoute="/games/ayla/settings/SettingsScreen"
      currentProfile={{
        name: "Ayla",
        avatarSvgName: "PrincessProfileAvatarSvg",
        startScreenRoute: "/games/ayla/StartScreen",
      }}
      otherProfile={{
        name: "Dino",
        avatarSvgName: "DinoProfileAvatarSvg",
        startScreenRoute: "/games/yachane/StartScreen",
      }}
    />
  );

  if (!question) {
    return (
      <ThemedSafeAreaView>
        {commonHeader}
      </ThemedSafeAreaView>
    );
  }

  const guidePaths = NUMBER_GUIDE_PATHS[question.targetCount] || NUMBER_GUIDE_PATHS[0];

  return (
    <ThemedSafeAreaView style={styles.container}>
      {commonHeader}
      <ScrollView
        scrollEnabled={!isDrawing} // Prevents parent scroll clash while tracing
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* <View style={styles.topActionsContainer}>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => speakCurrentNumber(question.targetCount)}
          >
            <IconVolume size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View> */}
        <View style={styles.board}>
          <View
            style={styles.canvasContainer}
            {...panResponder.panHandlers}
            onLayout={(event) => {
              boardLayoutRef.current = event.nativeEvent.layout;
            }}
          >
            {/* Guide Template SVG */}
            <Svg
              style={StyleSheet.absoluteFill}
              viewBox="0 0 200 260"
              preserveAspectRatio="xMidYMid meet"
            >
              {guidePaths.map((pathD, idx) => (
                <React.Fragment key={idx}>
                  <Path
                    d={pathD}
                    stroke="#e0e0e0"
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d={pathD}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </React.Fragment>
              ))}
            </Svg>

            {/* Touch Tracing Overlay SVG */}
            <Svg style={StyleSheet.absoluteFill}>
              {drawnPaths.map((pathPts, idx) => (
                <Path
                  key={`path-${idx}`}
                  d={convertPointsToSvgPath(pathPts)}
                  stroke="#4CAF50"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
              {currentPath.length > 0 && (
                <Path
                  d={convertPointsToSvgPath(currentPath)}
                  stroke="#4CAF50"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}
            </Svg>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleValidate}>
            <Text style={styles.continueText}>Continuer</Text>
            <IconArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    flexDirection: "column",
    paddingBottom: 30,
  },
  board: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  topActionsContainer: {
    width: "100%",
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  volumeButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statusText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  canvasContainer: {
    position: "relative",
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: "transparent",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  continueButton: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    gap: 8,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});