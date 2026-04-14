import { Text, View, TouchableOpacity } from "react-native";
import { useEffect, useState, useRef } from "react";
import { IconAlarm } from "@tabler/icons-react-native";
import { usePlayer } from "@/context/playerContext";
import { useWordPairGame } from "@/context/gameContext";

export function CountdownTimer() {
  const { timeLeft } = useWordPairGame();

  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <Text  style={{ color: "red", fontSize: 18 }} >
         <Text style={{ color: "red", fontSize: 18 }}>
          {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </Text>
      </Text>
    </View>
  );
}