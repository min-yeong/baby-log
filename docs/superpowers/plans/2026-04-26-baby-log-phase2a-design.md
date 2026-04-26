# Baby-Log Phase 2A: 시스템 전파 + 탭바 재설계 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5개 탭 화면을 토큰 + 컴포넌트로 재작성하고, 탭바를 재설계하고, Phase 1.5 잔여 정리를 마무리한다.

**Architecture:** 토큰 확장 → 컴포넌트 변형 추가 → 홈 정리 → 탭바 → 5개 탭 화면 순차 마이그레이션. 비즈니스 로직(store/fetch/navigation) 절대 변경 금지, 시각/구조 토큰화만 허용.

**Tech Stack:** RN 0.83, Expo 55(canary), expo-router, expo-image, expo-linear-gradient, react-native-gesture-handler 2.30, TypeScript 5.9. Jest 미설치 → 검증은 TS 타입체크 + grep + 시뮬레이터 시각 확인.

**Spec:** `docs/superpowers/specs/2026-04-26-baby-log-phase2a-design.md`

---

## File Structure

**수정:**
- `constants/theme.ts` — 신규 토큰 추가(font.hero/bodyLg, iconBox, opacity, scrim)
- `components/ui/Button.tsx` — onAccent variant 추가
- `app/(tabs)/_layout.tsx` — 탭바 재설계(AI 노출, 산부인과 제거, 사이즈 고정)
- `app/(tabs)/index.tsx` — Phase 1.5 정리(I-1, I-2)
- `app/(tabs)/profile.tsx` — 토큰/컴포넌트 마이그레이션
- `app/(tabs)/chat.tsx` — 토큰/컴포넌트 마이그레이션
- `app/(tabs)/community.tsx` — 토큰/컴포넌트 마이그레이션
- `app/(tabs)/diary.tsx` — 토큰/컴포넌트 마이그레이션 + Modal → Sheet 교체
- `app/(tabs)/hospital.tsx` — 토큰/컴포넌트 마이그레이션

**유지(Phase 2B):**
- `app/login.tsx`, `profile-setup.tsx`, `tips.tsx`, `nutrition.tsx`, `youtube.tsx`
- `app/diary/write.tsx`, `app/diary/[id].tsx`
- `app/community/write.tsx`, `app/community/[id].tsx`
- `app/hospital/[id].tsx`, `app/support/index.tsx`
- `components/SupportCard.tsx`, `WeekBanner.tsx`, `EmotionPicker.tsx`, `PhotoGrid.tsx`, `ChatBubble.tsx`, `FloatingTabBar.tsx`, `AnimatedSplash.tsx` (개별 컴포넌트는 Phase 3에서 폴리시 시 같이)

---

## Task 0: 사전 검증

**Files:** 없음

- [ ] **Step 1: 베이스라인 TypeScript 확인**

```bash
cd /Users/min-yeong/Desktop/project/baby-log
npx tsc --noEmit 2>&1 | tail -5
```

Expected: 출력 없음 (에러 0).

- [ ] **Step 2: dev 서버 동작 확인**

```bash
lsof -ti:8081
```

만약 결과 있으면 서버 이미 실행 중. 없으면 작업 후 `npx expo start --web`로 확인.

- [ ] **Step 3: 현재 브랜치 확인**

```bash
git status --short && git log --oneline -3
```

Expected: 작업 트리 clean. HEAD가 `ccd6ede` (worklets 추가) 또는 그 이후.

---

## Task 1: 토큰 확장 (`constants/theme.ts`)

**Files:**
- Modify: `constants/theme.ts`

- [ ] **Step 1: 토큰 추가**

`constants/theme.ts`를 열어서 기존 `theme` 객체 안에 다음 4개 변경:

(1) `font` 객체에 `hero`, `bodyLg` 추가 (기존 7개 뒤에):

```typescript
  font: {
    display: { size: 32, weight: "800" as const, lineHeight: 38 },
    title: { size: 22, weight: "700" as const, lineHeight: 28 },
    heading: { size: 17, weight: "700" as const, lineHeight: 22 },
    body: { size: 14, weight: "400" as const, lineHeight: 20 },
    bodyLg: { size: 15, weight: "400" as const, lineHeight: 22 },
    label: { size: 13, weight: "600" as const, lineHeight: 18 },
    caption: { size: 11, weight: "400" as const, lineHeight: 15 },
    overline: { size: 10, weight: "700" as const, lineHeight: 14, letterSpacing: 0.5 },
    hero: { size: 18, weight: "800" as const, lineHeight: 24 },
  },
```

(2) `space` 다음에 `iconBox` 추가:

```typescript
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 },
  iconBox: { sm: 32, md: 40, lg: 56, xl: 80, xxl: 96 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
```

(3) `shadow` 다음에 `opacity`, `scrim` 추가:

```typescript
  shadow: {
    // ... 기존 ...
  },
  opacity: {
    pressed: 0.85,
    pressedSubtle: 0.9,
    pressedStrong: 0.5,
    disabledMuted: 0.4,
  },
  scrim: "rgba(0, 0, 0, 0.4)",
} as const;
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected: 에러 0.

- [ ] **Step 3: Commit**

```bash
git add constants/theme.ts
git commit -m "feat(theme): expand tokens — font.hero/bodyLg, iconBox, opacity, scrim"
```

---

## Task 2: Button `onAccent` variant 추가

**Files:**
- Modify: `components/ui/Button.tsx`

- [ ] **Step 1: 타입 확장**

`components/ui/Button.tsx`의 Variant 타입에 `"onAccent"` 추가:

```typescript
type Variant = "primary" | "secondary" | "ghost" | "dark" | "onAccent";
```

- [ ] **Step 2: getColors switch에 케이스 추가**

`getColors` 함수의 switch 안에 케이스 추가:

```typescript
    case "onAccent":
      return { bg: theme.color.ink[0], fg: theme.color.pink[500], border: "transparent" };
