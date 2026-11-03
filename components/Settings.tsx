import React from "react";
import { TouchableOpacity } from "react-native";
import { IconSettings } from "@tabler/icons-react-native";
import { router, usePathname } from "expo-router";
import { useGameControls } from "@/context/GameControlsContext";
import { Colors } from "@/constants/Colors";


export function Settings() {
    const { mode } = useGameControls()
    const pathname = usePathname();
    const settingsRoute = pathname.startsWith("/games/ayla")
        ? "/games/ayla/settings/SettingsScreen"
        : "/games/yachane/settings/SettingsScreen";
    return (
        <TouchableOpacity
            style={[{
                justifyContent: "center",
                alignItems: "center",
                width: 40, height: 40, borderRadius: 20,
            }]}
            onPress={() => router.replace(settingsRoute)}
        >
            <IconSettings size={30} color={Colors[mode].icon} />
        </TouchableOpacity>
    )
}