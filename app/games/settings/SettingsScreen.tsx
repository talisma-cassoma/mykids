// SettingsScreen.tsx

import React, { useState } from "react";
import { View, Text, TouchableOpacity} from "react-native";
import { SETTINGS_TABS } from "./registry";
import { router } from "expo-router"
import { IconArrowLeft } from "@tabler/icons-react-native";
import { Button } from "@/components/Button";

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState(SETTINGS_TABS[0].id);

  const currentTab = SETTINGS_TABS.find(
    tab => tab.id === activeTab
  );

  if (!currentTab) return null;

  const ActiveComponent = currentTab.Component;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 16, marginTop: 40 }}>
         <View style={{ height: 40, width: "100%" }} >
                  <Button style={{ width: 40, height: 40, marginBottom: 40, backgroundColor: "transparent", justifyContent: "flex-start" }} 
                    onPress={() => router.replace("/")}>
                    <Button.Icon icon={IconArrowLeft} color="#333" />
                  </Button>
                </View>
      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        {SETTINGS_TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              padding: 16,
                borderBottomWidth: activeTab === tab.id ? 2 : 0,
                width: 150,
            }}
          >
            <Text>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo */}
      <View style={{ flex: 1 }}>
        <ActiveComponent />
      </View>
    </View>
  );
}