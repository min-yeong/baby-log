# Baby-Log Phase 1: 디자인 시스템 + 홈 개편 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 베이비로그에 디자인 토큰 + 7개 코어 UI 컴포넌트 + 일러스트 1개를 도입하고, 홈 화면을 Action First 레이아웃으로 재작성한다.

**Architecture:** `constants/theme.ts` 단일 토큰 소스, `components/ui/` 하위에 컴포넌트 7종을 StyleSheet 기반으로 작성. NativeWind 의존성 제거. 홈 화면(`app/(tabs)/index.tsx`)만 새 시스템으로 재작성하고 다른 화면은 Phase 2로 이연.

**Tech Stack:** React Native 0.83, Expo 55 (canary), expo-router, expo-image, react-native-gesture-handler 2.30, TypeScript 5.9. (Jest 미설치 → UI 검증은 TS 타입체크 + 시뮬레이터 시각 확인으로)

**Spec:** `docs/superpowers/specs/2026-04-26-baby-log-phase1-design.md`

---

## File Structure

**신규 생성:**
- `constants/theme.ts` — 단일 토큰 소스 (color/font/space/radius/shadow)
- `components/ui/Button.tsx` — variant × size × loading/disabled
- `components/ui/Card.tsx` — default/flat/accent
- `components/ui/Chip.tsx` — selected/outline/dashed × semantic colors
- `components/ui/ScreenHeader.tsx` — default/large
- `components/ui/EmptyState.tsx` — illustration + title + desc + action
- `components/ui/SkeletonCard.tsx` — 로딩 펄스
- `components/ui/Sheet.tsx` — BottomSheet + Header/Content/Footer 서브컴포넌트
- `components/ui/index.ts` — 배럴 export
- `components/illustrations/BabyGrowth.tsx` — 주차별 일러스트 컴포넌트 (Phase 1은 emoji 베이스, Phase 3에서 SVG 교체)
- `lib/babySize.ts` — `getWeekEmoji(weeks)` 헬퍼

**수정:**
- `app/(tabs)/index.tsx` — Action First 레이아웃으로 재작성
- `package.json` — nativewind/tailwindcss/react-native-css-interop 제거
- `.gitignore` — 이미 처리됨

**삭제:**
- `tailwind.config.js`
- `nativewind-env.d.ts`
- `global.css` (사용처 없음 확인 후)

**유지 (Phase 2 이연):**
- `app/(tabs)/diary.tsx`, `community.tsx`, `hospital.tsx`, `profile.tsx`, `chat.tsx`
- `app/login.tsx`, `profile-setup.tsx`, 기타 모든 sub-screen
- 기존 `components/` 하위 (SupportCard, AnimatedSplash, EmotionPicker, ChatBubble, FloatingTabBar, WeekBanner, PhotoGrid)

---

## Task 0: 사전 검증

**Files:** 없음 (확인만)

- [ ] **Step 1: NativeWind 사용처 확인**

```bash
grep -rn "className=" app components 2>/dev/null
grep -rn "from \"nativewind\"" app components stores lib 2>/dev/null
```

Expected: 빈 결과 (사용처 없음). 결과가 있으면 해당 파일을 inline style + 토큰으로 교체하는 task가 추가로 필요.

- [ ] **Step 2: Expo dev 서버 동작 확인**

```bash
cd /Users/min-yeong/Desktop/project/baby-log
npx expo start --web 2>&1 | head -10 &
```

Expected: "Waiting on http://localhost:8081" 출력. 서버는 종료해도 됨.

- [ ] **Step 3: TypeScript 베이스라인 확인**

```bash
npx tsc --noEmit 2>&1 | tail -20
```

Expected: 에러 0 또는 기존 에러 목록 (수정 작업 후 비교 기준).

---

## Task 1: NativeWind 의존성 제거

**Files:**
- Modify: `package.json`
- Delete: `tailwind.config.js`, `nativewind-env.d.ts`, `global.css`
- Modify: `index.ts` (global.css import 있으면 제거)

- [ ] **Step 1: global.css import 사용처 확인**

```bash
grep -rn "global.css" app components stores lib index.ts 2>/dev/null
```

Expected: import 위치 식별. 보통 `index.ts`에 있을 것.

- [ ] **Step 2: package.json에서 NativeWind 관련 의존성 제거**

`package.json`의 dependencies에서 다음 3개 라인 삭제:
```json
"nativewind": "^4.2.3",
"tailwindcss": "^3.4.19",
"react-native-css-interop": "^0.2.3",
```

- [ ] **Step 3: 설정 파일 + global.css 삭제**

```bash
rm -f tailwind.config.js nativewind-env.d.ts global.css
```

- [ ] **Step 4: index.ts에서 `import "./global.css"` 라인 있으면 제거**

