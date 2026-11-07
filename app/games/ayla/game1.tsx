import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import { IconArrowRight } from "@tabler/icons-react-native";
import { ThemedSafeAreaView } from "@/components/ThemedSafeAreaView";
import { GameHeader } from "@/components/Header";
import { useAyla } from "@/context/AylaContext";
import { TimerConverter } from "@/utils/lessons";

const { width } = Dimensions.get("window");

const isTablet = width >= 768;
const PLAYER_WIDTH = isTablet ? 600 : width - 40;
const PLAYER_HEIGHT = (PLAYER_WIDTH * 9) / 16;

const YOUTUBE_VIDEO_ID = "fRageyEvFVA";

export default function LearnTheNumbers() {
  const { nextStage, setGameScore } = useAyla();

  const playerRef = useRef<YoutubeIframeRef>(null);
  const [playing, setPlaying] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  const gameTitle = useMemo(() => `chante avec titounis`, []);

  const finishGame = useCallback(
    (finalScore: number) => {
      if (hasFinished) return;

      setHasFinished(true);
      setGameScore((prev) => [
        ...prev,
        {
          score: `video assisté`,
          name: gameTitle,
          duration: TimerConverter(Math.max(1, Math.round(finalScore * 4))),
        },
      ]);
      nextStage();
    },
    [gameTitle, hasFinished, nextStage, setGameScore]
  );

  const handleContinue = () => {
    finishGame(6);
  };

  const commonHeader = (
    <GameHeader
      gameDescription={gameTitle}
      trophiesCount={12}
      coinsCount={45}
      settingsRoute="/games/ayla/settings/SettingsScreen"
      currentProfile={{
        name: "Ayla",
        avatarSvgName: "PrincessProfileAvatarSvg",
        startScreenRoute: "/games/ayla/StartScreen",
      }}
      otherProfile={{
        name: "Dino",
        avatarSvgName: "DinoProfileAvatarSvg",
        startScreenRoute: "/games/yachane/StartScreen",
      }}
    />
  );

  return (
    <ThemedSafeAreaView style={styles.container}>
      {commonHeader}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.board}>
          <Text style={styles.instructionText}>
            {!playing
              ? "Appuie sur le bouton pour lancer la vidéo !"
              : "Regarde la vidéo !"}
          </Text>

          <View style={styles.canvasContainer}>
            <YoutubePlayer
              ref={playerRef}
              height={PLAYER_HEIGHT}
              width={PLAYER_WIDTH}
              play={playing}
              videoId={YOUTUBE_VIDEO_ID}
              webViewProps={{
                onShouldStartLoadWithRequest: ({ isTopFrame, url }: { isTopFrame?: boolean; url: string }) =>
                  !isTopFrame ||
                  url === "about:blank" ||
                  url.startsWith(
                    "https://lonelycpp.github.io/react-native-youtube-iframe/"
                  ),
                onOpenWindow: () => {},
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continuer</Text>
            <IconArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    flexDirection: "column",
    paddingBottom: 30,
  },
  board: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  instructionText: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  canvasContainer: {
    position: "relative",
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "#000000",
  },
  continueButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    gap: 8,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});