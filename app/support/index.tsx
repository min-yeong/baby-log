import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { SUPPORT_LIST, SupportInfo } from "../../constants/supports";
import { handleScroll } from "../../stores/uiStore";
import SupportCard from "../../components/SupportCard";

type Category = "전체" | "임신" | "출산" | "육아";

export default function SupportScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("전체");

  const filtered =
    category === "전체"
      ? SUPPORT_LIST
      : SUPPORT_LIST.filter((item) => item.category === category);

  const categories: Category[] = ["전체", "임신", "출산", "육아"];

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      {/* 카테고리 필터 */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={{
              height: 36,
              paddingHorizontal: 16,
              borderRadius: 18,
              backgroundColor: category === cat ? "#FF6B81" : "#FFFFFF",
              borderWidth: 1.5,
              borderColor: category === cat ? "#FF6B81" : "#EEEEEE",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: category === cat ? "#FFF" : "#6B6B6B",
                fontWeight: "600",
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 안내 */}
      <View
        style={{
          backgroundColor: "#F3EEFF",
          borderRadius: 12,
          padding: 14,
          marginHorizontal: 20,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, marginRight: 8 }}>💡</Text>
        <Text style={{ fontSize: 13, color: "#6B6B6B", flex: 1 }}>
          지원금 정보는 변경될 수 있어요.{"\n"}
          자세한 내용은 정부24(gov.kr)에서 확인해주세요.
        </Text>
      </View>

      {/* 지원금 목록 */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SupportCard item={item} />}
        contentContainerStyle={{ paddingBottom: 80 }}
        onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      />

      {/* AI 상담 버튼 */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/chat")}
        style={{
          position: "absolute",
          bottom: 30,
          right: 20,
          backgroundColor: "#FF6B81",
          borderRadius: 28,
          paddingVertical: 14,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#FF6B81",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text style={{ fontSize: 18, marginRight: 6 }}>🤖</Text>
        <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
          AI에게 물어보기
        </Text>
      </TouchableOpacity>
    </View>
  );
}
