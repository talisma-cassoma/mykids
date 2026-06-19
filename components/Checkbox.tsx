import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet
} from "react-native";
import { IconCheck } from "@tabler/icons-react-native";
import CheckBox from "@/components/organisms/check-box";
import { useGame } from "@/context/gameContext";
import { Colors } from "@/constants/Colors";

const size = 32

export function Checkbox({ selected }: { selected: boolean }) {
    const {mode}= useGame()
    return (
        false ? ( //debug
            <View style={{
                width: 30,
                height: 30,
                borderRadius: "100%",
                borderWidth: 2,
                borderColor: "#333",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: selected ? Colors[mode].button : Colors[mode].icon ,
            }}>
                {selected && (
                    <IconCheck color="#fff" size={18} />
                )}
            </View>
        ) :
            (
            <View style={[styles.checkbox, {backgroundColor: Colors[mode].box ,}]}>
                <CheckBox
                    checked={selected}
                    checkmarkColor="#fff"
                    stroke={5.5}
                    size={size}
                />
                </View>
            )
    );
}

const styles = StyleSheet.create({
  checkbox: {
    width: size,
    height: size,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
})