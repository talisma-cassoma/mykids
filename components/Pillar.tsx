
import React, { useState, useRef, type ReactNode } from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    LayoutChangeEvent,
    Animated,
    Easing,
} from "react-native";
import { SvgXml } from "react-native-svg";

import { useGame } from "@/context/YachaneContext";
import { SvgAsset } from '@/components/SvgAssets';
import {
    PillarCollectible,
    type CollectibleName,
    type PillarCollectibleProps,
} from '@/components/PillarCollectible';
import { ThemedText } from '@/components/ThemedText';
import { Canvas, Path, Skia } from "@shopify/react-native-skia";

interface SpeechBubbleProps {
    message: string;
}

export function InvertedSpeechBubble({ message }: SpeechBubbleProps) {
    const { mode } = useGame();
    const [size, setSize] = useState({ width: 0, height: 0 });

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setSize({ width, height });
    };

    const backgroundColor = mode === "dark" ? "#1F2937" : "#FFFFFF";
    const textColor = mode === "dark" ? "#FFFFFF" : "#111827";

    const pointerHeight = 6;
    const cornerRadius = 8;
    const pointerWidth = 12;

    const w = size.width;
    const h = size.height;
    const boxHeight = h - pointerHeight;
    const cx = w / 2;

    const getBubblePath = () => {
        if (w <= 0 || h <= 0) return null;

        const svgPath = `
            M ${cornerRadius} 0
            H ${w - cornerRadius}
            A ${cornerRadius} ${cornerRadius} 0 0 1 ${w} ${cornerRadius}
            V ${boxHeight - cornerRadius}
            A ${cornerRadius} ${cornerRadius} 0 0 1 ${w - cornerRadius} ${boxHeight}
            H ${cx + pointerWidth / 2}
            L ${cx} ${h}
            L ${cx - pointerWidth / 2} ${boxHeight}
            H ${cornerRadius}
            A ${cornerRadius} ${cornerRadius} 0 0 1 0 ${boxHeight - cornerRadius}
            V ${cornerRadius}
            A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} 0
            Z
        `;

        return Skia.Path.MakeFromSVGString(svgPath);
    };

    const path = getBubblePath();

    return (
        <View
            style={{
                alignSelf: 'center',
                marginBottom: 6,
                zIndex: 3,
            }}
            onLayout={onLayout}
        >
            {w > 0 && h > 0 && (
                <Canvas
                    style={[
                        StyleSheet.absoluteFillObject,
                        { width: w, height: h }
                    ]}
                >
                    {path && <Path path={path} color={backgroundColor} />}
                </Canvas>
            )}

            <View style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
            }}>
                <ThemedText
                    style={{
                        fontSize: 12,
                        textAlign: 'center',
                        fontWeight: '600',
                        color: textColor,
                    }}
                >
                    {message}
                </ThemedText>
            </View>
        </View>
    );
}

export interface PillarsProps {
    collectibles?: CollectibleName
    pillar:
        | "PillarCubeLgSvg"
        | "PillarCubeSmSvg"
        | "PillarCylinderLgSvg"
        | "PillarCylinderSmSvg";
    status?: PillarStatus;
    message: string;
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
    onPress,
    children,
}: PillarsProps) {
    const { mode } = useGame();

    // One animation value shared by the entire pillar.
    const bounceAnim = useRef(new Animated.Value(0)).current;

    const handlePress = () => {
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

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            style={styles.pillarWrapper}
        >
            {/* Animated message */}
            <Animated.View
                style={[
                    styles.messageContainer,
                    animatedStyle,
                    mode === "dark"
                        ? { borderBottomColor: "#fff" }
                        : { borderBottomColor: "#000" }
                ]}
            >
                {message ? (
                    <InvertedSpeechBubble message={message} />
                ) : null}
            </Animated.View>

            {/* Animated pillar and collectible */}
            <Animated.View
                style={[
                    styles.isometricContainer,
                    animatedStyle,
                ]}
            >
                {children != null
                    ? React.Children.map(children, child => {
                        if (
                            React.isValidElement<PillarCollectibleProps>(child) &&
                            child.type === PillarCollectible
                        ) {
                            return React.cloneElement(child, {
                                style: [
                                    { bottom: isLarge ? '75%' : '55%' },
                                    child.props.style,
                                ],
                            });
                        }

                        return child;
                    })
                    : (
                        <PillarCollectible
                            collectibles={collectibles}
                            style={{ bottom: isLarge ? '85%' : '55%' }}
                        />
                    )}

                {status === "idle" ? (
                    <SvgAsset
                        name={pillar}
                        width={60}
                        height={isLarge ? 75.5 : 55.5}
                    />
                ) : (
                    <SvgXml
                        xml={getColoredPillarXml(pillar, status)}
                        width={60}
                        height={isLarge ? 75.5 : 55.5}
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
    messageContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 4,
        borderBottomWidth: 0,
        zIndex: 3,
    },
    isometricContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
    },
});
