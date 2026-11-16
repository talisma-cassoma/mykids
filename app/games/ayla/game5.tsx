
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from "@/constants/Colors";
import {
  Canvas,
  Path,
  Skia,
} from '@shopify/react-native-skia';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import {
  runOnJS,
  useSharedValue,
} from 'react-native-reanimated';

import { useLocalSearchParams } from 'expo-router';

import {
  IconRotateClockwise,
  IconArrowNarrowRight,
  IconCheck,
  IconTrash,
  IconVolume
} from '@tabler/icons-react-native';

import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { GameHeader } from '@/components/Header';
import { useAyla } from '@/context/AylaContext';

import tracingData from '@/assets/tracingfiles/numbers.json';

import { TimerConverter, useSpeech } from '@/utils/lessons';

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const IS_TABLET = SCREEN_WIDTH >= 768;

const CANVAS_WIDTH = IS_TABLET ? 280 : 260;
const CANVAS_HEIGHT = IS_TABLET ? 320 : 300;

const DRAWING_COLOR = '#2196F3';
const DRAWING_WIDTH = 13;

// Geometric validation settings
const NORMALIZED_SIZE = 100;
const COMPARISON_SAMPLE_COUNT = 64;

const MIN_STROKE_POINTS = 3;
const MIN_DRAWING_SIZE = 25;
const MIN_STROKE_LENGTH = 8;

// Maximum average geometric deviation
const MAX_GEOMETRIC_DISTANCE = 25;

// Length ratio between corresponding reference/user strokes
const MIN_LENGTH_RATIO = 0.35;
const MAX_LENGTH_RATIO = 2.8;

// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------

interface Point {
  x: number;
  y: number;
}

interface Waypoint extends Point {
  id: number;
}

type Segment =
  | {
    type: 'line';
    from: number;
    to: number;
  }
  | {
    type: 'quadratic';
    from: number;
    to: number;
    control: Point;
  }
  | {
    type: 'cubic';
    from: number;
    to: number;
    control1: Point;
    control2: Point;
  };

interface Stroke {
  id: number;
  waypoints: Waypoint[];
  segments: Segment[];
}

interface NumberConfig {
  title: string;
  strokes: Stroke[];
}

type NumberKey = keyof typeof tracingData;

interface ValidationResult {
  accepted: boolean;
  distance: number;
  reason?: string;
}

type NumberWritingAppProps = {
  numberKey?: string;
};

// ---------------------------------------------------------
// NUMBER DATA
// ---------------------------------------------------------

const NUMBER_KEYS = (Object.keys(tracingData) as NumberKey[]).sort(
  (a, b) => Number(a) - Number(b)
);

// ---------------------------------------------------------
// GEOMETRIC UTILITIES
// ---------------------------------------------------------

function distance(a: Point, b: Point): number {
  return Math.hypot(
    a.x - b.x,
    a.y - b.y
  );
}

function getPolylineLength(points: Point[]): number {
  let length = 0;

  for (let i = 1; i < points.length; i++) {
    length += distance(points[i - 1], points[i]);
  }

  return length;
}

// ---------------------------------------------------------
// REFERENCE GEOMETRY
// Convert line/quadratic/cubic segments into points.
// ---------------------------------------------------------

