import React, { useEffect, useRef } from "react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react-native";
import {
    TouchableWithoutFeedback,
    Animated,
    StyleSheet,
    View,
} from "react-native";

interface PlayAndPauseToggleButtonProps {
    resumeStatus: "playing" | "paused";
    onToggle: () => void;
}

export function PlayAndPauseToggleButton({ resumeStatus, onToggle }: PlayAndPauseToggleButtonProps) {

   
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
                    { backgroundColor: resumeStatus=== "playing"? "#a5d6a7" : "#ccc" , marginBottom: 20 },
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
                        <IconPlayerPauseFilled color="#a5d6a7" size={18} />
                    ) : (
                        <IconPlayerPlayFilled color="#ccc" size={18} />
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