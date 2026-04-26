import { ReactNode } from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../constants/theme";

type Variant = "default" | "flat" | "accent";

interface CardProps {
  variant?: Variant;
  onPress?: () => void;
  padding?: number;
  style?: ViewStyle;
  children: ReactNode;
}

export function Card({
  variant = "default",
  onPress,
  padding = theme.space[4],
  style,
  children,
}: CardProps) {
  const baseStyle: ViewStyle = {
    borderRadius: theme.radius.lg,
    padding,
    overflow: "hidden",
  };

  const variantStyle: ViewStyle =
    variant === "default"
      ? { backgroundColor: theme.color.ink[0], ...theme.shadow.sm }
      : variant === "flat"
      ? { backgroundColor: theme.color.ink[0], borderWidth: 1, borderColor: theme.color.cream[200] }
      : { backgroundColor: "transparent" };

  const merged = [baseStyle, variantStyle, style];

  if (variant === "accent") {
    const inner = (
      <LinearGradient
        colors={[theme.color.pink[200], theme.color.pink[400]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[baseStyle, { borderRadius: theme.radius.lg }, style]}
      >
        {children}
      </LinearGradient>
    );
    return onPress ? (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
        {inner}
      </Pressable>
    ) : (
      inner
    );
  }

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [merged, pressed && { opacity: 0.9 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={merged}>{children}</View>;
}
