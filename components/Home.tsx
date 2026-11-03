import React, { useState, useEffect, useRef } from 'react';
import { View, useWindowDimensions, StyleSheet, ScrollView, LayoutChangeEvent, Animated } from 'react-native';
import { router } from 'expo-router';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { ThemeToggleButton } from './ThemeToggleButton';
import { IconPlayerPlay, IconChartLine, IconSettings } from '@tabler/icons-react-native';
import { SvgAsset } from '@/components/SvgAssets';

export default function Home() {
    const { width, height } = useWindowDimensions();
    const [rightContainerWidth, setRightContainerWidth] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    
    // Animação da barra de progresso (0 a 100%)
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Detect if device is in portrait (vertical) mode
    const isPortrait = height > width;

    useEffect(() => {
        // Simula o carregamento e preenchimento da barra até 100%
        // Você pode integrar isso com carregamento real de fontes/imagens se necessário
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 1200, // Duração do carregamento em ms
            useNativeDriver: false, // width não suporta native driver
        }).start(() => {
            setIsLoading(false);
        });
    }, [progressAnim]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    if (isLoading) {
        return (
            <ThemedSafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                <ThemedView style={{ width: '80%', maxWidth: 300, alignItems: 'center', gap: 16 }}>
                    <ThemedText style={{ fontFamily: 'Obviously-Demo-Bold', fontSize: 24, textAlign: 'center' }}>
                        Chargement...
                    </ThemedText>
                    {/* Barra de Carregamento */}
                    <View style={styles.progressBarContainer}>
                        <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
                    </View>
                </ThemedView>
            </ThemedSafeAreaView>
        );
    }

    return (
        <ThemedSafeAreaView style={{ flex: 1, paddingVertical: 0 }}>
            {/* Botão de alternar tema no topo direito */}
            <View
                style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    paddingHorizontal: 16,
                    paddingTop: 8,
                }}
            >
                <ThemeToggleButton />
            </View>

            {/* Conteúdo principal: muda para coluna em modo vertical e linha em horizontal */}
            <View
                style={{
                    flex: 1,
                    flexDirection: isPortrait ? 'column' : 'row',
                    justifyContent: 'space-between',
                }}
            >
                {/* Coluna da Esquerda / Conteúdo de Texto e Ações */}
                <ThemedView
                    style={{
                        flex: isPortrait ? 1 : 1,
                        width: '100%',
                        maxWidth: isPortrait ? '100%' : '45%',
                    }}
                    lightColor="#F9F9F9"
                >
                    <ScrollView
                        style={{ flex: 1, width: '100%' }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 24,
                            paddingVertical: 24,
                            gap: isPortrait ? 30 : 40,
                        }}
                    >
                        {/* Título Principal */}
                        <ThemedText
                            style={{
                                fontFamily: 'Obviously-Demo-Bold',
                                fontSize: isPortrait ? 32 : 38,
                                lineHeight: isPortrait ? 44 : 59,
                                flexWrap: 'wrap',
                                textAlign: 'center',
                            }}
                        >
                            MyKIDS:{'\n'}lets learn today
                        </ThemedText>

                        {/* Subtítulo / Descrição */}
                        <ThemedText
                            style={{
                                fontFamily: 'Obviously-Demo',
                                fontSize: 16,
                                lineHeight: 20,
                                textAlign: 'center',
                            }}
                        >
                            Sélectionne une option la dessous{'\n'}
                            et explore!{'\n'}
                            l’aventure vous attends
                        </ThemedText>

                        {/* Botões de Ação */}
                        <View
                            style={{
                                width: '100%',
                                maxWidth: 180,
                                gap: 12,
                            }}
                        >
                            <Button
                                onPress={() => router.replace('/select-profile')}
                                style={styles.Button}
                            >
                                <Button.Icon icon={IconPlayerPlay} color="#000000" />
                                <Button.Title
                                    style={{ fontFamily: 'Obviously-Demo', fontSize: 16 }}
                                    color="#000000"
                                >
                                    play
                                </Button.Title>
                            </Button>

                            <Button
                                onPress={() => console.log("settings pressed")}
                                style={styles.Button}
                            >
                                <Button.Icon icon={IconSettings} color="#0D0D0D" />
                                <Button.Title
                                    style={{ fontFamily: 'Obviously-Demo', fontSize: 16 }}
                                    color="#000000"
                                >
                                    settings
                                </Button.Title>
                            </Button>

                            <Button
                                onPress={() => console.log("Statistics pressed")}
                                style={styles.Button}
                            >
                                <Button.Icon icon={IconChartLine} color="#0D0D0D" />
                                <Button.Title
                                    style={{ fontFamily: 'Obviously-Demo', fontSize: 16 }}
                                    color="#000000"
                                >
                                    statistics
                                </Button.Title>
                            </Button>
                        </View>
                    </ScrollView>
                </ThemedView>

                {/* Coluna da Direita / Ilustração SVG */}
                <View
                    style={{
                        flex: isPortrait ? 0.6 : 1,
                        width: '100%',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        maxWidth: isPortrait ? '100%' : '55%',
                        alignItems: 'center',
                        paddingBottom: isPortrait ? 20 : 0,
                    }}
                    onLayout={(event: LayoutChangeEvent) => {
                        setRightContainerWidth(event.nativeEvent.layout.width);
                    }}
                >
                    {rightContainerWidth > 0 && (
                        <SvgAsset
                            name="DinoPrincessSvg"
                            width={isPortrait ? rightContainerWidth * 0.7 : rightContainerWidth * 0.9}
                            height={(isPortrait ? rightContainerWidth * 0.7 : rightContainerWidth * 0.9) * 0.7}
                        />
                    )}
                </View>
            </View>
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    Button: {
        backgroundColor: '#FFFFFF',
        gap: 10,
        borderRadius: 18,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    progressBarContainer: {
        width: '100%',
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: 'green', // Ou a cor de destaque desejada
        borderRadius: 6,
    },
});