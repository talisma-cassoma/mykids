import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react-native";
import { useGame } from "@/context/gameContext";

export function ThemeToggleButton() {
  const { mode, setMode } = useGame();

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
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
          <IconMoonFilled color="#fff" size={18} />
        ) : (
          <IconSunFilled color="#000" size={18} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
     width: 40,
    height: 40,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 24, // Botão circular
    justifyContent: "center",
    alignItems: "center",
  },
});