import { Text, View, TouchableOpacity } from "react-native";

interface TimerProps {
  isActive: boolean;
  mode: "decreasing" | "increasing";
  time: number | undefined;
}

export function Timer({ mode, isActive, time }: TimerProps) {



  if(time === undefined) return 
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  
  return (
    <>
    {isActive && (
    <View style={{ alignItems: "center", gap: 8 }}>
      <Text style={{ color: "red", fontSize: 20, fontWeight: "bold" }}>
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </Text>
    </View>)
    }
    </>
  );
}