```

- [ ] **Step 3: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected: 에러 0.

- [ ] **Step 4: Commit**

```bash
git add components/ui/Button.tsx
git commit -m "feat(ui): add Button onAccent variant (white bg + pink fg)"
```

---

## Task 3: 홈 화면 Phase 1.5 정리 (I-1, I-2)

**Files:**
- Modify: `app/(tabs)/index.tsx`

홈 화면의 raw 숫자 + hand-rolled pill을 정리한다.

- [ ] **Step 1: hand-rolled pill을 Button onAccent로 교체**

`app/(tabs)/index.tsx`에서 일기 영웅 카드의 흰 pill `<View>`를 `<Button>`으로 교체.

기존 코드 블록 (대략 라인 163~177):
```tsx
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: theme.color.ink[0],
                paddingVertical: theme.space[2] + 1,
                paddingHorizontal: theme.space[4],
                borderRadius: theme.radius.md,
                marginTop: theme.space[3],
              }}
            >
              <Text style={{ color: theme.color.pink[500], fontSize: 13, fontWeight: "700" }}>
                {todayEntry ? "기록 보기" : "✏ 일기 쓰기"}
              </Text>
            </View>
```

다음으로 교체:
```tsx
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
```

또한 Card.accent의 onPress prop을 제거(이중 트리거 방지). Card에서 onPress 빼고 Button만 가지게:

```tsx
          <Card variant="accent" padding={theme.space[5]}>
```
(기존 `onPress={...}` 제거)

- [ ] **Step 2: raw 숫자를 토큰으로 교체**

같은 파일에서 다음 라인들을 수정:

(a) 일기 영웅 카드 heading: `fontSize: 18` + `lineHeight: 24` → `theme.font.hero`:
```tsx
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
```

(b) 4그리드 아이콘 박스 `width:32, height:32` → `theme.iconBox.sm`:
```tsx
                  <View
                    style={{
                      width: theme.iconBox.sm,
                      height: theme.iconBox.sm,
                      borderRadius: theme.radius.sm + 1,
                      backgroundColor: item.iconBg,
                      marginBottom: theme.space[2] - 2,
                    }}
                  />
```

(c) 꿀팁 카드 아이콘 박스 `width:40, height:40` → `theme.iconBox.md`:
```tsx
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
```

(d) BabyGrowth 인라인 사이즈 `size={56}` → `size={theme.iconBox.lg}`:
```tsx
              <BabyGrowth weeks={weekData!.weeks} size={theme.iconBox.lg} />
```

(e) loading 분기 BabyGrowth `size={64}` → 64는 토큰 범위 밖이므로 그대로 유지하되 magic number 의미 주석 제거. 또는 lg(56) 사용. **lg(56) 사용으로 변경**:

```tsx
        <BabyGrowth weeks={20} size={theme.iconBox.lg} />
```

- [ ] **Step 3: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected: 에러 0.

- [ ] **Step 4: hex 하드코딩 재확인**

```bash
grep -nE '#[0-9A-Fa-f]{6}' 'app/(tabs)/index.tsx' || echo "OK"
```

Expected: "OK".

- [ ] **Step 5: Commit**

```bash
git add 'app/(tabs)/index.tsx'
git commit -m "refactor(home): replace hand-rolled pill with Button onAccent + apply iconBox tokens"
```

---

## Task 4: 탭바 재설계 (`app/(tabs)/_layout.tsx`)

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: 전체 교체**

`app/(tabs)/_layout.tsx`를 다음으로 전체 교체:

```typescript
import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { theme } from "../../constants/theme";

const ICON_SIZE = 24;
const TAB_HEIGHT = 64;

function TabIcon({ source, label, focused }: { source: any; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Image
        source={source}
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
        contentFit="contain"
      />
      <Text
        style={{
          fontSize: theme.font.caption.size,
          fontWeight: focused ? "700" : "500",
          color: focused ? theme.color.pink[500] : theme.color.ink[400],
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.color.ink[0],
          borderTopColor: theme.color.cream[200],
          borderTopWidth: 1,
          height: TAB_HEIGHT,
          paddingTop: 6,
          paddingBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/home.png")} label="홈" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/diary.png")} label="다이어리" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/community.png")} label="커뮤니티" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/ai_chat.png")} label="AI상담" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="hospital"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/mypage.png")} label="내정보" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
