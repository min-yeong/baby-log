# Baby-Log Phase 2A: 시스템 전파 + 탭바 재설계

**작성일**: 2026-04-26
**스코프**: Phase 2A — 토큰 확장 + 탭바 재설계 + 5개 탭 화면 마이그레이션
**예상 기간**: 2~3일
**Phase 1 완료 (선행)**: `docs/superpowers/specs/2026-04-26-baby-log-phase1-design.md`
**Phase 2B/3** (별도): sub-screens 일괄 마이그레이션 + 폴리시

---

## 1. 배경

Phase 1에서 디자인 토큰 + 7종 UI 컴포넌트 + 홈 화면 재작성을 완료했다. Phase 1 최종 코드 리뷰에서 "Phase 1.5"로 분류된 정리 항목 3건이 식별되었고, 이를 Phase 2A 진입 전제 조건으로 함께 처리한다.

**Phase 1 잔여 이슈:**
- **I-1**: 홈 일기 영웅 카드의 흰 pill CTA가 `<Button>`을 안 쓰고 hand-rolled. `Button`에 `onAccent` 변형 없어서 다른 화면에서 같은 패턴 필요해도 재사용 불가.
- **I-2**: 홈 화면에 토큰 미정의 raw 숫자 다수 leak (`fontSize:18`, `lineHeight:24`, `borderRadius:48`, `width/height: 32/40`, `marginTop:4` 등). 5개 화면 더 마이그레이션 시 leak 6배.
- **I-3**: `<Chip>` 컴포넌트 만들어두고 Phase 1 어디서도 안 씀 — 검증 안 된 컴포넌트. Phase 2A의 다이어리 화면이 첫 검증.

**Phase 2A 본 작업:**
- 5개 탭 화면을 토큰 + 컴포넌트로 재작성: `diary` / `community` / `hospital` / `profile` / `chat`
- 탭바 재설계: AI상담을 5번째 탭으로 노출(현재 `href: null` 숨김), 동적 사이징 → 고정 사이징, 헤더 패턴 통일
- 화면별 헤더는 `<ScreenHeader>` 사용 강제
- 다이어리 모달은 `<Sheet>` 컴포넌트로 교체 (드래그-투-클로즈 적용)

**비스코프 (Phase 2B):**
- sub-screens (login, profile-setup, tips, nutrition, youtube, diary/write, diary/[id], community/write, community/[id], hospital/[id], support/index)
- 폴리시 (햅틱, Toast, 일러스트 풀세트, 캘린더 밀도 재설계)

## 2. 결정 사항

| 영역 | 결정 | 근거 |
|---|---|---|
| **탭바 구성** | 산부인과 탭 제거, AI상담 5번째 탭으로 노출 | 산부인과 사용 빈도 < AI상담. 5탭 유지(디자인 가이드). 산부인과는 홈 그리드에 이미 노출되어 있음. |
| **탭 아이콘 사이즈** | 너비의 10% 동적 → 고정 24×24 (텍스트 11px) | 큰 폰에서 과대 사이즈 문제 해결. iOS 가이드 표준. |
| **다이어리 모달** | `Modal` → `<Sheet>` 컴포넌트 교체 | Phase 1에서 만든 Sheet를 실전 검증. 드래그-투-클로즈 + 백드롭 탭 + 핸들 표시 일관성. |
| **`<Chip>` 첫 적용** | 다이어리 이벤트 모달의 칩 + 커뮤니티 카테고리 필터 | Phase 1.5 잔여 이슈 I-3 해결. 모든 칩 사용처 통일. |
| **헤더 패턴** | 모든 탭 화면이 `<ScreenHeader>` 사용 | "📖 다이어리", "💬 AI 상담" 등 이모지+타이틀 패턴 일괄 폐지. |

## 3. 아키텍처

### 3.1 토큰 확장 (`constants/theme.ts`)

기존 토큰에 다음 추가:

```typescript
// 추가될 토큰
font: {
  // ... 기존 ...
  hero: { size: 18, weight: "800" as const, lineHeight: 24 },  // ★ 신규: 영웅 카드용
  bodyLg: { size: 15, weight: "400" as const, lineHeight: 22 }, // ★ 신규: 다이어리/커뮤니티 본문
},
iconBox: {
  sm: 32,   // 4그리드 아이콘
  md: 40,   // 꿀팁 카드 아이콘
  lg: 56,   // BabyGrowth 인라인
  xl: 80,   // EmptyState 일러스트
  xxl: 96,  // EmptyState 큰 일러스트
},
opacity: {
  pressed: 0.85,        // Pressable 기본 press
  pressedSubtle: 0.9,   // Card에서 보조
  pressedStrong: 0.5,   // 작은 아이콘 버튼
  disabledMuted: 0.4,   // 텍스트 muted
},
scrim: "rgba(0, 0, 0, 0.4)",  // ★ 신규: Sheet 백드롭 등
```

**규칙**: Phase 1.5 잔여 이슈 I-2 해결. 이후 모든 화면에서 임의 숫자 금지. 토큰 확장 PR과 사용 PR을 분리.

### 3.2 신규 컴포넌트 변형

**`<Button variant="onAccent">`** — Card.accent 위에 올라가는 흰 pill 버튼:
- bg: `theme.color.ink[0]` (white)
- fg: `theme.color.pink[500]`
- radius: `theme.radius.md`
- 기존 4 variant(primary/secondary/ghost/dark)에 5번째로 추가

**Phase 1 홈 화면**의 hand-rolled 흰 pill을 이걸로 교체.

### 3.3 탭바 (`app/(tabs)/_layout.tsx`)

**변경:**
1. 동적 사이징 코드 제거. `Math.floor(width * 0.10)` → 고정 `iconSize: 24`, `fontSize: 11`.
2. `href: null` 제거 → AI상담 탭 노출.
3. 산부인과 탭 제거 → 홈 그리드에서 진입.
4. 탭 순서: 홈 / 다이어리 / 커뮤니티 / AI상담 / 내정보.
5. `tabBarStyle` 정리: `borderTopColor: theme.color.cream[200]`, `height: 64` 고정 (safe-area는 별도 처리).
6. focused 색상: `theme.color.pink[500]`. inactive: `theme.color.ink[400]`.

**변경 없음:** TabIcon 컴포넌트 시그니처(`source/label/focused`).

### 3.4 화면별 마이그레이션 가이드

각 화면은 동일한 패턴:
1. 최상단 `<SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>`
2. `<ScreenHeader title="..." rightAction={<Button size="sm">...</Button>} />` (필요 시)
3. 본문은 `<Card>` 변형으로 구성
4. 칩은 `<Chip>` 사용
5. 빈 상태는 `<EmptyState>` 사용
6. 모달은 `<Sheet>`로 교체

**비즈니스 로직 변경 금지** — store hooks, fetch, navigation 모두 그대로.

### 3.5 화면별 상세

#### `app/(tabs)/profile.tsx` (가장 단순, 검증 워밍업)

**Before** (요약):
- 헤더: "👤 내 정보"
- 프로필 카드 (그림자 inline)
- 메뉴 아이템들

**After:**
- `<ScreenHeader title="내 정보" />`
- `<Card variant="default">` 안에 BabyGrowth + 닉네임 + 주차 정보
- 메뉴는 `<Card variant="flat">` 리스트
- 로그아웃은 `<Button variant="ghost">`

#### `app/(tabs)/chat.tsx`

**Before:**
- 헤더 "💬 AI 상담" + 부제
- FlatList of ChatBubble
- KeyboardAvoidingView + 입력창

