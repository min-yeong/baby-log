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
import { useAuthStore } from "../../stores/authStore";
import { useDiaryStore } from "../../stores/diaryStore";
import { calculatePregnancyWeek } from "../../lib/pregnancy";
import EmotionPicker from "../../components/EmotionPicker";
import PhotoGrid from "../../components/PhotoGrid";

export default function DiaryWriteScreen() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const { createEntry, uploadPhoto } = useDiaryStore();

  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user || !profile?.due_date) return;

    if (!emotion) {
      Alert.alert("알림", "오늘의 감정을 선택해주세요 😊");
      return;
    }

    setSaving(true);

    // 사진 업로드
    const uploadedUrls: string[] = [];
    for (const uri of photos) {
      const result = await uploadPhoto(user.id, uri);
      if (result.url) {
        uploadedUrls.push(result.url);
      }
    }

    const { weeks } = calculatePregnancyWeek(profile.due_date);

    const result = await createEntry({
      userId: user.id,
      date: today,
      content: content.trim(),
      emotion,
      weekNumber: weeks,
      photoUrls: uploadedUrls,
    });

    setSaving(false);

    if (result.error) {
      Alert.alert("오류", result.error);
    } else {
      Alert.alert("저장 완료!", "오늘의 기록이 저장되었어요 🎉", [
        { text: "확인", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFF8F0" }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* 날짜 */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 14,
          marginBottom: 20,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 20, marginRight: 10 }}>📅</Text>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#2D2D2D" }}>
            {today}
          </Text>
          {profile?.due_date && (
            <Text style={{ fontSize: 12, color: "#FFB5C2" }}>
              {calculatePregnancyWeek(profile.due_date).weeks}주{" "}
              {calculatePregnancyWeek(profile.due_date).days}일
            </Text>
          )}
        </View>
      </View>

      {/* 감정 선택 */}
      <View style={{ marginBottom: 24 }}>
        <EmotionPicker selected={emotion} onSelect={setEmotion} />
      </View>

      {/* 일기 내용 */}
      <Text
        style={{ fontSize: 16, fontWeight: "600", color: "#2D2D2D", marginBottom: 10 }}
      >
        오늘의 일기 ✏️
      </Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="오늘 있었던 일, 느낀 점, 아기에게 하고 싶은 말 등을 자유롭게 적어보세요..."
        placeholderTextColor="#9B9B9B"
        multiline
        textAlignVertical="top"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          padding: 16,
          fontSize: 15,
          minHeight: 150,
          marginBottom: 24,
          color: "#2D2D2D",
          lineHeight: 22,
        }}
      />

      {/* 사진 */}
      <Text
        style={{ fontSize: 16, fontWeight: "600", color: "#2D2D2D", marginBottom: 10 }}
      >
        오늘의 사진 📷
      </Text>
      <View style={{ marginBottom: 30 }}>
        <PhotoGrid
          photos={photos}
          onAdd={pickImage}
          onRemove={removePhoto}
          maxPhotos={5}
        />
      </View>

      {/* 저장 버튼 */}
      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        style={{
          backgroundColor: saving ? "#FFD6DE" : "#FF6B81",
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: "center",
          marginBottom: 90,
        }}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
            저장하기 💕
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
