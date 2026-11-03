import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useGameControls } from '@/context/GameControlsContext';
import { Colors } from '@/constants/Colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
   const { mode } = useGameControls();
   const backgroundColor =
    mode === "dark"
      ? darkColor ?? Colors.dark.background
      : lightColor ?? Colors.light.background;

return (
    <View
      style={[{ backgroundColor }, style]}
      {...otherProps}
    />
  );
}