**After:**
- `<ScreenHeader title="AI 상담" subtitle="임신·출산·육아 궁금한 건 뭐든 물어보세요" />`
- 빠른 질문 칩(첫 화면): `<Chip color="primary" variant="solid">` 사용
- 입력창 컨테이너: 기존 inline → 토큰 적용 (배경 ink[0], 상단 border cream[200], padding space[3])
- 전송 버튼: `<Button>` 안 씀. 작은 원형 버튼은 인라인 유지(layout exception). 색상만 토큰.
- ChatBubble 컴포넌트(`components/ChatBubble.tsx`)는 별도 컴포넌트 유지하되 토큰 적용.

#### `app/(tabs)/community.tsx`

**Before:**
- 헤더 "👩‍👩‍👧 커뮤니티" + "+ 글쓰기" 버튼
- 맘카페 horizontal scroll
- 카테고리 필터 horizontal scroll
- FlatList of posts

**After:**
- `<ScreenHeader title="커뮤니티" rightAction={<Button size="sm">+ 글쓰기</Button>} />`
- 맘카페 카드: `<Card variant="flat">` 작은 가로 스크롤
- 카테고리 필터: `<Chip selected={...} color="primary">` 가로 스크롤
- 게시글 카드: `<Card variant="default" onPress={...}>` (그림자 통일)
- 카테고리 라벨 칩: `<Chip color="primary" variant="solid">`
- 빈 상태: `<EmptyState illustration={...} title="아직 게시글이 없어요" description={...} />`

#### `app/(tabs)/hospital.tsx` (가장 큼, 520줄)

**Before** (520줄):
- 헤더 + 검색바
- 카테고리 필터
- 즐겨찾기 섹션
- 리스트
- 네이버 연동 버튼

**After** (구조는 유지, 토큰/컴포넌트만 교체):
- `<ScreenHeader title="산부인과" />`
- 검색바: 기존 `TextInput` + 토큰 (배경, 라운드, 패딩)
- 카테고리 칩: `<Chip>`
- 카드: `<Card variant="default" onPress={...}>`
- 빈 결과: `<EmptyState>`
- 즐겨찾기/네이버 연동 등 비즈니스 로직 보존
- **520줄 → 절대 길이 줄이는 것 우선 아님**. 토큰화만 강제.

#### `app/(tabs)/diary.tsx` (Sheet 검증, 485줄)

**Before:**
- 캘린더 (셀 height 46, 도트 시스템)
- 선택된 날짜 카드
- 타입별 이벤트 카드 4종
- 모달 (`<Modal animationType="slide">` + 인라인 핸들)

**After:**
- `<ScreenHeader title="다이어리" rightAction={<Button size="sm">+ 일기</Button>} />`
- 캘린더 영역은 토큰만 적용 (셀 사이즈/도트 재설계는 Phase 3)
- 이벤트 타입 카드: `<Card variant="default">`
- 칩: `<Chip color={evtType.key} selected={isChecked}>` (Chip의 첫 실전 적용)
- **모달은 `<Sheet>` 교체:**
  ```tsx
  <Sheet visible={showModal} onClose={() => setShowModal(false)}>
    <Sheet.Header title={`${evtTypeInfo.icon} ${evtTypeInfo.label}`} subtitle={...} />
    <Sheet.Content>
      {/* 칩 그리드 */}
      {/* 메모 인풋 */}
    </Sheet.Content>
    <Sheet.Footer>
      <Button variant="primary" fullWidth onPress={handleSave}>저장하기</Button>
    </Sheet.Footer>
  </Sheet>
  ```

### 3.6 홈 화면 수정 (Phase 1.5 정리)

`app/(tabs)/index.tsx`에서:
1. 흰 pill CTA `<View>` → `<Button variant="onAccent">` 교체.
2. 모든 raw 숫자(fontSize:18, lineHeight:24 등) → `theme.font.hero` 등 새 토큰으로 교체.
3. iconBox 크기들(`width:32/40` 등) → `theme.iconBox.*` 토큰으로 교체.

## 4. 마이그레이션 순서 (검증 가능한 순)

