# Baby-Log Phase 1: 디자인 시스템 + 홈 개편

**작성일**: 2026-04-26
**스코프**: Phase 1 only (디자인 토큰 + 코어 컴포넌트 + 아이콘 정리 + 홈 화면 재설계)
**예상 기간**: 2~3일
**Phase 2/3**: 별도 스펙 (Phase 1 완료 후 재브레인스톰)

---

## 1. 배경

베이비로그는 임산부를 위한 일기·주차정보·AI 상담·커뮤니티 통합 앱이다 (RN/Expo + Supabase + OpenAI). 6개 화면이 동작하지만 다음 4가지 구조적 문제가 있다.

1. **디자인 시스템 부재** — 모든 스타일이 inline. borderRadius 5종(12/14/16/20/24), 폰트 13종, 분홍 7종이 일관성 없이 혼재.
2. **아이콘 체계 혼재** — PNG 자산 10개와 이모지가 한 화면에서 공존. iOS/Android 이모지 렌더링 차이로 일관성 깨짐.
3. **홈 정보 위계 부재** — 5개 영역이 동등한 무게로 쌓여 사용자가 "지금 뭘 해야 하지?"를 인지하기 어렵다. AI 상담 등 핵심 기능이 그리드 4번째에 묻혀있다.
4. **NativeWind 의존성 미활용** — 패키지는 설치했으나 실제로는 거의 사용하지 않아 의도와 코드가 어긋나 있다.

Phase 1은 위 4개의 기반 문제를 해결한다. 다른 모든 개선(빈상태/마이크로인터랙션/캘린더 밀도 등)은 이 기반 위에서만 의미가 있으므로 Phase 2/3에서 다룬다.

## 2. 결정 사항

브레인스톰에서 확정된 4개 핵심 결정:

| 영역 | 결정 | 근거 |
|---|---|---|
| **컬러 팔레트** | Warm Neutral + Pink Accent | 분홍 일색은 임산부 앱 클리셰. 베이지 구조 + 분홍 액센트가 차분하면서 긴 텍스트 가독성 우수. 현재 BG가 이미 크림 계열(`#FFF8F0`)이라 자연스러운 전환. |
| **아이콘 시스템** | 하이브리드 (PNG 브랜드 + 벡터 UI) | 이미 만든 PNG 자산 활용 + UI 컨트롤(화살표/X/체크/검색 등) 무한 확장. 앱스토어 상위 앱 표준 패턴. |
| **스타일링** | StyleSheet + 토큰. NativeWind 제거 | RN 표준 패턴, 성능 우위, 새 컴포넌트 정의에 자연스러움. NativeWind 4.x는 RN 0.83 + reanimated에서 hot reload 깨지는 케이스 있어 위험. |
| **홈 레이아웃** | Action First (일기 카드 영웅) | 이 앱의 핵심 사용 행동은 일기 쓰기. "가장 자주 하는 행동 = 가장 큰 면적" 원칙. 매일 사용자의 리텐션 우선. |

## 3. 아키텍처

### 3.1 파일 구조 (신규)

```
constants/
  theme.ts              ★ 신규. 단일 토큰 소스
components/
  ui/
    Button.tsx          ★ 신규
    Card.tsx            ★ 신규
    Chip.tsx            ★ 신규
    Sheet.tsx           ★ 신규
    ScreenHeader.tsx    ★ 신규
    EmptyState.tsx      ★ 신규
    SkeletonCard.tsx    ★ 신규
    index.ts            ★ 신규 (배럴 export)
  illustrations/
    BabyMango.tsx       ★ 신규 (22주차 일러스트 1장, 데모용)
app/
  (tabs)/index.tsx      ☆ 재작성 (Action First 레이아웃)
```

### 3.2 토큰 시스템 (`constants/theme.ts`)

