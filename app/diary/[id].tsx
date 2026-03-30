import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useDiaryStore } from "../../stores/diaryStore";
import { useAuthStore } from "../../stores/authStore";
import { handleScroll } from "../../stores/uiStore";
import { EMOTIONS } from "../../constants/emotions";

export default function DiaryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentEntry, fetchEntry, deleteEntry } = useDiaryStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchEntry(id);
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert("일기 삭제", "정말 이 일기를 삭제하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          if (id) {
            await deleteEntry(id);
            if (user) {
              const { fetchEntries } = useDiaryStore.getState();
              await fetchEntries(user.id);
            }
            router.back();
          }
        },
      },
    ]);
  };

  if (!currentEntry) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFF8F0",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#9B9B9B" }}>로딩 중...</Text>
      </View>
    );
  }

  const emotion = EMOTIONS.find((e) => e.key === currentEntry.emotion);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFF8F0" }}
      contentContainerStyle={{ padding: 20 }}
      onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
    >
      {/* 날짜 & 감정 */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 40 }}>{emotion?.emoji || "📝"}</Text>
        <Text
          style={{ fontSize: 18, fontWeight: "600", color: "#2D2D2D", marginTop: 8 }}
        >
          {emotion?.label || ""}
        </Text>
        <Text style={{ fontSize: 14, color: "#9B9B9B", marginTop: 4 }}>
          {currentEntry.date} · {currentEntry.week_number}주차
        </Text>
      </View>

      {/* 내용 */}
      {currentEntry.content && (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 15, color: "#2D2D2D", lineHeight: 24 }}>
            {currentEntry.content}
          </Text>
        </View>
      )}

      {/* 사진 */}
      {currentEntry.photos && currentEntry.photos.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          {currentEntry.photos.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.photo_url }}
              style={{
                width: "100%",
                height: 300,
                borderRadius: 16,
                marginBottom: 8,
              }}
              contentFit="cover"
            />
          ))}
        </View>
      )}

      {/* 삭제 버튼 */}
      <TouchableOpacity
        onPress={handleDelete}
        style={{
          backgroundColor: "#FFF0F3",
          borderRadius: 12,
          padding: 14,
          alignItems: "center",
          marginTop: 10,
          marginBottom: 90,
        }}
      >
        <Text style={{ color: "#FF6B81", fontSize: 14 }}>🗑️ 일기 삭제</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