`index.ts`를 읽고 해당 import 라인 삭제.

- [ ] **Step 5: 의존성 재설치**

```bash
npm install
```

Expected: 정상 완료. 경고는 있어도 에러 없어야 함.

- [ ] **Step 6: 빌드 확인**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected: 새 에러 없음 (베이스라인 대비).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json index.ts
git rm -f tailwind.config.js nativewind-env.d.ts global.css 2>/dev/null || true
git commit -m "chore: remove unused nativewind/tailwind deps"
```

---

## Task 2: 디자인 토큰 추가 (`constants/theme.ts`)

**Files:**
- Create: `constants/theme.ts`

- [ ] **Step 1: theme.ts 작성**

```typescript
// constants/theme.ts
import { Platform } from "react-native";

export const theme = {
  color: {
    pink: {
      50: "#FFF5F8",
      100: "#FFE5EC",
      200: "#FFC2D1",
      400: "#FF8FA3",
      500: "#FF4D6D",
      600: "#D63A57",
    },
    cream: {
      50: "#FAF5EE",
      100: "#F5EDE0",
      200: "#E8D5C4",
      300: "#C8B8A8",
      400: "#A8907E",
    },
    ink: {
      0: "#FFFFFF",
      50: "#F5F1EB",
      400: "#8B7E73",
      700: "#5C5048",
      900: "#3D3530",
    },
    semantic: {
      hospital: "#64B5F6",
      checkup: "#81C784",
      symptom: "#FFB74D",
      medicine: "#BA68C8",
      danger: "#E57373",
    },
    bg: "#FAF5EE",
  },
  font: {
    display: { size: 32, weight: "800" as const, lineHeight: 38 },
    title: { size: 22, weight: "700" as const, lineHeight: 28 },
    heading: { size: 17, weight: "700" as const, lineHeight: 22 },
    body: { size: 14, weight: "400" as const, lineHeight: 20 },
    label: { size: 13, weight: "600" as const, lineHeight: 18 },
    caption: { size: 11, weight: "400" as const, lineHeight: 15 },
    overline: { size: 10, weight: "700" as const, lineHeight: 14, letterSpacing: 0.5 },
  },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  shadow: {
    none: Platform.select({
      ios: { shadowColor: "transparent", shadowOpacity: 0 },
      android: { elevation: 0 },
      default: {},
    })!,
    sm: Platform.select({
      ios: {
        shadowColor: "#3D3530",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    })!,
    md: Platform.select({
      ios: {
        shadowColor: "#3D3530",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
      },
      android: { elevation: 6 },
      default: {},
    })!,
  },
} as const;

export type Theme = typeof theme;
export type SemanticColor = keyof typeof theme.color.semantic;
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "constants/theme" || echo "OK"
```

Expected: "OK" 출력.

- [ ] **Step 3: Commit**

```bash
git add constants/theme.ts
git commit -m "feat(ui): add design tokens (color/font/space/radius/shadow)"
```

---

## Task 3: Button 컴포넌트

**Files:**
- Create: `components/ui/Button.tsx`

- [ ] **Step 1: Button.tsx 작성**

```typescript
// components/ui/Button.tsx
import { ReactNode } from "react";
import { Pressable, Text, ActivityIndicator, StyleSheet, View, ViewStyle, TextStyle } from "react-native";
import { theme } from "../../constants/theme";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress?: () => void;
  children: ReactNode;
}

const sizeMap: Record<Size, { padV: number; padH: number; font: number; radius: number }> = {
  sm: { padV: theme.space[2], padH: theme.space[3], font: 13, radius: theme.radius.md },
  md: { padV: theme.space[3] + 2, padH: theme.space[5] + 2, font: 15, radius: theme.radius.md },
  lg: { padV: theme.space[4] + 2, padH: theme.space[6] + 4, font: 16, radius: theme.radius.lg - 2 },
};