```typescript
export const theme = {
  color: {
    pink: {
      50: '#FFF5F8', 100: '#FFE5EC', 200: '#FFC2D1',
      400: '#FF8FA3', 500: '#FF4D6D', 600: '#D63A57',
    },
    cream: {
      50: '#FAF5EE', 100: '#F5EDE0', 200: '#E8D5C4',
      300: '#C8B8A8', 400: '#A8907E',
    },
    ink: {
      0: '#FFFFFF', 50: '#F5F1EB',
      400: '#8B7E73', 700: '#5C5048', 900: '#3D3530',
    },
    semantic: {
      hospital: '#64B5F6', checkup: '#81C784',
      symptom: '#FFB74D', medicine: '#BA68C8',
      danger: '#E57373',
    },
    bg: '#FAF5EE',  // 앱 전역 배경
  },
  font: {
    display: { size: 32, weight: '800' as const },
    title:   { size: 22, weight: '700' as const },
    heading: { size: 17, weight: '700' as const },
    body:    { size: 14, weight: '400' as const },
    label:   { size: 13, weight: '600' as const },
    caption: { size: 11, weight: '400' as const },
    overline:{ size: 10, weight: '700' as const, letterSpacing: 0.5 },
  },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  shadow: {
    none: { shadowColor: '#3D3530', shadowOpacity: 0, elevation: 0 },
    sm:   { shadowColor: '#3D3530', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
    md:   { shadowColor: '#3D3530', shadowOpacity: 0.10, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 6 },
  },
};

export type Theme = typeof theme;
```

**규칙**:
- 색/크기/여백/라운드/섀도우는 토큰만 사용. 직접 hex/숫자 하드코딩 금지.
- 토큰에 없는 값이 필요하면 토큰을 먼저 확장한 PR을 분리해서 올린다.

### 3.3 코어 컴포넌트 사양

각 컴포넌트는 `StyleSheet.create()` 기반. props는 모두 변형/사이즈를 토큰으로만 매핑.

#### `<Button>`
- **props**: `variant: 'primary'|'secondary'|'ghost'|'dark'` · `size: 'sm'|'md'|'lg'` · `loading: boolean` · `disabled: boolean` · `leftIcon?: ReactNode` · `rightIcon?: ReactNode` · `onPress` · `children` · `fullWidth?: boolean`
- **기본값**: `variant='primary' size='md'`
- **동작**: `loading` 시 children 숨기고 ActivityIndicator 표시. `disabled` 시 색상 톤다운 + onPress 무시.

#### `<Card>`
- **props**: `variant: 'default'|'flat'|'accent'` · `onPress?: () => void` · `padding?: number` · `children`
- **default**: 흰색 배경 + `shadow.sm` + `radius.lg`
- **flat**: 흰색 배경 + 1px `cream/200` 테두리, no shadow
- **accent**: 분홍 그라데이션(`pink/200 → pink/400`) + 흰 텍스트
- **onPress 있으면**: 자동 Pressable 래핑 + activeOpacity 0.85

#### `<Chip>`
- **props**: `selected: boolean` · `color: 'primary'|'hospital'|'checkup'|'symptom'|'medicine'|'neutral'` · `variant: 'solid'|'outline'|'dashed'` · `onPress?` · `children`
- **selected=true**: 색 배경 + 흰 글자
- **selected=false outline**: 흰 배경 + 색 테두리
- **dashed**: "+ 직접입력" 같은 추가 칩용 (cream/300 dashed border)

#### `<Sheet>` (BottomSheet)
- **props**: `visible: boolean` · `onClose: () => void` · `snapPoints?: string[]` · `children`
- **서브컴포넌트**: `Sheet.Header({ title, subtitle })` · `Sheet.Content` · `Sheet.Footer`
- **인터랙션**: 핸들 표시 + 드래그-투-클로즈 (react-native-gesture-handler 사용. 이미 의존성에 있음) + 백드롭 탭 닫기.
- **현재 다이어리 modal을 이걸로 교체** (재작성 아니고 wrapper만 교체).

#### `<ScreenHeader>`
- **props**: `title: string` · `subtitle?: string` · `showBack?: boolean` · `rightAction?: ReactNode` · `variant: 'default'|'large'`
- **default**: 좌측 타이틀 + 우측 액션 슬롯 1개. 패딩 일관.
- **large**: 인사 + 타이틀 2줄(홈 헤더용)
- **이모지 타이틀 폐지**: 현재 `📖 다이어리` `💬 AI 상담` 등 이모지+타이틀 패턴 모두 제거. 필요시 좌측 PNG 아이콘 prop 추가.

#### `<EmptyState>`
- **props**: `illustration?: ReactNode` · `title: string` · `description?: string` · `action?: ReactNode` (보통 Button)
- 데이터 없음/검색 결과 없음/에러 공통.
- 기본 일러스트는 원형 그라데이션 + 큰 이모지(임시), Phase 3에서 SVG 일러스트로 교체.

