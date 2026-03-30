import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/authStore";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAuthStore();

  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [babyNickname, setBabyNickname] = useState(profile?.baby_nickname || "");
  const [dueDate, setDueDate] = useState(profile?.due_date || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert("알림", "닉네임을 입력해주세요");
      return;
    }
    if (!dueDate.trim()) {
      Alert.alert("알림", "출산예정일을 입력해주세요");
      return;
    }

    // 날짜 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      Alert.alert("알림", "출산예정일을 YYYY-MM-DD 형식으로 입력해주세요\n예: 2026-11-20");
      return;
    }

    setLoading(true);
    const result = await updateProfile({
      nickname: nickname.trim(),
      baby_nickname: babyNickname.trim() || null,
      due_date: dueDate.trim(),
    });
    setLoading(false);

    if (result.error) {
      Alert.alert("오류", result.error);
    } else {
      Alert.alert("저장 완료!", "프로필이 설정되었어요 🎉", [
        { text: "확인", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Text style={{ fontSize: 50 }}>🎀</Text>
          <Text
            style={{ fontSize: 18, fontWeight: "bold", color: "#2D2D2D", marginTop: 10 }}
          >
            프로필을 설정해주세요
          </Text>
          <Text style={{ fontSize: 13, color: "#9B9B9B", marginTop: 4 }}>
            언제든지 수정할 수 있어요
          </Text>
        </View>

        {/* 닉네임 */}
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D", marginBottom: 8 }}>
          닉네임 *
        </Text>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="예: 행복한 예비맘"
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

        {/* 태명 */}
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D", marginBottom: 8 }}>
          태명 (선택)
        </Text>
        <TextInput
          value={babyNickname}
          onChangeText={setBabyNickname}
          placeholder="예: 복덩이, 콩이"
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

        {/* 출산예정일 */}
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D", marginBottom: 8 }}>
          출산예정일 *
        </Text>
        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD (예: 2026-11-20)"
          placeholderTextColor="#9B9B9B"
          keyboardType="numbers-and-punctuation"
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 16,
            fontSize: 15,
            marginBottom: 8,
            color: "#2D2D2D",
          }}
        />
        <Text style={{ fontSize: 12, color: "#9B9B9B", marginBottom: 30 }}>
          병원에서 알려준 출산예정일을 입력해주세요
        </Text>

        {/* 저장 버튼 */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#FFD6DE" : "#FF6B81",
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
            {loading ? "저장 중..." : "저장하기 💕"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
