import React from "react";
import { TouchableOpacity } from "react-native";
import { IconSettings } from "@tabler/icons-react-native";
import { router } from "expo-router";
import { useGame } from "@/context/gameContext";
import { Colors } from "@/constants/Colors";


export function Settings() {
    const { mode } = useGame()
    return (
        <TouchableOpacity
            style={[{
                justifyContent: "center",
                alignItems: "center",
                width: 40, height: 40, borderRadius: 20,
            }]}
            onPress={() => router.replace("/games/settings/SettingsScreen")}
        >
            <IconSettings size={30} color={Colors[mode].icon} />
        </TouchableOpacity>
    )
}