function sampleStrokeTrajectory(
  stroke: Stroke,
  samplesPerSegment = 32
): Point[] {
  if (!stroke.segments.length) {
    return [];
  }

  const waypointMap = new Map<number, Waypoint>(
    stroke.waypoints.map((point) => [point.id, point])
  );

  const trajectory: Point[] = [];

  for (const segment of stroke.segments) {
    const from = waypointMap.get(segment.from);
    const to = waypointMap.get(segment.to);

    if (!from || !to) {
      throw new Error(
        `Invalid reference segment: ${segment.from} -> ${segment.to}`
      );
    }

    if (
      trajectory.length > 0 &&
      distance(trajectory[trajectory.length - 1], from) > 0.01
    ) {
      throw new Error(
        `Disconnected segments in stroke ${stroke.id}`
      );
    }

    const firstSample = trajectory.length === 0 ? 0 : 1;

    for (let i = firstSample; i <= samplesPerSegment; i++) {
      const t = i / samplesPerSegment;
      const mt = 1 - t;

      let point: Point;

      if (segment.type === 'line') {
        point = {
          x: from.x + (to.x - from.x) * t,
          y: from.y + (to.y - from.y) * t,
        };
      } else if (segment.type === 'quadratic') {
        point = {
          x:
            mt * mt * from.x +
            2 * mt * t * segment.control.x +
            t * t * to.x,

          y:
            mt * mt * from.y +
            2 * mt * t * segment.control.y +
            t * t * to.y,
        };
      } else {
        point = {
          x:
            mt ** 3 * from.x +
            3 * mt ** 2 * t * segment.control1.x +
            3 * mt * t ** 2 * segment.control2.x +
            t ** 3 * to.x,

          y:
            mt ** 3 * from.y +
            3 * mt ** 2 * t * segment.control1.y +
            3 * mt * t ** 2 * segment.control2.y +
            t ** 3 * to.y,
        };
      }

      trajectory.push(point);
    }
  }

  return trajectory;
}

// ---------------------------------------------------------
// GLOBAL NORMALIZATION
//
// Removes differences in:
// - Position
// - Scale
//
// Preserves:
// - Aspect ratio
// - Relative position of strokes
// - Geometric proportions
// ---------------------------------------------------------

function normalizeStrokeSet(
  strokes: Point[][]
): Point[][] {
  const allPoints = strokes.flat();

  if (!allPoints.length) {
    return [];
  }

  const minX = Math.min(...allPoints.map(p => p.x));
  const maxX = Math.max(...allPoints.map(p => p.x));

  const minY = Math.min(...allPoints.map(p => p.y));
  const maxY = Math.max(...allPoints.map(p => p.y));

  const width = maxX - minX;
  const height = maxY - minY;

  const maxDimension = Math.max(width, height);

  if (maxDimension <= 0) {
    return [];
  }

  // Uniform scale: never distort the number.
  const scale = NORMALIZED_SIZE / maxDimension;

  const offsetX =
    (NORMALIZED_SIZE - width * scale) / 2;

  const offsetY =
    (NORMALIZED_SIZE - height * scale) / 2;

  return strokes.map(stroke =>
    stroke.map(point => ({
      x: (point.x - minX) * scale + offsetX,
      y: (point.y - minY) * scale + offsetY,
    }))
  );
}

// ---------------------------------------------------------
// ARC LENGTH RESAMPLING
//
// Makes comparison independent of touch-event frequency.
// ---------------------------------------------------------

function resamplePolyline(
  points: Point[],
  count = COMPARISON_SAMPLE_COUNT
): Point[] {
  if (points.length < 2) {
    return [];
  }

  const cumulativeDistances = [0];

  for (let i = 1; i < points.length; i++) {
    cumulativeDistances.push(
      cumulativeDistances[i - 1] +
      distance(points[i - 1], points[i])
    );
  }

  const totalLength =
    cumulativeDistances[cumulativeDistances.length - 1];

  if (totalLength <= 0) {
    return [];
  }

  const result: Point[] = [];

  let segmentIndex = 0;

  for (let i = 0; i < count; i++) {
    const targetDistance =
      (i / (count - 1)) * totalLength;

    while (
      segmentIndex < cumulativeDistances.length - 2 &&
      cumulativeDistances[segmentIndex + 1] < targetDistance
    ) {
      segmentIndex++;
    }

    const startDistance = cumulativeDistances[segmentIndex];
    const endDistance = cumulativeDistances[segmentIndex + 1];

    const segmentLength = endDistance - startDistance;

    const t =
      segmentLength <= 0
        ? 0
        : (targetDistance - startDistance) / segmentLength;

    const a = points[segmentIndex];
    const b = points[segmentIndex + 1];

    result.push({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });
  }

  return result;
}

