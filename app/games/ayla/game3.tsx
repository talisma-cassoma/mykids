import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { IconCheck, IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedRef,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { DropProvider, Draggable, Droppable } from "react-native-reanimated-dnd";

import { GameHeader } from "@/components/Header";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { ThemedText } from "@/components/ThemedText";
//import { ThemedView } from "@/components/ThemedView";
import { useAyla } from "@/context/AylaContext";
import { TimerConverter, useSpeech } from "@/utils/lessons";

const MIN_NUMBER = 1;
const MAX_NUMBER = 9; // Matches 1–9 in the reference UI (change to 10 if needed)
const TOTAL_NUMBERS = MAX_NUMBER - MIN_NUMBER + 1;

/**
 * Editable relative coordinates (0 to 1) inside the drag zone.
 * You can freely adjust `x` and `y` for each number to reposition it anywhere in the drag area.
 */
const DRAG_ZONE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0.49, y: 0.08 },
  2: { x: 0.48, y: 0.28 },
  3: { x: 0.52, y: 0.28 },
  4: { x: 0.42, y: 0.34 },
  5: { x: 0.48, y: 0.54 },
  6: { x: 0.52, y: 0.54 },
  7: { x: 0.39, y: 0.60 },
  8: { x: 0.61, y: 0.60 },
  9: { x: 0.51, y: 0.80 },
};

const NOTEBOOK_LINE_COUNT = 10;

interface NotebookMetrics {
  sheetWidth: number;
  lineSpacing: number;
  marginLeft: number;
  isTablet: boolean;
}

function useNotebookMetrics(): NotebookMetrics {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const minSide = Math.min(width, height);
    const isTablet = minSide >= 600;

    const sheetWidth = isTablet ? Math.min(width * 0.6, 520) : width * 0.88;
    const lineSpacing = isTablet ? 44 : 20;
    const marginLeft = Math.round(sheetWidth * 0.1);

    return {
      sheetWidth,
      lineSpacing,
      marginLeft,
      isTablet,
    };
  }, [width, height]);
}

function formatCentisecondTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}0`;
}

/**
 * Minimalist ruled notebook built strictly with 1px-thick Views
 * so droppable slots sit cleanly between the ruled horizontal lines.
 */
const RuledNotebookSheet = ({
  metrics,
  placedNumbers,
  currentExpectedNumber,
  onDrop,
  onSpeakCurrentNumber,
}: {
  metrics: NotebookMetrics;
  placedNumbers: number[];
  currentExpectedNumber: number;
  onDrop: (draggedValue: number, targetSlot: number) => void;
  onSpeakCurrentNumber: () => void;
}) => {
  const { sheetWidth, lineSpacing, marginLeft, isTablet } = metrics;
  const totalHeight = NOTEBOOK_LINE_COUNT * lineSpacing;
  // Each slot occupies one inter-line gap instead of a ruled line.
  const slotHeight = lineSpacing;

  return (
    <View
      style={[
        styles.notebookSheet,
        { width: sheetWidth, height: totalHeight },
      ]}
    >
      {/* Vertical pink margin line (width = 1) */}
      <View
        pointerEvents="none"
        style={[
          styles.verticalMarginLine,
          {
            left: marginLeft,
            height: totalHeight + 22,
            top: -22,
          },
        ]}
      />

      {/* Horizontal blue ruled lines (height = 1) */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: NOTEBOOK_LINE_COUNT }).map((_, index) => (
          <View
            key={`rule-${index}`}
            style={[
              styles.horizontalRuleLine,
              { top: (index + 1) * lineSpacing },
            ]}
          />
        ))}
      </View>

      {/* Droppable slots aligned right between the horizontal notebook lines */}
      <View
        style={[
          styles.slotsOverlay,
          {
            paddingTop: lineSpacing,
            paddingLeft: marginLeft + (isTablet ? 24 : 16),
            paddingRight: isTablet ? 24 : 16,
          },
        ]}
      >
        {Array.from({ length: TOTAL_NUMBERS }, (_, index) => {
          const slotNumber = MIN_NUMBER + index;
          const isPlaced = placedNumbers.includes(slotNumber);
          const isCurrent = slotNumber === currentExpectedNumber;

          return (
            <Droppable
              key={`number-slot-${slotNumber}`}
              droppableId={`number-slot-${slotNumber}`}
              capacity={1}
              dropDisabled={isPlaced}
              dropAlignment="center"
              style={[styles.numberDropSlotWrapper, { height: slotHeight }]}
              activeStyle={styles.numberDropSlotHover}
              onDrop={(dragged: number) => onDrop(Number(dragged), slotNumber)}
            >
              <Pressable
                onPress={onSpeakCurrentNumber}
                style={[
                  styles.numberDropSlot,
                  { height: slotHeight - 2 },
                  isCurrent && styles.numberDropSlotActive,
                ]}
              >
                <ThemedText
                  style={[
                    styles.numberGlyph,
                    isTablet && styles.numberGlyphTablet,
                  ]}
                >
                  {isPlaced ? slotNumber : ""}
                </ThemedText>
              </Pressable>
            </Droppable>
          );
        })}
      </View>
    </View>
  );
};

/**
 * Draggable number positioned using the coordinates in DRAG_ZONE_POSITIONS
 */
const ScatteredNumberToken = ({
  value,
  position,
  zoneSize,
  isTablet,
  isDraggingNumber,
  dragBoundsRef,
  onDragStateChange,
}: {
  value: number;
  position: { x: number; y: number };
  zoneSize: { width: number; height: number };
  isTablet: boolean;
  isDraggingNumber: SharedValue<boolean>;
  dragBoundsRef: React.RefObject<View | Animated.View | null>;
  onDragStateChange: (dragging: boolean) => void;
}) => {
  const tokenBoxSize = isTablet ? 44 : 36;

  if (zoneSize.width === 0 || zoneSize.height === 0) return null;

  const left = Math.max(
    0,
    Math.min(
      zoneSize.width - tokenBoxSize,
      position.x * zoneSize.width - tokenBoxSize / 2
    )
  );
  const top = Math.max(
    0,
    Math.min(
      zoneSize.height - tokenBoxSize,
      position.y * zoneSize.height - tokenBoxSize / 2
    )
  );

  return (
    <View
      style={[
        styles.scatteredTokenAnchor,
        {
          left,
          top,
          width: tokenBoxSize,
          height: tokenBoxSize,
        },
      ]}
    >
      <Draggable
        data={value}
        dragBoundsRef={dragBoundsRef as React.RefObject<View | Animated.View>}
        collisionAlgorithm="center"
        onDragStart={() => {
          isDraggingNumber.value = true;
          onDragStateChange(true);
        }}
        onDragEnd={() => {
          isDraggingNumber.value = false;
          onDragStateChange(false);
        }}
      >
        <View style={styles.plainNumberItem}>
          <ThemedText
            style={[styles.numberGlyph, isTablet && styles.numberGlyphTablet]}
          >
            {value}
          </ThemedText>
        </View>
      </Draggable>
    </View>
  );
};

export default function CountingNotebookGameScreen() {
  const { nextStage, setGameScore } = useAyla();
  const { speak } = useSpeech();
  const metrics = useNotebookMetrics();
  const { isTablet } = metrics;

  const [dragPool, setDragPool] = useState<number[]>(() =>
    Array.from({ length: TOTAL_NUMBERS }, (_, i) => MIN_NUMBER + i)
  );
  const [placedNumbers, setPlacedNumbers] = useState<number[]>([]);
  const [dragResetVersions, setDragResetVersions] = useState<
    Record<number, number>
  >({});
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const [dragZoneSize, setDragZoneSize] = useState({ width: 0, height: 0 });

  const isDraggingNumber = useSharedValue(false);
  const dragBoundsRef = useAnimatedRef<View>();

  const gameTitle = useMemo(() => "Compte et glisse le bon nombre", []);
  const currentExpectedNumber = MIN_NUMBER + placedNumbers.length;

  useEffect(() => {
    void speak(`${MIN_NUMBER}`, "fr-FR");
  }, [speak]);

  useEffect(() => {
    if (isPaused || hasFinished) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFinished, isPaused]);

  const finishGame = useCallback(
    (finalMistakes: number) => {
      if (hasFinished) return;

      setHasFinished(true);
      void speak("Bravo ! Tu as terminé.", "fr-FR");
      setGameScore((prev) => [
        ...prev,
        {
          score: `${TOTAL_NUMBERS}/${TOTAL_NUMBERS} · erreurs: ${finalMistakes}`,
          name: gameTitle,
          duration: TimerConverter(Math.max(1, time)),
        },
      ]);
      nextStage();
    },
    [gameTitle, hasFinished, nextStage, setGameScore, speak, time]
  );

  const replayNumber = useCallback(() => {
    if (!isPaused && currentExpectedNumber <= MAX_NUMBER) {
      if (currentExpectedNumber === 8) {
        void speak("huite", "fr-FR");
      } else {
        void speak(`${currentExpectedNumber}`, "fr-FR");
      }
    }
  }, [currentExpectedNumber, isPaused, speak]);

  const togglePause = useCallback(() => {
    setIsPaused((paused) => !paused);
  }, []);

  const handleValidate = useCallback(() => {
    if (placedNumbers.length >= TOTAL_NUMBERS) {
      finishGame(mistakeCount);
    } else {
      replayNumber();
    }
  }, [finishGame, mistakeCount, placedNumbers.length, replayNumber]);

  const handleDrop = useCallback(
    (draggedValue: number, targetSlot: number) => {
      isDraggingNumber.value = false;

      if (isPaused || hasFinished || currentExpectedNumber > MAX_NUMBER) return;

      const isCorrect =
        draggedValue === currentExpectedNumber &&
        targetSlot === currentExpectedNumber;

      if (isCorrect) {
        void speak("Bravo", "fr-FR");

        const updatedPlaced = [...placedNumbers, draggedValue];
        setPlacedNumbers(updatedPlaced);
        setDragPool((prev) => prev.filter((val) => val !== draggedValue));

        if (updatedPlaced.length >= TOTAL_NUMBERS) {
          finishGame(mistakeCount);
          return;
        }

        const nextNumber = currentExpectedNumber + 1;
        setTimeout(() => {
          if (nextNumber === 8) {
            void speak("huite", "fr-FR");
          } else {
            void speak(`${nextNumber}`, "fr-FR");
          }
        }, 800);
      } else {
        void speak("Faux", "fr-FR");
        setMistakeCount((prev) => prev + 1);
        setDragResetVersions((prev) => ({
          ...prev,
          [draggedValue]: (prev[draggedValue] ?? 0) + 1,
        }));
      }
    },
    [
      currentExpectedNumber,
      finishGame,
      hasFinished,
      isDraggingNumber,
      isPaused,
      mistakeCount,
      placedNumbers,
      speak,
    ]
  );

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <ThemedSafeAreaView darkColor="#1e1d1d" style={styles.safeArea}>
        <GameHeader
          trophiesCount={5}
          coinsCount={4}
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

        <DropProvider>
          <View style={styles.gameBody}>
            <View
              ref={dragBoundsRef}
              collapsable={false}
              style={styles.dragBounds}
            >
              {/* Upper Drag Zone with constant-positioned numbers */}
              <View
                pointerEvents={isPaused ? "none" : "auto"}
                style={styles.dragZone}
                onLayout={(e) => {
                  const { width, height } = e.nativeEvent.layout;
                  setDragZoneSize({ width, height });
                }}
              >
                {dragPool.map((value) => (
                  <ScatteredNumberToken
                    key={`drag-num-${value}-${dragResetVersions[value] ?? 0}`}
                    value={value}
                    position={
                      DRAG_ZONE_POSITIONS[value] ?? { x: 0.5, y: 0.5 }
                    }
                    zoneSize={dragZoneSize}
                    isTablet={isTablet}
                    isDraggingNumber={isDraggingNumber}
                    dragBoundsRef={dragBoundsRef}
                    onDragStateChange={() => { }}
                  />
                ))}
              </View>

              {/* Lower Notebook Drop Zone */}
              <View
                pointerEvents={isPaused ? "none" : "auto"}
                style={styles.notebookStage}
              >
                <RuledNotebookSheet
                  metrics={metrics}
                  placedNumbers={placedNumbers}
                  currentExpectedNumber={currentExpectedNumber}
                  onDrop={handleDrop}
                  onSpeakCurrentNumber={replayNumber}
                />
              </View>
            </View>
          </View>
        </DropProvider>
      </ThemedSafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  pauseSwitchPill: {
    width: 78,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#28C76F",
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  gameBody: {
    flex: 1,
  },
  dragBounds: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    paddingBottom: 24,
  },
  dragZone: {
    width: "100%",
    height: "36%",
    position: "relative",
    zIndex: 10,
    elevation: 10,
  },
  scatteredTokenAnchor: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  plainNumberItem: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  numberGlyph: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    textAlign: "center",
  },
  numberGlyphTablet: {
    fontSize: 32,
    lineHeight: 38,
  },
  notebookStage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notebookSheet: {
    position: "relative",
  },
  verticalMarginLine: {
    position: "absolute",
    width: 1,
    backgroundColor: "#F395BC",
    zIndex: 2,
  },
  horizontalRuleLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#88B8CC",
  },
  slotsOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    zIndex: 3,
  },
  numberDropSlotWrapper: {
    width: "33.333%",
    justifyContent: "center",
    alignItems: "center",
  },
  numberDropSlot: {
    width: "86%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  numberDropSlotActive: {
    backgroundColor: "rgba(59, 130, 246, 0.06)",
  },
  numberDropSlotHover: {
    backgroundColor: "rgba(59, 130, 246, 0.16)",
    borderColor: "#3B82F6",
    borderWidth: 1,
    borderStyle: "dashed",
  },
});