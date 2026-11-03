import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  TextProps,
  ActivityIndicator,
} from "react-native"
import { IconProps as TablerIconProps,  } from "@tabler/icons-react-native"
import {Colors} from "@/constants/Colors"
import { useGameControls } from "@/context/GameControlsContext"


type ButtonProps = TouchableOpacityProps & {
  isLoading?: boolean
}

export function Button({ children, style, isLoading = false, ...rest }: ButtonProps) {
  const {mode}= useGameControls()
  return (
    <TouchableOpacity
      style={[{ marginTop: 20,
                backgroundColor: Colors[mode].button,
                padding: 10,
                justifyContent: "center",
                alignItems: "center",
                minWidth: 100,
                borderRadius: 8}, style]}
      activeOpacity={0.8}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

type TitleProps = TextProps & {
  children: React.ReactNode
  color?: string
}
function Title({ children, color, style }: TitleProps) {
  return <Text style={[{ color: color || "#fff" }, style]}>{children}</Text>
}

type IconProps = {
  icon: React.ComponentType<TablerIconProps>
  color?: string
}

function Icon({ icon: Icon, color = "#fff" }: IconProps) {
  return <Icon size={18} color={color} />
}

Button.Title = Title
Button.Icon = Icon