#### `<SkeletonCard>` (보너스)
- **props**: `lines?: number` (기본 3) · `hasAvatar?: boolean`
- 회색 펄스 애니메이션 (Animated.loop + opacity 0.4↔0.8)
- 데이터 페치 화면(다이어리, 커뮤니티) 로딩 상태에 사용.

### 3.4 아이콘 사용 규칙

**PNG 영역** (`assets/icons/`):
- 탭바 5개 (home, diary, community, hospital, mypage)
- 홈 그리드 바로가기 (tips, ai_chat, hospital, government_subsidies, nutritional_supplements, youtube)
- 감정 픽커 8종 (이미 별도 자산)

**벡터 영역** (`@expo/vector-icons` Ionicons 사용. 이미 의존성에 있음):
- 화살표 (chevron-forward, chevron-back)
- 닫기 (close)
- 추가 (add)
- 검색 (search)
- 더보기 (ellipsis-horizontal)
- 체크 (checkmark)

**이모지**:
- 헤더 타이틀, 라벨, 버튼, 상태 메시지 등 **장식 용도 전면 금지**.
- 예외 (이모지가 콘텐츠 자체인 경우만 허용):
  - 감정 픽커 (😊😢🥺 등) — 사용자 데이터.
  - 주차별 아기 크기 표현 (🥭🥑🍆 등) — Phase 1에서 SVG 1장 외 나머지 주차의 fallback. Phase 3에서 SVG 풀세트로 교체 시 제거.
- 제거 대상 예시: 헤더의 `📖 다이어리`, `💬 AI 상담`, `🤖`, `👩‍👩‍👧`, 버튼의 `📝`, `💕`, 라벨 앞 `💡`, `📷` 등.

### 3.5 NativeWind 제거

- `package.json`에서 `nativewind`, `tailwindcss`, `react-native-css-interop` 제거
- `tailwind.config.js`, `nativewind-env.d.ts` 삭제
- `global.css`는 유지 검토 후 삭제 (Expo Router 자체 CSS 의존이 아니라면 삭제)
- 기존 코드에 `className=` 사용 사례가 거의 없는지 사전 grep 확인. 있으면 inline style + 토큰으로 교체.

## 4. 홈 화면 사양 (`app/(tabs)/index.tsx`)

### 4.1 레이아웃 (위→아래)

```
┌─ ScreenHeader (variant=large)
│  ├─ "좋은 아침이에요" (caption)
│  └─ "민영맘 · 22주 3일"  + D-119 뱃지(우측)
├─ [1차] Card.accent — 일기 영웅
│  ├─ "오늘의 기록" (overline)
│  ├─ "오늘 어떤 하루였어?" (heading 18 · weight 800)
│  ├─ "감정 기록 + 사진 한 장으로 충분해요" (caption)
│  └─ Button (variant=primary on white BG)  ✏️ 일기 쓰기
│  └─ 우하단: 주차 일러스트 (BabyMango 등)
├─ [2차] Card.default — 주차 정보
│  ├─ row: 일러스트 + ("22주차 · 약 350g · 27cm" / "아기는 망고 크기예요") + ›
│  ├─ description (body)
│  └─ 이번주 추천 칩 2~3개 (semantic 색상)
├─ [3차] Card.flat — 꿀팁 1개 (타이틀 + 1줄)
├─ [4차] "더 알아보기" 라벨 + 4칸 그리드
│  └─ AI상담 / 지원금 / 병원 / 전체메뉴
```

### 4.2 비로그인/프로필 미설정 분기

`<EmptyState>` 컴포넌트로 통일:
- 비로그인: 일러스트 + "베이비로그" + "우리 아기의 소중한 순간을..." + Button "시작하기"
- 프로필 미설정: 일러스트 + "프로필을 설정해주세요!" + Button "프로필 설정하기"

### 4.3 기존 데이터/로직 보존

- `useAuthStore`, `useDiaryStore`, `calculatePregnancyWeek`, `getWeekInfo`, `getUrgentTips` 모두 그대로 사용.
- 비즈니스 로직 변경 없음. 시각/구조 재배치만.

### 4.4 일러스트 (Phase 1: 1장만)

