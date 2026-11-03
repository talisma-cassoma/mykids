import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, ScrollView } from 'react-native';
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
import { useLocalSearchParams } from "expo-router";

import { IconRotateClockwise, IconArrowNarrowRight, IconArrowNarrowDown } from "@tabler/icons-react-native";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { GameHeader } from "@/components/Header";
import { useAyla } from "@/context/AylaContext";
import { Colors } from "@/constants/Colors";
import { TimerConverter } from "@/utils/lessons";
import tracingData from "@/assets/tracingfiles/numbers.json";

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = width;
const CANVAS_HEIGHT = 400;

interface Waypoint {
    id: number;
    x: number;
    y: number;
}

interface Stroke {
    id: number;
    waypoints: Waypoint[];
}

function getCenteredStrokes(strokes: Stroke[], targetWidth: number, targetHeight: number): Stroke[] {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    strokes.forEach(stroke => {
        stroke.waypoints.forEach(wp => {
            if (wp.x < minX) minX = wp.x;
            if (wp.x > maxX) maxX = wp.x;
            if (wp.y < minY) minY = wp.y;
            if (wp.y > maxY) maxY = wp.y;
        });
    });

    const letterWidth = maxX - minX;
    const letterHeight = maxY - minY;
    const scale = Math.min(
        (targetWidth * 0.8) / letterWidth,
        (targetHeight * 0.8) / letterHeight
    );
    const offsetX = (targetWidth - letterWidth * scale) / 2 - minX * scale;
    const offsetY = (targetHeight - letterHeight * scale) / 2 - minY * scale;

    return strokes.map(stroke => ({
        ...stroke,
        waypoints: stroke.waypoints.map(wp => ({
            ...wp,
            x: wp.x * scale + offsetX,
            y: wp.y * scale + offsetY,
        }))
    }));
}

const WAYPOINT_THRESHOLD = 35;
const START_THRESHOLD = 55;
const GUIDE_STROKE_WIDTH = 30;
const USER_STROKE_WIDTH = 25;

type WaypointTracingAppProps = {
    numberKey?: string;
};

type NumberKey = keyof typeof tracingData;

const NUMBER_KEYS = Object.keys(tracingData) as NumberKey[];

