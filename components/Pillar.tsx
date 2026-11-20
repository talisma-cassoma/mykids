
import React, { useEffect, useState, useRef, type ReactNode } from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Animated,
    Easing,
    Text,
    type GestureResponderEvent,
    type ViewStyle,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { router, type Href } from "expo-router";
 import { TimerConverter, useSpeech } from "@/utils/lessons";
import { SvgAsset } from '@/components/SvgAssets';
import {
    PillarCollectible,
    type CollectibleName,
    type PillarCollectibleProps,
} from '@/components/PillarCollectible';
import { Canvas, Path, Skia } from "@shopify/react-native-skia";

export interface PillarsProps {
    collectibles?: CollectibleName
    pillar:
        | "PillarCubeLgSvg"
        | "PillarCubeSmSvg"
        | "PillarCylinderLgSvg"
        | "PillarCylinderSmSvg";
    status?: PillarStatus;
    message: string;
    link?: Href;
    onEnter?: () => void;
    onClose?: () => void;
    onPress?: () => void;
    children?: ReactNode;
}

export type PillarStatus = "idle" | "clicked" | "done";

const pillarColors: Record<
    Exclude<PillarStatus, "idle">,
    { side: string; top: string; outline: string }
> = {
    clicked: { side: "#F8B041", top: "#FFF5C6", outline: "#F8B041" },
    done: { side: "#009F49", top: "#009F49", outline: "#34C759" },
};

function getColoredPillarXml(
    pillar: PillarsProps["pillar"],
    status: Exclude<PillarStatus, "idle">,
) {
    const { side: sideColor, top: topColor, outline: outlineColor } = pillarColors[status];

    switch (pillar) {
        case "PillarCubeSmSvg":
            return `
                <svg width="111" height="87" viewBox="0 0 111 87" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 54.75L54.7792 21L111 54.75L54.7792 87L0 54.75Z" fill="${sideColor}"/>
                    <path d="M0 33.75H111V54.75H0V33.75Z" fill="${sideColor}"/>
                    <path d="M0 33.75L54.7792 0L111 33.75L54.7792 66L0 33.75Z" fill="${topColor}"/>
                    <mask id="stroke" fill="white">
                        <path d="M0 33.75L54.7792 0L111 33.75L54.7792 66L0 33.75Z"/>
                    </mask>
                    <path d="M54.7792 0L0 33.75L54.7792 66L111 33.75L54.7792 0Z" stroke-width="27" stroke="${outlineColor}" mask="url(#stroke)"/>
                </svg>
            `;
        case "PillarCubeLgSvg":
            return `
                <svg width="111" height="165" viewBox="0 0 111 165" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="paint" x1="55.5" y1="33.7449" x2="55.5" y2="164.245" gradientUnits="userSpaceOnUse">
                            <stop stop-color="${sideColor}"/>
                            <stop offset="1" stop-color="${sideColor}" stop-opacity="0"/>
                        </linearGradient>
                    </defs>
                    <path d="M0 33.7449H111V164.245H0V33.7449Z" fill="url(#paint)"/>
                    <path d="M0 56.0999L54.7792 22.3499L111 56.0999L54.7792 88.3499L0 56.0999Z" fill="${sideColor}"/>
                    <path d="M0 35.0999H111V56.0999H0V35.0999Z" fill="${sideColor}"/>
                    <path d="M0 33.75L54.7792 0L111 33.75L54.7792 66L0 33.75Z" fill="${topColor}"/>
                    <mask id="stroke" fill="white">
                        <path d="M0 33.75L54.7792 0L111 33.75L54.7792 66L0 33.75Z"/>
                    </mask>
                    <path d="M54.7792 0L0 33.75L54.7792 66L111 33.75L54.7792 0Z" stroke-width="27" stroke="${outlineColor}" mask="url(#stroke)"/>
                </svg>
            `;
        case "PillarCylinderSmSvg":
            return `
                <svg width="111" height="90" viewBox="0 0 111 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="55.5" cy="55.5" rx="55.5" ry="34.5" fill="${sideColor}"/>
                    <path d="M0 34.5H111V55.5H0V34.5Z" fill="${sideColor}"/>
                    <path d="M111 34.5C111 53.5538 86.1518 69 55.5 69C24.8482 69 0 53.5538 0 34.5C0 15.4462 24.8482 0 55.5 0C86.1518 0 111 15.4462 111 34.5Z" fill="${topColor}"/>
                    <mask id="stroke" fill="white">
                        <path d="M111 34.5C111 53.5538 86.1518 69 55.5 69C24.8482 69 0 53.5538 0 34.5C0 15.4462 24.8482 0 55.5 0C86.1518 0 111 15.4462 111 34.5Z"/>
                    </mask>
                    <path d="M111 34.5C111 53.5538 86.1518 69 55.5 69C24.8482 69 0 53.5538 0 34.5C0 15.4462 24.8482 0 55.5 0C86.1518 0 111 15.4462 111 34.5Z" stroke-width="27" stroke-linecap="round" stroke="${outlineColor}" mask="url(#stroke)"/>
                </svg>
            `;
        case "PillarCylinderLgSvg":
            return `
                <svg width="111" height="165" viewBox="0 0 111 165" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="paint" x1="55.5" y1="34.5" x2="55.5" y2="165" gradientUnits="userSpaceOnUse">
                            <stop stop-color="${sideColor}"/>
                            <stop offset="1" stop-color="${sideColor}" stop-opacity="0"/>
                        </linearGradient>
                    </defs>
                    <path d="M0 34.5H111V165H0V34.5Z" fill="url(#paint)"/>
                    <ellipse cx="55.5" cy="55.5" rx="55.5" ry="34.5" fill="${sideColor}"/>
                    <path d="M0 34.5H111V55.5H0V34.5Z" fill="${sideColor}"/>
                    <path d="M111 34.5C111 53.5538 86.1518 69 55.5 69C24.8482 69 0 53.5538 0 34.5C0 15.4462 24.8482 0 55.5 0C86.1518 0 111 15.4462 111 34.5Z" fill="${topColor}"/>
                    <mask id="stroke" fill="white">
                        <path d="M111 34.5C111 53.5538 86.1518 69 55.5 69C24.8482 69 0 53.5538 0 34.5C0 15.4462 24.8482 0 55.5 0C86.1518 0 111 15.4462 111 34.5Z"/>
                    </mask>
                    <path d="M111 34.5C111 53.5538 86.1518 69 55.5 69C24.8482 69 0 53.5538 0 34.5C0 15.4462 24.8482 0 55.5 0C86.1518 0 111 15.4462 111 34.5Z" stroke-width="27" stroke-linecap="round" stroke="${outlineColor}" mask="url(#stroke)"/>
                </svg>
            `;
    }
}

