import React, { useEffect, useRef } from "react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react-native";
import {
    TouchableWithoutFeedback,
    Animated,
    StyleSheet,
    View,
} from "react-native";
import { useGame } from "@/context/gameContext";
import { Colors } from "@/constants/Colors";

interface PlayAndPauseToggleButtonProps {
    resumeStatus: "playing" | "paused";
    onToggle: () => void;
}

export function PlayAndPauseToggleButton({ resumeStatus, onToggle }: PlayAndPauseToggleButtonProps) {

   const { mode } = useGame();

    const translateX = useRef(new Animated.Value(resumeStatus === "playing"? 0 : 26)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: resumeStatus === "playing"? 26 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [resumeStatus]);

    return (
        <TouchableWithoutFeedback onPress={onToggle}>
            <View
                style={[
                    styles.switch,
                    { backgroundColor: resumeStatus=== "playing"? 
                        (mode === "dark" ? Colors.dark.icon : "#a5d6a7" ) : 
                        (mode === "dark" ? Colors.dark.icon : "#ccc" ), 
                        marginBottom: 20 },
                ]}
            >
                <Animated.View
                    style={[
                        styles.knob,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    {resumeStatus=== "playing"? (
                        <IconPlayerPauseFilled color={mode === "dark" ? Colors.dark.icon : "#a5d6a7"}  size={18} />
                    ) : (
                        <IconPlayerPlayFilled color={mode === "dark" ? Colors.dark.icon : "#ccc"} size={18} />
                    )}
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    switch: {
        width: 60,
        height: 32,
        borderRadius: 34,
        padding: 4,
        justifyContent: "center",
    },
    knob: {
        width: 26,
        height: 26,
        borderRadius: 13, // corrigé (pas "100%")
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});