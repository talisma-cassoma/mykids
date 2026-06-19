import { View, type ViewProps, TouchableOpacity } from 'react-native';
import { useGame } from '@/context/gameContext';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { IconArrowLeft } from "@tabler/icons-react-native"

export type ThemedSafeAreaViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
    backIcon?: boolean
    theme?: boolean
};

export function ThemedSafeAreaView({ children, style, lightColor, 
    darkColor, backIcon=false,
    theme=false, ...otherProps }: ThemedSafeAreaViewProps) {
    const { mode } = useGame();
    const backgroundColor =
        mode === "dark"
            ? darkColor ?? Colors.dark.background
            : lightColor ?? Colors.light.background;

    return (
        <SafeAreaView style={[{ flex: 1, padding: 28, paddingTop: 80 },
        { backgroundColor: backgroundColor }, style]}  {...otherProps}>
            <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", alignItems:"center" }}>
                {backIcon && (
                <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: "transparent"}}
                    onPress={() => router.replace("/")}>
                    <IconArrowLeft color={Colors[mode].icon} style={{alignSelf:"flex-start"}}/>
                </TouchableOpacity>
                )}
                {theme && <ThemeToggleButton />}
            </View>
            {children}
        </SafeAreaView>
    )
}