function PillarComponent({
    message,
    pillar,
    collectibles,
    status = "idle",
    link,
    onEnter,
    onClose,
    onPress,
    children,
}: PillarsProps) {
    const [speechDismissed, setSpeechDismissed] = useState(false);
    const [displayedMessage, setDisplayedMessage] = useState("");
     const { speak } = useSpeech();

    // One animation value shared by the entire pillar.
    const bounceAnim = useRef(new Animated.Value(0)).current;

    const handlePress = () => {
        setSpeechDismissed(false);

        // Restart the animation on every click.
        bounceAnim.stopAnimation();
        bounceAnim.setValue(0);

        Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();

        onPress?.();
    };

    // One quick upward bounce followed by a return.
    const translateY = bounceAnim.interpolate({
        inputRange: [0, 0.35, 0.65, 0.85, 1],
        outputRange: [0, -12, 0, -3, 0],
    });

    const animatedStyle = {
        transform: [{ translateY }],
    };

    const isLarge =
        pillar === "PillarCubeLgSvg" ||
        pillar === "PillarCylinderLgSvg";
    const showSpeech = status === "clicked" && !speechDismissed;
    const collectiblePosition: ViewStyle = { bottom: isLarge ? "76%" : "55%" };

    useEffect(() => {
        if (status !== "clicked") {
            setSpeechDismissed(false);
        }
    }, [status]);

    useEffect(() => {
        if (!showSpeech || !message) return;
        
        speak(message, "fr-FR")

        let currentIndex = 0;
        setDisplayedMessage("");
        const interval = setInterval(() => {
            if (currentIndex <= message.length) {
                setDisplayedMessage(message.substring(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 40);

        return () => clearInterval(interval);
    }, [message, showSpeech]);

    const handleSpeechClose = (event: GestureResponderEvent) => {
        event.stopPropagation();
        setSpeechDismissed(true);
        onClose?.();
    };
    const handleSpeechEnter = (event: GestureResponderEvent) => {
        event.stopPropagation();
        if (onEnter) {
            onEnter();
        } else if (link) {
            router.push(link);
        }
    };

    const makeSpeechBalloon = () => {
        const trianglePath = Skia.Path.Make();
        trianglePath.moveTo(0, 0);
        trianglePath.lineTo(16, 0);
        trianglePath.lineTo(8, 10);
        trianglePath.close();

        return (
            <View style={styles.balloonContainer}>
                <View style={styles.balloonBox}>
                    <Text style={styles.balloonText}>{displayedMessage}</Text>
                    <View style={styles.balloonActions}>
                        <TouchableOpacity onPress={handleSpeechClose} style={styles.actionButtonClose}>
                            <Text style={styles.actionTextClose}>fermer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSpeechEnter} style={styles.actionButtonEnter}>
                            <Text style={styles.actionTextEnter}>Entrer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Canvas style={{ width: 16, height: 10, alignSelf: "center" }}>
                    <Path path={trianglePath} color="black" />
                </Canvas>
            </View>
        );
    };

    const renderCollectibleChildren = () => children != null
        ? React.Children.map(children, child => {
            if (
                React.isValidElement<PillarCollectibleProps>(child) &&
                child.type === PillarCollectible
            ) {
                return (
                    <View style={[styles.collectibleAnchor, { bottom: isLarge ? "105%" : "95%" }]}>
                        {React.cloneElement(child)}
                        {showSpeech ? makeSpeechBalloon() : null}
                    </View>
                );
            }

            return child;
        })
        : (
            <View style={[styles.collectibleAnchor, collectiblePosition]}>
                <PillarCollectible collectibles={collectibles} />
                {showSpeech ? makeSpeechBalloon() : null}
            </View>
        );

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            style={[
                styles.pillarWrapper,
                status === "clicked" && styles.activePillarWrapper,
            ]}
        >
            {/* Animated pillar and collectible */}
            <Animated.View
                style={[
                    styles.isometricContainer,
                    animatedStyle,
                ]}
            >
                {renderCollectibleChildren()}

                {status === "idle" ? (
                    <SvgAsset
                        name={pillar}
                        width={100}
                        height={isLarge ? 100 : 55.5}
                    />
                ) : (
                    <SvgXml
                        xml={getColoredPillarXml(pillar, status)}
                        width={100}
                        height={isLarge ? 104 : 55.5}
                    />
                )}
            </Animated.View>
        </TouchableOpacity>
    );
}

export const Pillar = Object.assign(PillarComponent, {
    Collectible: PillarCollectible,
});

const styles = StyleSheet.create({
    pillarWrapper: {
        alignItems: "center",
        marginVertical: -8,
    },
    activePillarWrapper: {
        zIndex: 10,
        elevation: 10,
    },
    collectibleAnchor: {
        position: "absolute",
        zIndex: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    balloonContainer: {
        position: "absolute",
        bottom: "100%",
        marginBottom: 8,
        alignItems: "center",
        width: 220,
        zIndex: 10,
        elevation: 10,
    },
    balloonBox: {
        backgroundColor: "black",
        borderRadius: 12,
        padding: 12,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    balloonText: {
        color: "white",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 8,
        lineHeight: 18,
    },
    balloonActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 0.5,
        borderTopColor: "#333",
        paddingTop: 8,
    },
    actionButtonClose: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    actionTextClose: {
        color: "#aaa",
        fontSize: 12,
        fontWeight: "600",
    },
    actionButtonEnter: {
        backgroundColor: "#fff",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    actionTextEnter: {
        color: "#000",
        fontSize: 12,
        fontWeight: "bold",
    },
    isometricContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
    },
});
