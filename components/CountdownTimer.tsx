import { Text, View, TouchableOpacity } from "react-native";
import { useEffect, useState, useRef } from "react";
import { IconAlarm } from "@tabler/icons-react-native";
import { usePlayer } from "@/context/playerContext";

export function CountdownTimer({ timeInSeconds }: { timeInSeconds: number }) {
  const { isPlay, togglePlay } = usePlayer();
  const [time, setTime] = useState(timeInSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlay) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isPlay]);

  const handleReset = () => {
    clearInterval(intervalRef.current!);
    setTime(timeInSeconds);
  };

  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <IconAlarm color="red" size={24} />
        <Text style={{ color: "red", fontSize: 18 }}>
          {Math.floor(time / 60)}:
          {(time % 60).toString().padStart(2, "0")}
        </Text>
      </View>
    </View>
  );
}