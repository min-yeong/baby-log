import { ReactNode } from "react";
import { Pressable, Text, View, ViewStyle, TextStyle } from "react-native";
import { theme, SemanticColor } from "../../constants/theme";

type ChipColor = "primary" | SemanticColor | "neutral";
type ChipVariant = "solid" | "outline" | "dashed";

interface ChipProps {
  selected?: boolean;
  color?: ChipColor;
  variant?: ChipVariant;
  onPress?: () => void;
  children: ReactNode;
}

function getColor(color: ChipColor): string {
  if (color === "primary") return theme.color.pink[500];
  if (color === "neutral") return theme.color.ink[400];
  return theme.color.semantic[color];
}

function getTintBg(color: ChipColor): string {
  if (color === "primary") return theme.color.pink[100];
  if (color === "neutral") return theme.color.cream[100];
  const tints: Record<SemanticColor, string> = {
    hospital: "#E3F2FD",
    checkup: "#E8F5E9",
    symptom: "#FFF3E0",
    medicine: "#F3E5F5",
    danger: "#FFEBEE",
  };
  return tints[color];
}

export function Chip({
  selected = false,
  color = "primary",
  variant = "outline",
  onPress,
  children,
}: ChipProps) {
  const accent = getColor(color);
  const tintBg = getTintBg(color);

  const containerStyle: ViewStyle = selected
    ? {
        backgroundColor: accent,
        borderRadius: theme.radius.full,
        paddingVertical: theme.space[2],
        paddingHorizontal: theme.space[3] + 2,
      }
    : variant === "solid"
    ? {
        backgroundColor: tintBg,
        borderRadius: theme.radius.full,
        paddingVertical: theme.space[2],
        paddingHorizontal: theme.space[3] + 2,
      }
    : variant === "dashed"
    ? {
        backgroundColor: theme.color.ink[0],
        borderColor: theme.color.cream[300],
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderRadius: theme.radius.full,
        paddingVertical: theme.space[2] - 1.5,
        paddingHorizontal: theme.space[3] - 0.5,
      }
    : {
        backgroundColor: theme.color.ink[0],
        borderColor: theme.color.cream[200],
        borderWidth: 1.5,
        borderRadius: theme.radius.full,
        paddingVertical: theme.space[2] - 1.5,
        paddingHorizontal: theme.space[3] - 0.5,
      };

  const textStyle: TextStyle = {
    fontSize: 13,
    fontWeight: selected || variant === "solid" ? "700" : "600",
    color: selected ? theme.color.ink[0] : variant === "solid" ? accent : theme.color.ink[900],
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [containerStyle, pressed && { opacity: 0.85 }]}
      >
        <Text style={textStyle}>{children}</Text>
      </Pressable>
    );
  }
  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
}
