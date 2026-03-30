import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../stores/authStore";
import { formatPregnancyWeek, getDaysUntilDue } from "../../lib/pregnancy";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFF8F0", justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ fontSize: 16, color: "#9B9B9B" }}>
          로그인이 필요해요
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={{
            backgroundColor: "#FF6B81",
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 30,
            marginTop: 16,
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "600" }}>로그인</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#2D2D2D" }}>
          👤 내 정보
        </Text>
      </View>

      {/* 프로필 카드 */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 24,
          margin: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#FFF0F3",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 40 }}>👶</Text>
          </View>
          <Text
            style={{ fontSize: 20, fontWeight: "bold", color: "#2D2D2D", marginTop: 12 }}
          >
            {profile?.nickname || "예비맘"}
          </Text>
          {profile?.baby_nickname && (
            <Text style={{ fontSize: 14, color: "#FFB5C2", marginTop: 4 }}>
              태명: {profile.baby_nickname}
            </Text>
          )}
        </View>

        {profile?.due_date && (
          <View
            style={{
              backgroundColor: "#FFF8F0",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: "#9B9B9B" }}>임신 주차</Text>
              <Text style={{ fontSize: 14, color: "#2D2D2D", fontWeight: "600" }}>
                {formatPregnancyWeek(profile.due_date)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: "#9B9B9B" }}>출산예정일</Text>
              <Text style={{ fontSize: 14, color: "#2D2D2D", fontWeight: "600" }}>
                {profile.due_date}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 14, color: "#9B9B9B" }}>D-Day</Text>
              <Text style={{ fontSize: 14, color: "#FF6B81", fontWeight: "600" }}>
                D-{getDaysUntilDue(profile.due_date)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 메뉴 */}
      <View style={{ paddingHorizontal: 20 }}>
        <TouchableOpacity
          onPress={() => router.push("/profile-setup")}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 16,
            marginBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 15, color: "#2D2D2D" }}>✏️ 프로필 수정</Text>
          <Text style={{ color: "#9B9B9B" }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/support/")}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 16,
            marginBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 15, color: "#2D2D2D" }}>💰 정부지원금 안내</Text>
          <Text style={{ color: "#9B9B9B" }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 15, color: "#FF6B81" }}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
