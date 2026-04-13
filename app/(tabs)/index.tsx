import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAuthStore } from "../../stores/authStore";
import { useDiaryStore } from "../../stores/diaryStore";
import { EMOTIONS } from "../../constants/emotions";
import { calculatePregnancyWeek, getDaysUntilDue } from "../../lib/pregnancy";
import { getWeekInfo } from "../../constants/babyGrowth";
import { getUrgentTips, getTipsForWeek } from "../../constants/weeklyTips";
import { useEffect, useMemo } from "react";

const SHORTCUT_ICONS: Record<string, any> = {
  tips: require("../../assets/icons/tips.png"),
  nutrition: require("../../assets/icons/nutritional_supplements.png"),
  support: require("../../assets/icons/government_subsidies.png"),
  hospital: require("../../assets/icons/hospital.png"),
  community: require("../../assets/icons/community.png"),
  ai_chat: require("../../assets/icons/ai_chat.png"),
  youtube: require("../../assets/icons/youtube.png"),
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "좋은 아침이에요";
  if (h < 18) return "좋은 오후예요";
  return "편안한 저녁이에요";
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, loading } = useAuthStore();
  const { entries, fetchEntries } = useDiaryStore();
  useEffect(() => {
    if (user) fetchEntries(user.id);
  }, [user]);

  const weekData = useMemo(() => {
    if (!profile?.due_date) return null;
    const { weeks, days } = calculatePregnancyWeek(profile.due_date);
    const daysLeft = getDaysUntilDue(profile.due_date);
    const weekInfo = getWeekInfo(weeks);
    const topTip = getUrgentTips(weeks)[0] || null;
    return { weeks, days, daysLeft, weekInfo, topTip };
  }, [profile]);

  // 비로그인
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 40 }}>👶</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0", justifyContent: "center", alignItems: "center", padding: 40 }}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>👶</Text>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#2D2D2D" }}>베이비로그</Text>
        <Text style={{ fontSize: 15, color: "#6B6B6B", textAlign: "center", marginTop: 8, lineHeight: 22 }}>
          우리 아기의 소중한 순간을{"\n"}하루하루 기록해보세요 💕
        </Text>
        <TouchableOpacity onPress={() => router.push("/login")} style={{ backgroundColor: "#FF6B81", borderRadius: 14, paddingVertical: 16, paddingHorizontal: 50, marginTop: 30 }}>
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>시작하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!profile?.due_date) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0", justifyContent: "center", alignItems: "center", padding: 40 }}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>🎀</Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#2D2D2D", textAlign: "center" }}>프로필을 설정해주세요!</Text>
        <Text style={{ fontSize: 14, color: "#6B6B6B", textAlign: "center", marginTop: 8 }}>
          출산예정일을 입력하면{"\n"}맞춤 정보를 받을 수 있어요
        </Text>
        <TouchableOpacity onPress={() => router.push("/profile-setup")} style={{ backgroundColor: "#FF6B81", borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, marginTop: 24 }}>
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>프로필 설정하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find((e) => e.date === todayStr);
  const babyName = profile.baby_nickname || "아기";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── 헤더: 인사 + 주차 ── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 6 }}>
          <Text style={{ fontSize: 14, color: "#9B9B9B" }}>
            {getGreeting()}, {profile.nickname || "예비맘"} 님
          </Text>
        </View>

        {/* ── 히어로 카드: 주차 + 아기 정보 ── */}
        {weekData && (
          <View style={{ marginHorizontal: 20, marginTop: 8, borderRadius: 24, overflow: "hidden" }}>
            {/* 그라데이션 느낌의 배경 */}
            <View style={{ backgroundColor: "#FF8FA3", padding: 28 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                    {babyName}와 함께한 지
                  </Text>
                  <Text style={{ fontSize: 36, fontWeight: "bold", color: "#FFF", marginTop: 2 }}>
                    {weekData.weeks}주 {weekData.days}일
                  </Text>
                </View>
                <View style={{ backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 }}>
                  <Text style={{ fontSize: 12, color: "#FFF", fontWeight: "600" }}>
                    D-{weekData.daysLeft}
                  </Text>
                </View>
              </View>

              {weekData.weekInfo && (
                <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, padding: 14, marginTop: 18 }}>
                  <Text style={{ fontSize: 14, color: "#FFF", fontWeight: "600" }}>
                    지금 {babyName}은 {weekData.weekInfo.sizeCompare} 크기예요
                  </Text>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 4, lineHeight: 18 }}>
                    {weekData.weekInfo.description}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── 오늘의 일기 CTA ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          {todayEntry ? (
            <TouchableOpacity
              onPress={() => router.push(`/diary/${todayEntry.id}`)}
              activeOpacity={0.7}
              style={{ backgroundColor: "#FFF", borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center" }}
            >
              <Text style={{ fontSize: 32, marginRight: 14 }}>
                {EMOTIONS.find((e) => e.key === todayEntry.emotion)?.emoji || "😊"}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: "#9B9B9B" }}>오늘의 기록</Text>
                <Text style={{ fontSize: 14, color: "#2D2D2D", marginTop: 2 }} numberOfLines={1}>
                  {todayEntry.content || "감정을 기록했어요"}
                </Text>
              </View>
              <Text style={{ color: "#D0D0D0" }}>›</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/diary/write")}
              activeOpacity={0.7}
              style={{ backgroundColor: "#FF6B81", borderRadius: 16, paddingVertical: 20, alignItems: "center" }}
            >
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
                📝  오늘의 일기 쓰기
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 한 줄 알림 (긴급 꿀팁 1개만) ── */}
        {weekData?.topTip && (
          <TouchableOpacity
            onPress={() => router.push("/tips")}
            activeOpacity={0.7}
            style={{
              backgroundColor: "#FFF",
              borderRadius: 16,
              padding: 16,
              marginHorizontal: 20,
              marginTop: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View style={{ backgroundColor: "#FFE5E5", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 }}>
                <Text style={{ fontSize: 10, color: "#FF6B81", fontWeight: "700" }}>💡 {weekData.weeks}주차 꿀팁</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>{weekData.topTip.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: "#2D2D2D", fontWeight: "600" }} numberOfLines={1}>
                  {weekData.topTip.title}
                </Text>
                <Text style={{ fontSize: 12, color: "#9B9B9B", marginTop: 2 }} numberOfLines={1}>
                  {weekData.topTip.description}
                </Text>
              </View>
              <Text style={{ color: "#D0D0D0", fontSize: 16 }}>›</Text>
            </View>
            <View style={{ backgroundColor: "#FFF0F3", borderRadius: 10, paddingVertical: 8, alignItems: "center", marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: "#FF6B81", fontWeight: "600" }}>
                {weekData.weeks}주차 꿀팁 {getTipsForWeek(weekData.weeks).length}개 더 보기 →
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── 바로가기 3×2 그리드 ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {[
              { route: "/tips", iconKey: "tips", emoji: "💡", label: "주차별 꿀팁", desc: "지금 꼭 알아야 할 것", bg: "#FFF0F3" },
              { route: "/nutrition", iconKey: "nutrition", emoji: "💊", label: "영양제 가이드", desc: "엽산·철분 복용법", bg: "#FFF3B0" },
              { route: "/support/", iconKey: "support", emoji: "💰", label: "정부지원금", desc: "받을 수 있는 혜택", bg: "#F3EEFF" },
              { route: "/(tabs)/chat", iconKey: "ai_chat", emoji: "🤖", label: "AI 상담", desc: "궁금한 거 물어보기", bg: "#E8F8F0" },
              { route: "/youtube", iconKey: "youtube", emoji: "🎬", label: "임산부 영상", desc: "주차별 추천 영상", bg: "#E8F4FF" },
              { route: "/(tabs)/hospital", iconKey: "hospital", emoji: "🏥", label: "근처 보건소·병원", desc: "산부인과·보건소 찾기", bg: "#F0FFF0" },
            ].map((item) => (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
                style={{
                  width: "48%",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: item.bg, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                  {item.iconKey && SHORTCUT_ICONS[item.iconKey] ? (
                    <Image source={SHORTCUT_ICONS[item.iconKey]} style={{ width: 40, height: 40, borderRadius: 10 }} contentFit="cover" />
                  ) : (
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#2D2D2D" }} numberOfLines={1}>{item.label}</Text>
                  <Text style={{ fontSize: 10, color: "#9B9B9B", marginTop: 2 }} numberOfLines={1}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
