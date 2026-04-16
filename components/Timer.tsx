import { Text, View, TouchableOpacity } from "react-native";

import { useGame } from "@/context/gameContext";
import { useEffect } from "react";

type TimerProps = {
  mode: "decreasing" | "increasing";
};

export function Timer() {

   const { time, isTimerActive } = useGame();
   

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  
  return (
    <>
    {isTimerActive && (
    <View style={{ alignItems: "center", gap: 8 }}>
      <Text style={{ color: "red", fontSize: 18 }}>
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </Text>
    </View>)
    }
    </>
  );
}