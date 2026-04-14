import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect } from "react";
import { AuthProvider } from "@/context/auth";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as ScreenOrientation from 'expo-screen-orientation';
import { WordPairGameProvider } from "@/context/gameContext";
import { PlayerProvider } from "@/context/playerContext";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const unlockScreenOerientation = async () => {
      await ScreenOrientation.unlockAsync()
    }
    unlockScreenOerientation()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <AuthProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <PlayerProvider>
              <WordPairGameProvider>
                <StatusBar style="auto" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                />
              </WordPairGameProvider>
            </PlayerProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


