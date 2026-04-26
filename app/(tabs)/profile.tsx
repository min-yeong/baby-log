import { View, Text, Alert, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../stores/authStore";
import { formatPregnancyWeek, getDaysUntilDue } from "../../lib/pregnancy";
import { theme } from "../../constants/theme";
import { Button, Card, EmptyState, ScreenHeader } from "../../components/ui";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: async () => { await signOut(); } },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg, justifyContent: "center" }}>
        <EmptyState
          title="로그인이 필요해요"
          action={
            <Button variant="primary" size="md" onPress={() => router.push("/login")}>
              로그인
            </Button>
          }
        />
      </SafeAreaView>
    );
  }

  const dueDate = profile?.due_date;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScreenHeader title="내 정보" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.space[5], paddingBottom: theme.space[8] }}>
        <Card variant="default">
          <View style={{ alignItems: "center", marginBottom: theme.space[5] }}>
            <View
              style={{
                width: theme.iconBox.xl,
                height: theme.iconBox.xl,
                borderRadius: theme.iconBox.xl / 2,
                backgroundColor: theme.color.pink[100],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 40 }}>👶</Text>
            </View>
            <Text
              style={{
                fontSize: theme.font.title.size,
                fontWeight: "800",
                color: theme.color.ink[900],
                marginTop: theme.space[3],
              }}
            >
              {profile?.nickname || "예비맘"}
            </Text>
            {profile?.baby_nickname && (
              <Text
                style={{
                  fontSize: theme.font.body.size,
                  color: theme.color.pink[400],
                  marginTop: theme.space[1],
                }}
              >
                태명: {profile.baby_nickname}
              </Text>
            )}
          </View>

          {dueDate && (
            <View
              style={{
                backgroundColor: theme.color.bg,
                borderRadius: theme.radius.md,
                padding: theme.space[4],
                gap: theme.space[2],
              }}
            >
              <Row label="임신 주차" value={formatPregnancyWeek(dueDate)} />
              <Row label="출산예정일" value={dueDate} />
              <Row label="D-Day" value={`D-${getDaysUntilDue(dueDate)}`} accent />
            </View>
          )}
        </Card>

        <View style={{ marginTop: theme.space[4], gap: theme.space[2] }}>
          <MenuItem label="프로필 수정" onPress={() => router.push("/profile-setup")} />
          <MenuItem label="정부지원금 안내" onPress={() => router.push("/support/")} />
        </View>

        <View style={{ marginTop: theme.space[5] }}>
          <Card variant="flat" onPress={handleSignOut}>
            <Text
              style={{
                fontSize: theme.font.bodyLg.size,
                color: theme.color.pink[500],
                textAlign: "center",
              }}
            >
              로그아웃
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text style={{ fontSize: theme.font.body.size, color: theme.color.ink[400] }}>{label}</Text>
      <Text
        style={{
          fontSize: theme.font.body.size,
          color: accent ? theme.color.pink[500] : theme.color.ink[900],
          fontWeight: "600",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Card variant="flat" onPress={onPress}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: theme.font.bodyLg.size, color: theme.color.ink[900] }}>{label}</Text>
        <Text style={{ color: theme.color.cream[300], fontSize: 16 }}>›</Text>
      </View>
    </Card>
  );
}
