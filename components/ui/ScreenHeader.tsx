import { ReactNode } from "react";
import { View, Text, Pressable, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../constants/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  variant?: "default" | "large";
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  variant = "default",
}: ScreenHeaderProps) {
  const router = useRouter();

  const containerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: variant === "large" ? "flex-end" : "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.space[5],
    paddingTop: theme.space[4],
    paddingBottom: variant === "large" ? theme.space[5] : theme.space[3],
  };

  return (
    <View style={containerStyle}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space[2], flex: 1 }}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              { padding: theme.space[1], marginLeft: -theme.space[1] },
              pressed && { opacity: 0.5 },
            ]}
            hitSlop={8}
          >
            <Text style={{ fontSize: 22, color: theme.color.ink[700], fontWeight: "600" }}>‹</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          {variant === "large" && subtitle && (
            <Text style={{ fontSize: theme.font.caption.size, color: theme.color.ink[400], marginBottom: 2 }}>
              {subtitle}
            </Text>
          )}
          <Text
            style={{
              fontSize: variant === "large" ? theme.font.heading.size : theme.font.title.size,
              fontWeight: variant === "large" ? "700" : "800",
              color: theme.color.ink[900],
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {variant === "default" && subtitle && (
            <Text style={{ fontSize: theme.font.caption.size, color: theme.color.ink[400], marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightAction && <View>{rightAction}</View>}
    </View>
  );
}
