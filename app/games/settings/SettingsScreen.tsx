// SettingsScreen.tsx
import React, { useState } from "react";
// 1. Importez ScrollView depuis react-native
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SETTINGS_TABS } from "./registry";
import { router } from "expo-router";
import { IconArrowLeft } from "@tabler/icons-react-native";
import { Button } from "@/components/Button";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useGame } from "@/context/gameContext";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import {ThemedSafeAreaView} from "@/components/ThemedSafeAreaView"
export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState(SETTINGS_TABS[0].id);
  const { mode } = useGame();


  const currentTab = SETTINGS_TABS.find(tab => tab.id === activeTab);
  if (!currentTab) return null;

  const ActiveComponent = currentTab.Component;

  return (
     <ThemedSafeAreaView>
      {/* Retour */}
      <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-between", height: "auto" }}>
        <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" }}
          onPress={() => router.replace("/")}>
          <IconArrowLeft color={Colors[mode].icon} />
        </TouchableOpacity>
        <ThemeToggleButton />
      </View>
      {/* Tabs avec Défilement Horizontal */}
      <ThemedView style={{ height: 60, marginBottom: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {SETTINGS_TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: activeTab === tab.id ? 2 : 0,
                alignItems: "center",
                justifyContent: "center",
              },
              mode === "dark" ? ({ borderBottomColor: "#fff" })
                : ({ borderBottomColor: "#000" })
              ]}

            >
              <ThemedText style={{ fontWeight: activeTab === tab.id ? "bold" : "normal" }}>
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      {/* Conteúdo */}
      <ThemedView style={{ flex: 1 }}>
        <ActiveComponent />
      </ThemedView>

    </ThemedSafeAreaView>
  );
}
