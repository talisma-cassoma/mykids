import { useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface BeforeAfterSliderProps {
  beforeImage: ImageSourcePropType;
  afterImage: ImageSourcePropType;
}

export function Slider({
  beforeImage,
  afterImage,
}: BeforeAfterSliderProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const resolvedImage = Image.resolveAssetSource(beforeImage);
  const [imageAspectRatio, setImageAspectRatio] = useState(
    resolvedImage?.width && resolvedImage?.height
      ? resolvedImage.width / resolvedImage.height
      : 16 / 9
  );
  const containerHeight = containerWidth / imageAspectRatio;

  const position = useSharedValue(0);
  const context = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
      position.value = width / 2; // Initialize slider at the center
    }
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = position.value;
    })
    .onUpdate((event) => {
      position.value = Math.max(
        0,
        Math.min(containerWidth, context.value + event.translationX)
      );
    });

  const afterStyle = useAnimatedStyle(() => {
    return {
      width: position.value,
    };
  });

  const handleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: position.value - 40 }],
    };
  });

  return (
    <View
      style={[styles.container, { height: containerHeight }]} 
      onLayout={onLayout}
    >
      {containerWidth > 0 && (
        <>
          {/* Before Image (Background Layer) */}
          <View style={[StyleSheet.absoluteFill, { width: containerWidth, height: containerHeight }]}>
            <Image
              source={beforeImage}
              style={styles.image}
              resizeMode="cover"
              onLoad={({ nativeEvent }) => {
                const { width, height } = nativeEvent.source;
                if (width > 0 && height > 0) {
                  setImageAspectRatio(width / height);
                }
              }}
            />
          </View>

          {/* After Image (Clipped Foreground Layer) */}
          <Animated.View style={[styles.afterContainer, afterStyle, { height: containerHeight }]}>
            <View style={{ width: containerWidth, height: containerHeight, position: 'absolute', left: 0 }}>
              <Image source={afterImage} style={styles.image} resizeMode="cover" />
            </View>
          </Animated.View>

          {/* Draggable Handle */}
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.divider, handleStyle]}>
              <Svg width="40" height="40" viewBox="0 0 80 80" fill="none">
                <Path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M80 40C80 62.0914 62.0914 80 40 80C17.9086 80 0 62.0914 0 40C0 17.9086 17.9086 0 40 0C62.0914 0 80 17.9086 80 40ZM24.8906 53.5316C24.8908 53.7944 24.813 54.0514 24.6671 54.27C24.5211 54.4886 24.3136 54.659 24.0708 54.7596C23.828 54.8602 23.5608 54.8865 23.303 54.8351C23.0453 54.7838 22.8085 54.6572 22.6228 54.4712L9.34153 41.19C9.21805 41.0666 9.12009 40.9201 9.05325 40.7589C8.98641 40.5977 8.95201 40.4248 8.95201 40.2503C8.95201 40.0758 8.98641 39.9029 9.05325 39.7417C9.12009 39.5805 9.21805 39.434 9.34153 39.3107L22.6228 26.0294C22.8085 25.8435 23.0453 25.7168 23.303 25.6655C23.5608 25.6141 23.828 25.6404 24.0708 25.741C24.3136 25.8417 24.5211 26.012 24.6671 26.2306C24.813 26.4492 24.8908 26.7062 24.8906 26.9691V53.5316ZM56.3771 54.4712L69.6584 41.19C69.7819 41.0666 69.8798 40.9201 69.9467 40.7589C70.0135 40.5977 70.0479 40.4248 70.0479 40.2503C70.0479 40.0758 70.0135 39.9029 69.9467 39.7417C69.8798 39.5805 69.7819 39.434 69.6584 39.3107L56.3771 26.0294C56.1914 25.8435 55.9547 25.7168 55.6969 25.6655C55.4391 25.6141 55.1719 25.6404 54.9291 25.741C54.6863 25.8417 54.4788 26.012 54.3329 26.2306C54.187 26.4492 54.1092 26.7062 54.1094 26.9691V53.5316C54.1092 53.7944 54.187 54.0514 54.3329 54.27C54.4788 54.4886 54.6863 54.659 54.9291 54.7596C55.1719 54.8602 55.4391 54.8865 55.6969 54.8351C55.9547 54.7838 56.1914 54.6572 56.3771 54.4712Z"
                  fill="white"
                />
              </Svg>
            </Animated.View>
          </GestureDetector>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    //borderRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  afterContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
    borderRightWidth: 3,
    borderRightColor: '#FFFFFF',
  },
  divider: {
    position: 'absolute',
    top: '50%',
    marginTop: -40,
    width: 80,
    height: 80,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});