import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { useAuth } from "@/context/auth";
import SignInWithGoogleButton from "./SignInWithGoogleButton";
import { Image, useColorScheme, View, StyleSheet, TouchableOpacity } from "react-native";
import { SignInWithAppleButton } from "./SignInWithAppleButton";
import { Redirect, router } from "expo-router";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react-native";
import { Avatars } from "@/assets/avatars";


export default function LoginForm() {
  const { signIn, isLoading } = useAuth();
  const theme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <Image
        source={
          theme === "dark"
            ? require("@/assets/images/bkg.jpg")
            : require("@/assets/images/bkg.jpg")
        }
        style={{
          flex: 1, width: "100%", height: "100%",
          borderBottomLeftRadius: 50, borderBottomRightRadius: 50,
        }}
      />
      <View style={{
        position: "absolute",
        top: 80,
        flexDirection: "column", alignItems: "center", justifyContent: "center", width: 100,
        height: 100,

      }}
      >
     {/* Avatar flottant */}
          <TouchableOpacity 
            style={styles.avatarWrapper}
            onPress={() => router.replace("/games/StartScreen")}
          >
            <View style={styles.imageShadow}>
              <Image
                source={Avatars.dino}
                style={styles.avatarImage}
              />
            </View>
            <ThemedText style={styles.description}>yachane</ThemedText>
          </TouchableOpacity>
      </View>

      <View style={styles.card}>

        <View style={styles.contentContainer}>
    
          <View style={styles.buttonContainer}>
            <SignInWithGoogleButton onPress={signIn} disabled={isLoading} />
            <SignInWithAppleButton />
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    //padding: 16,
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
    avatarWrapper: {
    alignItems: "center",
    marginTop: 40, // Ajuste selon l'encoche (SafeArea)
  },
  imageShadow: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "#FFF",
    // Ombres iOS
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    // Ombre Android
    elevation: 10,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
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
    marginBottom: 80,
    marginTop: 20,
  },
  description: {
    textAlign: "center",
    fontSize: 20,
    color: "#fff",
    lineHeight: 24,
  },
});