```

**핵심 변경:**
- `useWindowDimensions` 제거, `ICON_SIZE = 24` 고정.
- `chat`이 `href: null` 제거되어 노출됨.
- `hospital`이 `href: null`로 숨김(홈 그리드에서 진입).
- 색상/border 모두 토큰 적용.

- [ ] **Step 2: 홈 그리드 라우팅 확인**

`app/(tabs)/index.tsx`의 4그리드 중 "병원" 항목이 `/(tabs)/hospital`로 라우팅되는지 확인. expo-router는 `href: null`이어도 직접 push로 도달 가능.

```bash
grep -A 1 '"병원"' 'app/(tabs)/index.tsx'
```

Expected: `route: "/(tabs)/hospital"` 라인 보임.

- [ ] **Step 3: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected: 에러 0.

- [ ] **Step 4: Commit**

```bash
git add 'app/(tabs)/_layout.tsx'
git commit -m "feat(tabs): redesign tab bar — surface AI chat, hide hospital, fix sizes"
```

---

## Task 5: profile.tsx 마이그레이션

**Files:**
- Modify: `app/(tabs)/profile.tsx`

가장 단순한 화면. 패턴 검증 워밍업.

- [ ] **Step 1: 전체 교체**

`app/(tabs)/profile.tsx`를 다음으로 전체 교체:

```typescript
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
        {/* 프로필 카드 */}
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

        {/* 메뉴 */}
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
```

- [ ] **Step 2: 검증**

```bash
npx tsc --noEmit 2>&1 | tail -5
grep -nE '#[0-9A-Fa-f]{6}' 'app/(tabs)/profile.tsx' || echo "OK"
grep -nE '👤|✏️|💰' 'app/(tabs)/profile.tsx' || echo "NO DECORATIVE EMOJI"
```

Expected: TS 에러 0, "OK", "NO DECORATIVE EMOJI" (👶는 일러스트 슬롯 콘텐츠라 잡히지 않게 명시적 패턴).

- [ ] **Step 3: Commit**

```bash
git add 'app/(tabs)/profile.tsx'
git commit -m "feat(profile): migrate to design system — Card/EmptyState/ScreenHeader"
```

---

## Task 6: chat.tsx 마이그레이션

**Files:**
- Modify: `app/(tabs)/chat.tsx`
- Modify (선택적): `components/ChatBubble.tsx` (토큰 적용만, 별도 commit)

- [ ] **Step 1: chat.tsx 전체 교체**

`app/(tabs)/chat.tsx`를 다음으로 전체 교체:

```typescript
import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatBubble from "../../components/ChatBubble";
import { sendChatMessage, ChatMessage } from "../../lib/openai";
import { theme } from "../../constants/theme";
import { Chip, ScreenHeader } from "../../components/ui";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "임신 초기 주의사항이 뭐야?",
  "정부지원금 뭐 받을 수 있어?",
  "입덧 줄이는 방법 알려줘",
  "엽산은 언제까지 먹어야해?",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! 저는 베이비로그 AI 도우미예요\n\n임신, 출산, 육아에 관한 궁금한 점이 있으면 편하게 물어보세요! 정부지원금 정보도 알려드릴 수 있어요.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const chatHistory: ChatMessage[] = [...messages, userMessage]
      .filter((m) => m.id !== "welcome")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    const response = await sendChatMessage(chatHistory);

    const assistantMessage: DisplayMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }} edges={["top"]}>
      <ScreenHeader
        title="AI 상담"
        subtitle="임신·출산·육아 궁금한 건 뭐든 물어보세요"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble role={item.role} content={item.content} />
          )}
          contentContainerStyle={{ paddingVertical: theme.space[4] }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: theme.space[5],
              paddingBottom: theme.space[2],
            }}
          >
            <ActivityIndicator size="small" color={theme.color.pink[200]} />
            <Text
              style={{
                fontSize: theme.font.label.size,
                color: theme.color.ink[400],
                marginLeft: theme.space[2],
              }}
            >
              답변을 준비하고 있어요...
            </Text>
          </View>
        )}

        {/* 빠른 질문 칩 */}
        {messages.length <= 1 && (
          <View
            style={{
              paddingHorizontal: theme.space[4],
              paddingBottom: theme.space[2],
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.space[2],
            }}
          >
            {QUICK_QUESTIONS.map((q) => (
              <Chip key={q} color="primary" variant="solid" onPress={() => handleSend(q)}>
                {q}
              </Chip>
            ))}
          </View>
        )}

        {/* 입력창 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: theme.space[4],
            paddingVertical: theme.space[3],
            borderTopWidth: 1,
            borderTopColor: theme.color.cream[200],
            backgroundColor: theme.color.ink[0],
            gap: theme.space[2],
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="궁금한 걸 물어보세요..."
            placeholderTextColor={theme.color.ink[400]}
            multiline
            style={{
              flex: 1,
              backgroundColor: theme.color.bg,
              borderRadius: theme.radius.full,
              paddingHorizontal: theme.space[4],
              paddingVertical: theme.space[2] + 2,
              fontSize: theme.font.bodyLg.size,
              maxHeight: 100,
              color: theme.color.ink[900],
            }}
          />
          <Pressable
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
            style={({ pressed }) => [
              {
                backgroundColor: input.trim() ? theme.color.pink[500] : theme.color.pink[200],
                borderRadius: theme.radius.full,
                width: theme.iconBox.md,
                height: theme.iconBox.md,
                alignItems: "center",
                justifyContent: "center",
              },
              pressed && { opacity: theme.opacity.pressed },
            ]}
          >
            <Text style={{ color: theme.color.ink[0], fontSize: 18, fontWeight: "700" }}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: 검증**

```bash
npx tsc --noEmit 2>&1 | tail -5
grep -nE '#[0-9A-Fa-f]{6}' 'app/(tabs)/chat.tsx' || echo "OK"
grep -nE '💬|🤗|💰' 'app/(tabs)/chat.tsx' || echo "NO DECORATIVE EMOJI"
```

Expected: TS 0, "OK", "NO DECORATIVE EMOJI".

- [ ] **Step 3: Commit**

```bash
git add 'app/(tabs)/chat.tsx'
git commit -m "feat(chat): migrate to design system — Chip + ScreenHeader + tokens"
```

---

## Task 7: community.tsx 마이그레이션

**Files:**
- Modify: `app/(tabs)/community.tsx`

- [ ] **Step 1: 전체 교체**

`app/(tabs)/community.tsx`를 다음으로 전체 교체:

```typescript
import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ScrollView, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useCommunityStore, COMMUNITY_CATEGORIES, Post } from "../../stores/communityStore";
import { timeAgo } from "../../lib/utils";
import { theme } from "../../constants/theme";
import { Button, Card, Chip, EmptyState, ScreenHeader } from "../../components/ui";

const MOM_CAFES = [
  { name: "맘스홀릭 베이비", icon: "💛", url: "https://cafe.naver.com/imsanbu" },
  { name: "레몬테라스", icon: "🍋", url: "https://cafe.naver.com/remonterrace" },
  { name: "여성시대", icon: "👩", url: "https://cafe.naver.com/womangeneration" },
  { name: "쭉빵카페", icon: "🍼", url: "https://cafe.naver.com/jukbang" },
];

export default function CommunityScreen() {
  const router = useRouter();
  const { posts, loading, fetchPosts } = useCommunityStore();
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchPosts(category);
  }, [category]);

  const renderPost = useCallback(({ item }: { item: Post }) => {
    const cat = COMMUNITY_CATEGORIES.find((c) => c.key === item.category);

    return (
      <View style={{ paddingHorizontal: theme.space[5], marginBottom: theme.space[3] - 2 }}>
        <Card variant="default" onPress={() => router.push(`/community/${item.id}`)}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.space[3] - 2 }}>
            <View
              style={{
                width: theme.iconBox.sm + 4,
                height: theme.iconBox.sm + 4,
                borderRadius: (theme.iconBox.sm + 4) / 2,
                backgroundColor: theme.color.pink[100],
                alignItems: "center",
                justifyContent: "center",
                marginRight: theme.space[3] - 2,
              }}
            >
              <Text style={{ fontSize: 16 }}>👩</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: theme.font.body.size, fontWeight: "600", color: theme.color.ink[900] }}>
                {item.nickname}
              </Text>
              <Text style={{ fontSize: theme.font.caption.size, color: theme.color.ink[400] }}>
                {item.week_number ? `${item.week_number}주차 · ` : ""}{timeAgo(item.created_at)}
              </Text>
            </View>
            {cat && (
              <Chip color="primary" variant="solid">
                {cat.label}
              </Chip>
            )}
          </View>

          <Text
            style={{
              fontSize: theme.font.bodyLg.size,
              fontWeight: "600",
              color: theme.color.ink[900],
              marginBottom: theme.space[2] - 2,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={{ fontSize: theme.font.label.size, color: theme.color.ink[700], lineHeight: 19 }}
            numberOfLines={2}
          >
            {item.content}
          </Text>

          {(item as any).image_url && (
            <Image
              source={{ uri: (item as any).image_url }}
              style={{
                width: "100%",
                height: 160,
                borderRadius: theme.radius.md - 2,
                marginTop: theme.space[3] - 2,
              }}
              contentFit="cover"
            />
          )}

          <View
            style={{
              flexDirection: "row",
              marginTop: theme.space[3],
              paddingTop: theme.space[3] - 2,
              borderTopWidth: 1,
              borderTopColor: theme.color.cream[100],
              gap: theme.space[4],
            }}
          >
            <Text style={{ fontSize: theme.font.label.size, color: theme.color.ink[400] }}>
              ♡ {item.like_count}
            </Text>
            <Text style={{ fontSize: theme.font.label.size, color: theme.color.ink[400] }}>
              💬 {item.comment_count}
            </Text>
          </View>
        </Card>
      </View>
    );
  }, [router]);

  const ListHeader = (
    <View>
      {/* 맘카페 가로 스크롤 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.space[5],
          paddingBottom: theme.space[3] + 2,
          gap: theme.space[2] + 2,
        }}
      >
        {MOM_CAFES.map((cafe) => (
          <Pressable
            key={cafe.name}
            onPress={() => Linking.openURL(cafe.url)}
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.color.cream[100],
                borderRadius: theme.radius.md,
                paddingVertical: theme.space[2] + 2,
                paddingHorizontal: theme.space[3] + 2,
                gap: theme.space[2] - 2,
              },
              pressed && { opacity: theme.opacity.pressed },
            ]}
          >
            <Text style={{ fontSize: 16 }}>{cafe.icon}</Text>
            <Text
              style={{
                fontSize: theme.font.caption.size + 1,
                color: theme.color.ink[900],
                fontWeight: "600",
              }}
            >
              {cafe.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 카테고리 필터 칩 가로 스크롤 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.space[5],
          paddingBottom: theme.space[3] + 2,
          gap: theme.space[2],
        }}
      >
        {COMMUNITY_CATEGORIES.map((cat) => (
          <Chip
            key={cat.key}
            selected={category === cat.key}
            color="primary"
            onPress={() => setCategory(cat.key)}
          >
            {cat.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScreenHeader
        title="커뮤니티"
        rightAction={
          <Button size="sm" onPress={() => router.push("/community/write")}>
            + 글쓰기
          </Button>
        }
      />

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: theme.space[5], flexGrow: 1 }}
        refreshing={loading}
        onRefresh={() => fetchPosts(category)}
        ListEmptyComponent={
          <EmptyState
            illustration={<Text style={{ fontSize: 44 }}>🤰</Text>}
            title="아직 게시글이 없어요"
            description={"첫 번째 글을 작성해보세요!"}
            action={
              <Button variant="primary" onPress={() => router.push("/community/write")}>
                글쓰기
              </Button>
            }
          />
        }
      />
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: 검증**

```bash
npx tsc --noEmit 2>&1 | tail -5
grep -nE '#[0-9A-Fa-f]{6}' 'app/(tabs)/community.tsx' || echo "OK"
grep -nE '👩‍👩‍👧' 'app/(tabs)/community.tsx' || echo "NO DECORATIVE EMOJI IN HEADER"
```

Expected: TS 0, "OK", "NO DECORATIVE EMOJI IN HEADER" (맘카페 brand emoji와 게시글 댓글 💬는 콘텐츠).

- [ ] **Step 3: Commit**

```bash
git add 'app/(tabs)/community.tsx'
git commit -m "feat(community): migrate to design system — Card/Chip/EmptyState/ScreenHeader"
```

---

## Task 8: diary.tsx 마이그레이션 (Modal → Sheet 교체)

**Files:**
- Modify: `app/(tabs)/diary.tsx`

가장 큰 변경. 캘린더 + 이벤트 카드 + 모달 → Sheet 통합.

- [ ] **Step 1: 전체 교체**

`app/(tabs)/diary.tsx`를 다음으로 전체 교체:

```typescript
import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TextInput, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAuthStore } from "../../stores/authStore";
import { useDiaryStore, DiaryEntry } from "../../stores/diaryStore";
import { useEventStore, CalendarEvent, EventType } from "../../stores/eventStore";
import { EMOTIONS } from "../../constants/emotions";
import { calculatePregnancyWeek } from "../../lib/pregnancy";
import { theme } from "../../constants/theme";
import { Button, Card, Chip, EmptyState, ScreenHeader, Sheet } from "../../components/ui";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const EVENT_TYPES: {
  key: EventType;
  label: string;
  icon: string;
  quickItems: string[];
}[] = [
  { key: "hospital", label: "병원방문", icon: "🏥", quickItems: ["산부인과", "초음파", "혈액검사", "치과"] },
  { key: "checkup", label: "검진", icon: "🔬", quickItems: ["1차 기형아", "2차 기형아", "당뇨검사", "정밀초음파"] },
  { key: "symptom", label: "증상", icon: "🤒", quickItems: ["입덧", "두통", "허리통증", "부종", "피로"] },
  { key: "medicine", label: "영양제", icon: "💊", quickItems: ["엽산", "철분", "비타민D", "오메가3", "유산균"] },
];

const WEEK_RECOMMENDED: Record<EventType, Record<string, string[]>> = {
  medicine: {
    early: ["엽산", "비타민D", "유산균"],
    mid: ["철분", "비타민D", "오메가3", "칼슘"],
    late: ["철분", "오메가3", "칼슘", "비타민D"],
  },
  symptom: {
    early: ["입덧", "피로", "두통"],
    mid: ["허리통증", "부종", "소화불량"],
    late: ["허리통증", "부종", "불면", "배뭉침"],
  },
  hospital: {
    early: ["산부인과"],
    mid: ["산부인과", "초음파", "치과"],
    late: ["산부인과", "초음파"],
  },
  checkup: {
    early: ["1차 기형아"],
    mid: ["2차 기형아", "당뇨검사", "정밀초음파"],
    late: ["NST검사"],
  },
};

const POPULAR_ITEMS: Record<EventType, string[]> = {
  medicine: ["엽산", "철분", "비타민D", "오메가3", "유산균", "칼슘", "마그네슘", "종합비타민"],
  symptom: ["입덧", "두통", "허리통증", "부종", "피로", "소화불량", "불면", "배뭉침", "변비"],
  hospital: ["산부인과", "초음파", "혈액검사", "치과", "한의원"],
  checkup: ["1차 기형아", "2차 기형아", "당뇨검사", "정밀초음파", "NST검사"],
};

const EVENT_COLORS: Record<EventType, "hospital" | "checkup" | "symptom" | "medicine"> = {
  hospital: "hospital",
  checkup: "checkup",
  symptom: "symptom",
  medicine: "medicine",
};

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }
function formatDate(y: number, m: number, d: number) { return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }

export default function DiaryScreen() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const { entries, fetchEntries } = useDiaryStore();
  const { events, fetchEvents, createEvent, deleteEvent } = useEventStore();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(formatDate(today.getFullYear(), today.getMonth(), today.getDate()));

  const [showSheet, setShowSheet] = useState(false);
  const [modalType, setModalType] = useState<EventType>("hospital");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [memoText, setMemoText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  useEffect(() => {
    if (user) { fetchEntries(user.id); fetchEvents(user.id); }
  }, [user]);

  const dateMap = useMemo(() => {
    const map: Record<string, { diary?: DiaryEntry; events: CalendarEvent[] }> = {};
    entries.forEach((entry) => { if (!map[entry.date]) map[entry.date] = { events: [] }; map[entry.date].diary = entry; });
    events.forEach((evt) => { if (!map[evt.date]) map[evt.date] = { events: [] }; map[evt.date].events.push(evt); });
    return map;
  }, [entries, events]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentYear, currentMonth]);

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedData = dateMap[selectedDate];

  const prevMonth = () => { if (currentMonth === 0) { setCurrentYear(currentYear - 1); setCurrentMonth(11); } else setCurrentMonth(currentMonth - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentYear(currentYear + 1); setCurrentMonth(0); } else setCurrentMonth(currentMonth + 1); };

  const getDotsForDate = (dateStr: string): { colors: string[]; hasPhoto: boolean } => {
    const data = dateMap[dateStr];
    if (!data) return { colors: [], hasPhoto: false };
    const dots: string[] = [];
    let hasPhoto = false;
    if (data.diary) {
      dots.push(theme.color.pink[500]);
      if (data.diary.photos && data.diary.photos.length > 0) hasPhoto = true;
    }
    const seen = new Set<string>();
    data.events.forEach((e) => {
      if (!seen.has(e.type)) {
        dots.push(theme.color.semantic[EVENT_COLORS[e.type]]);
        seen.add(e.type);
      }
    });
    return { colors: dots.slice(0, 4), hasPhoto };
  };

  const weekStage = useMemo(() => {
    if (!profile?.due_date) return "early";
    const { weeks } = calculatePregnancyWeek(profile.due_date);
    if (weeks < 16) return "early";
    if (weeks < 28) return "mid";
    return "late";
  }, [profile]);

  const getOrderedChips = (type: EventType): { label: string; tag: "frequent" | "recommended" | "popular" }[] => {
    const seen = new Set<string>();
    const result: { label: string; tag: "frequent" | "recommended" | "popular" }[] = [];

    const counts: Record<string, number> = {};
    events.filter((e) => e.type === type).forEach((e) => { counts[e.title] = (counts[e.title] || 0) + 1; });
    const frequent = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t]) => t);
    for (const item of frequent) {
      if (!seen.has(item)) { result.push({ label: item, tag: "frequent" }); seen.add(item); }
    }

    const recommended = WEEK_RECOMMENDED[type]?.[weekStage] || [];
    for (const item of recommended) {
      if (!seen.has(item)) { result.push({ label: item, tag: "recommended" }); seen.add(item); }
    }

    const popular = POPULAR_ITEMS[type] || [];
    for (const item of popular) {
      if (!seen.has(item)) { result.push({ label: item, tag: "popular" }); seen.add(item); }
    }

    return result;
  };

  const openSheet = (type: EventType) => {
    setModalType(type);
    setMemoText("");
    setShowCustomInput(false);
    setCustomTitle("");
    const existing = new Set<string>();
    selectedData?.events.filter((e) => e.type === type).forEach((e) => existing.add(e.title));
    setCheckedItems(existing);
    setShowSheet(true);
  };

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    const hasCustom = customTitle.trim().length > 0;
    if (checkedItems.size === 0 && !hasCustom) {
      Alert.alert("알림", "항목을 선택하거나 직접 입력해주세요");
      return;
    }
    const existingEvts = selectedData?.events.filter((e) => e.type === modalType) || [];
    for (const evt of existingEvts) {
      await deleteEvent(evt.id);
    }
    const memo = memoText.trim();
    for (const item of checkedItems) {
      await createEvent({ userId: user.id, date: selectedDate, type: modalType, title: item, memo });
    }
    if (hasCustom) {
      await createEvent({ userId: user.id, date: selectedDate, type: modalType, title: customTitle.trim(), memo });
    }
    setShowSheet(false);
  };

  const evtTypeInfo = EVENT_TYPES.find((t) => t.key === modalType);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScreenHeader
        title="다이어리"
        rightAction={
          <Button size="sm" onPress={() => router.push("/diary/write")}>
            + 일기
          </Button>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.space[8] }}>
        {/* 캘린더 */}
        <View style={{ paddingHorizontal: theme.space[5], marginBottom: theme.space[4] }}>
          <Card variant="default" padding={theme.space[5] - 2}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.space[4] }}>
              <Pressable onPress={prevMonth} hitSlop={8} style={{ padding: theme.space[2] }}>
                <Text style={{ fontSize: 20, color: theme.color.ink[400] }}>‹</Text>
              </Pressable>
              <Text style={{ fontSize: theme.font.heading.size, fontWeight: "700", color: theme.color.ink[900] }}>
                {currentYear}년 {currentMonth + 1}월
              </Text>
              <Pressable onPress={nextMonth} hitSlop={8} style={{ padding: theme.space[2] }}>
                <Text style={{ fontSize: 20, color: theme.color.ink[400] }}>›</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", marginBottom: theme.space[2] }}>
              {WEEKDAYS.map((day, i) => (
                <View key={day} style={{ flex: 1, alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: theme.font.caption.size,
                      fontWeight: "600",
                      color: i === 0 ? theme.color.pink[500] : i === 6 ? theme.color.semantic.hospital : theme.color.ink[400],
                    }}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {calendarDays.map((day, index) => {
                if (day === null) return <View key={`e-${index}`} style={{ width: "14.28%", height: 50 }} />;
                const dateStr = formatDate(currentYear, currentMonth, day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const { colors: dots, hasPhoto } = getDotsForDate(dateStr);
                const dayOfWeek = (getFirstDayOfMonth(currentYear, currentMonth) + day - 1) % 7;
                return (
                  <Pressable
                    key={day}
                    onPress={() => setSelectedDate(dateStr)}
                    style={{ width: "14.28%", height: 46, alignItems: "center", justifyContent: "flex-start", paddingTop: 2 }}
                  >
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: isSelected ? theme.color.pink[500] : isToday ? theme.color.pink[100] : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.font.label.size,
                          fontWeight: isToday || isSelected ? "700" : "400",
                          color: isSelected
                            ? theme.color.ink[0]
                            : isToday
                            ? theme.color.pink[500]
                            : dayOfWeek === 0
                            ? theme.color.pink[500]
                            : dayOfWeek === 6
                            ? theme.color.semantic.hospital
                            : theme.color.ink[900],
                        }}
                      >
                        {day}
                      </Text>
                    </View>
                    {(dots.length > 0 || hasPhoto) && (
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                        {hasPhoto && <Text style={{ fontSize: 6, marginRight: 1 }}>📷</Text>}
                        {dots.map((color, i) => (
                          <View
                            key={i}
                            style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginHorizontal: 0.5 }}
                          />
                        ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </View>

        {/* 선택된 날짜의 기록 */}
        <View style={{ paddingHorizontal: theme.space[5] }}>
          <Text
            style={{
              fontSize: theme.font.heading.size,
              fontWeight: "700",
              color: theme.color.ink[900],
              marginBottom: theme.space[3] + 2,
            }}
          >
            {selectedDate.slice(5).replace("-", ".")}
          </Text>

          {/* 일기 */}
          {selectedData?.diary && (
            <View style={{ marginBottom: theme.space[3] }}>
              <Card variant="default" onPress={() => router.push(`/diary/${selectedData.diary!.id}`)} padding={0}>
                {selectedData.diary.photos && selectedData.diary.photos.length > 0 && (
                  <View>
                    {selectedData.diary.photos.length === 1 ? (
                      <Image
                        source={{ uri: selectedData.diary.photos[0].photo_url }}
                        style={{ width: "100%", height: 180 }}
                        contentFit="cover"
                      />
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 140 }}>
                        {selectedData.diary.photos.map((photo) => (
                          <Image
                            key={photo.id}
                            source={{ uri: photo.photo_url }}
                            style={{ width: 180, height: 140, marginRight: 2 }}
                            contentFit="cover"
                          />
                        ))}
                      </ScrollView>
                    )}
                  </View>
                )}
                <View style={{ padding: theme.space[4] }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.space[2] }}>
                    <Text style={{ fontSize: 28, marginRight: theme.space[2] + 2 }}>
                      {EMOTIONS.find((e) => e.key === selectedData.diary!.emotion)?.emoji || ""}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: theme.font.body.size, fontWeight: "700", color: theme.color.ink[900] }}>
                        {EMOTIONS.find((e) => e.key === selectedData.diary!.emotion)?.label || "일기"}
                      </Text>
                      <Text style={{ fontSize: theme.font.caption.size, color: theme.color.pink[400] }}>
                        {selectedData.diary.week_number}주차
                      </Text>
                    </View>
                  </View>
                  {selectedData.diary.content && (
                    <Text
                      style={{ fontSize: theme.font.label.size, color: theme.color.ink[700], lineHeight: 20 }}
                      numberOfLines={3}
                    >
                      {selectedData.diary.content}
                    </Text>
                  )}
                </View>
              </Card>
            </View>
          )}

          {/* 이벤트 카드 4종 */}
          {EVENT_TYPES.map((evtType) => {
            const typeEvents = selectedData?.events.filter((e) => e.type === evtType.key) || [];
            const hasEvents = typeEvents.length > 0;
            const memo = typeEvents.find((e) => e.memo)?.memo;

            return (
              <View key={evtType.key} style={{ marginBottom: theme.space[2] + 2 }}>
                <Card variant="default" onPress={() => openSheet(evtType.key)}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: hasEvents ? theme.space[2] + 2 : 0 }}>
                    <View
                      style={{
                        width: theme.iconBox.sm,
                        height: theme.iconBox.sm,
                        borderRadius: theme.radius.md - 2,
                        backgroundColor: theme.color.tint[EVENT_COLORS[evtType.key]],
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: theme.space[3] - 2,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{evtType.icon}</Text>
                    </View>
                    <Text
                      style={{
                        fontSize: theme.font.body.size,
                        fontWeight: "600",
                        color: theme.color.ink[900],
                        flex: 1,
                      }}
                    >
                      {evtType.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.font.caption.size + 1,
                        color: hasEvents ? theme.color.semantic[EVENT_COLORS[evtType.key]] : theme.color.cream[300],
                        fontWeight: "600",
                      }}
                    >
                      {hasEvents ? "수정" : "+ 추가"}
                    </Text>
                  </View>

                  {hasEvents && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.space[2] - 2 }}>
                      {typeEvents.map((evt) => (
                        <Chip key={evt.id} color={EVENT_COLORS[evtType.key]} variant="solid">
                          {evt.title}
                        </Chip>
                      ))}
                    </View>
                  )}

                  {memo && (
                    <Text style={{ fontSize: theme.font.caption.size + 1, color: theme.color.ink[400], marginTop: theme.space[1] }}>
                      📝 {memo}
                    </Text>
                  )}
                </Card>
              </View>
            );
          })}

          {!selectedData?.diary && (
            <View style={{ marginTop: theme.space[1] }}>
              <Button variant="primary" fullWidth onPress={() => router.push("/diary/write")}>
                일기 쓰기
              </Button>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 이벤트 체크 Sheet */}
      <Sheet visible={showSheet} onClose={() => setShowSheet(false)}>
        <Sheet.Header
          title={`${evtTypeInfo?.icon || ""} ${evtTypeInfo?.label || ""}`}
          subtitle={`${selectedDate.replace(/-/g, ".")} · 해당하는 항목을 체크하세요`}
        />
        <Sheet.Content>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.space[2] }}>
            {getOrderedChips(modalType).map(({ label: item }) => (
              <Chip
                key={item}
                selected={checkedItems.has(item)}
                color={EVENT_COLORS[modalType]}
                onPress={() => toggleItem(item)}
              >
                {item}
              </Chip>
            ))}
            <Chip
              variant="dashed"
              color="neutral"
              selected={showCustomInput}
              onPress={() => setShowCustomInput(!showCustomInput)}
            >
              + 직접입력
            </Chip>
          </View>

          {showCustomInput && (
            <TextInput
              value={customTitle}
              onChangeText={setCustomTitle}
              placeholder="항목명을 입력하세요"
              placeholderTextColor={theme.color.cream[300]}
              autoFocus
              style={{
                backgroundColor: theme.color.ink[0],
                borderRadius: theme.radius.md,
                padding: theme.space[3] + 2,
                fontSize: theme.font.body.size,
                color: theme.color.ink[900],
                marginTop: theme.space[2],
              }}
            />
          )}

          <TextInput
            value={memoText}
            onChangeText={setMemoText}
            placeholder="메모 남기기 (선택) 예: 엽산 800μg 복용"
            placeholderTextColor={theme.color.cream[300]}
            style={{
              backgroundColor: theme.color.ink[0],
              borderRadius: theme.radius.md,
              padding: theme.space[3] + 2,
              fontSize: theme.font.body.size,
              color: theme.color.ink[900],
              marginTop: theme.space[2],
            }}
          />
        </Sheet.Content>
        <Sheet.Footer>
          <Button variant="primary" fullWidth onPress={handleSave}>
            저장하기
          </Button>
        </Sheet.Footer>
      </Sheet>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: 검증**

