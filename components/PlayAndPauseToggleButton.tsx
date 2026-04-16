import React, { useEffect, useRef } from "react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react-native";
import {
    TouchableWithoutFeedback,
    Animated,
    StyleSheet,
    View,
} from "react-native";
import { useGame } from "@/context/gameContext";

export function PlayAndPauseToggleButton() {

    const {
        pauseGame,
        resumeGame,
        status,
    } = useGame();

    const isPlaying = status === "playing";

    const togglePlay = () => {
        if (isPlaying) {
            pauseGame();
        } else {
            resumeGame();
        }
    };

    const translateX = useRef(new Animated.Value(isPlaying ?  0 : 26)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: isPlaying ? 0 : 26,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isPlaying]);

    return (
        <TouchableWithoutFeedback onPress={togglePlay}>
            <View
                style={[
                    styles.switch,
                    { backgroundColor: isPlaying ? "#ccc" : "#a5d6a7", marginBottom: 20 },
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
                    {isPlaying ? (
                        <IconPlayerPlayFilled color="#ccc" size={18} />
                    ) : (
                        <IconPlayerPauseFilled color="#a5d6a7" size={18} />
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