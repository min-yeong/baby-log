import { View, Text } from "react-native";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "80%",
        marginVertical: 4,
        marginHorizontal: 16,
      }}
    >
      {!isUser && (
        <Text style={{ fontSize: 12, color: "#9B9B9B", marginBottom: 4, marginLeft: 4 }}>
          베이비로그 AI 🤖
        </Text>
      )}
      <View
        style={{
          backgroundColor: isUser ? "#FFB5C2" : "#FFFFFF",
          borderRadius: 18,
          borderTopRightRadius: isUser ? 4 : 18,
          borderTopLeftRadius: isUser ? 18 : 4,
          padding: 14,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: isUser ? "#FFFFFF" : "#2D2D2D",
            lineHeight: 22,
          }}
        >
          {content}
        </Text>
      </View>
    </View>
  );
}
