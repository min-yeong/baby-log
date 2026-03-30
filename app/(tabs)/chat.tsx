import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatBubble from "../../components/ChatBubble";
import { sendChatMessage, ChatMessage } from "../../lib/openai";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! 저는 베이비로그 AI 도우미예요 🤗\n\n임신, 출산, 육아에 관한 궁금한 점이 있으면 편하게 물어보세요! 정부지원금 정보도 알려드릴 수 있어요 💰",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // API에 보낼 메시지 히스토리 (최근 10개)
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      {/* 헤더 */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#FFD6DE",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#2D2D2D" }}>
          💬 AI 상담
        </Text>
        <Text style={{ fontSize: 12, color: "#9B9B9B", marginTop: 2 }}>
          임신·출산·육아 궁금한 건 뭐든 물어보세요
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        {/* 메시지 목록 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble role={item.role} content={item.content} />
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {loading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingBottom: 8,
            }}
          >
            <ActivityIndicator size="small" color="#FFB5C2" />
            <Text style={{ fontSize: 13, color: "#9B9B9B", marginLeft: 8 }}>
              답변을 준비하고 있어요...
            </Text>
          </View>
        )}

        {/* 빠른 질문 버튼 */}
        {messages.length <= 1 && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {[
                "임신 초기 주의사항이 뭐야?",
                "정부지원금 뭐 받을 수 있어?",
                "입덧 줄이는 방법 알려줘",
                "엽산은 언제까지 먹어야해?",
              ].map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => {
                    setInput(q);
                  }}
                  style={{
                    backgroundColor: "#FFF0F3",
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderColor: "#FFD6DE",
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#FF6B81" }}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 입력창 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: "#FFD6DE",
            backgroundColor: "#FFFFFF",
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="궁금한 걸 물어보세요..."
            placeholderTextColor="#9B9B9B"
            multiline
            style={{
              flex: 1,
              backgroundColor: "#FFF8F0",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              maxHeight: 100,
              color: "#2D2D2D",
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || loading}
            style={{
              backgroundColor: input.trim() ? "#FF6B81" : "#FFD6DE",
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 8,
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 18 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