```bash
npx tsc --noEmit 2>&1 | tail -5
grep -nE '#[0-9A-Fa-f]{6}' 'app/(tabs)/diary.tsx' || echo "OK"
grep -nE '📖|👶' 'app/(tabs)/diary.tsx' || echo "NO DECORATIVE EMOJI"
```

Expected: TS 0, "OK". 이벤트 카드 icon emoji(🏥💊 등)는 카테고리 콘텐츠라 OK.

- [ ] **Step 3: Sheet 동작 시각 확인**

브라우저(`http://localhost:8081`) 또는 시뮬레이터에서:
- 다이어리 → 이벤트 카드 탭 → Sheet 올라옴
- 핸들 드래그 다운 → Sheet 닫힘
- 백드롭 탭 → 닫힘
- 칩 토글, 직접입력, 메모, 저장 모두 동작

- [ ] **Step 4: Commit**

```bash
git add 'app/(tabs)/diary.tsx'
git commit -m "feat(diary): migrate to design system + replace Modal with Sheet"
```

---

## Task 9: hospital.tsx 마이그레이션

**Files:**
- Modify: `app/(tabs)/hospital.tsx`

가장 큰 화면(520줄). 비즈니스 로직 변경 금지, 토큰화만.

- [ ] **Step 1: 현재 hospital.tsx 구조 파악**

