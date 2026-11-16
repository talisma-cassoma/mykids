import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import {
    Canvas,
    Path,
    Circle,
    Group,
    Skia,
} from '@shopify/react-native-skia';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {
    useSharedValue,
    runOnJS,
} from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';

import {
    IconRotateClockwise,
    IconArrowNarrowRight,
    IconArrowNarrowDown,
} from '@tabler/icons-react-native';

import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { GameHeader } from '@/components/Header';
import { useAyla } from '@/context/AylaContext';
import tracingData from '@/assets/tracingfiles/numbers.json';
import { TimerConverter, useSpeech } from "@/utils/lessons";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const isTablet = SCREEN_WIDTH >= 768;
const CANVAS_WIDTH = isTablet ? 220 : 140;
const CANVAS_HEIGHT = isTablet ? 280 : 200;

const GUIDE_STROKE_WIDTH = 30;
const USER_STROKE_WIDTH = 25;

// A criança pode começar perto do primeiro ponto, mas a validação final
// continua a verificar a distância real ao início da trajetória.
const START_THRESHOLD = 32;

// Tolerância geométrica em pixels do canvas.
const TRAJECTORY_TOLERANCE = 18;

const REFERENCE_SAMPLES_PER_SEGMENT = 32;
const COMPARISON_SAMPLE_COUNT = 64;
const MIN_USER_POINTS = 8;

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

type ValidationReason =
    | 'insufficient-points'
    | 'wrong-start'
    | 'wrong-end'
    | 'trajectory-mismatch';

interface TrajectoryValidationResult {
    accepted: boolean;
    distance: number;
    startDistance: number;
    endDistance: number;
    tolerance: number;
    reason?: ValidationReason;
}

type NumberKey = keyof typeof tracingData;

type WaypointTracingAppProps = {
    numberKey?: string;
};

const NUMBER_KEYS = (Object.keys(tracingData) as NumberKey[]).sort(
    (a, b) => Number(a) - Number(b)
);

function distance(a: Point, b: Point): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Converte a geometria de um stroke (line/quadratic/cubic)
 * numa sequência de pontos ao longo da trajetória esperada.
 */
