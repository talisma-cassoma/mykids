import React, { useEffect, useRef } from "react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react-native";
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  View,
  Text
} from "react-native";
import { usePlayer } from "@/context/playerContext";

export function PlayAndPauseToggleButton(){
  const { isPlay, togglePlay } = usePlayer();

  const translateX = useRef(new Animated.Value(isPlay ? 22 : 0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isPlay ? 26 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isPlay]);

  return (
    <TouchableWithoutFeedback onPress={togglePlay}>
      <View
        style={[
          styles.switch,
          { backgroundColor: isPlay ? "#a5d6a7" : "#ccc", marginBottom: 20 },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [{ translateX }],
            },
          ]}
        >
            {isPlay?(<IconPlayerPauseFilled color="#a5d6a7" size={18} ></IconPlayerPauseFilled>):(<IconPlayerPlayFilled color="#ccc" size={18}></IconPlayerPlayFilled>)}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default PlayAndPauseToggleButton;

const styles = StyleSheet.create({
  switch: {
    width: 60,
    height: 32,
    borderRadius: 34,
    padding: 4,
    justifyContent: "center",
  },
  knob: {
    width: 26,
    height: 26,
    borderRadius: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});