```bash
head -60 'app/(tabs)/hospital.tsx'
```

주요 섹션 식별: 헤더, 검색, 카테고리 필터, 즐겨찾기, 리스트, 네이버 연동.

- [ ] **Step 2: 마이그레이션 패턴 적용**

다음 변환을 전체 파일에 적용:

(a) 최상단:
```typescript
// import 추가
import { theme } from "../../constants/theme";
import { Button, Card, Chip, EmptyState, ScreenHeader } from "../../components/ui";
```

(b) 헤더:
```tsx
// Before: <View>...{이모지+타이틀}</View>
// After:
<ScreenHeader title="산부인과" />
```

(c) hex 색상 일괄 교체:
| Before | After |
|---|---|
| `#FFF8F0` | `theme.color.bg` |
| `#FFFFFF` | `theme.color.ink[0]` |
| `#FF6B81` | `theme.color.pink[500]` |
| `#FFB5C2` | `theme.color.pink[400]` |
| `#FFD6DE` | `theme.color.pink[200]` |
| `#FFF0F3` | `theme.color.pink[100]` |
| `#FFE5E5` | `theme.color.pink[100]` |
| `#2D2D2D` | `theme.color.ink[900]` |
| `#6B6B6B` | `theme.color.ink[700]` |
| `#9B9B9B` | `theme.color.ink[400]` |
| `#D0D0D0` | `theme.color.cream[300]` |
| `#F5F5F5` | `theme.color.cream[100]` |
| `#EEEEEE` | `theme.color.cream[200]` |
| `#64B5F6` | `theme.color.semantic.hospital` |