// ---------------------------------------------------------
// DISCRETE FRECHET DISTANCE
//
// Measures the geometric similarity of two trajectories.
// ---------------------------------------------------------

function discreteFrechetDistance(
  a: Point[],
  b: Point[]
): number {
  if (!a.length || !b.length) {
    return Infinity;
  }

  let previous = new Float64Array(b.length);
  let current = new Float64Array(b.length);

  previous.fill(Infinity);
  current.fill(Infinity);

  for (let i = 0; i < a.length; i++) {
    current.fill(Infinity);

    for (let j = 0; j < b.length; j++) {
      const pointDistance = distance(a[i], b[j]);

      if (i === 0 && j === 0) {
        current[j] = pointDistance;
        continue;
      }

      const predecessor = Math.min(
        i > 0 ? previous[j] : Infinity,
        j > 0 ? current[j - 1] : Infinity,
        i > 0 && j > 0 ? previous[j - 1] : Infinity
      );

      current[j] = Math.max(
        pointDistance,
        predecessor
      );
    }

    [previous, current] = [current, previous];
  }

  return previous[b.length - 1];
}

// ---------------------------------------------------------
// STROKE COMPARISON
//
// Allows drawing in either direction.
// ---------------------------------------------------------

function compareStrokes(
  userStroke: Point[],
  referenceStroke: Point[]
): number {
  const user = resamplePolyline(userStroke);
  const reference = resamplePolyline(referenceStroke);

  if (!user.length || !reference.length) {
    return Infinity;
  }

  const forward = discreteFrechetDistance(
    reference,
    user
  );

  const reversed = discreteFrechetDistance(
    reference,
    [...user].reverse()
  );

  return Math.min(forward, reversed);
}

// ---------------------------------------------------------
// STROKE ASSIGNMENT
//
// Finds the best correspondence between strokes,
// even if the user drew them in a different order.
//
// Uses dynamic programming with bitmasks.
// ---------------------------------------------------------

function minimumAssignmentCost(
  matrix: number[][]
): number {
  const count = matrix.length;

  if (
    count === 0 ||
    matrix.some(row => row.length !== count) ||
    count > 15
  ) {
    return Infinity;
  }

  const memo = new Map<string, number>();

  function solve(
    userIndex: number,
    mask: number
  ): number {
    if (userIndex === count) {
      return 0;
    }

    const key = `${userIndex}-${mask}`;

    if (memo.has(key)) {
      return memo.get(key)!;
    }

    let best = Infinity;

    for (let referenceIndex = 0; referenceIndex < count; referenceIndex++) {
      const bit = 1 << referenceIndex;

      if (mask & bit) {
        continue;
      }

      const cost = matrix[userIndex][referenceIndex];

      if (!Number.isFinite(cost)) {
        continue;
      }

      const remaining = solve(
        userIndex + 1,
        mask | bit
      );

      best = Math.min(
        best,
        cost + remaining
      );
    }

    memo.set(key, best);

    return best;
  }

  return solve(0, 0);
}

// ---------------------------------------------------------
// COMPLETE NUMBER VALIDATION
// ---------------------------------------------------------

