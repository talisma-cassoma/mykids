import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { IconSettings, IconCircleCheck } from "@tabler/icons-react-native";
import { Score } from "@/components/Score";
import { ProgressBar } from "@/components/ProgressBar";
import { Settings } from "@/components/Settings";
import { Timer } from "@/components/Timer";
import { PlayAndPauseToggleButton } from "@/components/PlayAndPauseToggleButton";
import { Redirect, router, usePathname } from "expo-router";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { useGameControls } from "@/context/GameControlsContext";
import { Colors } from "@/constants/Colors";
import { SvgAsset } from "@/components/SvgAssets"; // Ajuste o caminho se necessário
import { useSpeech } from "@/utils/lessons"; // Ajuste o caminho se necessário
import { Button } from "@/components/Button";


export interface ProfileConfig {
    name: string;
    avatarSvgName: "DinoPrincessSvg" | "DinoProfileAvatarSvg" | "PrincessProfileAvatarSvg" | "CoinSvg" | "TrophySvg"
    startScreenRoute: string;
}

export interface GameHeaderProps {
    gameDescription?: string;
    trophiesCount?: number;
    coinsCount?: number;
    avatarSize?: number;
    wrapperBorderWidth?: number;
    currentProfile: ProfileConfig;
    otherProfile: ProfileConfig;
    settingsRoute: string;
   
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
    validate?: {
        isActive: boolean;
        onValidate?: (isValid: boolean) => void;
    };    
}

const buildValidationChallenge = () => {
    const root = Math.floor(Math.random() * 18) + 7;
    const target = root * root;

    return {
        prompt: `Trouve la racine carrée de ${target}`,
        answer: root,
    };
};

