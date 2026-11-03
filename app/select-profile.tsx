import React, { useState, useEffect, useRef } from 'react';
import { View, useWindowDimensions, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { IconArrowLeft } from "@tabler/icons-react-native";
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { SvgAsset } from '@/components/SvgAssets';
import { Colors } from "@/constants/Colors";
import { useGame } from '@/context/YachaneContext';

// Componente de Skeleton para os Avatares com efeito Shimmer / Pulse
function ProfileSkeleton({ size }: { size: number }) {
    const opacityAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, {
                    toValue: 0.8,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [opacityAnim]);

    return (
        <Animated.View
            style={[
                styles.skeletonCircle,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    opacity: opacityAnim,
                },
            ]}
        />
    );
}

export default function SelectProfile() {
    const { mode } = useGame();
    const { width, height } = useWindowDimensions();
    const [isLoading, setIsLoading] = useState(true);

    const isTablet = width >= 768;
    const avatarSize = isTablet ? 234 : 117;
    const wrapperBorderWidth = isTablet ? 20 : 10;

    // Simula / Aguarda a renderização completa dos assets
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300); // Ajuste conforme a real necessidade ou evento de load
        return () => clearTimeout(timer);
    }, []);

    return (
        <ThemedSafeAreaView style={{ flex: 1, paddingVertical: 0 }}>
            {/* Cabeçalho */}
            <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", height: "auto", paddingHorizontal: 16 }}>
                <TouchableOpacity
                    style={{ width: 40, height: 40, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" }}
                    onPress={() => router.replace("/")}
                >
                    <IconArrowLeft color={Colors[mode].icon} />
                </TouchableOpacity>
                <ThemeToggleButton />
            </View>
            
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 32,
                    paddingHorizontal: 16,
                }}
            >
                <ThemedText
                    style={{
                        fontFamily: 'Obviously-Demo-Bold',
                        fontSize: isTablet ? 38 : 28,
                        lineHeight: isTablet ? 59 : 36,
                        flexWrap: 'nowrap',
                        textAlign: 'center',
                    }}
                >
                    Choisissez un profile
                </ThemedText>

                <View style={{ 
                    flex: 1, 
                    flexDirection: "row", 
                    gap: isTablet ? 42 : 24, 
                    justifyContent: "center", 
                    alignItems: "center", 
                    minWidth: isTablet ? 508 : undefined,
                }}>
                    {isLoading ? (
                        <>
                            {/* Placeholders idênticos aos avatares */}
                            <ProfileSkeleton size={avatarSize + wrapperBorderWidth * 2} />
                            <ProfileSkeleton size={avatarSize + wrapperBorderWidth * 2} />
                        </>
                    ) : (
                        <>
                            {/* Avatar 1 */}
                            <TouchableOpacity
                                style={{ alignItems: "center", justifyContent: "center" }}
                                onPress={() => router.replace("/games/ayla/StartScreen")}
                            >
                                <View style={[styles.profileWrapper, { borderWidth: wrapperBorderWidth }]}>
                                    <SvgAsset
                                        name="PrincessProfileAvatarSvg"
                                        width={avatarSize}
                                        height={avatarSize}
                                        style={{ aspectRatio: 1 / 1 }}
                                    />
                                </View>
                            </TouchableOpacity>

                            {/* Avatar 2 */}
                            <TouchableOpacity
                                style={{ alignItems: "center", justifyContent: "center" }}
                                onPress={() => router.replace("/games/yachane/StartScreen")}
                            >
                                <View style={[styles.profileWrapper, { borderWidth: wrapperBorderWidth }]}>
                                    <SvgAsset
                                        name="DinoProfileAvatarSvg"
                                        width={avatarSize}
                                        height={avatarSize}
                                        style={{ aspectRatio: 1 / 1 }}
                                    />
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    profileWrapper: { 
        backgroundColor: "#FFDFB9", 
        borderColor: 'white', 
        borderRadius: 9999, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 3.84, 
        elevation: 5, 
        alignItems: "center", 
        justifyContent: "center" 
    },
    skeletonCircle: {
        backgroundColor: "#FFDFB9",
    },
});