export default function WaypointTracingApp({ numberKey: numberKeyProp }: WaypointTracingAppProps) {
    const { nextStage, setGameScore } = useAyla();
    const { numberKey: routeNumberKey } = useLocalSearchParams<{ numberKey?: string }>();
    
    const initialKey = numberKeyProp ?? routeNumberKey;
    const initialIndex = initialKey && NUMBER_KEYS.includes(initialKey as NumberKey)
        ? NUMBER_KEYS.indexOf(initialKey as NumberKey)
        : 0;

    const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
    const [completedNumbers, setCompletedNumbers] = useState<string[]>([]);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    
    const numberKey = NUMBER_KEYS[currentIndex] ?? NUMBER_KEYS[0];
    const numberConfig = tracingData[numberKey];

    const strokes = useMemo(
        () => getCenteredStrokes(numberConfig.strokes, CANVAS_WIDTH, CANVAS_HEIGHT),
        [numberConfig]
    );

    const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
    const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const scrollViewRef = useRef<ScrollView | null>(null);
    const [time, setTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const hasSavedScoreRef = useRef(false);
    const gameTitle = numberConfig.title;

    const currentStroke = useSharedValue(0);
    const currentWaypoint = useSharedValue(0);
    const isTracing = useSharedValue(false);
    const isCompleted = useSharedValue(false);
    const isPausedShared = useSharedValue(false);
    const userPath = useSharedValue(Skia.Path.Make());

    const resetTrace = () => {
        currentStroke.value = 0;
        currentWaypoint.value = 0;
        isTracing.value = false;
        isCompleted.value = false;
        isPausedShared.value = false;
        userPath.value = Skia.Path.Make();

        setCurrentStrokeIndex(0);
        setCurrentWaypointIndex(0);
        setCompleted(false);
        setIsPaused(false);
        setTime(0);
        setIsDrawing(false);
        hasSavedScoreRef.current = false;
    };

    const handleReset = () => resetTrace();
    const handleScroll = () => scrollViewRef.current?.scrollToEnd({ animated: true });

    useEffect(() => {
        if (isPaused || completed) return;

        const interval = setInterval(() => {
            setTime((elapsed) => elapsed + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [completed, isPaused, currentIndex]);

    const handleTogglePause = () => {
        const nextPaused = !isPaused;
        isPausedShared.value = nextPaused;
        setIsPaused(nextPaused);
    };

    const handleAdvance = () => {
        if (!hasSavedScoreRef.current) {
            hasSavedScoreRef.current = true;
            setGameScore((scores) => [
                ...scores,
                {
                    score: "1/1",
                    name: gameTitle,
                    duration: TimerConverter(Math.max(1, time)),
                },
            ]);
            setCompletedNumbers((numbers) =>
                numbers.includes(numberKey) ? numbers : [...numbers, numberKey]
            );
        }

        if (currentIndex < NUMBER_KEYS.length - 1) {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            setCurrentIndex((prev) => prev + 1);
            resetTrace();
        } else {
            nextStage();
        }
    };

    const panGesture = Gesture.Pan()
        .onStart((e) => {
            'worklet';

            if (isCompleted.value || isPausedShared.value) return;

            const strokeIndex = currentStroke.value;
            const waypointIndex = currentWaypoint.value;
            const stroke = strokes[strokeIndex];

            if (!stroke) return;
            const target = stroke.waypoints[waypointIndex];
            if (!target) return;

            const distance = Math.hypot(e.x - target.x, e.y - target.y);

            if (distance <= START_THRESHOLD) {
                isTracing.value = true;
                runOnJS(setIsDrawing)(true);
                userPath.modify((path) => {
                    path.moveTo(target.x, target.y);
                    return path;
                });
            }
        })
        .onUpdate((e) => {
            'worklet';

            if (!isTracing.value || isCompleted.value || isPausedShared.value) return;

            const strokeIndex = currentStroke.value;
            const waypointIndex = currentWaypoint.value;
            const stroke = strokes[strokeIndex];

            if (!stroke) return;
            const target = stroke.waypoints[waypointIndex];
            if (!target) return;

            userPath.modify((path) => {
                path.lineTo(e.x, e.y);
                return path;
            });

            const distance = Math.hypot(e.x - target.x, e.y - target.y);

            if (distance > WAYPOINT_THRESHOLD) return;

            const nextWaypoint = waypointIndex + 1;

            if (nextWaypoint < stroke.waypoints.length) {
                currentWaypoint.value = nextWaypoint;
                runOnJS(setCurrentWaypointIndex)(nextWaypoint);
                return;
            }

            const nextStroke = strokeIndex + 1;

            if (nextStroke < strokes.length) {
                currentStroke.value = nextStroke;
                currentWaypoint.value = 0;
                isTracing.value = false;
                runOnJS(setIsDrawing)(false);

                runOnJS(setCurrentStrokeIndex)(nextStroke);
                runOnJS(setCurrentWaypointIndex)(0);
                return;
            }

            isCompleted.value = true;
            isTracing.value = false;
            runOnJS(setIsDrawing)(false);
            runOnJS(setCompleted)(true);
        })
        .onEnd(() => {
            'worklet';
            isTracing.value = false;
            runOnJS(setIsDrawing)(false);
        })
        .onFinalize(() => {
            'worklet';
            isTracing.value = false;
            runOnJS(setIsDrawing)(false);
        });

    return (
        <ThemedSafeAreaView style={{ flex: 1 }}>
            <GameHeader
                gameDescription={gameTitle}
                playAndPauseButton={{
                    isActive: true,
                    resumeStatus: isPaused ? "paused" : "playing",
                    onToggle: handleTogglePause,
                }}
                timer={{
                    isActive: true,
                    mode: "increasing",
                    time,
                }}
                score={{
                    isActive: true,
                    current: currentIndex + (completed ? 1 : 0),
                    total: NUMBER_KEYS.length,
                }}
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

            <ScrollView
                ref={scrollViewRef}
                scrollEnabled={!isDrawing}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
                <TouchableOpacity style={styles.continueButton} onPress={handleScroll}>
                    <Text style={styles.continueText}>Descendre</Text>
                    <IconArrowNarrowDown size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <GestureHandlerRootView style={styles.container}>
                    <GestureDetector gesture={panGesture}>
                        <View style={styles.canvasContainer}>
                            <Canvas style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
                                {strokes.map((stroke) => (
                                    <Path
                                        key={`guide-${stroke.id}`}
                                        path={createStrokePath(stroke)}
                                        color="#e0e0e0"
                                        style="stroke"
                                        strokeWidth={GUIDE_STROKE_WIDTH}
                                        strokeCap="round"
                                        strokeJoin="round"
                                    />
                                ))}

                                <Path
                                    path={userPath}
                                    color={completed ? '#4CAF50' : '#2196F3'}
                                    style="stroke"
                                    strokeWidth={USER_STROKE_WIDTH}
                                    strokeCap="round"
                                    strokeJoin="round"
                                />

                                {strokes.map((stroke, strokeIndex) =>
                                    stroke.waypoints.map((wp, waypointIndex) => {
                                        if (
                                            strokeIndex < currentStrokeIndex ||
                                            (strokeIndex === currentStrokeIndex && waypointIndex < currentWaypointIndex)
                                        ) {
                                            return null;
                                        }

                                        const isActive =
                                            strokeIndex === currentStrokeIndex &&
                                            waypointIndex === currentWaypointIndex;

                                        return (
                                            <Group key={`waypoint-${wp.id}`}>
                                                <Circle
                                                    cx={wp.x}
                                                    cy={wp.y}
                                                    r={isActive ? 25 : 14}
                                                    color={isActive ? 'rgba(33, 150, 243, 0.25)' : 'rgba(180, 180, 180, 0.35)'}
                                                />
                                                <Circle
                                                    cx={wp.x}
                                                    cy={wp.y}
                                                    r={isActive ? 9 : 7}
                                                    color={isActive ? '#2196F3' : '#aaaaaa'}
                                                />
                                            </Group>
                                        );
                                    })
                                )}
                            </Canvas>
                        </View>
                    </GestureDetector>
                </GestureHandlerRootView>

                <View style={styles.headerContainer}>
                    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexWrap: "wrap" }}>
                        <Text style={styles.title}>
                            {completed ? "🎉 Bravo !" : numberConfig.title}
                        </Text>
                        <Text style={styles.subtitle}>
                            {completed
                                ? `Vous avez réussi le chiffre ${numberKey} !`
                                : currentWaypointIndex === 0
                                    ? 'Suivez le point bleu'
                                    : `Continuez vers le point ${currentWaypointIndex + 1}`}
                        </Text>
                    </View>

                    {completed && (
                        <TouchableOpacity style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#000000",
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 20,
                            gap: 6,
                        }} onPress={handleAdvance}>
                            <Text style={{
                                color: "#FFFFFF",
                                fontSize: 14,
                                fontWeight: "600",
                            }}>continuer</Text>
                            <IconArrowNarrowRight size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                        <IconRotateClockwise size={22} color="#555" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedSafeAreaView>
    );
}

function createStrokePath(stroke: Stroke) {
    const path = Skia.Path.Make();
    if (stroke.waypoints.length === 0) return path;

    const first = stroke.waypoints[0];
    path.moveTo(first.x, first.y);

    for (let i = 1; i < stroke.waypoints.length; i++) {
        const point = stroke.waypoints[i];
        path.lineTo(point.x, point.y);
    }

    return path;
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        flexDirection: "column",
        paddingBottom: 30,
    },
    continueButton: {
        alignSelf: "flex-end",
        marginTop: 10,
        marginRight: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#000000",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 6,
    },
    continueText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        marginTop: 2,
        fontSize: 14,
        color: '#777',
    },
    resetButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    canvasContainer: {
        height: CANVAS_HEIGHT,
        width: CANVAS_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
});