(d) 폰트 사이즈:
| Before | After |
|---|---|
| `fontSize: 22` (헤더) | (이미 ScreenHeader에서 처리) |
| `fontSize: 14` | `theme.font.body.size` |
| `fontSize: 13` | `theme.font.label.size` |
| `fontSize: 12` | `theme.font.caption.size + 1` |
| `fontSize: 11` | `theme.font.caption.size` |
| `fontSize: 16` (카드 제목) | `theme.font.heading.size - 1` 또는 `theme.font.heading.size` |

(e) 라운드:
| Before | After |
|---|---|
| `borderRadius: 12` | `theme.radius.md` |
| `borderRadius: 14` | `theme.radius.md + 2` |
| `borderRadius: 16` | `theme.radius.lg` |
| `borderRadius: 20` | `theme.radius.full` (작은 칩이면) 또는 `theme.radius.xl - 4` |

(f) 카테고리 필터: `<TouchableOpacity>` chip → `<Chip selected={...} color="primary">`

(g) 카드: `<TouchableOpacity style={{ backgroundColor: "#FFFFFF", borderRadius: 16 ...}}>` → `<Card variant="default" onPress={...}>`

(h) 빈 결과: 인라인 → `<EmptyState>`

(i) 모든 inline 버튼 → `<Button>` 적용 (저장, 검색, 액션 버튼 등). 단 작은 아이콘 버튼(즐겨찾기 별표 등)은 inline + Pressable 유지.

