import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  TextProps,
  ActivityIndicator,
} from "react-native"
import { IconProps as TablerIconProps,  } from "@tabler/icons-react-native"


type ButtonProps = TouchableOpacityProps & {
  isLoading?: boolean
}

export function Button({ children, style, isLoading = false, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      style={{ marginTop: 20,
                backgroundColor: "#a5d6a7",
                padding: 10,
                justifyContent: "center",
                alignItems: "center",
                width: 100,
                borderRadius: 8}}
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

function Title({ children }: TextProps) {
  return <Text style={{ color: "#fff" }}>{children}</Text>
}

type IconProps = {
  icon: React.ComponentType<TablerIconProps>
}

function Icon({ icon: Icon }: IconProps) {
  return <Icon size={24} color="#fff" />
}

Button.Title = Title
Button.Icon = Icon


