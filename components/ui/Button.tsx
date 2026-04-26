import { ReactNode } from "react";
import { Pressable, Text, ActivityIndicator, View, ViewStyle, TextStyle } from "react-native";
import { theme } from "../../constants/theme";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "onAccent";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress?: () => void;
  children: ReactNode;
}

const sizeMap: Record<Size, { padV: number; padH: number; font: number; radius: number }> = {
  sm: { padV: theme.space[2], padH: theme.space[3], font: 13, radius: theme.radius.md },
  md: { padV: theme.space[3] + 2, padH: theme.space[5] + 2, font: 15, radius: theme.radius.md },
  lg: { padV: theme.space[4] + 2, padH: theme.space[6] + 4, font: 16, radius: theme.radius.lg - 2 },
};

function getColors(variant: Variant, disabled: boolean) {
  if (disabled) return { bg: theme.color.pink[200], fg: theme.color.ink[400], border: "transparent" };
  switch (variant) {
    case "primary":
      return { bg: theme.color.pink[500], fg: theme.color.ink[0], border: "transparent" };
    case "secondary":
      return { bg: theme.color.ink[0], fg: theme.color.pink[500], border: theme.color.pink[500] };
    case "ghost":
      return { bg: "transparent", fg: theme.color.ink[900], border: "transparent" };
    case "dark":
      return { bg: theme.color.ink[900], fg: theme.color.ink[0], border: "transparent" };
    case "onAccent":
      return { bg: theme.color.ink[0], fg: theme.color.pink[500], border: "transparent" };
  }
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
}: ButtonProps) {
  const s = sizeMap[size];
  const c = getColors(variant, disabled);
  const isInteractive = !disabled && !loading;

  const containerStyle: ViewStyle = {
    backgroundColor: c.bg,
    borderColor: c.border,
    borderWidth: variant === "secondary" ? 1.5 : 0,
    borderRadius: s.radius,
    paddingVertical: variant === "secondary" ? s.padV - 1.5 : s.padV,
    paddingHorizontal: variant === "secondary" ? s.padH - 1.5 : s.padH,
    alignSelf: fullWidth ? "stretch" : "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  };

  const textStyle: TextStyle = {
    color: c.fg,
    fontSize: s.font,
    fontWeight: "700",
  };

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      style={({ pressed }) => [containerStyle, pressed && isInteractive && { opacity: 0.85 }]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} size="small" />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text style={textStyle}>{children}</Text>
          {rightIcon && <View>{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}