(j) 이모지: 헤더에 `🏥` 등 있으면 제거. 카테고리/타입 식별용 이모지(병원 종류 구분 등)는 콘텐츠라 유지 가능.

- [ ] **Step 3: 검증**

```bash
npx tsc --noEmit 2>&1 | tail -5
grep -nE '#[0-9A-Fa-f]{6}' 'app/(tabs)/hospital.tsx' || echo "OK"
```

Expected: TS 0, "OK".

- [ ] **Step 4: 비즈니스 로직 보존 확인**

```bash
grep -nE 'fetchHospitals|favoriteHospital|toggleFavorite|searchHospitals|Linking.openURL' 'app/(tabs)/hospital.tsx' | head
```

기존 로직 함수 호출이 모두 보존되어야 함.

- [ ] **Step 5: 시각 확인**

시뮬레이터/웹: 검색 / 카테고리 / 즐겨찾기 / 네이버 링크 모두 동작.

- [ ] **Step 6: Commit**

```bash
git add 'app/(tabs)/hospital.tsx'
git commit -m "feat(hospital): migrate to design system — Card/Chip/EmptyState"
```

---

## Task 10: 최종 수락 기준 검증

**Files:** 없음 (검증만)

- [ ] **Step 1: 토큰 신규 항목 존재 확인**