function getColors(variant: Variant, disabled: boolean) {
  if (disabled) return { bg: theme.color.pink[200], fg: theme.color.ink[400], border: "transparent" };
  switch (variant) {
    case "primary":
      return { bg: theme.color.pink[500], fg: theme.color.ink[0], border: "transparent" };
    case "secondary":
      return { bg: theme.color.ink[0], fg: theme.color.pink[500], border: theme.color.pink[500] };
    case "ghost":
      return { bg: "transparent", fg: theme.color.ink[900], border: "transparent" };
    case "dark":
      return { bg: theme.color.ink[900], fg: theme.color.ink[0], border: "transparent" };
  }
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
}: ButtonProps) {
  const s = sizeMap[size];
  const c = getColors(variant, disabled);
  const isInteractive = !disabled && !loading;

  const containerStyle: ViewStyle = {
    backgroundColor: c.bg,
    borderColor: c.border,
    borderWidth: variant === "secondary" ? 1.5 : 0,
    borderRadius: s.radius,
    paddingVertical: variant === "secondary" ? s.padV - 1.5 : s.padV,
    paddingHorizontal: variant === "secondary" ? s.padH - 1.5 : s.padH,
    alignSelf: fullWidth ? "stretch" : "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  };

  const textStyle: TextStyle = {
    color: c.fg,
    fontSize: s.font,
    fontWeight: "700",
  };

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      style={({ pressed }) => [containerStyle, pressed && isInteractive && { opacity: 0.85 }]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} size="small" />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text style={textStyle}>{children}</Text>
          {rightIcon && <View>{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "Button" || echo "OK"
```

Expected: "OK".

- [ ] **Step 3: Commit**

```bash
git add components/ui/Button.tsx
git commit -m "feat(ui): add Button component"
```

---

## Task 4: Card 컴포넌트

**Files:**
- Create: `components/ui/Card.tsx`

- [ ] **Step 1: Card.tsx 작성**

```typescript
// components/ui/Card.tsx
import { ReactNode } from "react";
import { Pressable, View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../constants/theme";

type Variant = "default" | "flat" | "accent";

interface CardProps {
  variant?: Variant;
  onPress?: () => void;
  padding?: number;
  style?: ViewStyle;
  children: ReactNode;
}

export function Card({
  variant = "default",
  onPress,
  padding = theme.space[4],
  style,
  children,
}: CardProps) {
  const baseStyle: ViewStyle = {
    borderRadius: theme.radius.lg,
    padding,
    overflow: "hidden",
  };

  const variantStyle: ViewStyle =
    variant === "default"
      ? { backgroundColor: theme.color.ink[0], ...theme.shadow.sm }
      : variant === "flat"
      ? { backgroundColor: theme.color.ink[0], borderWidth: 1, borderColor: theme.color.cream[200] }
      : { backgroundColor: "transparent" };

  const merged = [baseStyle, variantStyle, style];

  if (variant === "accent") {
    const inner = (
      <LinearGradient
        colors={[theme.color.pink[200], theme.color.pink[400]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[baseStyle, { borderRadius: theme.radius.lg }, style]}
      >
        {children}
      </LinearGradient>
    );
    return onPress ? (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
        {inner}
      </Pressable>
    ) : (
      inner
    );
  }

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [merged, pressed && { opacity: 0.9 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={merged}>{children}</View>;
}
```

- [ ] **Step 2: expo-linear-gradient 의존성 확인 및 설치**

```bash
node -e "console.log(require('./package.json').dependencies['expo-linear-gradient'] || 'MISSING')"
```

Expected: 버전 출력 또는 "MISSING".

만약 MISSING이면:
```bash
npx expo install expo-linear-gradient
```

- [ ] **Step 3: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "Card" || echo "OK"
```

Expected: "OK".

- [ ] **Step 4: Commit**

```bash
git add components/ui/Card.tsx package.json package-lock.json
git commit -m "feat(ui): add Card component"
```

---

## Task 5: Chip 컴포넌트

**Files:**
- Create: `components/ui/Chip.tsx`

- [ ] **Step 1: Chip.tsx 작성**

```typescript
// components/ui/Chip.tsx
import { ReactNode } from "react";
import { Pressable, Text, ViewStyle, TextStyle } from "react-native";
import { theme, SemanticColor } from "../../constants/theme";

type ChipColor = "primary" | SemanticColor | "neutral";
type ChipVariant = "solid" | "outline" | "dashed";

interface ChipProps {
  selected?: boolean;
  color?: ChipColor;
  variant?: ChipVariant;
  onPress?: () => void;
  children: ReactNode;
}

function getColor(color: ChipColor): string {
  if (color === "primary") return theme.color.pink[500];
  if (color === "neutral") return theme.color.ink[400];
  return theme.color.semantic[color];
}

function getTintBg(color: ChipColor): string {
  if (color === "primary") return theme.color.pink[100];
  if (color === "neutral") return theme.color.cream[100];
  // semantic 색의 18% 투명도 → 미리 정의된 tint pair 사용
  const tints: Record<SemanticColor, string> = {
    hospital: "#E3F2FD",
    checkup: "#E8F5E9",
    symptom: "#FFF3E0",
    medicine: "#F3E5F5",
    danger: "#FFEBEE",
  };
  return tints[color];
}

export function Chip({
  selected = false,
  color = "primary",
  variant = "outline",
  onPress,
  children,
}: ChipProps) {
  const accent = getColor(color);
  const tintBg = getTintBg(color);

  const containerStyle: ViewStyle = selected
    ? {
        backgroundColor: accent,
        borderRadius: theme.radius.full,
        paddingVertical: theme.space[2],
        paddingHorizontal: theme.space[3] + 2,
      }
    : variant === "solid"
    ? {
        backgroundColor: tintBg,
        borderRadius: theme.radius.full,
        paddingVertical: theme.space[2],
        paddingHorizontal: theme.space[3] + 2,
      }
    : variant === "dashed"
    ? {
        backgroundColor: theme.color.ink[0],
        borderColor: theme.color.cream[300],
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderRadius: theme.radius.full,
        paddingVertical: theme.space[2] - 1.5,
        paddingHorizontal: theme.space[3] - 0.5,
      }
    : {
        backgroundColor: theme.color.ink[0],
        borderColor: theme.color.cream[200],
        borderWidth: 1.5,
        borderRadius: theme.radius.full,
        paddingVertical: theme.space[2] - 1.5,
        paddingHorizontal: theme.space[3] - 0.5,
      };

  const textStyle: TextStyle = {
    fontSize: 13,
    fontWeight: selected || variant === "solid" ? "700" : "600",
    color: selected ? theme.color.ink[0] : variant === "solid" ? accent : theme.color.ink[900],
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [containerStyle, pressed && { opacity: 0.85 }]}
      >
        <Text style={textStyle}>{children}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable style={containerStyle} disabled>
      <Text style={textStyle}>{children}</Text>
    </Pressable>
  );
}
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "Chip" || echo "OK"
```

Expected: "OK".

- [ ] **Step 3: Commit**

```bash
git add components/ui/Chip.tsx
git commit -m "feat(ui): add Chip component"
```

---

## Task 6: ScreenHeader 컴포넌트

**Files:**
- Create: `components/ui/ScreenHeader.tsx`

- [ ] **Step 1: ScreenHeader.tsx 작성**

```typescript
// components/ui/ScreenHeader.tsx
import { ReactNode } from "react";
import { View, Text, Pressable, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../constants/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  variant?: "default" | "large";
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  variant = "default",
}: ScreenHeaderProps) {
  const router = useRouter();

  const containerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: variant === "large" ? "flex-end" : "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.space[5],
    paddingTop: theme.space[4],
    paddingBottom: variant === "large" ? theme.space[5] : theme.space[3],
  };

  const leftBlock = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space[2], flex: 1 }}>
      {showBack && (
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            { padding: theme.space[1], marginLeft: -theme.space[1] },
            pressed && { opacity: 0.5 },
          ]}
          hitSlop={8}
        >
          <Text style={{ fontSize: 22, color: theme.color.ink[700], fontWeight: "600" }}>‹</Text>
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        {variant === "large" && subtitle && (
          <Text style={{ fontSize: theme.font.caption.size, color: theme.color.ink[400], marginBottom: 2 }}>
            {subtitle}
          </Text>
        )}
        <Text
          style={{
            fontSize: variant === "large" ? theme.font.heading.size : theme.font.title.size,
            fontWeight: variant === "large" ? "700" : "800",
            color: theme.color.ink[900],
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {variant === "default" && subtitle && (
          <Text style={{ fontSize: theme.font.caption.size, color: theme.color.ink[400], marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={containerStyle}>
      {leftBlock}
      {rightAction && <View>{rightAction}</View>}
    </View>
  );
}
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "ScreenHeader" || echo "OK"
```

Expected: "OK".

- [ ] **Step 3: Commit**

```bash
git add components/ui/ScreenHeader.tsx
git commit -m "feat(ui): add ScreenHeader component"
```

---

## Task 7: EmptyState 컴포넌트

**Files:**
- Create: `components/ui/EmptyState.tsx`

- [ ] **Step 1: EmptyState.tsx 작성**

```typescript
// components/ui/EmptyState.tsx
import { ReactNode } from "react";
import { View, Text } from "react-native";
import { theme } from "../../constants/theme";

interface EmptyStateProps {
  illustration?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: theme.space[8] + theme.space[4],
        paddingHorizontal: theme.space[6],
      }}
    >
      {illustration && (
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: theme.color.pink[100],
            alignItems: "center",
            justifyContent: "center",
            marginBottom: theme.space[5],
          }}
        >
          {illustration}
        </View>
      )}
      <Text
        style={{
          fontSize: theme.font.heading.size,
          fontWeight: "700",
          color: theme.color.ink[900],
          marginBottom: theme.space[2],
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: theme.font.body.size,
            color: theme.color.ink[400],
            lineHeight: theme.font.body.lineHeight,
            textAlign: "center",
            marginBottom: action ? theme.space[5] : 0,
          }}
        >
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "EmptyState" || echo "OK"
```

Expected: "OK".

- [ ] **Step 3: Commit**

```bash
git add components/ui/EmptyState.tsx
git commit -m "feat(ui): add EmptyState component"
```

---

## Task 8: SkeletonCard 컴포넌트

**Files:**
- Create: `components/ui/SkeletonCard.tsx`

- [ ] **Step 1: SkeletonCard.tsx 작성**

```typescript
// components/ui/SkeletonCard.tsx
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { theme } from "../../constants/theme";

interface SkeletonCardProps {
  lines?: number;
  hasAvatar?: boolean;
}

export function SkeletonCard({ lines = 3, hasAvatar = false }: SkeletonCardProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const bar = (width: string | number, height: number) => (
    <Animated.View
      style={{
        backgroundColor: theme.color.cream[100],
        height,
        width: width as any,
        borderRadius: theme.radius.sm / 2,
        opacity,
      }}
    />
  );

  return (
    <View
      style={{
        backgroundColor: theme.color.ink[0],
        borderRadius: theme.radius.lg,
        padding: theme.space[4],
        ...theme.shadow.sm,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space[3] }}>
        {hasAvatar && (
          <Animated.View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.color.cream[100],
              opacity,
            }}
          />
        )}
        <View style={{ flex: 1, gap: theme.space[2] }}>
          {bar("60%", 14)}
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <View key={i}>{bar(i === lines - 2 ? "70%" : "90%", 10)}</View>
          ))}
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "SkeletonCard" || echo "OK"
```

Expected: "OK".

- [ ] **Step 3: Commit**

```bash
git add components/ui/SkeletonCard.tsx
git commit -m "feat(ui): add SkeletonCard component"
```

---

## Task 9: Sheet 컴포넌트 (BottomSheet)

**Files:**
- Create: `components/ui/Sheet.tsx`

- [ ] **Step 1: Sheet.tsx 작성**

```typescript
// components/ui/Sheet.tsx
import { ReactNode, useEffect, useRef } from "react";
import { Modal, View, Text, Animated, Pressable, Dimensions } from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { theme } from "../../constants/theme";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function Sheet({ visible, onClose, children }: SheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const startY = useRef(0);

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const close = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const onGesture = (e: PanGestureHandlerGestureEvent) => {
    const ty = Math.max(0, e.nativeEvent.translationY);
    dragY.setValue(ty);
  };

  const onGestureEnd = (e: PanGestureHandlerGestureEvent) => {
    const ty = e.nativeEvent.translationY;
    const vy = e.nativeEvent.velocityY;
    if (ty > 120 || vy > 800) {
      close();
    } else {
      Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
    }
  };

  const combinedY = Animated.add(translateY, dragY);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
        <Pressable style={{ flex: 1 }} onPress={close} />
        <Animated.View
          style={{
            transform: [{ translateY: combinedY }],
            backgroundColor: theme.color.bg,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            ...theme.shadow.md,
          }}
        >
          <PanGestureHandler onGestureEvent={onGesture} onEnded={onGestureEnd as any}>
            <Animated.View>
              <View style={{ alignItems: "center", paddingVertical: theme.space[3] }}>
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: theme.color.cream[300],
                  }}
                />
              </View>
            </Animated.View>
          </PanGestureHandler>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

interface SheetHeaderProps {
  title: string;
  subtitle?: string;
}

Sheet.Header = function SheetHeader({ title, subtitle }: SheetHeaderProps) {
  return (
    <View style={{ paddingHorizontal: theme.space[6], paddingBottom: theme.space[4] }}>
      <Text
        style={{
          fontSize: theme.font.title.size,
          fontWeight: "700",
          color: theme.color.ink[900],
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: theme.font.caption.size,
            color: theme.color.ink[400],
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

Sheet.Content = function SheetContent({ children }: { children: ReactNode }) {
  return (
    <View style={{ paddingHorizontal: theme.space[6], paddingBottom: theme.space[4] }}>
      {children}
    </View>
  );
};

Sheet.Footer = function SheetFooter({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        paddingHorizontal: theme.space[6],
        paddingTop: theme.space[4],
        paddingBottom: theme.space[8] + theme.space[1],
      }}
    >
      {children}
    </View>
  );
};
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "Sheet" || echo "OK"
```

Expected: "OK".

- [ ] **Step 3: Commit**

```bash
git add components/ui/Sheet.tsx
git commit -m "feat(ui): add Sheet (BottomSheet) component with drag-to-close"
```

---

## Task 10: ui/index.ts 배럴 export

**Files:**
- Create: `components/ui/index.ts`

- [ ] **Step 1: index.ts 작성**

```typescript
// components/ui/index.ts
export { Button } from "./Button";
export { Card } from "./Card";
export { Chip } from "./Chip";
export { ScreenHeader } from "./ScreenHeader";
export { EmptyState } from "./EmptyState";
export { SkeletonCard } from "./SkeletonCard";
export { Sheet } from "./Sheet";
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | tail -10
```

Expected: 새 에러 0.

- [ ] **Step 3: Commit**

```bash
git add components/ui/index.ts
git commit -m "feat(ui): add barrel export for ui components"
```

---

## Task 11: babySize 헬퍼 + BabyGrowth 일러스트 컴포넌트

**Files:**
- Create: `lib/babySize.ts`
- Create: `components/illustrations/BabyGrowth.tsx`

- [ ] **Step 1: babySize.ts 작성**

```typescript
// lib/babySize.ts

interface BabySizeInfo {
  emoji: string;
  name: string;
  weight?: string;
  length?: string;
}

const SIZE_TABLE: { fromWeek: number; emoji: string; name: string; weight?: string; length?: string }[] = [
  { fromWeek: 4, emoji: "🌱", name: "양귀비 씨", weight: "0.04g", length: "1mm" },
  { fromWeek: 6, emoji: "🫘", name: "콩알", weight: "0.5g", length: "5mm" },
  { fromWeek: 8, emoji: "🍇", name: "포도알", weight: "1g", length: "1.6cm" },
  { fromWeek: 10, emoji: "🍓", name: "딸기", weight: "4g", length: "3cm" },
  { fromWeek: 12, emoji: "🍋", name: "라임", weight: "14g", length: "5.4cm" },
  { fromWeek: 14, emoji: "🍑", name: "복숭아", weight: "43g", length: "8.7cm" },
  { fromWeek: 16, emoji: "🥑", name: "아보카도", weight: "100g", length: "11.6cm" },
  { fromWeek: 18, emoji: "🫑", name: "피망", weight: "190g", length: "14.2cm" },
  { fromWeek: 20, emoji: "🍌", name: "바나나", weight: "300g", length: "16.4cm" },
  { fromWeek: 22, emoji: "🥭", name: "망고", weight: "430g", length: "27cm" },
  { fromWeek: 24, emoji: "🌽", name: "옥수수", weight: "600g", length: "30cm" },
  { fromWeek: 26, emoji: "🥬", name: "양상추", weight: "760g", length: "35cm" },
  { fromWeek: 28, emoji: "🍆", name: "가지", weight: "1kg", length: "37cm" },
  { fromWeek: 30, emoji: "🥥", name: "코코넛", weight: "1.3kg", length: "40cm" },
  { fromWeek: 32, emoji: "🍍", name: "파인애플", weight: "1.7kg", length: "42cm" },
  { fromWeek: 34, emoji: "🍈", name: "캔털루프", weight: "2.1kg", length: "44cm" },
  { fromWeek: 36, emoji: "🍉", name: "수박", weight: "2.6kg", length: "47cm" },
  { fromWeek: 38, emoji: "🎃", name: "호박", weight: "3kg", length: "49cm" },
  { fromWeek: 40, emoji: "👶", name: "신생아", weight: "3.4kg", length: "50cm" },
];

export function getBabySize(weeks: number): BabySizeInfo {
  for (let i = SIZE_TABLE.length - 1; i >= 0; i--) {
    if (weeks >= SIZE_TABLE[i].fromWeek) {
      const e = SIZE_TABLE[i];
      return { emoji: e.emoji, name: e.name, weight: e.weight, length: e.length };
    }
  }
  return SIZE_TABLE[0];
}
```

- [ ] **Step 2: BabyGrowth.tsx 작성**

```typescript
// components/illustrations/BabyGrowth.tsx
import { View, Text } from "react-native";
import { theme } from "../../constants/theme";
import { getBabySize } from "../../lib/babySize";

interface BabyGrowthProps {
  weeks: number;
  size?: number;
}

export function BabyGrowth({ weeks, size = 80 }: BabyGrowthProps) {
  const info = getBabySize(weeks);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.color.pink[100],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: Math.floor(size * 0.5) }}>{info.emoji}</Text>
    </View>
  );
}
```

- [ ] **Step 3: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -iE "babySize|BabyGrowth" || echo "OK"
```

Expected: "OK".

- [ ] **Step 4: Commit**

```bash
git add lib/babySize.ts components/illustrations/BabyGrowth.tsx
git commit -m "feat: add baby size table + BabyGrowth illustration component"
```

---

## Task 12: 홈 화면 재작성 — 뼈대 (헤더 + 일기 영웅 카드)

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: 기존 index.tsx 백업 (참조용)**

```bash
cp app/\(tabs\)/index.tsx app/\(tabs\)/index.tsx.bak
```

- [ ] **Step 2: index.tsx 새로 작성 — 비로그인/프로필미설정 분기 + 헤더 + 일기 카드까지**

`app/(tabs)/index.tsx` 전체 교체:

```typescript
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useMemo } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useDiaryStore } from "../../stores/diaryStore";
import { calculatePregnancyWeek, getDaysUntilDue } from "../../lib/pregnancy";
import { getWeekInfo } from "../../constants/babyGrowth";
import { getUrgentTips, getTipsForWeek } from "../../constants/weeklyTips";
import { getBabySize } from "../../lib/babySize";
import { theme } from "../../constants/theme";
import { Button, Card, Chip, EmptyState, ScreenHeader } from "../../components/ui";
import { BabyGrowth } from "../../components/illustrations/BabyGrowth";

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
    const baby = getBabySize(weeks);
    return { weeks, days, daysLeft, weekInfo, topTip, baby };
  }, [profile]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg, alignItems: "center", justifyContent: "center" }}>
        <BabyGrowth weeks={20} size={64} />
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
            <Button variant="primary" size="lg" onPress={() => router.push("/profile-setup")}>
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
          <Card
            variant="accent"
            onPress={() =>
              todayEntry ? router.push(`/diary/${todayEntry.id}`) : router.push("/diary/write")
            }
            padding={theme.space[5]}
          >
            <Text
              style={{
                fontSize: theme.font.overline.size,
                fontWeight: "700",
                color: theme.color.ink[0],
                opacity: 0.9,
                letterSpacing: theme.font.overline.letterSpacing,
              }}
            >
              오늘의 기록
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: theme.color.ink[0],
                marginTop: theme.space[1],
                lineHeight: 24,
              }}
            >
              {todayEntry ? "오늘의 일기를 다시 보기" : `오늘 어떤 하루였어, ${babyName}맘?`}
            </Text>
            <Text
              style={{
                fontSize: theme.font.caption.size,
                color: theme.color.ink[0],
                opacity: 0.85,
                marginTop: 4,
              }}
            >
              {todayEntry ? "감정 + 기록을 확인하세요" : "감정 기록 + 사진 한 장으로 충분해요"}
            </Text>
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
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "index" | head
```

Expected: 새 에러 0.

- [ ] **Step 4: Expo 시뮬레이터/웹에서 시각 확인**

```bash
npx expo start --web
```

브라우저 자동 열림. 비로그인 상태/프로필 없는 상태/정상 상태 모두 정상 렌더 확인.

- [ ] **Step 5: 백업 파일 삭제**

```bash
rm app/\(tabs\)/index.tsx.bak
```

- [ ] **Step 6: Commit**

```bash
git add 'app/(tabs)/index.tsx'
git commit -m "feat(home): rewrite home with new tokens — header + diary hero card"
```

---

## Task 13: 홈 화면 — 주차정보 카드 + 꿀팁 카드 추가

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: 일기 카드 다음에 주차정보 카드 추가**

`app/(tabs)/index.tsx`의 일기 영웅 Card 닫는 `</View>` (paddingHorizontal 컨테이너) 뒤에 다음 블록 삽입:

```tsx
        {/* 2차: 주차 정보 카드 */}
        <View style={{ paddingHorizontal: theme.space[5], marginBottom: theme.space[3] - 1 }}>
          <Card variant="default" onPress={() => router.push("/tips")}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.space[3] }}>
              <BabyGrowth weeks={weekData!.weeks} size={56} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: theme.font.caption.size,
                    color: theme.color.ink[400],
                    fontWeight: "600",
                  }}
                >
                  {weekData!.weeks}주차 · {weekData!.baby.weight} · {weekData!.baby.length}
                </Text>
                <Text
                  style={{
                    fontSize: theme.font.label.size + 1,
                    color: theme.color.ink[900],
                    fontWeight: "700",
                    marginTop: 2,
                  }}
                >
                  {babyName}은 {weekData!.baby.name} 크기예요
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
                    width: 40,
                    height: 40,
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
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "(tabs)/index" || echo "OK"
```

Expected: "OK".

- [ ] **Step 3: 시뮬레이터 시각 확인**

`npx expo start` 상태에서 hot reload. 일기 카드 아래 주차정보+꿀팁이 정상 렌더되는지 확인.

- [ ] **Step 4: Commit**

```bash
git add 'app/(tabs)/index.tsx'
git commit -m "feat(home): add week info card + tip card"
```

---

## Task 14: 홈 화면 — 4칸 바로가기 그리드

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: 꿀팁 카드 다음에 4칸 그리드 추가**

`app/(tabs)/index.tsx`의 꿀팁 카드 블록 끝 `</View>` (paddingHorizontal 컨테이너) 뒤에 추가:

```tsx
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
          <View style={{ flexDirection: "row", gap: theme.space[2] - 2 }}>
            {[
              { route: "/(tabs)/chat" as const, label: "AI 상담", iconBg: theme.color.pink[100] },
              { route: "/support/" as const, label: "지원금", iconBg: "#F3EEFF" },
              { route: "/(tabs)/hospital" as const, label: "병원", iconBg: "#E3F2FD" },
              { route: "/nutrition" as const, label: "영양", iconBg: theme.color.cream[100] },
            ].map((item) => (
              <Card
                key={item.route}
                variant="default"
                onPress={() => router.push(item.route as any)}
                padding={theme.space[3]}
                style={{ flex: 1 }}
              >
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: theme.radius.sm + 1,
                      backgroundColor: item.iconBg,
                      marginBottom: theme.space[2] - 2,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: theme.font.caption.size,
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
```

- [ ] **Step 2: TypeScript 검증**

```bash
npx tsc --noEmit 2>&1 | grep -i "(tabs)/index" || echo "OK"
```

Expected: "OK".

- [ ] **Step 3: 시뮬레이터 시각 확인**

홈 스크롤 끝까지: 헤더 → 일기 영웅 → 주차정보 → 꿀팁 → 4그리드 모두 정상.

- [ ] **Step 4: Commit**

```bash
git add 'app/(tabs)/index.tsx'
git commit -m "feat(home): add 4-shortcut grid (AI/지원금/병원/영양)"
```

---

## Task 15: 최종 수락 기준 검증

**Files:** 없음 (검증만)

- [ ] **Step 1: 토큰 단일 소스 확인**

```bash
test -f constants/theme.ts && echo "theme.ts: OK" || echo "MISSING"
```

Expected: "theme.ts: OK".

- [ ] **Step 2: ui 컴포넌트 7종 + index 확인**

```bash
ls components/ui/
```

Expected: `Button.tsx Card.tsx Chip.tsx EmptyState.tsx ScreenHeader.tsx Sheet.tsx SkeletonCard.tsx index.ts` 모두 존재.

- [ ] **Step 3: 홈 화면에 hex 하드코딩 없는지 확인**

```bash
grep -E '#[0-9A-Fa-f]{6}' 'app/(tabs)/index.tsx' || echo "NO HARDCODED HEX"
```

Expected: "NO HARDCODED HEX". (단, 일러스트 fallback 이모지 색상 등 콘텐츠는 제외 — 본 grep은 hex 코드만 확인)

- [ ] **Step 4: 홈 화면 이모지 텍스트 확인 (감정·아기 크기 fallback 제외)**

```bash
grep -nE "[📖💬🤖💕🎬👩‍|💡|📷|📝|📅]" 'app/(tabs)/index.tsx' || echo "NO DECORATIVE EMOJI"
```

Expected: "NO DECORATIVE EMOJI" 또는 "✏" 카피 정도만 (CTA 화살표) — 즉 헤더/라벨에 장식 이모지 없음.

- [ ] **Step 5: NativeWind 의존성 제거 확인**

```bash
grep -E '"(nativewind|tailwindcss|react-native-css-interop)"' package.json || echo "REMOVED"
```

Expected: "REMOVED".

- [ ] **Step 6: TypeScript 전체 통과**

```bash
npx tsc --noEmit
```

Expected: 종료 코드 0.

- [ ] **Step 7: 앱 빌드 + 실행 확인**

```bash
npx expo start --web
```

브라우저에서:
- [ ] 비로그인 상태: EmptyState로 "베이비로그" 표시 + 시작하기 버튼
- [ ] 프로필 미설정: EmptyState로 "프로필을 설정해주세요" + 설정 버튼
- [ ] 정상 상태 (실제 로그인 필요 시 디버그 더미 데이터 또는 스킵): 헤더+일기영웅+주차+꿀팁+4그리드 모두 렌더
- [ ] 일기 영웅 카드 탭 → diary/write 또는 diary/[id] 이동
- [ ] 주차 카드 탭 → tips 이동
- [ ] 4그리드 카드 탭 → 각 라우트 이동

- [ ] **Step 8: 최종 커밋 (검증 자체에는 수정 없음, 검증 완료 표시용)**

검증만 했으면 별도 커밋 불필요. Phase 1 완료.

---

## Out of Scope (Phase 2/3 — 별도 스펙)

- 다이어리/커뮤니티/병원/AI상담/프로필 화면에 토큰·컴포넌트 적용 → **Phase 2**
- 탭바 재설계 (AI 상담 노출, 사이즈 고정) → **Phase 2**
- 햅틱 피드백, Toast, 빈 상태 일러스트 풀세트 → **Phase 3**
- 다이어리 모달 → Sheet로 교체 → **Phase 3**
- 캘린더 밀도 재설계 → **Phase 3**
- 주차별 SVG 일러스트 풀세트 → **Phase 3**