function validateNumberDrawing(
  userStrokes: Point[][],
  referenceStrokes: Point[][]
): ValidationResult {

  if (
    !userStrokes.length ||
    userStrokes.length !== referenceStrokes.length
  ) {
    return {
      accepted: false,
      distance: Infinity,
      reason: 'stroke-count',
    };
  }

  // Check individual strokes.
  for (const stroke of userStrokes) {
    if (stroke.length < MIN_STROKE_POINTS) {
      return {
        accepted: false,
        distance: Infinity,
        reason: 'insufficient-points',
      };
    }

    if (getPolylineLength(stroke) < MIN_STROKE_LENGTH) {
      return {
        accepted: false,
        distance: Infinity,
        reason: 'insufficient-length',
      };
    }
  }

  // Prevent extremely small drawings.
  const allPoints = userStrokes.flat();

  const width =
    Math.max(...allPoints.map(p => p.x)) -
    Math.min(...allPoints.map(p => p.x));

  const height =
    Math.max(...allPoints.map(p => p.y)) -
    Math.min(...allPoints.map(p => p.y));

  if (
    Math.max(width, height) < MIN_DRAWING_SIZE
  ) {
    return {
      accepted: false,
      distance: Infinity,
      reason: 'drawing-too-small',
    };
  }

  // Normalize both drawings using their global bounding boxes.
  const normalizedUser = normalizeStrokeSet(userStrokes);
  const normalizedReference = normalizeStrokeSet(referenceStrokes);

  if (
    !normalizedUser.length ||
    !normalizedReference.length
  ) {
    return {
      accepted: false,
      distance: Infinity,
      reason: 'invalid-geometry',
    };
  }

  // Build the stroke similarity matrix.
  const matrix = normalizedUser.map(userStroke =>
    normalizedReference.map(referenceStroke => {
      const userLength = getPolylineLength(userStroke);
      const referenceLength = getPolylineLength(referenceStroke);

      const ratio = userLength / referenceLength;

      // Prevent extremely incomplete or exaggerated strokes.
      if (
        ratio < MIN_LENGTH_RATIO ||
        ratio > MAX_LENGTH_RATIO
      ) {
        return Infinity;
      }

      const geometricDistance = compareStrokes(
        userStroke,
        referenceStroke
      );

      // Small penalty for substantially different lengths.
      const lengthPenalty =
        Math.abs(Math.log(ratio)) * 3;

      return geometricDistance + lengthPenalty;
    })
  );

  const totalCost = minimumAssignmentCost(matrix);

  const averageDistance =
    totalCost / userStrokes.length;

  const accepted =
    Number.isFinite(averageDistance) &&
    averageDistance <= MAX_GEOMETRIC_DISTANCE;

  return {
    accepted,
    distance: averageDistance,
    reason: accepted ? undefined : 'geometry-mismatch',
  };
}

// ---------------------------------------------------------
// CANVAS PATH
// ---------------------------------------------------------

function createPolylinePath(points: Point[]) {
  const path = Skia.Path.Make();

  if (!points.length) {
    return path;
  }

  path.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i].x, points[i].y);
  }

  return path;
}

// ---------------------------------------------------------
// FEEDBACK
// ---------------------------------------------------------

function getFeedback(reason?: string): string {
  switch (reason) {
    case 'stroke-count':
      return 'Vérifie le nombre de traits et essaie encore.';

    case 'insufficient-points':
    case 'insufficient-length':
      return 'Continue à écrire le chiffre.';

    case 'drawing-too-small':
      return 'Écris le chiffre un peu plus grand.';

    case 'geometry-mismatch':
      return 'Ce chiffre ne correspond pas. Essaie encore !';

    default:
      return 'Réessaie tranquillement.';
  }
}

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------

