import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { IconSettings } from "@tabler/icons-react-native";
import { Score } from "@/components/Score";
import { ProgressBar } from "@/components/ProgressBar";
import { Settings } from "@/components/Settings";
import { Timer } from "@/components/Timer";
import { PlayAndPauseToggleButton } from "@/components/PlayAndPauseToggleButton";
import { Redirect, router } from "expo-router";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { useGame } from "@/context/gameContext";
import { Colors } from "@/constants/Colors";


interface HeaderProps {
    gameDescription?: string;
    playAndPauseButton?: {
        isActive: boolean;
        resumeStatus?: "playing" | "paused";
        onToggle?: () => void;
    }
    timer?: {
        isActive: boolean;
        mode?: "increasing" | "decreasing";
        time?: number;
    };
    score?: {
        isActive: boolean;
        current?: number;
        total?: number;
    };
}

export function Header({ gameDescription, timer, score, playAndPauseButton }: HeaderProps) {

    const { mode } = useGame();

    return (
        <View style={styles.header}>
            <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", marginBottom:20 }}>
                {(playAndPauseButton?.isActive
                    && playAndPauseButton.resumeStatus !== undefined
                    && playAndPauseButton.onToggle !== undefined) && (
                        <PlayAndPauseToggleButton
                            resumeStatus={playAndPauseButton.resumeStatus}
                            onToggle={playAndPauseButton.onToggle}
                        />
                    )}
                <View style={{
                    flexDirection: "row",
                    width: "auto",
                    gap: 10,
                    marginLeft: playAndPauseButton?.isActive ? 0 : 'auto',
                    alignSelf: "center",
                }}>
                    <ThemeToggleButton />
                    <Settings />
                </View>
            </View>

            <ProgressBar />

            <View style={styles.row}>
                {/* SCORE */}
                {(score?.isActive && score.current !== undefined && score.total !== undefined) && (
                    <Score score={score.current} total={score.total} />
                )}

                {(timer?.isActive && timer?.time !== undefined, timer?.mode !== undefined) && (
                    <Timer
                        isActive={timer.isActive}
                        time={timer.time}
                        mode={timer.mode}
                    />)
                }
            </View>

            {/* TITULO DO JOGO */}
            {gameDescription && (
                <ThemedText style={styles.title}>{gameDescription}</ThemedText>
            )}

            {/* TITULO DO STAGE
            {currentStage?.component?.props?.title && (
                <Text style={[styles.title, styles.underline]}>
                    {currentStage.component.props.title}
                </Text> }
            )*/}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "column",
        width: "100%",
        height: 138,
        justifyContent: "space-between"
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    underline: {
        textDecorationLine: "underline",
        fontStyle: "italic",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        gap: 20,
    },
});