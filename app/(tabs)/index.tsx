import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useMemo } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useDiaryStore } from "../../stores/diaryStore";
import { calculatePregnancyWeek, getDaysUntilDue } from "../../lib/pregnancy";
import { getWeekInfo } from "../../constants/babyGrowth";
import { getUrgentTips } from "../../constants/weeklyTips";
import { eunNeun } from "../../lib/koreanParticle";
import { theme } from "../../constants/theme";
import { Button, Card, EmptyState, ScreenHeader } from "../../components/ui";
import { BabyGrowth } from "../../components/illustrations/BabyGrowth";

const SHORTCUTS = [
  { route: "/(tabs)/chat", label: "AI 상담", iconBg: theme.color.pink[100], icon: require("../../assets/icons/ai_chat.png") },
  { route: "/support/", label: "지원금", iconBg: theme.color.tint.medicine, icon: require("../../assets/icons/government_subsidies.png") },
  { route: "/(tabs)/hospital", label: "병원", iconBg: theme.color.tint.hospital, icon: require("../../assets/icons/hospital.png") },
  { route: "/nutrition", label: "영양", iconBg: theme.color.cream[100], icon: require("../../assets/icons/nutritional_supplements.png") },
] as const;

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

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.color.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BabyGrowth weeks={20} size={theme.iconBox.lg} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
        <EmptyState
          illustration={<Text style={{ fontSize: 44 }}>👶</Text>}
          title="베이비로그"
          description={"우리 아기의 소중한 순간을\n하루하루 기록해보세요"}
          action={
            <Button variant="primary" size="lg" onPress={() => router.push("/login")}>
              시작하기
            </Button>
          }
        />
      </SafeAreaView>
    );
  }

  if (!profile?.due_date) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
        <EmptyState
          illustration={<Text style={{ fontSize: 44 }}>🎀</Text>}
          title="프로필을 설정해주세요"
          description={"출산예정일을 입력하면\n맞춤 정보를 받을 수 있어요"}
          action={
            <Button
              variant="primary"
              size="lg"
              onPress={() => router.push("/profile-setup")}
            >
              프로필 설정하기
            </Button>
          }
        />
      </SafeAreaView>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntry = entries.find((e) => e.date === todayStr);
  const babyName = profile.baby_nickname || "아기";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <ScreenHeader
          variant="large"
          subtitle={`${getGreeting()}, ${profile.nickname || "예비맘"} 님`}
          title={`${weekData!.weeks}주 ${weekData!.days}일`}
          rightAction={
            <View
              style={{
                backgroundColor: theme.color.ink[900],
                paddingVertical: theme.space[2] - 2,
                paddingHorizontal: theme.space[3] - 1,
                borderRadius: theme.radius.sm,
              }}
            >
              <Text style={{ color: theme.color.bg, fontSize: 11, fontWeight: "700" }}>
                D-{weekData!.daysLeft}
              </Text>
            </View>
          }
        />

        {/* 1차: 일기 영웅 카드 */}
        <View style={{ paddingHorizontal: theme.space[5], marginBottom: theme.space[3] }}>
          <Card variant="accent" padding={theme.space[5]}>
            <Text
              style={{
                fontSize: theme.font.overline.size,
                fontWeight: "700",
                color: theme.color.ink[0],
                opacity: theme.opacity.pressedSubtle,
                letterSpacing: theme.font.overline.letterSpacing,
              }}
            >
              오늘의 기록
            </Text>
            <Text
              style={{
                fontSize: theme.font.hero.size,
                fontWeight: "800",
                color: theme.color.ink[0],
                marginTop: theme.space[1],
                lineHeight: theme.font.hero.lineHeight,
              }}
            >
              {todayEntry ? "오늘의 일기를 다시 보기" : `오늘 어떤 하루였어, ${babyName}맘?`}
            </Text>
            <Text
              style={{
                fontSize: theme.font.caption.size,
                color: theme.color.ink[0],
                opacity: theme.opacity.pressed,
                marginTop: theme.space[1],
              }}
            >
              {todayEntry ? "감정 + 기록을 확인하세요" : "감정 기록 + 사진 한 장으로 충분해요"}
            </Text>
            <View style={{ marginTop: theme.space[3], alignSelf: "flex-start" }}>
              <Button
                variant="onAccent"
                size="sm"
                onPress={() =>
                  todayEntry
                    ? router.push(`/diary/${todayEntry.id}`)
                    : router.push("/diary/write")
                }
              >
                {todayEntry ? "기록 보기" : "일기 쓰기"}
              </Button>
            </View>
          </Card>
        </View>

        {/* 2차: 주차 정보 카드 */}
        <View style={{ paddingHorizontal: theme.space[5], marginBottom: theme.space[3] - 1 }}>
          <Card variant="default" onPress={() => router.push("/tips")}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space[3] }}>
              <BabyGrowth weeks={weekData!.weeks} size={theme.iconBox.lg} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: theme.font.caption.size,
                    color: theme.color.ink[400],
                    fontWeight: "600",
                  }}
                >
                  {weekData!.weeks}주차 · {weekData!.weekInfo?.weight} · {weekData!.weekInfo?.length}
                </Text>
                <Text
                  style={{
                    fontSize: theme.font.label.size + 1,
                    color: theme.color.ink[900],
                    fontWeight: "700",
                    marginTop: 2,
                  }}
                >
                  {babyName}{eunNeun(babyName)} {weekData!.weekInfo?.sizeCompare} 크기예요
                </Text>
              </View>
              <Text style={{ color: theme.color.cream[300], fontSize: 16 }}>›</Text>
            </View>
            {weekData!.weekInfo?.description && (
              <Text
                style={{
                  fontSize: theme.font.caption.size + 1,
                  color: theme.color.ink[700],
                  marginTop: theme.space[2],
                  lineHeight: 18,
                }}
                numberOfLines={2}
              >
                {weekData!.weekInfo.description}
              </Text>
            )}
          </Card>
        </View>

        {/* 3차: 꿀팁 카드 */}
        {weekData!.topTip && (
          <View style={{ paddingHorizontal: theme.space[5], marginBottom: theme.space[5] }}>
            <Card variant="flat" onPress={() => router.push("/tips")}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space[3] }}>
                <View
                  style={{
                    width: theme.iconBox.md,
                    height: theme.iconBox.md,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.color.pink[100],
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{weekData!.topTip.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: theme.font.overline.size,
                      color: theme.color.ink[400],
                      fontWeight: "700",
                      letterSpacing: theme.font.overline.letterSpacing,
                    }}
                  >
                    {weekData!.weeks}주 꿀팁
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.font.label.size,
                      color: theme.color.ink[900],
                      fontWeight: "700",
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {weekData!.topTip.title}
                  </Text>
                </View>
                <Text style={{ color: theme.color.cream[300], fontSize: 16 }}>›</Text>
              </View>
            </Card>
          </View>
        )}

        {/* 4차: 더 알아보기 4칸 그리드 */}
        <View style={{ paddingHorizontal: theme.space[5], marginBottom: theme.space[6] }}>
          <Text
            style={{
              fontSize: theme.font.overline.size,
              color: theme.color.ink[400],
              fontWeight: "700",
              letterSpacing: theme.font.overline.letterSpacing,
              marginBottom: theme.space[2],
            }}
          >
            더 알아보기
          </Text>
          <View style={{ flexDirection: "row", gap: theme.space[2] }}>
            {SHORTCUTS.map((item) => (
              <Card
                key={item.route}
                variant="default"
                onPress={() => router.push(item.route as any)}
                padding={theme.space[4]}
                style={{ flex: 1 }}
              >
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: theme.iconBox.lg,
                      height: theme.iconBox.lg,
                      borderRadius: theme.radius.md,
                      backgroundColor: item.iconBg,
                      marginBottom: theme.space[2],
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={item.icon}
                      style={{ width: theme.iconBox.lg - 12, height: theme.iconBox.lg - 12 }}
                      contentFit="contain"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: theme.font.label.size,
                      fontWeight: "700",
                      color: theme.color.ink[900],
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
