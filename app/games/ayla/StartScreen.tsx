import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ScrollView } from "react-native";
import { useAyla } from "@/context/AylaContext";
import { Color, router } from "expo-router";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { GameHeader } from "@/components/Header";
import LinearGradient from 'react-native-linear-gradient';
import { useGame } from "@/context/YachaneContext";
import { Pillar } from "@/components/Pillar"
import { ThemedText } from '@/components/ThemedText';
import { IconSearch, IconPencilMinus, IconEdit } from "@tabler/icons-react-native"
import { Colors } from "@/constants/Colors";

export default function StartScreen() {
  const { selectedGames, mode } = useAyla();
  const [activePillar, setActivePillar] = useState<number | null>(null);

  const gradientColors = mode === "dark"
    ? [Colors.dark.background, "#333", '#34C759']
    : [Colors.light.background, Colors.light.background, '#34C759'];

  const shadowColor = mode === "dark" ? Colors.dark.background : Colors.light.background;

  return (
    <ThemedSafeAreaView style={styles.safeArea} >
      <View style={{width:"100%", paddingHorizontal:28,}}>
      <GameHeader
        trophiesCount={12}
        coinsCount={45}
        settingsRoute="/games/ayla/settings/SettingsScreen"
        currentProfile={{
          name: "Ayla",
          avatarSvgName: "PrincessProfileAvatarSvg",
          startScreenRoute: "/games/ayla/StartScreen",
        }}
        otherProfile={{
          name: "Dino",
          avatarSvgName: "DinoProfileAvatarSvg",
          startScreenRoute: "/games/yachane/StartScreen",
        }}
        validate={{ isActive: false }}
      />
      </View>
      <TouchableOpacity
        onPress={() => {
          const firstGame = selectedGames[0];
          router.replace(
            firstGame?.href ?? "/games/ayla/settings/SettingsScreen"
          );
        }}
        style={styles.button}
      >
        <Text style={{ color: "#fff" }}>commencer</Text>
      </TouchableOpacity>
      <View style={styles.wrapper}>
        <LinearGradient
          key={mode}
          colors={gradientColors}
          locations={[0, 0.5, 1]}
          style={styles.gradientContainer}
        >
          {/* Usamos ScrollView para permitir rolar a trilha caso ela cresça */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.innerShadowOverlay, { shadowColor }]}>

              {/* Trilha Isométrica em zigue-zague usando offsets horizontais */}
              <View style={{ transform: [{ translateX: 40 }] }}>
                <Pillar
                  message=""
                  pillar="PillarCubeSmSvg"
                  status={activePillar === 0 ? "clicked" : "idle"}
                  onPress={() => setActivePillar(0)}
                >
                  <Pillar.Collectible style={{ flexDirection: "row" }}>
                    <ThemedText darkColor='#333'>123</ThemedText>
                  </Pillar.Collectible>
                </Pillar>
              </View>

              <View style={{ transform: [{ translateX: -30 }] }}>
                <Pillar
                  message=""
                  pillar="PillarCylinderSmSvg"
                  status={activePillar === 1 ? "clicked" : "idle"}
                  onPress={() => setActivePillar(1)}
                >
                  <Pillar.Collectible style={{ flexDirection: "row" }}>
                    <ThemedText darkColor='#333'>123</ThemedText>
                    <IconSearch size={20} color="#333" />
                  </Pillar.Collectible>
                </Pillar>
              </View>

              <View style={{ transform: [{ translateX: 20 }] }}>
                <Pillar
                  message=""
                  pillar="PillarCylinderSmSvg"
                  status={activePillar === 2 ? "clicked" : "idle"}
                  onPress={() => setActivePillar(2)}
                >
                  <Pillar.Collectible style={{ flexDirection: "row" }}>
                    <ThemedText darkColor='#333'>123</ThemedText>
                    <IconPencilMinus size={20} color="#333" />
                  </Pillar.Collectible>
                </Pillar>
              </View>

              <View style={{ transform: [{ translateX: -40 }] }}>
                <Pillar
                  message=""
                  pillar="PillarCylinderSmSvg"
                  status={activePillar === 3 ? "clicked" : "idle"}
                  onPress={() => setActivePillar(3)}
                >
                  <Pillar.Collectible style={{ flexDirection: "row" }}>
                    <ThemedText darkColor='#333'>123</ThemedText>
                    <IconEdit size={20} color="#333" />
                  </Pillar.Collectible>
                </Pillar>
              </View>

              <View style={{ transform: [{ translateX: 10 }] }}>
                <Pillar
                  message=""
                  pillar="PillarCubeLgSvg"
                  collectibles='TestSvg'
                  status={activePillar === 4 ? "clicked" : "idle"}
                  onPress={() => setActivePillar(4)}
                />
              </View>

              <View style={{ transform: [{ translateX: -20 }] }}>
                <Pillar
                  message=""
                  pillar="PillarCylinderLgSvg"
                  collectibles='TrophySvg'
                  status={activePillar === 5 ? "clicked" : "idle"}
                  onPress={() => setActivePillar(5)}
                />
              </View>

            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 0,
    paddingTop: 80,
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  wrapper: {
    flex: 1,
    width: '100%',
    minHeight: 400,
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingVertical: 30,
    alignItems: "center",
  },
  innerShadowOverlay: {
    width: '100%',
    alignItems: 'center',
    flexDirection: "column-reverse",
    gap: 10,
    shadowOffset: { width: 0, height: 416 },
    shadowOpacity: 1,
    shadowRadius: 497.25 / 2,
    elevation: 25,
  },
  button: {
    backgroundColor: "#4caf50",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    borderRadius: 8,
  },
});