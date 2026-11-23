import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions, TouchableOpacity } from "react-native";
import { IconVolume } from "@tabler/icons-react-native";
import { SvgAsset } from '@/components/SvgAssets';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { DropProvider, Draggable, Droppable } from "react-native-reanimated-dnd";

import { Button } from "@/components/Button";
import { GameHeader } from "@/components/Header";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAyla } from "@/context/AylaContext";
import { TimerConverter, useSpeech } from "@/utils/lessons";

const MIN_NUMBER = 1;
const MAX_NUMBER = 10;
const TOTAL_NUMBERS = MAX_NUMBER - MIN_NUMBER + 1;
const NUMBER_COLOR = "#64748B";

const FLIP_SPRING = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
};

interface BookMetrics {
  pageWidth: number;
  pageHeight: number;
  lineHeight: number;
  headerHeight: number;
  marginLeftPrimary: number;
  marginLeftSecondary: number;
  isTablet: boolean;
}

function useBookMetrics(): BookMetrics {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const minSide = Math.min(width, height);
    const isTablet = minSide >= 600;

    const maxSpreadWidth = width * (isTablet ? 0.86 : 0.94);
    const targetPageWidth = isTablet
      ? Math.min(width * 0.4, 360)
      : Math.min(width * 0.48, 205);

    const pageWidth = Math.min(targetPageWidth, maxSpreadWidth / 2);
    const pageHeight = pageWidth * 1.32;

    const lineHeight = isTablet ? 22 : 17;
    const headerHeight = isTablet ? 34 : 24;
    const marginLeftPrimary = isTablet ? 32 : 20;
    const marginLeftSecondary = marginLeftPrimary + (isTablet ? 5 : 4);

    return {
      pageWidth,
      pageHeight,
      lineHeight,
      headerHeight,
      marginLeftPrimary,
      marginLeftSecondary,
      isTablet,
    };
  }, [width, height]);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function createFullPool(): number[] {
  return shuffle(
    Array.from({ length: TOTAL_NUMBERS }, (_, index) => MIN_NUMBER + index)
  );
}

/**
 * Lined Notebook Page:
 * Horizontal blue lines (#88B8CC) + double vertical margin lines (#F395BC)
 */
const NotebookPaper = ({
  metrics,
  children,
}: {
  metrics: BookMetrics;
  children?: React.ReactNode;
}) => {
  const {
    pageHeight,
    lineHeight,
    headerHeight,
    marginLeftPrimary,
    marginLeftSecondary,
    isTablet,
  } = metrics;

  const usableHeight = Math.max(0, pageHeight - headerHeight - 8);
  const lineCount = Math.floor(usableHeight / lineHeight);

  return (
    <View style={styles.paperBase}>
      <View
        style={[
          styles.verticalMarginLine,
          { left: marginLeftPrimary, width: isTablet ? 1.5 : 1 },
        ]}
      />

      <View style={{ height: headerHeight }} />

      <View style={styles.linesContainer}>
        {Array.from({ length: lineCount }).map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.horizontalLine,
              {
                height: lineHeight,
                borderBottomWidth: isTablet ? 1.25 : 1,
              },
            ]}
          />
        ))}
      </View>

      <View
        style={[
          styles.paperContent,
          {
            paddingTop: headerHeight + 2,
            paddingLeft: marginLeftSecondary + (isTablet ? 12 : 7),
            paddingRight: isTablet ? 14 : 8,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

interface LeafProps {
  index: number;
  totalLeaves: number;
  pageWidth: number;
  pageHeight: number;
  progress: SharedValue<number>;
  frontFace: React.ReactNode;
  backFace: React.ReactNode;
}

const BookLeaf = ({
  index,
  totalLeaves,
  pageWidth,
  pageHeight,
  progress,
  frontFace,
  backFace,
}: LeafProps) => {
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const leafProgress = interpolate(
      progress.value,
      [index, index + 1],
      [0, 1],
      Extrapolation.CLAMP
    );

    const rotateY = interpolate(leafProgress, [0, 1], [0, -180]);
    const zIndex = leafProgress < 0.5 ? totalLeaves - index : index + 1;

    return {
      zIndex,
      transform: [
        { perspective: 1400 },
        { translateX: -pageWidth / 2 },
        { rotateY: `${rotateY}deg` },
        { translateX: pageWidth / 2 },
      ],
    };
  }, [index, totalLeaves, pageWidth]);

  const frontOpacityStyle = useAnimatedStyle(() => {
    const leafProgress = interpolate(
      progress.value,
      [index, index + 1],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity: leafProgress < 0.5 ? 1 : 0 };
  }, [index]);

  const backOpacityStyle = useAnimatedStyle(() => {
    const leafProgress = interpolate(
      progress.value,
      [index, index + 1],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity: leafProgress >= 0.5 ? 1 : 0 };
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.leafContainer,
        { width: pageWidth, height: pageHeight },
        containerAnimatedStyle,
      ]}
    >
      <Animated.View style={[styles.face, frontOpacityStyle]}>
        {frontFace}
      </Animated.View>
      <Animated.View style={[styles.face, styles.backFace, backOpacityStyle]}>
        {backFace}
      </Animated.View>
    </Animated.View>
  );
};

