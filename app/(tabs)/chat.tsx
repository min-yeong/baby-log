import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatBubble from "../../components/ChatBubble";
import { sendChatMessage, ChatMessage } from "../../lib/openai";
import { theme } from "../../constants/theme";
import { Chip, ScreenHeader } from "../../components/ui";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "임신 초기 주의사항이 뭐야?",
  "정부지원금 뭐 받을 수 있어?",
  "입덧 줄이는 방법 알려줘",
  "엽산은 언제까지 먹어야해?",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! 저는 베이비로그 AI 도우미예요\n\n임신, 출산, 육아에 관한 궁금한 점이 있으면 편하게 물어보세요! 정부지원금 정보도 알려드릴 수 있어요.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const renderMessage = useCallback(
    ({ item }: { item: DisplayMessage }) => (
      <ChatBubble role={item.role} content={item.content} />
    ),
    []
  );

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const chatHistory: ChatMessage[] = [...messages, userMessage]
      .filter((m) => m.id !== "welcome")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    const response = await sendChatMessage(chatHistory);

    const assistantMessage: DisplayMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }} edges={["top"]}>
      <ScreenHeader
        title="AI 상담"
        subtitle="임신·출산·육아 궁금한 건 뭐든 물어보세요"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: theme.space[4] }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: theme.space[5],
              paddingBottom: theme.space[2],
            }}
          >
            <ActivityIndicator size="small" color={theme.color.pink[200]} />
            <Text
              style={{
                fontSize: theme.font.label.size,
                color: theme.color.ink[400],
                marginLeft: theme.space[2],
              }}
            >
              답변을 준비하고 있어요...
            </Text>
          </View>
        )}

        {messages.length <= 1 && (
          <View
            style={{
              paddingHorizontal: theme.space[4],
              paddingBottom: theme.space[2],
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.space[2],
            }}
          >
            {QUICK_QUESTIONS.map((q) => (
              <Chip key={q} color="primary" variant="solid" onPress={() => handleSend(q)}>
                {q}
              </Chip>
            ))}
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: theme.space[4],
            paddingVertical: theme.space[3],
            borderTopWidth: 1,
            borderTopColor: theme.color.cream[200],
            backgroundColor: theme.color.ink[0],
            gap: theme.space[2],
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="궁금한 걸 물어보세요..."
            placeholderTextColor={theme.color.ink[400]}
            multiline
            style={{
              flex: 1,
              backgroundColor: theme.color.bg,
              borderRadius: theme.radius.full,
              paddingHorizontal: theme.space[4],
              paddingVertical: theme.space[2] + 2,
              fontSize: theme.font.bodyLg.size,
              maxHeight: 100,
              color: theme.color.ink[900],
            }}
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
            style={({ pressed }) => [
              {
                backgroundColor: input.trim() ? theme.color.pink[500] : theme.color.pink[200],
                borderRadius: theme.radius.full,
                width: theme.iconBox.md,
                height: theme.iconBox.md,
                alignItems: "center",
                justifyContent: "center",
              },
              pressed && { opacity: theme.opacity.pressed },
            ]}
          >
            <Text style={{ color: theme.color.ink[0], fontSize: 18, fontWeight: "700" }}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
