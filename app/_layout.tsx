import React, { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/context/auth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as ScreenOrientation from "expo-screen-orientation";
import { YachaneProvider } from "@/context/YachaneContext";
import { Platform, Image } from "react-native";
import { IconCopy, IconCloudUpload } from "@tabler/icons-react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    "Obviously-Demo": require("../assets/fonts/obviously-font/ObviouslyDemo-Regular.otf"),
    "Obviously-Demo-Bold": require("../assets/fonts/obviously-font/ObviouslyDemo-Bold.otf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const unlockScreenOrientation = async () => {
      await ScreenOrientation.unlockAsync();
    };
    unlockScreenOrientation();
  }, []);

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return null;
  }

  if (Platform.OS === "web") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          width: "100%",
          backgroundColor: "#FFFFFF",
          padding: "20px 16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: "420px",
          }}
        >
          {/* Header Image */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <Image
              source={require("@/assets/images/ourcharctersHello.png")}
              style={{
                width: "100%",
                maxWidth: 240,
                height: "auto",
                aspectRatio: 1,
              }}
              resizeMode="contain"
            />
          </div>

          {/* Upload Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              border: "1px dashed #F0F0F0",
              alignItems: "center",
              justifyContent: "center",
              padding: "36px 20px",
              marginBottom: "32px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                marginBottom: "16px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconCloudUpload size={44} color="#000000" strokeWidth={1.8} />
            </div>

            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#000000",
                letterSpacing: "0.5px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              DRAG AND DROP FILES TO UPLOAD
            </span>

            <button
              style={{
                backgroundColor: "#000000",
                padding: "10px 22px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => {}}
            >
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: 800,
                  letterSpacing: "0.6px",
                }}
              >
                CHOOSE FILES
              </span>
            </button>
          </div>

          {/* Input Box */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#EAEAEA",
              borderRadius: "14px",
              padding: "10px 16px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <textarea
              style={{
                flex: 1,
                fontSize: "14px",
                color: "#333333",
                padding: 0,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                resize: "none",
              }}
              placeholder="écrit ou colle quelque chose"
            />
            <button
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                paddingLeft: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => {}}
            >
              <IconCopy size={20} color="#333333" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <YachaneProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <SafeAreaProvider style={{ flex: 1 }}>
            <AuthProvider>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <StatusBar style="auto" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                />
              </ThemeProvider>
            </AuthProvider>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </YachaneProvider>
  );
}