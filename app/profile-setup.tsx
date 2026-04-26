import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useAuthStore } from "../stores/authStore";

const formatYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDisplay = (d: Date) => {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}년 ${m}월 ${day}일`;
};

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAuthStore();

  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [babyNickname, setBabyNickname] = useState(profile?.baby_nickname || "");
  const [dueDate, setDueDate] = useState<Date | null>(
    profile?.due_date ? new Date(profile.due_date) : null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // 기본 표시 날짜 (현재 + 약 280일)
  const defaultPickerDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 280);
    return d;
  })();

  const minDate = new Date();
  const maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 310);
    return d;
  })();

  const handleDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowPicker(false);
    if (selected) setDueDate(selected);
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert("알림", "닉네임을 입력해주세요");
      return;
    }
    if (!dueDate) {
      Alert.alert("알림", "출산예정일을 선택해주세요");
      return;
    }

    setLoading(true);
    const result = await updateProfile({
      nickname: nickname.trim(),
      baby_nickname: babyNickname.trim() || null,
      due_date: formatYMD(dueDate),
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
        <Pressable
          onPress={() => setShowPicker(true)}
          style={({ pressed }) => [
            {
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 16,
              marginBottom: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text
            style={{
              fontSize: 15,
              color: dueDate ? "#2D2D2D" : "#9B9B9B",
            }}
          >
            {dueDate ? formatDisplay(dueDate) : "날짜를 선택하세요"}
          </Text>
          <Text style={{ fontSize: 18 }}>📅</Text>
        </Pressable>
        <Text style={{ fontSize: 12, color: "#9B9B9B", marginBottom: 30 }}>
          병원에서 알려준 출산예정일을 선택해주세요
        </Text>

        {showPicker && (
          <DateTimePicker
            value={dueDate || defaultPickerDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={minDate}
            maximumDate={maxDate}
            onChange={handleDateChange}
          />
        )}

        {/* iOS는 spinner라 직접 닫기 버튼 필요 */}
        {showPicker && Platform.OS === "ios" && (
          <TouchableOpacity
            onPress={() => setShowPicker(false)}
            style={{
              backgroundColor: "#FFF0F3",
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#FF6B81", fontWeight: "600" }}>완료</Text>
          </TouchableOpacity>
        )}

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
