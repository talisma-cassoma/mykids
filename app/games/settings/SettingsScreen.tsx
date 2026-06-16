// SettingsScreen.tsx
import React, { useState } from "react";
// 1. Importez ScrollView depuis react-native
import { View, Text, TouchableOpacity, ScrollView } from "react-native"; 
import { SETTINGS_TABS } from "./registry";
import { router } from "expo-router";
import { IconArrowLeft } from "@tabler/icons-react-native";
import { Button } from "@/components/Button";

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState(SETTINGS_TABS[0].id);

  const currentTab = SETTINGS_TABS.find(tab => tab.id === activeTab);
  if (!currentTab) return null;

  const ActiveComponent = currentTab.Component;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16, marginTop: 40 }}>
      
      {/* Retour */}
      <View style={{ height: 40, width: "100%" }}>
        <Button 
          style={{ width: 40, height: 40, marginBottom: 40, backgroundColor: "transparent", justifyContent: "flex-start" }} 
          onPress={() => router.replace("/")}
        >
          <Button.Icon icon={IconArrowLeft} color="#333" />
        </Button>
      </View>

      {/* Tabs avec Défilement Horizontal */}
      <View style={{ height: 60, marginBottom: 16 }}> {/* Conteneur avec hauteur fixe */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {SETTINGS_TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: activeTab === tab.id ? 2 : 0,
                borderBottomColor: "#000",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontWeight: activeTab === tab.id ? "bold" : "normal" }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conteúdo */}
      <View style={{ flex: 1 }}>
        <ActiveComponent />
      </View>

    </View>
  );
}
