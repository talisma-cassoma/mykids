import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Score } from "@/components/Score";
import { ProgressBar } from "@/components/ProgressBar";
import { Timer } from "@/components/Timer";
import { PlayAndPauseToggleButton } from "@/components/PlayAndPauseToggleButton";
import { useGame } from "@/context/gameContext";
import { resume } from "expo-speech";

interface HeaderProps {
    gameDescription?: string;
    playAndPauseButton?:{
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

export function Header({gameDescription, timer, score, playAndPauseButton}: HeaderProps) {


    return (
        <View style={styles.header}>
            {(playAndPauseButton?.isActive 
            && playAndPauseButton.resumeStatus !== undefined 
            && playAndPauseButton.onToggle !== undefined)&& (
                <PlayAndPauseToggleButton 
                resumeStatus={playAndPauseButton.resumeStatus}
                onToggle={playAndPauseButton.onToggle}
                />
            )}
            <ProgressBar />

            <View style={styles.row}>
                {/* SCORE */}
                {(score?.isActive && score.current !== undefined && score.total !== undefined)&& (
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
                <Text style={styles.title}>{gameDescription}</Text>
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
        height:138,
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