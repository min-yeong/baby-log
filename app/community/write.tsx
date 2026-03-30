import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useAuthStore } from "../../stores/authStore";
import { useCommunityStore, COMMUNITY_CATEGORIES } from "../../stores/communityStore";
import { calculatePregnancyWeek } from "../../lib/pregnancy";

export default function CommunityWriteScreen() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const { createPost } = useCommunityStore();

  const [category, setCategory] = useState("question");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = COMMUNITY_CATEGORIES.filter((c) => c.key !== "all");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!user) return;

    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요");
      return;
    }
    if (!content.trim()) {
      Alert.alert("알림", "내용을 입력해주세요");
      return;
    }

    setSaving(true);

    const weekNumber = profile?.due_date
      ? calculatePregnancyWeek(profile.due_date).weeks
      : null;

    const result = await createPost({
      userId: user.id,
      nickname: profile?.nickname || "익명",
      weekNumber,
      category,
      title: title.trim(),
      content: content.trim(),
    });

    setSaving(false);

    if (result.error) {
      Alert.alert("오류", result.error);
    } else {
      router.back();
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFF8F0" }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* 카테고리 선택 */}
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D", marginBottom: 10 }}>
        카테고리
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => setCategory(cat.key)}
            style={{
              marginRight: 8,
              marginBottom: 8,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: category === cat.key ? "#FF6B81" : "#FFFFFF",
              borderWidth: 1,
              borderColor: category === cat.key ? "#FF6B81" : "#F0F0F0",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: category === cat.key ? "#FFF" : "#6B6B6B",
                fontWeight: "600",
              }}
            >
              {cat.icon} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 제목 */}
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D", marginBottom: 8 }}>
        제목
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="제목을 입력해주세요"
        placeholderTextColor="#9B9B9B"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 16,
          fontSize: 15,
          marginBottom: 20,
          color: "#2D2D2D",
        }}
      />

      {/* 내용 */}
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D", marginBottom: 8 }}>
        내용
      </Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="궁금한 점이나 나누고 싶은 이야기를 적어주세요"
        placeholderTextColor="#9B9B9B"
        multiline
        textAlignVertical="top"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 16,
          fontSize: 15,
          minHeight: 150,
          marginBottom: 20,
          color: "#2D2D2D",
          lineHeight: 22,
        }}
      />

      {/* 이미지 첨부 */}
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D", marginBottom: 8 }}>
        사진 첨부 (선택)
      </Text>
      {imageUri ? (
        <View style={{ position: "relative", marginBottom: 20 }}>
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: 200, borderRadius: 12 }}
            contentFit="cover"
          />
          <TouchableOpacity
            onPress={() => setImageUri(null)}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 14,
              width: 28,
              height: 28,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "bold" }}>×</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={pickImage}
          style={{
            borderWidth: 2,
            borderColor: "#FFD6DE",
            borderStyle: "dashed",
            borderRadius: 12,
            padding: 30,
            alignItems: "center",
            marginBottom: 20,
            backgroundColor: "#FFF0F3",
          }}
        >
          <Text style={{ fontSize: 30 }}>📷</Text>
          <Text style={{ fontSize: 13, color: "#FFB5C2", marginTop: 6 }}>
            사진을 추가해보세요
          </Text>
        </TouchableOpacity>
      )}

      {/* 작성 버튼 */}
      <TouchableOpacity
        onPress={handlePost}
        disabled={saving}
        style={{
          backgroundColor: saving ? "#FFD6DE" : "#FF6B81",
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
            작성하기
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
