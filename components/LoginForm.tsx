import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { ThemedText } from "./ThemedText";
import { useAuth } from "@/context/auth";
import SignInWithGoogleButton from "./SignInWithGoogleButton";
import { Image, useColorScheme, View, StyleSheet, TouchableOpacity } from "react-native";
import { SignInWithAppleButton } from "./SignInWithAppleButton";
import {  router } from "expo-router";
import { Avatars } from "@/assets/avatars";
import { Settings } from "@/components/Settings";
import { ThemedView } from "@/components/ThemedView"

export default function LoginForm() {
  const { signIn, isLoading } = useAuth();
  const theme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <View style={{
        backgroundColor: "#fece00",
        width: "100%",
        height: 250,
        borderBottomLeftRadius: 50, borderBottomRightRadius: 50,
        flex: 1,
        alignItems: "center",
        //boxSizing: "border-box",
        overflow: "hidden",
        flexDirection: "column",
        justifyContent: "space-around",
        paddingTop:80
      }
      }>
        <View style={{
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: 250,
          //position: "absolute",
          
          //boxSizing: "content-box",
          //overflow: "hidden",
        }}
        >
          <View style={{ height: 100, flexDirection: "row", justifyContent: "flex-end", width: "100%", paddingHorizontal: 20 }}>
          <Settings/>
          </View>
          <View style={{ height: 150, flexDirection: "row", justifyContent: "space-around", alignItems: "center",width: 200 }}>
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
              <ThemedText style={styles.description}>Yachane</ThemedText>
            </TouchableOpacity>
            {/* Avatar flottant */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              //onPress={() => router.replace("/games/StartScreen")}
            >
              <View style={styles.imageShadow}>
                <Image
                  source={Avatars.ayla}
                  style={styles.avatarImage}
                />
              </View>
              <ThemedText style={styles.description}>Ayla</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        <Image
          source={
            theme === "dark"
              ? require("@/assets/images/bkg.jpg")
              : require("@/assets/images/bkg.jpg")
          }
          style={{
            flex: 1,
            resizeMode: "contain",
          }}
        />

      </View>

      <View style={styles.contentContainer}>
        <View style={styles.buttonContainer}>
          <SignInWithGoogleButton onPress={signIn} disabled={isLoading} />
          <SignInWithAppleButton />
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
    padding: 0,
    paddingTop:0
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
    height: "100%",
  },
  imageShadow: {
    width: 80,
    height: 80,
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
    maxWidth: 360,
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