```bash
grep -E "hero|bodyLg|iconBox|opacity|scrim" constants/theme.ts | head
```

Expected: 5개 모두 보임.

- [ ] **Step 2: Button onAccent 존재 확인**

```bash
grep -E "onAccent" components/ui/Button.tsx
```

Expected: type 정의 + case 모두 보임.

- [ ] **Step 3: 5개 탭 화면 모두 ScreenHeader 사용 확인**

```bash
for f in 'app/(tabs)/profile.tsx' 'app/(tabs)/chat.tsx' 'app/(tabs)/community.tsx' 'app/(tabs)/diary.tsx' 'app/(tabs)/hospital.tsx'; do
  grep -q "ScreenHeader" "$f" && echo "$f: OK" || echo "$f: MISSING"
done
```

Expected: 5개 모두 "OK".

- [ ] **Step 4: hex 하드코딩 없음 확인**

```bash
grep -nE '#[0-9A-Fa-f]{6}' app/'(tabs)'/*.tsx | grep -v "// " || echo "NO HARDCODED HEX"
```

Expected: "NO HARDCODED HEX".

- [ ] **Step 5: 헤더 장식 이모지 없음 확인**

```bash
for f in 'app/(tabs)/profile.tsx' 'app/(tabs)/chat.tsx' 'app/(tabs)/community.tsx' 'app/(tabs)/diary.tsx' 'app/(tabs)/hospital.tsx'; do
  head -50 "$f" | grep -qE "title=\"[^\"]*[👤💬👩📖🏥]" && echo "$f: HAS EMOJI" || echo "$f: OK"
done
```

Expected: 5개 모두 "OK".

- [ ] **Step 6: 다이어리 Sheet 사용 확인**

```bash
grep -E "<Sheet|Sheet\." 'app/(tabs)/diary.tsx' | head -5
```

Expected: `<Sheet visible={...}>`, `<Sheet.Header>`, `<Sheet.Content>`, `<Sheet.Footer>` 모두 보임.

- [ ] **Step 7: Chip 두 곳 이상 사용 확인**

```bash
grep -l "<Chip" app/'(tabs)'/*.tsx | wc -l
```

Expected: 2 이상 (diary + community 최소).

- [ ] **Step 8: 탭바 변경 확인**

```bash
grep -E "name=\"chat\"|name=\"hospital\"|ICON_SIZE" 'app/(tabs)/_layout.tsx'
```

Expected: chat 탭이 `href: null` 없이 노출, hospital이 `href: null`로 숨김, ICON_SIZE 상수 존재.

- [ ] **Step 9: TypeScript 전체 통과**

```bash
npx tsc --noEmit
```

Expected: 종료 코드 0.

- [ ] **Step 10: 시뮬레이터/웹 시각 확인 — 5개 탭 + 다이어리 Sheet**

```bash
npx expo start --web
```

브라우저에서:
- [ ] 탭바: 홈/다이어리/커뮤니티/AI상담/내정보 5탭 노출. 산부인과 탭 없음.
- [ ] 홈: 일기 영웅 카드의 "일기 쓰기" 버튼이 `Button onAccent` 스타일.
- [ ] 다이어리: 이벤트 카드 탭 → Sheet 올라옴 → 핸들 드래그 다운으로 닫힘.
- [ ] 커뮤니티: 카테고리 칩 가로 스크롤 동작, 게시글 Card 그림자 통일.
- [ ] AI상담: 빠른 질문 칩 표시 + 탭하면 즉시 전송.
- [ ] 내정보: 프로필 카드, 메뉴, 로그아웃 버튼 동작.
- [ ] 산부인과: 홈 그리드 4번째 슬롯에서 진입 가능.

---

## Out of Scope (Phase 2B / 3)

- **Phase 2B**: sub-screens 일괄 마이그레이션 (login/profile-setup/tips/nutrition/youtube/write/[id] 화면들)
- **Phase 3**: 햅틱, Toast, EmptyState SVG 일러스트, 캘린더 셀/도트 재설계, 주차별 SVG 풀세트, 중앙 FAB AI상담 옵션