function sampleStrokeTrajectory(
    stroke: Stroke,
    samplesPerSegment = REFERENCE_SAMPLES_PER_SEGMENT
): Point[] {
    if (!stroke.segments.length) {
        return [];
    }

    const waypointMap = new Map<number, Waypoint>(
        stroke.waypoints.map((waypoint) => [waypoint.id, waypoint])
    );

    const trajectory: Point[] = [];

    for (const segment of stroke.segments) {
        const from = waypointMap.get(segment.from);
        const to = waypointMap.get(segment.to);

        if (!from || !to) {
            throw new Error(
                `Invalid segment reference: ${segment.from} -> ${segment.to}`
            );
        }

        // Todos os segmentos de um mesmo stroke devem estar ligados.
        // O path do Skia continua a partir do fim do segmento anterior.
        if (
            trajectory.length > 0 &&
            distance(trajectory[trajectory.length - 1], from) > 0.01
        ) {
            // A última amostra é o fim do segmento anterior.
            // Esta verificação evita trajetórias de referência com saltos.
            throw new Error(
                `Disconnected segments in stroke ${stroke.id}: ` +
                    `segment starts at waypoint ${segment.from}, ` +
                    'which does not match the previous segment endpoint.'
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

/**
 * Reamostra uma polyline por distância percorrida.
 * Assim, a comparação não depende da frequência dos eventos de toque.
 */
function resamplePolyline(points: Point[], count = COMPARISON_SAMPLE_COUNT): Point[] {
    if (points.length < 2 || count < 2) {
        return [];
    }

    const cumulativeDistances: number[] = [0];

    for (let i = 1; i < points.length; i++) {
        cumulativeDistances.push(
            cumulativeDistances[i - 1] + distance(points[i - 1], points[i])
        );
    }

    const totalLength = cumulativeDistances[cumulativeDistances.length - 1];

    if (totalLength <= 0) {
        return [];
    }

    const result: Point[] = [];
    let segmentIndex = 0;

    for (let i = 0; i < count; i++) {
        const targetDistance = (i / (count - 1)) * totalLength;

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

/**
 * Discrete Fréchet Distance.
 * Considera a proximidade e a ordem dos pontos nas duas trajetórias.
 */
function discreteFrechetDistance(a: Point[], b: Point[]): number {
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

            current[j] = Math.max(pointDistance, predecessor);
        }

        [previous, current] = [current, previous];
    }

    return previous[b.length - 1];
}

/**
 * Valida a trajetória completa de um stroke.
 *
 * Além da distância Fréchet, verifica explicitamente:
 * - início próximo do início esperado;
 * - fim próximo do fim esperado;
 * - quantidade mínima de pontos.
 */
function validateTrajectory(
    userTrajectory: Point[],
    referenceTrajectory: Point[],
    tolerance = TRAJECTORY_TOLERANCE
): TrajectoryValidationResult {
    const failedResult = (
        reason: ValidationReason,
        startDistance = Infinity,
        endDistance = Infinity,
        deviation = Infinity
    ): TrajectoryValidationResult => ({
        accepted: false,
        distance: deviation,
        startDistance,
        endDistance,
        tolerance,
        reason,
    });

    if (
        userTrajectory.length < MIN_USER_POINTS ||
        referenceTrajectory.length < 2
    ) {
        return failedResult('insufficient-points');
    }

    const userStart = userTrajectory[0];
    const userEnd = userTrajectory[userTrajectory.length - 1];
    const referenceStart = referenceTrajectory[0];
    const referenceEnd = referenceTrajectory[referenceTrajectory.length - 1];

    const startDistance = distance(userStart, referenceStart);
    const endDistance = distance(userEnd, referenceEnd);

    // Estes limites impedem que uma trajetória parcial seja aprovada.
    if (startDistance > tolerance) {
        return failedResult('wrong-start', startDistance, endDistance);
    }

    if (endDistance > tolerance) {
        return failedResult('wrong-end', startDistance, endDistance);
    }

    const user = resamplePolyline(userTrajectory, COMPARISON_SAMPLE_COUNT);
    const reference = resamplePolyline(
        referenceTrajectory,
        COMPARISON_SAMPLE_COUNT
    );

    if (!user.length || !reference.length) {
        return failedResult('insufficient-points', startDistance, endDistance);
    }

    const deviation = discreteFrechetDistance(reference, user);
    const accepted = deviation <= tolerance;

    return {
        accepted,
        distance: deviation,
        startDistance,
        endDistance,
        tolerance,
        reason: accepted ? undefined : 'trajectory-mismatch',
    };
}

/**
 * Centraliza e redimensiona o número.
 * Transforma waypoints e pontos de controlo com a mesma escala.
 */
function getCenteredStrokes(
    strokes: Stroke[],
    targetWidth: number,
    targetHeight: number
): Stroke[] {
    const coordinates: Point[] = [];

    strokes.forEach((stroke) => {
        stroke.waypoints.forEach((waypoint) => {
            coordinates.push(waypoint);
        });

        stroke.segments.forEach((segment) => {
            if (segment.type === 'quadratic') {
                coordinates.push(segment.control);
            }

            if (segment.type === 'cubic') {
                coordinates.push(segment.control1, segment.control2);
            }
        });
    });

    if (!coordinates.length) {
        return strokes;
    }

    const minX = Math.min(...coordinates.map((point) => point.x));
    const maxX = Math.max(...coordinates.map((point) => point.x));
    const minY = Math.min(...coordinates.map((point) => point.y));
    const maxY = Math.max(...coordinates.map((point) => point.y));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) {
        return strokes;
    }

    const scale = Math.min(
        (targetWidth * 0.8) / contentWidth,
        (targetHeight * 0.8) / contentHeight
    );

    const offsetX =
        (targetWidth - contentWidth * scale) / 2 - minX * scale;

    const offsetY =
        (targetHeight - contentHeight * scale) / 2 - minY * scale;

    const transformPoint = (point: Point): Point => ({
        x: point.x * scale + offsetX,
        y: point.y * scale + offsetY,
    });

    return strokes.map((stroke) => ({
        ...stroke,
        waypoints: stroke.waypoints.map((waypoint) => ({
            ...waypoint,
            ...transformPoint(waypoint),
        })),
        segments: stroke.segments.map((segment): Segment => {
            if (segment.type === 'line') {
                return { ...segment };
            }

            if (segment.type === 'quadratic') {
                return {
                    ...segment,
                    control: transformPoint(segment.control),
                };
            }

            return {
                ...segment,
                control1: transformPoint(segment.control1),
                control2: transformPoint(segment.control2),
            };
        }),
    }));
}

/**
 * Constrói o path de referência para o Skia.
 */
function createStrokePath(stroke: Stroke) {
    const path = Skia.Path.Make();

    if (!stroke.segments.length) {
        return path;
    }

    const waypointMap = new Map<number, Waypoint>(
        stroke.waypoints.map((waypoint) => [waypoint.id, waypoint])
    );

    const firstWaypoint = waypointMap.get(stroke.segments[0].from);

    if (!firstWaypoint) {
        return path;
    }

    path.moveTo(firstWaypoint.x, firstWaypoint.y);

    for (const segment of stroke.segments) {
        const destination = waypointMap.get(segment.to);

        if (!destination) {
            return Skia.Path.Make();
        }

        switch (segment.type) {
            case 'line':
                path.lineTo(destination.x, destination.y);
                break;

            case 'quadratic':
                path.quadTo(
                    segment.control.x,
                    segment.control.y,
                    destination.x,
                    destination.y
                );
                break;

            case 'cubic':
                path.cubicTo(
                    segment.control1.x,
                    segment.control1.y,
                    segment.control2.x,
                    segment.control2.y,
                    destination.x,
                    destination.y
                );
                break;
        }
    }

    return path;
}

/**
 * Constrói um path a partir dos pontos realmente desenhados.
 * Usado para preservar os strokes já aprovados no canvas.
 */
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

function getValidationFeedback(reason?: ValidationReason): string {
    switch (reason) {
        case 'insufficient-points':
            return 'Trace le trait complet, du début à la fin.';
        case 'wrong-start':
            return 'Commence au point de départ du chiffre.';
        case 'wrong-end':
            return "Continue le trait jusqu'au point final";
        case 'trajectory-mismatch':
            return 'Suis la courbe du nombre';
        default:
            return '';
    }
}

export default function WaypointTracingApp({
    numberKey: numberKeyProp,
}: WaypointTracingAppProps) {
    const { nextStage, setGameScore } = useAyla();
      const { speak } = useSpeech();

    const { numberKey: routeNumberKey } = useLocalSearchParams<{
        numberKey?: string;
    }>();

    const initialKey = numberKeyProp ?? routeNumberKey;
    const initialIndex =
        initialKey && NUMBER_KEYS.includes(initialKey as NumberKey)
            ? NUMBER_KEYS.indexOf(initialKey as NumberKey)
            : 0;

    const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
    const [, setCompletedNumbers] = useState<string[]>([]);
    const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
    // Índice do marcador que acompanha visualmente a trajetória de referência.
    const [guidanceIndex, setGuidanceIndex] = useState(0);
    const [acceptedTrajectories, setAcceptedTrajectories] = useState<Point[][]>(
        []
    );
    const [completed, setCompleted] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [time, setTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [feedback, setFeedback] = useState('');

    const scrollViewRef = useRef<ScrollView | null>(null);
    const hasSavedScoreRef = useRef(false);

    const numberKey = NUMBER_KEYS[currentIndex] ?? NUMBER_KEYS[0];
    const numberConfig = tracingData[numberKey] as NumberConfig;
    const gameTitle = numberConfig.title;

    const strokes = useMemo(
        () =>
            getCenteredStrokes(
                numberConfig.strokes,
                CANVAS_WIDTH,
                CANVAS_HEIGHT
            ),
        [numberConfig]
    );

    // A referência é calculada a partir dos strokes já centralizados,
    // exatamente no mesmo sistema de coordenadas usado pelo canvas.
    const referenceTrajectories = useMemo(
        () =>
            strokes.map((stroke) =>
                sampleStrokeTrajectory(
                    stroke,
                    REFERENCE_SAMPLES_PER_SEGMENT
                )
            ),
        [strokes]
    );

    // Preserva no canvas os strokes que já foram aprovados.
    const acceptedPaths = useMemo(
        () => acceptedTrajectories.map(createPolylinePath),
        [acceptedTrajectories]
    );

    const currentStroke = useSharedValue(0);
    const guidanceIndexShared = useSharedValue(0);
    const isTracing = useSharedValue(false);
    const isCompleted = useSharedValue(false);
    const isPausedShared = useSharedValue(false);
    const userPath = useSharedValue(Skia.Path.Make());
    const userPoints = useSharedValue<Point[]>([]);

    const resetTrace = () => {
        currentStroke.value = 0;
        guidanceIndexShared.value = 0;
        isTracing.value = false;
        isCompleted.value = false;
        isPausedShared.value = false;
        userPath.value = Skia.Path.Make();
        userPoints.value = [];

        setCurrentStrokeIndex(0);
        setGuidanceIndex(0);
        setAcceptedTrajectories([]);
        setCompleted(false);
        setIsPaused(false);
        setIsDrawing(false);
        setFeedback('');
        setTime(0);

        hasSavedScoreRef.current = false;
    };

    const handleReset = () => {
        resetTrace();
    };

    // const handleScroll = () => {
    //     scrollViewRef.current?.scrollToEnd({ animated: true });
    // };

    useEffect(() => {
        if (isPaused || completed) {
            return;
        }

        const interval = setInterval(() => {
            setTime((elapsed) => elapsed + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [completed, isPaused, currentIndex]);

    const handleTogglePause = () => {
        const nextPaused = !isPaused;
        isPausedShared.value = nextPaused;
        setIsPaused(nextPaused);

        if (nextPaused) {
            setFeedback('en pause.');
            speak("en pause!", "fr-FR");
        } else {
            setFeedback('');
        }
    };

    const handleAdvance = () => {
        if (!hasSavedScoreRef.current) {
            hasSavedScoreRef.current = true;

            setGameScore((scores) => [
                ...scores,
                {
                    score: '1/1',
                    name: gameTitle,
                    duration: TimerConverter(Math.max(1, time)),
                },
            ]);

            setCompletedNumbers((numbers) =>
                numbers.includes(numberKey)
                    ? numbers
                    : [...numbers, numberKey]
            );
        }

        if (currentIndex < NUMBER_KEYS.length - 1) {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });

            // Limpa os dados do número atual antes de mudar de número.
            resetTrace();
            setCurrentIndex((previous) => previous + 1);
        } else {
            nextStage();
        }
    };

    /**
     * Executada no JS thread quando a criança termina um gesto.
     * Só avança para o próximo stroke se a trajetória for aprovada.
     */
    const handleTrajectoryEnd = (
        points: Point[],
        strokeIndex: number
    ) => {
        setIsDrawing(false);

        if (completed || strokeIndex !== currentStrokeIndex) {
            return;
        }

        const reference = referenceTrajectories[strokeIndex];

        if (!reference) {
            setFeedback('appele papa');
            speak("appele papa", "fr-FR");
            userPath.value = Skia.Path.Make();
            userPoints.value = [];
            guidanceIndexShared.value = 0;
            setGuidanceIndex(0);
            return;
        }

        const result = validateTrajectory(
            points,
            reference,
            TRAJECTORY_TOLERANCE
        );

        if (!result.accepted) {
            setFeedback(getValidationFeedback(result.reason));
            speak(getValidationFeedback(result.reason),"fr-FR")

            // Apaga apenas a tentativa atual.
            // Os strokes anteriormente aprovados permanecem visíveis.
            userPath.value = Skia.Path.Make();
            userPoints.value = [];
            guidanceIndexShared.value = 0;
            setGuidanceIndex(0);
            return;
        }

        setFeedback('');

        // Guarda a trajetória real aprovada para a manter no canvas.
        setAcceptedTrajectories((previous) => [
            ...previous,
            points.map((point) => ({ ...point })),
        ]);

        userPath.value = Skia.Path.Make();
        userPoints.value = [];

        const nextStrokeIndex = strokeIndex + 1;

        if (nextStrokeIndex < strokes.length) {
            currentStroke.value = nextStrokeIndex;
            guidanceIndexShared.value = 0;
            setGuidanceIndex(0);
            setCurrentStrokeIndex(nextStrokeIndex);
            return;
        }

        // O número só fica concluído quando todos os strokes
        // foram desenhados e aprovados individualmente.
        isCompleted.value = true;
        setCompleted(true);
        setFeedback('Tres bien!');
        speak("Tres bien!", "fr-FR");
    };

    const panGesture = useMemo(
        () =>
            Gesture.Pan()
                .minDistance(0)
                .onStart((event) => {
                    'worklet';

                    if (isCompleted.value || isPausedShared.value) {
                        return;
                    }

                    const strokeIndex = currentStroke.value;
                    const stroke = strokes[strokeIndex];

                    if (!stroke || !stroke.waypoints.length) {
                        return;
                    }

                    // O primeiro waypoint serve apenas para indicar
                    // onde começar. Os restantes não controlam a aprovação.
                    const startPoint = stroke.waypoints[0];
                    const startDistance = Math.hypot(
                        event.x - startPoint.x,
                        event.y - startPoint.y
                    );

                    if (startDistance > START_THRESHOLD) {
                        return;
                    }

                    isTracing.value = true;

                    const firstPoint = {
                        x: event.x,
                        y: event.y,
                    };

                    userPoints.value = [firstPoint];
                    guidanceIndexShared.value = 0;
                    runOnJS(setGuidanceIndex)(0);

                    userPath.modify((path) => {
                        path.moveTo(firstPoint.x, firstPoint.y);
                        return path;
                    });

                    runOnJS(setIsDrawing)(true);
                    runOnJS(setFeedback)('');
                })
                .onUpdate((event) => {
                    'worklet';

                    if (
                        !isTracing.value ||
                        isCompleted.value ||
                        isPausedShared.value
                    ) {
                        return;
                    }

                    const nextPoint = {
                        x: event.x,
                        y: event.y,
                    };

                    const points = userPoints.value;
                    const lastPoint = points[points.length - 1];

                    // Evita acumular eventos praticamente iguais.
                    if (
                        lastPoint &&
                        Math.hypot(
                            nextPoint.x - lastPoint.x,
                            nextPoint.y - lastPoint.y
                        ) < 1.5
                    ) {
                        return;
                    }

                    userPoints.value = [...points, nextPoint];

                    userPath.modify((path) => {
                        path.lineTo(nextPoint.x, nextPoint.y);
                        return path;
                    });

                    // ORIENTAÇÃO VISUAL (não é validação): o marcador azul
                    // acompanha a amostra mais próxima, procurando apenas um
                    // pequeno intervalo à frente para evitar saltos grandes.
                    const strokeIndex = currentStroke.value;
                    const reference = referenceTrajectories[strokeIndex];
                    if (reference && reference.length > 0) {
                        const currentIndex = guidanceIndexShared.value;
                        const searchEnd = Math.min(
                            reference.length - 1,
                            currentIndex + 24
                        );
                        let nearestIndex = currentIndex;
                        let nearestDistance = Number.POSITIVE_INFINITY;

                        for (let i = currentIndex; i <= searchEnd; i += 1) {
                            const candidate = reference[i];
                            const distance = Math.hypot(
                                nextPoint.x - candidate.x,
                                nextPoint.y - candidate.y
                            );
                            if (distance < nearestDistance) {
                                nearestDistance = distance;
                                nearestIndex = i;
                            }
                        }

                        // Só faz o marcador avançar quando o dedo está
                        // suficientemente perto do percurso de referência.
                        if (
                            nearestIndex > currentIndex &&
                            nearestDistance <= 30
                        ) {
                            guidanceIndexShared.value = nearestIndex;
                            runOnJS(setGuidanceIndex)(nearestIndex);
                        }
                    }

                    // A aprovação continua a acontecer exclusivamente no onEnd.
                })
                .onEnd(() => {
                    'worklet';

                    if (!isTracing.value) {
                        return;
                    }

                    const points = userPoints.value;
                    const strokeIndex = currentStroke.value;

                    isTracing.value = false;

                    runOnJS(handleTrajectoryEnd)(points, strokeIndex);
                })
                .onFinalize(() => {
                    'worklet';

                    isTracing.value = false;
                    runOnJS(setIsDrawing)(false);
                }),
        [
            strokes,
            referenceTrajectories,
            currentStroke,
            guidanceIndexShared,
            isTracing,
            isCompleted,
            isPausedShared,
            userPath,
            userPoints,
            handleTrajectoryEnd,
        ]
    );

    const currentGuidancePoint =
        referenceTrajectories[currentStrokeIndex]?.[guidanceIndex] ??
        referenceTrajectories[currentStrokeIndex]?.[0];

    return (
        <ThemedSafeAreaView style={{ flex: 1 }}>
            <GameHeader
                gameDescription={gameTitle}
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
            />

            <ScrollView
                ref={scrollViewRef}
                scrollEnabled={!isDrawing}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator
            >
                {/* <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleScroll}
                >
                    <Text style={styles.continueText}>Descendre</Text>
                    <IconArrowNarrowDown size={20} color="#FFFFFF" />
                </TouchableOpacity> */}

                <GestureHandlerRootView style={styles.container}>
                    <GestureDetector gesture={panGesture}>
                        <View style={styles.canvasContainer}>
                            <Canvas
                                style={{
                                    width: CANVAS_WIDTH,
                                    height: CANVAS_HEIGHT,
                                }}
                            >
                                {/* Trajectoires de référence */}
                                {strokes.map((stroke, index) => (
                                    <Path
                                        key={`guide-${stroke.id}-${index}`}
                                        path={createStrokePath(stroke)}
                                        color="#e0e0e0"
                                        style="stroke"
                                        strokeWidth={GUIDE_STROKE_WIDTH}
                                        strokeCap="round"
                                        strokeJoin="round"
                                    />
                                ))}

                                {/* Strokes déjà validés */}
                                {acceptedPaths.map((path, index) => (
                                    <Path
                                        key={`accepted-${index}`}
                                        path={path}
                                        color="#4CAF50"
                                        style="stroke"
                                        strokeWidth={USER_STROKE_WIDTH}
                                        strokeCap="round"
                                        strokeJoin="round"
                                    />
                                ))}

                                {/* Stroke en cours */}
                                <Path
                                    path={userPath}
                                    color="#2196F3"
                                    style="stroke"
                                    strokeWidth={USER_STROKE_WIDTH}
                                    strokeCap="round"
                                    strokeJoin="round"
                                />

                                {/* Marcador azul móvel: orientação em tempo real.
                                    A sua posição nunca aprova o traçado. */}
                                {currentGuidancePoint && !completed && (
                                    <Group>
                                        <Circle
                                            cx={currentGuidancePoint.x}
                                            cy={currentGuidancePoint.y}
                                            r={15}
                                            color="rgba(33, 150, 243, 0.20)"
                                        />
                                        <Circle
                                            cx={currentGuidancePoint.x}
                                            cy={currentGuidancePoint.y}
                                            r={7}
                                            color="#2196F3"
                                        />
                                    </Group>
                                )}

                                {/* Waypoints : repères visuels uniquement.
                                    Ils ne déclenchent plus la validation. */}
                                {strokes.map((stroke, strokeIndex) =>
                                    stroke.waypoints.map(
                                        (waypoint, waypointIndex) => {
                                            if (strokeIndex < currentStrokeIndex) {
                                                return null;
                                            }

                                            const isStartPoint =
                                                strokeIndex === currentStrokeIndex &&
                                                waypointIndex === 0;

                                            return (
                                                <Group
                                                    key={
                                                        `waypoint-${stroke.id}-` +
                                                        `${strokeIndex}-${waypoint.id}`
                                                    }
                                                >
                                                    <Circle
                                                        cx={waypoint.x}
                                                        cy={waypoint.y}
                                                        r={isStartPoint ? 22 : 6}
                                                        color={
                                                            isStartPoint
                                                                ? 'rgba(33, 150, 243, 0.22)'
                                                                : 'rgba(150, 150, 150, 0.28)'
                                                        }
                                                    />
                                                    <Circle
                                                        cx={waypoint.x}
                                                        cy={waypoint.y}
                                                        r={isStartPoint ? 8 : 4}
                                                        color={
                                                            isStartPoint
                                                                ? '#2196F3'
                                                                : '#999999'
                                                        }
                                                    />
                                                </Group>
                                            );
                                        }
                                    )
                                )}
                            </Canvas>
                        </View>
                    </GestureDetector>
                </GestureHandlerRootView>

                {/* {!!feedback && (
                    <Text
                        style={[
                            styles.feedbackText,
                            completed && styles.successText,
                        ]}
                    >
                        {feedback}
                    </Text>
                )} */}

                {/* <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        Traço {Math.min(currentStrokeIndex + 1, strokes.length)} /{' '}
                        {strokes.length}
                    </Text>
                    <Text style={styles.progressText}>
                        {time}s
                    </Text>
                </View> */}

                <View style={styles.headerContainer}>
                    {completed && (
                        <TouchableOpacity
                            style={styles.completeButton}
                            onPress={handleAdvance}
                        >
                            <Text style={styles.completeButtonText}>
                                Continuer
                            </Text>
                            <IconArrowNarrowRight
                                size={20}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={handleReset}
                    >
                        <IconRotateClockwise size={22} color="#555555" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 12,
    },
    canvasContainer: {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 16,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#2196F3',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginVertical: 12,
    },
    continueText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    feedbackText: {
        marginTop: 14,
        paddingHorizontal: 16,
        textAlign: 'center',
        color: '#B45309',
        fontSize: 14,
        fontWeight: '600',
    },
    successText: {
        color: '#16A34A',
    },
    progressContainer: {
        width: '100%',
        maxWidth: 320,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingHorizontal: 8,
    },
    progressText: {
        color: '#777777',
        fontSize: 12,
        fontWeight: '500',
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: "auto",
        marginTop: 18,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#000000',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    completeButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    resetButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 24,
        backgroundColor: '#EEEEEE',
    },
});
