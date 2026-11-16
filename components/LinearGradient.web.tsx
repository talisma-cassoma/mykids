import { View, type ViewProps } from "react-native";

type Props = ViewProps & {
  colors: string[];
  locations?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  useAngle?: boolean;
  angleCenter?: { x: number; y: number };
  angle?: number;
};

export default function LinearGradient({ colors, style, ...props }: Props) {
  return (
    <View
      {...props}
      style={[
        style,
        colors.length > 0 && { backgroundColor: colors[0] },
      ]}
    />
  );
}
