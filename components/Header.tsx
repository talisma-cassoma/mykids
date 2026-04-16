import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Score } from "@/components/Score";
import { ProgressBar } from "@/components/ProgressBar";
import { Timer } from "@/components/Timer";
import { PlayAndPauseToggleButton } from "@/components/PlayAndPauseToggleButton";
import { useGame } from "@/context/gameContext";

export function Header() {
    const {
        currentStageIndex,
        stages,
        scores,
        gameDescription,
        status
    } = useGame();

    const currentStage = stages?.[currentStageIndex];

    // exemplo simples: pega score do stage atual
    const currentStageId = currentStage?.id;
    const currentScore = currentStageId ? scores[currentStageId] : undefined;

    const hasScore =
        typeof currentScore === "number";

    return (
        <View style={styles.header}>
            {(status === "playing" || status === "paused") && <PlayAndPauseToggleButton />}
            <ProgressBar />

            <View style={styles.row}>
                {/* SCORE */}
                {hasScore && (
                    <Score score={currentScore} total={100} />
                )}

                {/* TIMER */}
                <Timer />
            </View>

            {/* TITULO DO JOGO */}
            <Text style={styles.title}>{gameDescription}</Text>

            {/* TITULO DO STAGE */}
            {currentStage?.component?.props?.title && (
                <Text style={[styles.title, styles.underline]}>
                    {currentStage.component.props.title}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "column",
        width: "100%",
        paddingHorizontal: 20,     
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