/**
 * Each number has a fixed target in the notebook grid, so drops are only
 * accepted in a numbered cell.
 */
const NumberDropSlots = ({
  placedNumbers,
  currentExpectedNumber,
  onDrop,
  onSpeakCurrentNumber,
  isTablet,
}: {
  placedNumbers: number[];
  currentExpectedNumber: number;
  onDrop: (draggedValue: number, targetSlot: number) => void;
  onSpeakCurrentNumber: () => void;
  isTablet: boolean;
}) => {
  const slotSize = isTablet ? 54 : 42;

  return (
    <View style={styles.slotsContainer}>
      <View style={styles.numberSlotsList}>
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
              style={[styles.numberDropSlotWrapper, { height: slotSize }]}
              activeStyle={{
                backgroundColor: "rgba(59, 130, 246, 0.16)",
                borderColor: "#3B82F6",
                borderWidth: 1,
                borderStyle: "dashed",
              }}
              onDrop={(dragged: number) => onDrop(Number(dragged), slotNumber)}
            >
              <Pressable
                onPress={onSpeakCurrentNumber}
                style={[
                  styles.numberDropSlot,
                  { height: slotSize },
                  isCurrent && styles.numberDropSlotActive,
                  isPlaced && styles.numberDropSlotPlaced,
                ]}
              >
                <ThemedText
                  style={[
                    styles.numberGlyph,
                    isTablet && styles.numberGlyphTablet,
                    styles.numberGlyphColor,
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
 * Number token that pops up out of the notebook page into the top tray
 */
const PoppingNumberToken = ({
  value,
  popIndex,
  popSignal,
  isDraggingNumber,
  isTablet,
  isNotebookOpen,
  dragBoundsRef,
  popDistance,
  onDragStateChange,
}: {
  value: number;
  popIndex: number;
  popSignal: SharedValue<number>;
  isDraggingNumber: SharedValue<boolean>;
  isTablet: boolean;
  isNotebookOpen: boolean;
  dragBoundsRef: React.RefObject<View | Animated.View | null>;
  popDistance: number;
  onDragStateChange: (dragging: boolean) => void;
}) => {
  const popAnimStyle = useAnimatedStyle(() => {
    const active = popSignal.value === 1;
    return {
      opacity: active
        ? withDelay(popIndex * 45, withTiming(1, { duration: 220 }))
        : withTiming(0, { duration: 0 }),
      transform: [
        {
          translateY: active
            ? withDelay(
              popIndex * 45,
              withSpring(0, { damping: 14, stiffness: 160 })
            )
            : withTiming(popDistance, { duration: 0 }),
        },
        {
          scale: active
            ? withDelay(
              popIndex * 45,
              withSpring(1, { damping: 13, stiffness: 180 })
            )
            : withTiming(0.5, { duration: 150 }),
        },
      ],
    };
  }, [popDistance, popIndex]);

  return (
    <Animated.View style={popAnimStyle}>
      <Draggable
        data={value}
        dragBoundsRef={
          dragBoundsRef as React.RefObject<View | Animated.View>
        }
        dragDisabled={!isNotebookOpen}
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
        <View
          style={[
            styles.plainNumberItem,
            isTablet && styles.plainNumberItemTablet,
          ]}
        >
          <ThemedText
            style={[
              styles.numberGlyph,
              isTablet && styles.numberGlyphTablet,
              styles.numberGlyphColor,
            ]}
          >
            {value}
          </ThemedText>
        </View>
      </Draggable>
    </Animated.View>
  );
};

export default function CountingFlipbookGameScreen() {
  const { nextStage, setGameScore } = useAyla();
  const { speak } = useSpeech();
  const { width: screenWidth } = useWindowDimensions();
  const metrics = useBookMetrics();
  const { pageWidth, pageHeight, isTablet } = metrics;

  const TOTAL_LEAVES = 3; // 0: Front Cover, 1: Notebook Sheet, 2: Back Cover

  const [dragPool, setDragPool] = useState<number[]>(() => createFullPool());
  const [placedNumbers, setPlacedNumbers] = useState<number[]>([]);
  const [dragResetVersions, setDragResetVersions] = useState<
    Record<number, number>
  >({});
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>(
    "Ouvre le cahier pour commencer"
  );
  const [time, setTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const [isAnyDragging, setIsAnyDragging] = useState<boolean>(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  const flipProgress = useSharedValue(0);
  const startFlipProgress = useSharedValue(0);
  const isDraggingNumber = useSharedValue(false);
  const isPoppingShared = useSharedValue(false);
  const popSignal = useSharedValue(0);
  const dragBoundsRef = useAnimatedRef<View>();
  const popDistance = 52 + pageHeight / 2;

  const gameTitle = useMemo(() => "Compte et glisse le bon nombre", []);
  const currentExpectedNumber = MIN_NUMBER + placedNumbers.length;

  const triggerPopOutFromBook = useCallback(() => {
    isPoppingShared.value = true;
    popSignal.value = 0;

    requestAnimationFrame(() => {
      popSignal.value = 1;
    });

    const lockTimer = setTimeout(() => {
      isPoppingShared.value = false;
    }, 650);

    return () => clearTimeout(lockTimer);
  }, [isPoppingShared, popSignal]);

  const openNotebook = useCallback(() => {
    setIsNotebookOpen(true);
    setStatusText(`Écoute et glisse le nombre ${MIN_NUMBER}`);
    triggerPopOutFromBook();
    void speak(`${MIN_NUMBER}`, "fr-FR");
  }, [speak, triggerPopOutFromBook]);

  const finishGame = useCallback(
    (finalMistakes: number) => {
      if (hasFinished) return;

      setHasFinished(true);
      setStatusText("Bravo ! Tu as terminé les 10 nombres.");
      void speak("Bravo ! Tu as terminé.", "fr-FR");
      setGameScore((prev) => [
        ...prev,
        {
          score: `${TOTAL_NUMBERS}/${TOTAL_NUMBERS} · erreurs: ${finalMistakes}`,
          name: gameTitle,
          duration: TimerConverter(Math.max(1, time)),
        },
      ]);
    },
    [gameTitle, hasFinished, setGameScore, speak, time]
  );

  const resetGameSession = useCallback(() => {
    setDragPool(createFullPool());
    setPlacedNumbers([]);
    setDragResetVersions({});
    setMistakeCount(0);
    setTime(0);
    setIsPaused(false);
    setHasFinished(false);
    setIsAnyDragging(false);
    setIsNotebookOpen(false);
    isDraggingNumber.value = false;
    isPoppingShared.value = false;
    popSignal.value = 0;
    flipProgress.value = withSpring(0, FLIP_SPRING);
    setStatusText("Ouvre le cahier pour commencer");
  }, [
    flipProgress,
    isDraggingNumber,
    isPoppingShared,
    popSignal,
  ]);

  useEffect(() => {
    if (!isNotebookOpen || isPaused || hasFinished) return;

    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFinished, isNotebookOpen, isPaused]);

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

  const handleDrop = useCallback(
    (draggedValue: number, targetSlot: number) => {
      isDraggingNumber.value = false;
      setIsAnyDragging(false);

      if (isPaused || hasFinished || currentExpectedNumber > MAX_NUMBER) return;

      // A number is valid only when both the token and the destination row
      // match the next expected value.
      const isCorrect =
        draggedValue === currentExpectedNumber &&
        targetSlot === currentExpectedNumber;

      if (isCorrect) {
        setStatusText("Bravo !");
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
          setStatusText(`Écoute et glisse le nombre ${nextNumber}`);
          if (nextNumber === 8) {
            void speak("huite", "fr-FR");
          } else {
            void speak(`${nextNumber}`, "fr-FR");
          }
        }, 800);
      } else {
        setStatusText("Oups ! Ce n'est pas le bon ordre.");
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

  // The book can be opened once; the page gesture is disabled afterward.
  const flipPanGesture = Gesture.Pan()
    .enabled(!isNotebookOpen && !isPaused && !hasFinished && !isAnyDragging)
    .onBegin(() => {
      if (isDraggingNumber.value || isPoppingShared.value) return;
      startFlipProgress.value = flipProgress.value;
    })
    .onUpdate((event) => {
      if (isDraggingNumber.value || isPoppingShared.value) return;
      const delta = -event.translationX / (pageWidth * 1.25);
      flipProgress.value = Math.max(
        0,
        Math.min(1, startFlipProgress.value + delta)
      );
    })
    .onEnd((event) => {
      if (isDraggingNumber.value || isPoppingShared.value) return;
      const velocityBoost = -event.velocityX / 1200;
      const targetPage = Math.round(
        Math.max(0, Math.min(1, flipProgress.value + velocityBoost))
      );
      flipProgress.value = withSpring(targetPage, FLIP_SPRING, (finished) => {
        if (finished && targetPage === 1) {
          runOnJS(openNotebook)();
        }
      });
    });

  // Shifts book spine so closed cover is centered and open spread is centered
  const bookSpineStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      flipProgress.value,
      [0, 1, 2, 3],
      [-pageWidth / 2, 0, 0, pageWidth / 2],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateX }],
    };
  }, [pageWidth]);

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <ThemedSafeAreaView style={styles.safeArea}>
        <GameHeader
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

        <DropProvider>
          <ThemedView
            style={styles.gameBody}
            pointerEvents={isPaused ? "none" : "auto"}
          >
            <View
              ref={dragBoundsRef}
              collapsable={false}
              style={styles.dragBounds}
            >
              {/* Top Pop-Out Tray (no rounded cards) */}
              <View style={styles.popTray}>
                {dragPool.map((value, idx) => (
                  <PoppingNumberToken
                    key={`pop-num-${value}-${dragResetVersions[value] ?? 0}`}
                    value={value}
                    popIndex={idx}
                    popSignal={popSignal}
                    isDraggingNumber={isDraggingNumber}
                    isTablet={isTablet}
                    isNotebookOpen={isNotebookOpen}
                    dragBoundsRef={dragBoundsRef}
                    popDistance={popDistance}
                    onDragStateChange={setIsAnyDragging}
                  />
                ))}
              </View>

              {/* Book Drop Target */}
              <GestureDetector gesture={flipPanGesture}>
                <View
                  style={[
                    styles.bookStage,
                    {
                      width: screenWidth - 32,
                      height: pageHeight + 8,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.bookSpineAnchor,
                      { height: pageHeight },
                      bookSpineStyle,
                    ]}
                  >
                    {/* LEAF 0: FRONT COVER */}
                    <BookLeaf
                      index={0}
                      totalLeaves={TOTAL_LEAVES}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                      progress={flipProgress}
                      frontFace={
                        <View style={[styles.cover, styles.frontCover]}>
                          <ThemedText style={styles.coverTitle}>
                            CAHIER DE DEVOIR{'\n'}
                            DE AYLA
                          </ThemedText>
                          {/* Avatar 1 */}
                          <View
                            style={{ alignItems: "center", justifyContent: "center" }}

                          >
                            <View style={{
                              backgroundColor: "#FFDFB9",
                              borderColor: 'white',
                              borderRadius: 9999,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.25,
                              shadowRadius: 3.84,
                              elevation: 5,
                              alignItems: "center",
                              justifyContent: "center",
                              borderWidth: 20
                            }}>
                              <SvgAsset
                                name="PrincessProfileAvatarSvg"
                                width={100}
                                height={100}
                                style={{ aspectRatio: 1 / 1 }}
                              />
                            </View>
                          </View>
                        </View>
                      }
                      backFace={
                        <View style={[styles.cover, styles.insideCover]}>
                          <ThemedText style={styles.insideCoverLabel}>
                            Dépose ici
                          </ThemedText>
                        </View>
                      }
                    />

                    {/* LEAF 1: RULED NOTEBOOK PAGE (#88B8CC & #F395BC) */}
                    <BookLeaf
                      index={1}
                      totalLeaves={TOTAL_LEAVES}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                      progress={flipProgress}
                      frontFace={
                        <NotebookPaper metrics={metrics}>
                          <NumberDropSlots
                            placedNumbers={placedNumbers}
                            currentExpectedNumber={currentExpectedNumber}
                            onDrop={handleDrop}
                            onSpeakCurrentNumber={replayNumber}
                            isTablet={isTablet}
                          />
                        </NotebookPaper>
                      }
                      backFace={
                        <NotebookPaper metrics={metrics}>
                          <ThemedText
                            style={[
                              styles.dropHintText,
                              isTablet && styles.dropHintTextTablet,
                            ]}
                          >
                            Verso
                          </ThemedText>
                        </NotebookPaper>
                      }
                    />

                    {/* LEAF 2: BACK COVER */}
                    <BookLeaf
                      index={2}
                      totalLeaves={TOTAL_LEAVES}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                      progress={flipProgress}
                      frontFace={
                        <View style={[styles.cover, styles.insideCover]}>
                          <ThemedText style={styles.insideCoverLabel}>
                            Fin
                          </ThemedText>
                        </View>
                      }
                      backFace={
                        <View style={[styles.cover, styles.backCover]}>
                          <ThemedText style={styles.backCoverText}>
                            FIN
                          </ThemedText>
                        </View>
                      }
                    />
                  </Animated.View>
                </View>
              </GestureDetector>
            </View>
          </ThemedView>
        </DropProvider>

        {hasFinished && (
          <Button onPress={nextStage} style={styles.continueButton}>
            <Button.Title>Continuer</Button.Title>
          </Button>
        )}

        {/* <Button onPress={resetGameSession} style={styles.resetButton}>
          <Button.Icon icon={IconRefresh} />
          <Button.Title>Recommencer</Button.Title>
        </Button> */}
      </ThemedSafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  rootView: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    justifyContent: "space-between",
  },
  controlPanel: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  replayButton: {
    flexDirection: "row",
    gap: 8,
    marginTop: 0,
  },
  gameBody: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 4,
  },
  dragBounds: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
  },
  popTray: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    minHeight: 76,
    paddingHorizontal: 8,
    zIndex: 10,
    elevation: 10,
  },
  plainNumberItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  plainNumberItemTablet: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  numberGlyph: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    textAlign: "center",
  },
  numberGlyphTablet: {
    fontSize: 36,
    lineHeight: 42,
  },
  numberGlyphColor: {
    color: NUMBER_COLOR,
  },
  bookStage: {
    alignSelf: "center",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  bookSpineAnchor: {
    width: 0,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  leafContainer: {
    position: "absolute",
    left: 0,
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFDF9",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
  },
  backFace: {
    transform: [{ scaleX: -1 }],
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  cover: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  frontCover: {
    backgroundColor: "#2B3A4A",
    borderLeftWidth: 7,
    borderLeftColor: "#1E2936",
  },
  coverTitle: {
    color: "#F5E6C4",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
    textAlign: 'center'
  },
  insideCover: {
    backgroundColor: "#F4EFE6",
  },
  insideCoverLabel: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#7A7267",
  },
  backCover: {
    backgroundColor: "#2B3A4A",
    borderRightWidth: 7,
    borderRightColor: "#1E2936",
  },
  backCoverText: {
    color: "#8E9EAD",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  paperBase: {
    flex: 1,
    backgroundColor: "#FFFDF8",
    position: "relative",
  },
  verticalMarginLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "#F395BC",
    zIndex: 2,
  },
  linesContainer: {
    flex: 1,
    paddingHorizontal: 6,
  },
  horizontalLine: {
    borderBottomColor: "#88B8CC",
  },
  paperContent: {
    ...StyleSheet.absoluteFillObject,
  },
  dropHintText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  dropHintTextTablet: {
    fontSize: 16,
  },
  slotsContainer: {
    flex: 1,
    width: "100%",
  },
  numberSlotsList: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
  },
  numberDropSlotWrapper: {
    width: "33.333%",
  },
  numberDropSlot: {
    width: "100%",
    padding: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "transparent",
  },
  numberDropSlotActive: {
    backgroundColor: "rgba(59, 130, 246, 0.10)",
    borderColor: "#60A5FA",
    borderStyle: "dashed",
  },
  numberDropSlotPlaced: {
    backgroundColor: "rgba(22, 163, 74, 0.06)",
  },
  placedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  placedGlyph: {
    fontSize: 18,
    fontWeight: "800",
    color: "#16A34A",
  },
  placedGlyphTablet: {
    fontSize: 24,
  },
  continueButton: {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 4,
  },
  resetButton: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
    marginBottom: 8,
  },
});