1. **토큰 확장** (`theme.ts` 업데이트) — 모든 후속 작업의 전제
2. **`<Button>` onAccent variant 추가**
3. **홈 화면 정리** (Phase 1.5: I-1, I-2 해결) — 새 토큰 첫 검증
4. **탭바 재설계** (`(tabs)/_layout.tsx`) — 작고 독립적
5. **profile.tsx** — 가장 단순한 화면으로 패턴 검증
6. **chat.tsx** — 입력 UI 패턴 검증
7. **community.tsx** — Chip 첫 컬렉션 사용 + Card 리스트 패턴 검증
8. **diary.tsx** — Sheet 첫 적용 + Chip 폼 사용 (가장 검증 가치 높음)
9. **hospital.tsx** — 가장 큰 화면. 위 패턴 누적 적용.
10. **수락 기준 검증**

## 5. 비스코프

- sub-screens 마이그레이션 (Phase 2B)
- 캘린더 셀/도트 재설계 (Phase 3)
- 햅틱, Toast (Phase 3)
- 빈 상태 SVG 일러스트 (Phase 3)
- 다크모드, 접근성 (보류)
- 새로운 기능 추가 (없음)

## 6. 수락 기준

Phase 2A 완료 시 모두 충족:

1. ✅ `theme.ts`에 신규 토큰(`font.hero`, `font.bodyLg`, `iconBox`, `opacity`, `scrim`) 추가.
2. ✅ `<Button>` onAccent variant 동작.
3. ✅ 5개 탭 화면(profile/chat/community/diary/hospital) 모두 `<ScreenHeader>` 사용.
4. ✅ 5개 탭 화면 + 홈 모두 hex 코드 하드코딩 0개 (`grep -E '#[0-9A-Fa-f]{6}' app/(tabs)/*.tsx app/(tabs)/index.tsx` 결과 없음).
5. ✅ 5개 탭 화면 헤더에 장식 이모지 0개 (`📖 다이어리`, `💬 AI 상담` 등 모두 텍스트만).
6. ✅ 다이어리 모달이 `<Sheet>` 사용 (드래그-투-클로즈 동작 확인).
7. ✅ `<Chip>`이 다이어리 이벤트 모달과 커뮤니티 카테고리에서 사용 (검증 완료).
8. ✅ 탭바: AI상담 5번째 탭으로 노출, 산부인과 탭 제거, 아이콘 사이즈 24 고정.
9. ✅ TypeScript 타입 에러 0.
10. ✅ 시뮬레이터/웹에서 5개 탭 화면 모두 정상 렌더 (헤더/카드/칩/리스트/빈상태).

## 7. 리스크 / 대응

| 리스크 | 대응 |
|---|---|
| Sheet 교체 시 다이어리 이벤트 모달의 동작이 깨짐 (체크리스트 토글, 메모 입력) | 모달 → Sheet 교체는 Children 그대로 옮김. Sheet는 wrapper만 다름. 비즈니스 로직 손대지 않음. |
| hospital.tsx 520줄 마이그레이션 중 회귀 발생 | 사전에 git diff 확인, 비즈니스 로직 라인은 변경 없도록 strict하게 토큰 교체만. |
| Chip의 다중 색상이 다이어리에서 어색함 | 이벤트 타입 4종(hospital/checkup/symptom/medicine)은 이미 semantic 색상 매핑 존재. Chip의 color prop으로 1:1 매핑. |
| 탭바에서 산부인과 탭 제거 시 사용자 혼란 | 산부인과는 홈 그리드에 이미 노출되어 있음. 추가 액션 불필요. |
| 토큰 확장이 Phase 1 코드 깨뜨림 | 토큰은 추가만 하고 기존 토큰 변경 안 함. backward compatible. |

## 8. Phase 2B/3 (참조용)

- **Phase 2B** (~2일): sub-screens 일괄 마이그레이션 (login/profile-setup/tips/nutrition/youtube/write/detail 화면들).
- **Phase 3** (~2-3일): 폴리시 — 햅틱, Toast, EmptyState SVG 일러스트, 캘린더 셀/도트 재설계, 주차별 SVG 풀세트, 중앙 FAB AI상담 옵션 검토.