export default function NumberWritingApp({
  numberKey: numberKeyProp,
}: NumberWritingAppProps) {

  const { nextStage, setGameScore, mode } = useAyla();
  const { speak } = useSpeech();

  const { numberKey: routeNumberKey } = useLocalSearchParams<{
    numberKey?: string;
  }>();

  const initialKey = numberKeyProp ?? routeNumberKey;

  const initialIndex =
    initialKey && NUMBER_KEYS.includes(initialKey as NumberKey)
      ? NUMBER_KEYS.indexOf(initialKey as NumberKey)
      : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const [completed, setCompleted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [time, setTime] = useState(0);

  const [feedback, setFeedback] = useState('');

  // Each gesture represents one user stroke.
  const [userStrokes, setUserStrokes] = useState<Point[][]>([]);

  const scrollViewRef = useRef<ScrollView | null>(null);
  const hasSavedScoreRef = useRef(false);

  // Current number
  const numberKey = NUMBER_KEYS[currentIndex] ?? NUMBER_KEYS[0];

  const numberConfig = tracingData[numberKey] as NumberConfig;

  const gameTitle = numberConfig.title;

  const currentNumber = String(Number(numberKey));

  // -----------------------------------------------------
  // SPEECH
  // -----------------------------------------------------

  useEffect(() => {
    speak(currentNumber, 'fr-FR');
  }, [currentNumber, speak]);

  // -----------------------------------------------------
  // REFERENCE GEOMETRY
  //
  // These paths are NEVER rendered on the canvas.
  // They exist exclusively for geometric validation.
  // -----------------------------------------------------

  const referenceTrajectories = useMemo(
    () =>
      numberConfig.strokes
        .map(stroke => sampleStrokeTrajectory(stroke))
        .filter(points => points.length >= 2),

    [numberConfig]
  );

  // -----------------------------------------------------
  // DRAWING STATE
  // -----------------------------------------------------

  const activePath = useSharedValue(Skia.Path.Make());

  const activePoints = useSharedValue<Point[]>([]);

  const isTracing = useSharedValue(false);

  const isPausedShared = useSharedValue(false);

  const isCompletedShared = useSharedValue(false);

  const drawnPaths = useMemo(
    () => userStrokes.map(createPolylinePath),
    [userStrokes]
  );

  // -----------------------------------------------------
  // RESET
  // -----------------------------------------------------

  const resetDrawing = () => {
    activePath.value = Skia.Path.Make();
    activePoints.value = [];

    isTracing.value = false;
    isCompletedShared.value = false;

    setUserStrokes([]);

    setCompleted(false);
    setIsDrawing(false);

    setFeedback('');
    setTime(0);

    hasSavedScoreRef.current = false;
  };

  // -----------------------------------------------------
  // TIMER
  // -----------------------------------------------------

  useEffect(() => {
    if (completed || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setTime(previous => previous + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [completed, isPaused, currentIndex]);

  // -----------------------------------------------------
  // PAUSE
  // -----------------------------------------------------

  const handleTogglePause = () => {
    const nextPaused = !isPaused;

    isPausedShared.value = nextPaused;

    setIsPaused(nextPaused);

    if (nextPaused) {
      setFeedback('En pause.');
      speak('En pause !', 'fr-FR');
    } else {
      setFeedback('');
      speak(currentNumber, 'fr-FR');
    }
  };

  // -----------------------------------------------------
  // STORE A COMPLETED GESTURE
  // -----------------------------------------------------

  const handleStrokeEnd = (points: Point[]) => {
    setIsDrawing(false);

    if (completed || isPaused || points.length < 2) {
      activePath.value = Skia.Path.Make();
      activePoints.value = [];
      return;
    }

    setUserStrokes(previous => [
      ...previous,
      points.map(point => ({ ...point })),
    ]);

    activePath.value = Skia.Path.Make();
    activePoints.value = [];

    setFeedback('');
  };

  // -----------------------------------------------------
  // PAN GESTURE
  //
  // No start waypoint or reference position is required.
  // The child can start anywhere on the canvas.
  // -----------------------------------------------------

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)

        .onStart(event => {
          'worklet';

          if (
            isCompletedShared.value ||
            isPausedShared.value
          ) {
            return;
          }

          isTracing.value = true;

          const firstPoint = {
            x: event.x,
            y: event.y,
          };

          activePoints.value = [firstPoint];

          activePath.value = Skia.Path.Make();

          activePath.value.moveTo(
            firstPoint.x,
            firstPoint.y
          );

          runOnJS(setIsDrawing)(true);
          runOnJS(setFeedback)('');
        })

        .onUpdate(event => {
          'worklet';

          if (
            !isTracing.value ||
            isCompletedShared.value ||
            isPausedShared.value
          ) {
            return;
          }

          const nextPoint = {
            x: event.x,
            y: event.y,
          };

          const points = activePoints.value;

          const lastPoint = points[points.length - 1];

          if (
            lastPoint &&
            Math.hypot(
              nextPoint.x - lastPoint.x,
              nextPoint.y - lastPoint.y
            ) < 1.5
          ) {
            return;
          }

          activePoints.value = [
            ...points,
            nextPoint,
          ];

          activePath.modify(path => {
            path.lineTo(nextPoint.x, nextPoint.y);
            return path;
          });
        })

        .onEnd(() => {
          'worklet';

          if (!isTracing.value) {
            return;
          }

          const points = activePoints.value;

          isTracing.value = false;

          runOnJS(handleStrokeEnd)(points);
        })

        .onFinalize(() => {
          'worklet';

          isTracing.value = false;

          runOnJS(setIsDrawing)(false);
        }),

    [
      activePath,
      activePoints,
      isTracing,
      isCompletedShared,
      isPausedShared,
      handleStrokeEnd,
    ]
  );

  // -----------------------------------------------------
  // VALIDATE COMPLETE NUMBER
  // -----------------------------------------------------

  const handleValidate = () => {
    if (completed || isPaused) {
      return;
    }

    if (!userStrokes.length) {
      const message = 'Écris le chiffre avant de vérifier.';

      setFeedback(message);
      speak(message, 'fr-FR');

      return;
    }

    const result = validateNumberDrawing(
      userStrokes,
      referenceTrajectories
    );

    if (!result.accepted) {
      const message = getFeedback(result.reason);

      setFeedback(message);
      speak(message, 'fr-FR');

      return;
    }

    // Success
    isCompletedShared.value = true;

    setCompleted(true);

    setFeedback('Bravo ! Très bien !');

    speak('Bravo ! Très bien !', 'fr-FR');
  };

  // -----------------------------------------------------
  // ADVANCE TO NEXT NUMBER
  // -----------------------------------------------------

  const handleAdvance = () => {
    if (!hasSavedScoreRef.current) {
      hasSavedScoreRef.current = true;

      setGameScore(scores => [
        ...scores,
        {
          score: '1/1',
          name: gameTitle,
          duration: TimerConverter(Math.max(1, time)),
        },
      ]);
    }

    if (currentIndex < NUMBER_KEYS.length - 1) {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      });

      resetDrawing();

      setCurrentIndex(previous => previous + 1);
    } else {
      nextStage();
    }
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------

  return (
    <ThemedSafeAreaView style={{ flex: 1 }}>

      <GameHeader
        gameDescription="Écoute et écris le chiffre"

        playAndPauseButton={{
          isActive: true,
          resumeStatus: isPaused ? 'paused' : 'playing',
          onToggle: handleTogglePause,
        }}

        trophiesCount={12}
        coinsCount={45}

        settingsRoute="/games/ayla/settings/SettingsScreen"

        currentProfile={{
          name: 'Ayla',
          avatarSvgName: 'PrincessProfileAvatarSvg',
          startScreenRoute: '/games/ayla/StartScreen',
        }}

        otherProfile={{
          name: 'Dino',
          avatarSvgName: 'DinoProfileAvatarSvg',
          startScreenRoute: '/games/yachane/StartScreen',
        }}

        validate={{
          isActive: true,
          onValidate: isValid => {
            if (!isValid) {
              return;
            }

            // Alternate validation path only: it does not replace the
            // drawing-based validation logic already used by handleValidate.
            handleAdvance();
          },
        }}
      />
      <View style={{flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,}}>
        <TouchableOpacity
          style={styles.volumeButton}
          activeOpacity={0.7}
          onPress={async () => await speak(currentNumber, "fr-FR")}
        >
          <IconVolume size={36} color={Colors[mode].text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollViewRef}
        scrollEnabled={!isDrawing}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* -----------------------------------------
                    EMPTY DRAWING CANVAS

                    No reference paths.
                    No waypoints.
                    No markers.
                    Only user drawings.
                ----------------------------------------- */}

        <GestureHandlerRootView style={styles.gestureContainer}>

          <GestureDetector gesture={panGesture}>

            <View style={[styles.canvasContainer, {
              backgroundColor: mode === "dark" ? "#555" : "#E4E7F0",
              }]}>

              <Canvas
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                }}
              >

                {/* Previously drawn user strokes */}

                {drawnPaths.map((path, index) => (
                  <Path
                    key={`user-stroke-${index}`}
                    path={path}
                    color={DRAWING_COLOR}
                    style="stroke"
                    strokeWidth={DRAWING_WIDTH}
                    strokeCap="round"
                    strokeJoin="round"
                  />
                ))}

                {/* Current active user stroke */}

                <Path
                  path={activePath}
                  color={DRAWING_COLOR}
                  style="stroke"
                  strokeWidth={DRAWING_WIDTH}
                  strokeCap="round"
                  strokeJoin="round"
                />

              </Canvas>

            </View>

          </GestureDetector>

        </GestureHandlerRootView>

        {!!feedback && (
          <Text
            style={[
              styles.feedbackText,
              completed && styles.successText,
            ]}
          >
            {feedback}
          </Text>
        )}

        {/* -----------------------------------------
                    ACTIONS
                ----------------------------------------- */}

        <View style={styles.actionsContainer}>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetDrawing}
            disabled={completed}
          >
            <IconRotateClockwise
              size={22}
              color="#555555"
            />
          </TouchableOpacity>

          {!completed ? (
            <TouchableOpacity
              style={[
                styles.validateButton,
                (isPaused || isDrawing) &&
                styles.disabledButton,
              ]}
              onPress={handleValidate}
              disabled={isPaused || isDrawing}
            >
              <IconCheck
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.buttonText}>
                Vérifier
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleAdvance}
            >
              <Text style={styles.buttonText}>
                Continuer
              </Text>

              <IconArrowNarrowRight
                size={21}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}

        </View>

        {/* -----------------------------------------
                    OPTIONAL: CLEAR DRAWING
                ----------------------------------------- */}

        {userStrokes.length > 0 && !completed && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setUserStrokes([]);
              setFeedback('');
            }}
          >
            <IconTrash size={17} color="#777777" />

            <Text style={styles.clearText}>
              Effacer le dessin
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

    </ThemedSafeAreaView>
  );
}

