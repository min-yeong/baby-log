import { ReactNode } from "react";
import { View, Text } from "react-native";
import { theme } from "../../constants/theme";

interface EmptyStateProps {
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: theme.space[8] + theme.space[4],
        paddingHorizontal: theme.space[6],
      }}
    >
      {illustration && (
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: theme.color.pink[100],
            alignItems: "center",
            justifyContent: "center",
            marginBottom: theme.space[5],
          }}
        >
          {illustration}
        </View>
      )}
      <Text
        style={{
          fontSize: theme.font.heading.size,
          fontWeight: "700",
          color: theme.color.ink[900],
          marginBottom: theme.space[2],
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: theme.font.body.size,
            color: theme.color.ink[400],
            lineHeight: theme.font.body.lineHeight,
            textAlign: "center",
            marginBottom: action ? theme.space[5] : 0,
          }}
        >
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}
