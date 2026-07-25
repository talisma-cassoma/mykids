import React, { useEffect } from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Circle, Line, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedG = Animated.createAnimatedComponent(G);

export function EmojiHero({ style, ...restProps }: ViewProps) {
  const lookX = useSharedValue(0);
  const lookY = useSharedValue(0);
  const eyeHeightScale = useSharedValue(1);

  useEffect(() => {
    const ease = Easing.inOut(Easing.ease);

    // Recreates `@keyframes olhar` (8s loop)
    lookX.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 2800, easing: ease }), // 0% - 35%
        withTiming(6, { duration: 1200, easing: ease }), // 35% - 50%
        withTiming(0, { duration: 1200, easing: ease }), // 50% - 65%
        withTiming(0, { duration: 1200, easing: ease }), // 65% - 80%
        withTiming(0, { duration: 1600, easing: ease })  // 80% - 100%
      ),
      -1
    );

    lookY.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 2800, easing: ease }),
        withTiming(-5, { duration: 1200, easing: ease }),
        withTiming(8, { duration: 1200, easing: ease }),
        withTiming(8, { duration: 1200, easing: ease }),
        withTiming(0, { duration: 1600, easing: ease })
      ),
      -1
    );

    // Recreates `@keyframes piscar` (4s loop)
    eyeHeightScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3600, easing: ease }),   // 0% - 90%
        withTiming(0.08, { duration: 200, easing: ease }), // 90% - 95%
        withTiming(1, { duration: 200, easing: ease })    // 95% - 100%
      ),
      -1
    );
  }, [lookX, lookY, eyeHeightScale]);

  // Animated props for SVG <G> translation transform
  const animatedGProps = useAnimatedProps(() => ({
    transform: `translate(${lookX.value}, ${lookY.value})`,
  }));

  // Dynamic eye height calculation centered at Y=83
  const animatedEyeProps = useAnimatedProps(() => {
    const halfHeight = 8 * eyeHeightScale.value;
    return {
      y1: 83 - halfHeight,
      y2: 83 + halfHeight,
    };
  });

  return (
    <View style={[styles.container, style]} {...restProps}>
      <Svg viewBox="0 0 200 200" width="100%" height="100%">
        <Defs>
          <RadialGradient
            id="faceGrad"
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
            fx="50%"
            fy="50%"
          >
            <Stop offset="0%" stopColor="#00B37E" stopOpacity="1" />
            <Stop offset="100%" stopColor="#00B37E" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Glowing Radial Face Background */}
        <Circle cx="100" cy="100" r="90" fill="url(#faceGrad)" />

        {/* Animated Group for Eye Looking Motions */}
        <AnimatedG animatedProps={animatedGProps}>
          {/* Left Eye (Aligned horizontally at X=75) */}
          <AnimatedLine
            x1="75"
            x2="75"
            stroke="white"
            strokeWidth="20"
            strokeLinecap="round"
            animatedProps={animatedEyeProps}
          />

          {/* Right Eye (Aligned horizontally at X=125) */}
          <AnimatedLine
            x1="125"
            x2="125"
            stroke="white"
            strokeWidth="20"
            strokeLinecap="round"
            animatedProps={animatedEyeProps}
          />
        </AnimatedG>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
  },
});

