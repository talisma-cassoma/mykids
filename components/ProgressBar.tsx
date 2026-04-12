import { Image, useColorScheme,Text, View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { ThemedText } from "./ThemedText";

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: `${progress}%` }]} />
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 20,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  progress: {
    height: "100%",
    backgroundColor: "#a5d6a7",
  },
  progressText: {
    position: "absolute",
    alignSelf: "center",
    color: "#fff",
    fontWeight: "bold",
  },
});