- `components/illustrations/BabyMango.tsx` — 22주차용 SVG 일러스트 1개 (react-native-svg 추가 필요)
- 다른 주차는 fallback emoji `getWeekEmoji(weeks)` 함수로 처리 (16주 자두, 22주 망고, 28주 가지, 36주 멜론 등 단순 매핑)
- Phase 3에서 SVG 풀세트 작업.

## 5. 마이그레이션 전략

**점진적 적용** — Phase 1에서는 다음만 처리한다:

1. **신규 작성**: `theme.ts`, `ui/*` 컴포넌트, 일러스트 1개.
2. **재작성**: `app/(tabs)/index.tsx` (홈 화면).
3. **유지**: 다른 모든 화면 (다이어리/커뮤니티/병원/AI상담/프로필) — Phase 2에서 일괄 적용.

**이유**: 코어 컴포넌트가 실전에서 1개 화면을 통과해야 디자인이 검증된다. 6개 화면을 동시에 갈아엎으면 컴포넌트 설계 미스를 6배로 보수해야 함.

**기존 화면 영향**: 없음. 토큰/컴포넌트는 추가만 되고 기존 inline style은 그대로 동작. Phase 2에서 1화면씩 마이그레이션.

## 6. 비스코프 (Phase 1에서 안 하는 것)

다음은 **명시적으로 Phase 2/3 대상**:

- 다이어리/커뮤니티/병원/AI상담/프로필 화면의 토큰·컴포넌트 적용 → **Phase 2**
- 탭바 재설계 (AI 상담 노출, 사이즈 고정) → **Phase 2**
- 빈 상태 일러스트 풀세트 → **Phase 3**
- 햅틱 피드백, Toast, Alert→커스텀 → **Phase 3**
- 다이어리 캘린더 밀도 재설계 → **Phase 3**
- 주차별 SVG 일러스트 풀세트 → **Phase 3**
- 다크모드 → 보류 (사용자 요구 명시 없음)

## 7. 검증 / 수락 기준

Phase 1 완료 시 다음이 모두 충족되어야 한다:

1. ✅ `constants/theme.ts` 단일 파일에 모든 토큰 존재.
2. ✅ `components/ui/`에 7개 컴포넌트 + index.ts 존재. 각 컴포넌트 단위로 동작 확인 가능.
3. ✅ 홈 화면이 새 레이아웃으로 동작. 비로그인/프로필 미설정/정상 3분기 모두 정상.
4. ✅ 홈 화면 코드 내 hex 색상/사이즈 숫자 하드코딩 0개 (`grep -E '#[0-9A-Fa-f]{6}'` 결과 없음, 토큰 import만).
5. ✅ 홈 화면에 이모지 텍스트 0개 (감정 데이터 제외).
6. ✅ NativeWind 의존성 제거 후 앱이 정상 빌드 + 실행.
7. ✅ TypeScript 타입 에러 0.
8. ✅ iOS Simulator에서 시각 검증: 헤더/일기카드/주차카드/꿀팁/4그리드 모두 토큰 색상 적용 확인.

## 8. 리스크 / 대응

| 리스크 | 대응 |
|---|---|
| NativeWind 제거 시 숨겨진 className 사용 발견 | 사전 `grep -r "className=" app components` 실행해 모두 inline + 토큰으로 교체. |
| react-native-svg 추가가 expo-image와 충돌 | 일러스트 1장은 SVG 안 쓰고 PNG로 대체 가능. 우선 SVG 시도, 충돌 시 PNG fallback. |
| 다이어리 모달의 Sheet 교체가 기존 동작 깨뜨림 | Phase 1에서는 다이어리 미수정. Sheet 컴포넌트만 만들어두고 Phase 2에서 적용. |
| 홈 재작성 중 비즈니스 로직 회귀 | 기존 `useAuthStore`/`useDiaryStore` 사용을 1:1 보존. 데이터 페치 로직은 손대지 않음. |

## 9. Phase 2/3 (참조용, 별도 스펙 작성)

- **Phase 2** (2~3일): 다른 5개 화면에 토큰/컴포넌트 일괄 적용. 탭바 재설계 (AI 상담 5번째 탭 노출, 동적 사이즈 → 고정).
- **Phase 3** (2~3일): 폴리시 레이어 — 햅틱, Toast, 빈 상태 일러스트, 캘린더 밀도, 주차별 SVG 풀세트, Sheet 드래그.
