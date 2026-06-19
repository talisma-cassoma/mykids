import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react-native";
import { useGame } from "@/context/gameContext";
import { AnimatedThemeToggle } from "@/components/micro-interactions/animated-theme-toggle"
import { Colors } from "@/constants/Colors";

export function ThemeToggleButton() {
  const { mode, setMode } = useGame();

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    true ? (
      <View style={{padding: "auto", alignSelf: "center"}}>

        <AnimatedThemeToggle
          isDark={mode == "dark"}
          onToggle={toggleTheme}
          size={30}
          color={Colors[mode].icon}
          strokeWidth={2}
          style={{padding: "auto", alignSelf: "center"}}
        />
      </View>
    ) :
      (
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.7}
          style={styles.buttonContainer}
        >
          <View style={[
            styles.iconWrapper,
            { backgroundColor: mode === "dark" ? "#1e1e1e" : "#f0f0f0" } // Fundo sutil para o botão, ajuste se preferir transparente
          ]}>
            {mode === "dark" ? (
              <IconMoonFilled color="#fff" size={24} />
            ) : (
              <IconSunFilled color="#000" size={24} />
            )}
          </View>
        </TouchableOpacity>
      )
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 24, // Botão circular
    justifyContent: "center",
    alignItems: "center",
  },
});