// ---------------------------------------------------------
// STYLES
// ---------------------------------------------------------

const styles = StyleSheet.create({

  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  gestureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
  },

  canvasContainer: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',

    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  feedbackText: {
    marginTop: 14,
    paddingHorizontal: 16,

    textAlign: 'center',

    color: '#B45309',
    fontSize: 15,
    fontWeight: '600',
  },

  successText: {
    color: '#16A34A',
  },

  actionsContainer: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 22,
    gap: 12,
  },

  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',

    padding: 12,

    borderRadius: 24,
    backgroundColor: '#EEEEEE',
  },

  validateButton: {

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    backgroundColor: Colors.dark.button,

    paddingVertical: 13,
    paddingHorizontal: 20,

    borderRadius: 24,
  },

  disabledButton: {
    opacity: 0.45,
  },

  continueButton: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    backgroundColor: '#16A34A',

    paddingVertical: 13,
    paddingHorizontal: 20,

    borderRadius: 24,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    marginTop: 16,
    padding: 8,
  },

  clearText: {
    color: '#777777',
    fontSize: 13,
  },

  debugContainer: {
    marginTop: 20,
    padding: 10,

    backgroundColor: '#F3F4F6',
    borderRadius: 8,

    width: '100%',
  },

  debugText: {
    fontSize: 11,
    color: '#777777',
  },
  volumeButton: {
        padding: 10,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.12)",
    }
});
