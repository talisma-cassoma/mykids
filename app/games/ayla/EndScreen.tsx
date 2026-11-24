import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { IconArrowNarrowRight } from "@tabler/icons-react-native";

import { SvgAsset } from "@/components/SvgAssets";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { ThemedText } from "@/components/ThemedText";
import { useAyla } from "@/context/AylaContext";

const SCORES_PER_PAGE = 6;
const ROWS_PER_SCORE = 2; // 6 scores × 2 ruled lines = 12 ruled lines per page

const FLIP_SPRING = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
};

interface ScoreEntry {
  name: string;
  score: string | number;
  duration?: string;
}

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
    const pageHeight = pageWidth * 1.38;

    const headerHeight = isTablet ? 34 : 24;
    const marginLeftPrimary = isTablet ? 32 : 20;
    const marginLeftSecondary = marginLeftPrimary + (isTablet ? 5 : 4);

    // Guarantee at least 13 ruled rows fit cleanly so 6 scores (12 rows) never overflow
    const usableHeight = Math.max(0, pageHeight - headerHeight - 8);
    const baseLineHeight = isTablet ? 24 : 18;
    const lineHeight = Math.min(baseLineHeight, Math.floor(usableHeight / 13));

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

function chunkScores(items: ScoreEntry[], size: number): ScoreEntry[][] {
  if (items.length === 0) return [[]];
  const chunks: ScoreEntry[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Lined Notebook Page:
 * Horizontal blue lines (#88B8CC) + vertical pink margin line (#F395BC).
 * Content paddingTop equals headerHeight exactly so every child row aligns
 * with the horizontal ruled lines.
 */
const NotebookPaper = ({
  metrics,
  pageNumber,
  children,
}: {
  metrics: BookMetrics;
  pageNumber?: number;
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

      {/* Top Header Area (above first ruled line) */}
      <View
        style={[
          styles.pageHeader,
          {
            height: headerHeight,
            paddingLeft: marginLeftSecondary + (isTablet ? 10 : 6),
            paddingRight: isTablet ? 12 : 8,
          },
        ]}
      >
        {pageNumber !== undefined && (
          <ThemedText
            style={[styles.pageNumberText, isTablet && styles.pageNumberTablet]}
          >
            p. {pageNumber}
          </ThemedText>
        )}
      </View>

      {/* Ruled Lines */}
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

      {/* Content aligned strictly to the ruled grid */}
      <View
        style={[
          styles.paperContent,
          {
            paddingTop: headerHeight,
            paddingLeft: marginLeftSecondary + (isTablet ? 10 : 6),
            paddingRight: isTablet ? 12 : 8,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

/**
 * Renders up to 6 scores inside a single notebook page.
 * Each score takes 2 ruled line heights:
 *  - Line 1: Game Name (sits cleanly on the 1st ruled line)
 *  - Line 2: Score & Duration (sits cleanly on the 2nd ruled line)
 */
const ScorePageContent = ({
  scores,
  metrics,
  isEmptyBook,
}: {
  scores: ScoreEntry[];
  metrics: BookMetrics;
  isEmptyBook: boolean;
}) => {
  const { lineHeight, isTablet } = metrics;

  if (isEmptyBook) {
    return (
      <View style={{ height: lineHeight * 2, justifyContent: "flex-end" }}>
        <ThemedText
          numberOfLines={1}
          style={[
            styles.ruledText,
            styles.emptyText,
            {
              height: lineHeight,
              lineHeight,
              fontSize: isTablet ? 13 : 10.5,
            },
          ]}
        >
          Aucun point pour l&apos;instant
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.scoreListContainer}>
      {scores.map((item, idx) => (
        <View
          key={idx}
          style={{
            height: lineHeight * ROWS_PER_SCORE,
            justifyContent: "flex-end",
          }}
        >
          {/* Ruled Space 1: Game Title */}
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.ruledText,
              styles.scoreTitleText,
              {
                height: lineHeight,
                lineHeight,
                fontSize: isTablet ? 13.5 : 10.5,
              },
            ]}
          >
            {item.name}
          </ThemedText>

          {/* Ruled Space 2: Score & Duration */}
          <View
            style={[
              styles.scoreDetailRow,
              { height: lineHeight },
            ]}
          >
            <ThemedText
              numberOfLines={1}
              style={[
                styles.ruledText,
                styles.scoreValueText,
                {
                  height: lineHeight,
                  lineHeight,
                  fontSize: isTablet ? 12.5 : 9.5,
                },
              ]}
            >
              {item.score}
            </ThemedText>
            <ThemedText
              numberOfLines={1}
              style={[
                styles.ruledText,
                styles.scoreDurationText,
                {
                  height: lineHeight,
                  lineHeight,
                  fontSize: isTablet ? 12 : 9,
                },
              ]}
            >
              ⏱ {item.duration ?? "—"}
            </ThemedText>
          </View>
        </View>
      ))}
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

export default function EndScreen() {
  const { resetGame, gameScore } = useAyla();
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const { width: screenWidth } = useWindowDimensions();
  const metrics = useBookMetrics();
  const { pageWidth, pageHeight, isTablet } = metrics;

  // Split scores into pages of 6 items
  const scorePages = useMemo(
    () => chunkScores(gameScore, SCORES_PER_PAGE),
    [gameScore]
  );

  // Each physical paper sheet holds 2 score pages (front & back),
  // plus 1 front cover leaf and 1 back cover leaf.
  const paperLeafCount = Math.max(1, Math.ceil(scorePages.length / 2));
  const totalLeaves = paperLeafCount + 2;

  // Start at 1 so the book opens directly to the first score spread,
  // while still allowing the user to swipe back to 0 (Front Cover) or forward to the end.
  const flipProgress = useSharedValue(1);
  const startFlipProgress = useSharedValue(1);

  // Unrestricted pan gesture across all leaves [0 .. totalLeaves]
  const flipPanGesture = Gesture.Pan()
    .onBegin(() => {
      startFlipProgress.value = flipProgress.value;
    })
    .onUpdate((event) => {
      const delta = -event.translationX / (pageWidth * 1.25);
      flipProgress.value = Math.max(
        0,
        Math.min(totalLeaves, startFlipProgress.value + delta)
      );
    })
    .onEnd((event) => {
      const velocityBoost = -event.velocityX / 1200;
      const targetPage = Math.round(
        Math.max(0, Math.min(totalLeaves, flipProgress.value + velocityBoost))
      );
      flipProgress.value = withSpring(targetPage, FLIP_SPRING);
    });

  // Centers closed front cover (0), open spread (1..totalLeaves-1), and closed back cover (totalLeaves)
  const bookSpineStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      flipProgress.value,
      [0, 1, Math.max(1, totalLeaves - 1), totalLeaves],
      [-pageWidth / 2, 0, 0, pageWidth / 2],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateX }],
    };
  }, [pageWidth, totalLeaves]);

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <ThemedSafeAreaView style={styles.safeArea}>
        <View style={styles.headerBlock}>
          <ThemedText style={styles.title}>C&apos;est fini 🎮</ThemedText>
          <ThemedText style={styles.subtitle}>
            Glisse les pages pour voir tes résultats
          </ThemedText>
        </View>

        {/* Interactive 3D Score Notebook */}
        <GestureDetector gesture={flipPanGesture}>
          <View
            style={[
              styles.bookStage,
              {
                width: screenWidth - 24,
                height: pageHeight + 12,
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
                totalLeaves={totalLeaves}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
                progress={flipProgress}
                frontFace={
                  <View style={[styles.cover, styles.frontCover]}>
                    <ThemedText style={styles.coverTitle}>
                      CAHIER DE SCORES{"\n"}DE AYLA
                    </ThemedText>
                    <View style={styles.avatarRing}>
                      <SvgAsset
                        name="PrincessProfileAvatarSvg"
                        width={isTablet ? 110 : 82}
                        height={isTablet ? 110 : 82}
                        style={{ aspectRatio: 1 }}
                      />
                    </View>
                  </View>
                }
                backFace={
                  <View style={[styles.cover, styles.insideCover]}>
                    <ThemedText style={styles.insideCoverLabel}>
                      Mes résultats ({gameScore.length})
                    </ThemedText>
                  </View>
                }
              />

              {/* DYNAMIC PAPER LEAVES (6 SCORES PER PAGE) */}
              {Array.from({ length: paperLeafCount }).map((_, paperIdx) => {
                const leafIndex = paperIdx + 1;
                const frontScorePageIdx = paperIdx * 2;
                const backScorePageIdx = paperIdx * 2 + 1;

                const frontScores = scorePages[frontScorePageIdx] ?? [];
                const backScores = scorePages[backScorePageIdx] ?? [];

                return (
                  <BookLeaf
                    key={`score-leaf-${leafIndex}`}
                    index={leafIndex}
                    totalLeaves={totalLeaves}
                    pageWidth={pageWidth}
                    pageHeight={pageHeight}
                    progress={flipProgress}
                    frontFace={
                      <NotebookPaper
                        metrics={metrics}
                        pageNumber={frontScorePageIdx + 1}
                      >
                        <ScorePageContent
                          scores={frontScores}
                          metrics={metrics}
                          isEmptyBook={
                            gameScore.length === 0 && frontScorePageIdx === 0
                          }
                        />
                      </NotebookPaper>
                    }
                    backFace={
                      <NotebookPaper
                        metrics={metrics}
                        pageNumber={
                          backScores.length > 0
                            ? backScorePageIdx + 1
                            : undefined
                        }
                      >
                        {backScores.length > 0 ? (
                          <ScorePageContent
                            scores={backScores}
                            metrics={metrics}
                            isEmptyBook={false}
                          />
                        ) : null}
                      </NotebookPaper>
                    }
                  />
                );
              })}

              {/* LAST LEAF: BACK COVER */}
              <BookLeaf
                index={totalLeaves - 1}
                totalLeaves={totalLeaves}
                pageWidth={pageWidth}
                pageHeight={pageHeight}
                progress={flipProgress}
                frontFace={
                  <View style={[styles.cover, styles.insideCover]}>
                    <ThemedText style={styles.insideCoverLabel}>
                      Bravo Ayla !
                    </ThemedText>
                  </View>
                }
                backFace={
                  <View style={[styles.cover, styles.backCover]}>
                    <ThemedText style={styles.backCoverText}>FIN</ThemedText>
                  </View>
                }
              />
            </Animated.View>
          </View>
        </GestureDetector>

        <View style={styles.footer}>
          <TouchableOpacity
            disabled={isButtonLoading}
            style={styles.advanceButton}
            onPress={() => {
              setIsButtonLoading(true);
              resetGame();
            }}
          >
            <Text style={styles.advanceButtonText}>avancer</Text>
            <IconArrowNarrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerBlock: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: "center",
  },
  bookStage: {
    alignSelf: "center",
    justifyContent: "center",
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
    gap: 14,
  },
  frontCover: {
    backgroundColor: "#4caf50",
    borderLeftWidth: 7,
    borderLeftColor: "#4aa74e",
  },
  coverTitle: {
    color: "#F5E6C4",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  avatarRing: {
    backgroundColor: "#FFDFB9",
    borderColor: "#FFFFFF",
    borderRadius: 9999,
    borderWidth: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insideCover: {
    backgroundColor: "#F4EFE6",
  },
  insideCoverLabel: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#7A7267",
    textAlign: "center",
  },
  backCover: {
    backgroundColor: "#2B3A4A",
    borderRightWidth: 7,
    borderRightColor: "#1E2936",
  },
  backCoverText: {
    color: "#4caf50",
    fontSize: 12,
    fontWeight: "700",
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
  pageHeader: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 2,
  },
  pageNumberText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#8A8175",
  },
  pageNumberTablet: {
    fontSize: 11,
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
  scoreListContainer: {
    width: "100%",
  },
  ruledText: {
    includeFontPadding: false,
    textAlignVertical: "bottom",
  },
  scoreTitleText: {
    fontWeight: "700",
    color: "#1E293B",
  },
  scoreDetailRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 4,
  },
  scoreValueText: {
    fontWeight: "600",
    color: "#2E7D32",
    flexShrink: 1,
  },
  scoreDurationText: {
    fontWeight: "500",
    color: "#64748B",
  },
  emptyText: {
    fontStyle: "italic",
    color: "#94A3B8",
  },
  footer: {
    marginTop: 12,
    alignItems: "center",
  },
  advanceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 6,
  },
  advanceButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});