import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
    };    
}

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
                
                { validate?.isActive ??(
                <Button style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, backgroundColor: "#000000", borderRadius: 18 }}
                    onPress={() => {
                        //as for square of a radon numaber between 1 and 10
                        const randomNum = Math.floor(Math.random() * 10) + 1;
                        const square = randomNum * randomNum;
                        Alert.alert(`Le carré de ${randomNum} est ${square}`);
                    }}>
                    <Button.Icon icon={IconCircleCheck} color="#FFFFFF" />
                    <Button.Title>Valider</Button.Title>
                </Button>
                )}
                

            </View>
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