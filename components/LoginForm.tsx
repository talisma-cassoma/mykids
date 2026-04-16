import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { useAuth } from "@/context/auth";
import SignInWithGoogleButton from "./SignInWithGoogleButton";
import { Image, useColorScheme, View, StyleSheet, TouchableOpacity } from "react-native";
import { SignInWithAppleButton } from "./SignInWithAppleButton";
import { Redirect, router } from "expo-router";

export default function LoginForm() {
  const { signIn, isLoading } = useAuth();
  const theme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={
            theme === "dark"
              ? require("@/assets/images/icon.png")
              : require("@/assets/images/icon.png")
          }
          style={styles.logo}
        />

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <ThemedText type="subtitle" style={styles.title}>
              Bien Venue au My KIDS App
            </ThemedText>
            <ThemedText style={styles.description}>
              Experience seamless authentication{"\n"}
              powered by Expo.{"\n"}
            </ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            <SignInWithGoogleButton onPress={signIn} disabled={isLoading} />
            <SignInWithAppleButton />
          </View>
          <TouchableOpacity style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          onPress={()=>router.replace("/GameScreen")}
          >
            <Image source={require("@/assets/images/yachane_avatar.png")}
                style={{ width: 100, height: 100, borderRadius: 10, margin: 20 }}
              />
            <ThemedText style={styles.description}>
              Yachane
            </ThemedText>

          </TouchableOpacity>

        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  titleContainer: {
    alignItems: "center",
    gap: 12,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 32,
    borderRadius: 10,
  },
  contentContainer: {
    width: "100%",
    gap: 32,
  },
  title: {
    textAlign: "center",
    fontSize: 30,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  description: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
});