export function GameHeader({
    gameDescription,
    trophiesCount = 5,
    coinsCount = 4,
    avatarSize = 50,
    wrapperBorderWidth = 4,
    currentProfile,
    otherProfile,
    settingsRoute,
    timer,
    score,
    playAndPauseButton,
    validate,
}: GameHeaderProps) {
    const { mode } = useGameControls()
     const { speak } = useSpeech();
     const [validationVisible, setValidationVisible] = useState(false);
     const [validationInput, setValidationInput] = useState("");
     const [validationChallenge, setValidationChallenge] = useState(() => buildValidationChallenge());

     const handleProfilePress = async(route: string) => {
        const warning = "vous voulez vraiment sortir?";
        await speak(warning, "fr-FR");
        
        Alert.alert(
            "Confirmation",
            warning,
            [
                { text: "Non", style: "cancel" },
                {
                    text: "Oui",
                    onPress:  () => {
                        router.replace(route as any);
                    },
                },
            ]
        );
    };

    const openValidationModal = () => {
        setValidationInput("");
        setValidationChallenge(buildValidationChallenge());
        setValidationVisible(true);
    };

    const submitValidation = () => {
        const parsedValue = Number(validationInput.replace(",", "."));
        const isValid = Number.isFinite(parsedValue) && Math.abs(parsedValue - validationChallenge.answer) < 0.0001;

        validate?.onValidate?.(isValid);
        setValidationVisible(false);
        setValidationInput("");
    };

    return (
        <View style={s.container}>
            
            {/* <ProgressBar /> */}

            <ThemedView style={s.headerBar} darkColor="#333" lightColor="#FFFFFF">
                {/* Left Avatar (Current Profile) */}
                <TouchableOpacity
                    style={{ alignItems: "center", justifyContent: "center" }}
                    onPress={() => handleProfilePress(currentProfile.startScreenRoute)}
                >
                    <View style={[s.profileWrapper, { borderWidth: wrapperBorderWidth }]}>
                        <SvgAsset
                            name={currentProfile.avatarSvgName}
                            width={avatarSize}
                            height={avatarSize}
                            style={{ aspectRatio: 1 / 1 }}
                        />
                    </View>
                </TouchableOpacity>

                {/* Central Stats & Controls */}
                <View style={s.statsAndControlsContainer}>
                    {/* Trophies */}
                    <View style={s.statItem}>
                        <SvgAsset name="TrophySvg" width={32.19} height={25.5} />
                        <ThemedText style={s.statText}>{trophiesCount}</ThemedText>
                    </View>

                    {/* Coins */}
                    <View style={s.statItem}>
                        <SvgAsset name="CoinSvg" width={32} height={32} />
                        <ThemedText style={s.statText}>{coinsCount}</ThemedText>
                    </View>

                    {/* Settings Button */}
                    <TouchableOpacity onPress={() => router.replace(settingsRoute as any)}>
                          <IconSettings size={30} color={Colors[mode].icon} />
                            </TouchableOpacity>
                    

                    {/* Theme Toggle */}
                    <ThemeToggleButton />
                </View>

                {/* Right Avatar (Other Profile / Switch Target) */}
                <TouchableOpacity
                    style={{ alignItems: "center", justifyContent: "center" }}
                    onPress={() => handleProfilePress(otherProfile.startScreenRoute)}
                >
                    <View style={{ filter: [{ grayscale: 1 }] }}>
                        <SvgAsset
                            name={otherProfile.avatarSvgName}
                            width={avatarSize}
                            height={avatarSize}
                            style={{ aspectRatio: 1 / 1 }}
                        />
                    </View>
                </TouchableOpacity>
            </ThemedView>

            <View style={{ flexDirection: "row-reverse", width: "100%", justifyContent: "space-between", marginBottom:20, paddingHorizontal: "10%", paddingVertical: 12, alignItems: "center", gap: 20 }}>
            
                {(playAndPauseButton?.isActive
                    && playAndPauseButton.resumeStatus !== undefined
                    && playAndPauseButton.onToggle !== undefined) && (
                        <PlayAndPauseToggleButton
                            resumeStatus={playAndPauseButton.resumeStatus}
                            onToggle={playAndPauseButton.onToggle}
                        />
                    )}
                
                {(timer?.isActive && timer?.time !== undefined, timer?.mode !== undefined) && (
                    <Timer
                        isActive={timer.isActive}
                        time={timer.time}
                        mode={timer.mode}
                    />)
                }


                {(score?.isActive && score.current !== undefined && score.total !== undefined) && (
                    <Score score={score.current} total={score.total} />
                )}
                
                {validate?.isActive && (
                    <Button
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            paddingHorizontal: 12,
                            backgroundColor: "#000000",
                            borderRadius: 18,
                        }}
                        onPress={openValidationModal}
                    >
                        <Button.Icon icon={IconCircleCheck} color="#FFFFFF" />
                        <Button.Title>Valider</Button.Title>
                    </Button>
                )}
                

            </View>
            <Modal
                visible={validationVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setValidationVisible(false)}
            >
                <View style={s.modalOverlay}>
                    <View style={s.modalCard}>
                        <ThemedText style={s.modalTitle}>Validation</ThemedText>
                        <ThemedText style={s.modalPrompt}>{validationChallenge.prompt} ?</ThemedText>

                        <TextInput
                            value={validationInput}
                            onChangeText={setValidationInput}
                            placeholder="Réponse"
                            keyboardType="numeric"
                            autoFocus
                            style={s.input}
                        />

                        <View style={s.modalActions}>
                            <TouchableOpacity
                                style={[s.modalButton, s.secondaryButton]}
                                onPress={() => setValidationVisible(false)}
                            >
                                <Text style={s.secondaryButtonText}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[s.modalButton, s.primaryButton]}
                                onPress={submitValidation}
                            >
                                <Text style={s.primaryButtonText}>Vérifier</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Optional Game Description */}
            {gameDescription && (
                <ThemedText style={s.title}>{gameDescription}</ThemedText>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
    },
    headerBar: {
        flexDirection: "row",
        width: "100%",
        height: 72,
        borderRadius: 36,
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    profileWrapper: {
        borderRadius: 999,
        overflow: "hidden",
        borderColor: "#22c55e",
        alignItems: "center",
        justifyContent: "center",
    },
    statsAndControlsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 15,
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 24,
        gap: 18,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        color: "#111827",
    },
    modalPrompt: {
        fontSize: 18,
        textAlign: "center",
        color: "#374151",
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 18,
        backgroundColor: "#F9FAFB",
        color: "#111827",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    modalButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButton: {
        backgroundColor: "#E5E7EB",
    },
    secondaryButtonText: {
        color: "#111827",
        fontWeight: "600",
    },
    primaryButton: {
        backgroundColor: "#111827",
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
});

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