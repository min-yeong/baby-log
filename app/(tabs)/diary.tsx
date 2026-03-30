import { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAuthStore } from "../../stores/authStore";
import { useDiaryStore, DiaryEntry } from "../../stores/diaryStore";
import { useEventStore, CalendarEvent, EventType } from "../../stores/eventStore";
import { EMOTIONS } from "../../constants/emotions";
import { calculatePregnancyWeek } from "../../lib/pregnancy";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const EVENT_TYPES: { key: EventType; label: string; color: string; icon: string; quickItems: string[] }[] = [
  { key: "hospital", label: "병원방문", color: "#64B5F6", icon: "🏥", quickItems: ["산부인과", "초음파", "혈액검사", "치과"] },
  { key: "checkup", label: "검진", color: "#81C784", icon: "🔬", quickItems: ["1차 기형아", "2차 기형아", "당뇨검사", "정밀초음파"] },
  { key: "symptom", label: "증상", color: "#FFB74D", icon: "🤒", quickItems: ["입덧", "두통", "허리통증", "부종", "피로"] },
  { key: "medicine", label: "영양제", color: "#BA68C8", icon: "💊", quickItems: ["엽산", "철분", "비타민D", "오메가3", "유산균"] },
];

// 주차별 추천 항목 (해당 주차에 특히 필요한 것)
const WEEK_RECOMMENDED: Record<EventType, Record<string, string[]>> = {
  medicine: {
    early: ["엽산", "비타민D", "유산균"],         // ~16주
    mid: ["철분", "비타민D", "오메가3", "칼슘"],   // 16~28주
    late: ["철분", "오메가3", "칼슘", "비타민D"],   // 28주~
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

// TODO: DB 연동 후 실제 전체 사용자 통계로 교체
const POPULAR_ITEMS: Record<EventType, string[]> = {
  medicine: ["엽산", "철분", "비타민D", "오메가3", "유산균", "칼슘", "마그네슘", "종합비타민"],
  symptom: ["입덧", "두통", "허리통증", "부종", "피로", "소화불량", "불면", "배뭉침", "변비"],
  hospital: ["산부인과", "초음파", "혈액검사", "치과", "한의원"],
  checkup: ["1차 기형아", "2차 기형아", "당뇨검사", "정밀초음파", "NST검사"],
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

  // 이벤트 모달
  const [showModal, setShowModal] = useState(false);
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
      dots.push("#FF6B81");
      if (data.diary.photos && data.diary.photos.length > 0) hasPhoto = true;
    }
    const colors: Record<string, string> = { hospital: "#64B5F6", checkup: "#81C784", symptom: "#FFB74D", medicine: "#BA68C8" };
    const seen = new Set<string>();
    data.events.forEach((e) => { if (!seen.has(e.type)) { dots.push(colors[e.type] || "#CCC"); seen.add(e.type); } });
    return { colors: dots.slice(0, 4), hasPhoto };
  };

  // 주차 구간
  const weekStage = useMemo(() => {
    if (!profile?.due_date) return "early";
    const { weeks } = calculatePregnancyWeek(profile.due_date);
    if (weeks < 16) return "early";
    if (weeks < 28) return "mid";
    return "late";
  }, [profile]);

  // 칩 목록 생성: 자주 쓰는 것 → 주차 추천 → 전체 인기 (중복 제거)
  const getOrderedChips = (type: EventType): { label: string; tag: "frequent" | "recommended" | "popular" }[] => {
    const seen = new Set<string>();
    const result: { label: string; tag: "frequent" | "recommended" | "popular" }[] = [];

    // 1. 자주 쓰는 것 (내 이벤트 빈도순)
    const counts: Record<string, number> = {};
    events.filter((e) => e.type === type).forEach((e) => { counts[e.title] = (counts[e.title] || 0) + 1; });
    const frequent = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t]) => t);
    for (const item of frequent) {
      if (!seen.has(item)) { result.push({ label: item, tag: "frequent" }); seen.add(item); }
    }

    // 2. 주차별 추천
    const recommended = WEEK_RECOMMENDED[type]?.[weekStage] || [];
    for (const item of recommended) {
      if (!seen.has(item)) { result.push({ label: item, tag: "recommended" }); seen.add(item); }
    }

    // 3. 전체 인기 (TODO: DB 연동 후 실제 통계)
    const popular = POPULAR_ITEMS[type] || [];
    for (const item of popular) {
      if (!seen.has(item)) { result.push({ label: item, tag: "popular" }); seen.add(item); }
    }

    return result;
  };

  // 모달 열기
  const openModal = (type: EventType) => {
    setModalType(type);
    setMemoText("");
    setShowCustomInput(false);
    setCustomTitle("");
    const existing = new Set<string>();
    selectedData?.events.filter((e) => e.type === type).forEach((e) => existing.add(e.title));
    setCheckedItems(existing);
    setShowModal(true);
  };

  // 체크 토글
  const toggleItem = (item: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  // 모달 저장
  const handleSave = async () => {
    if (!user) return;

    const hasCustom = customTitle.trim().length > 0;
    if (checkedItems.size === 0 && !hasCustom) {
      Alert.alert("알림", "항목을 선택하거나 직접 입력해주세요");
      return;
    }

    // 기존 해당 타입 이벤트 삭제
    const existingEvts = selectedData?.events.filter((e) => e.type === modalType) || [];
    for (const evt of existingEvts) {
      await deleteEvent(evt.id);
    }

    const memo = memoText.trim();

    // 체크된 항목 저장
    for (const item of checkedItems) {
      await createEvent({ userId: user.id, date: selectedDate, type: modalType, title: item, memo });
    }

    // 직접 입력 항목 저장
    if (hasCustom) {
      await createEvent({ userId: user.id, date: selectedDate, type: modalType, title: customTitle.trim(), memo });
    }

    setShowModal(false);
  };

  const evtTypeInfo = EVENT_TYPES.find((t) => t.key === modalType);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#2D2D2D" }}>📖 다이어리</Text>
          <TouchableOpacity onPress={() => router.push("/diary/write")} activeOpacity={0.7} style={{ backgroundColor: "#FF6B81", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 }}>
            <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "600" }}>+ 일기</Text>
          </TouchableOpacity>
        </View>

        {/* 캘린더 */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, marginHorizontal: 20, padding: 18, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <TouchableOpacity onPress={prevMonth} style={{ padding: 8 }}><Text style={{ fontSize: 20, color: "#9B9B9B" }}>‹</Text></TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#2D2D2D" }}>{currentYear}년 {currentMonth + 1}월</Text>
            <TouchableOpacity onPress={nextMonth} style={{ padding: 8 }}><Text style={{ fontSize: 20, color: "#9B9B9B" }}>›</Text></TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {WEEKDAYS.map((day, i) => (
              <View key={day} style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: i === 0 ? "#FF6B81" : i === 6 ? "#64B5F6" : "#9B9B9B" }}>{day}</Text>
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
                <TouchableOpacity key={day} onPress={() => setSelectedDate(dateStr)} activeOpacity={0.6} style={{ width: "14.28%", height: 46, alignItems: "center", justifyContent: "flex-start", paddingTop: 2 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: isSelected ? "#FF6B81" : isToday ? "#FFD6DE" : "transparent", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 13, fontWeight: isToday || isSelected ? "700" : "400", color: isSelected ? "#FFF" : isToday ? "#FF6B81" : dayOfWeek === 0 ? "#FF6B81" : dayOfWeek === 6 ? "#64B5F6" : "#2D2D2D" }}>{day}</Text>
                  </View>
                  {(dots.length > 0 || hasPhoto) && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                      {hasPhoto && <Text style={{ fontSize: 6, marginRight: 1 }}>📷</Text>}
                      {dots.map((color, i) => <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginHorizontal: 0.5 }} />)}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {/* 범례 */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F5F5F5" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF6B81", marginRight: 4 }} />
              <Text style={{ fontSize: 10, color: "#9B9B9B" }}>일기</Text>
            </View>
            {EVENT_TYPES.map((evt) => (
              <View key={evt.key} style={{ flexDirection: "row", alignItems: "center", marginRight: 12, marginBottom: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: evt.color, marginRight: 4 }} />
                <Text style={{ fontSize: 10, color: "#9B9B9B" }}>{evt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 선택된 날짜의 기록 */}
        <View style={{ paddingHorizontal: 20, marginBottom: 90 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#2D2D2D" }}>
              {selectedDate.slice(5).replace("-", ".")}
            </Text>
          </View>

          {/* 일기 */}
          {selectedData?.diary ? (
            <TouchableOpacity onPress={() => router.push(`/diary/${selectedData.diary!.id}`)} activeOpacity={0.7} style={{ backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
              {selectedData.diary!.photos && selectedData.diary!.photos.length > 0 && (
                <View>
                  {selectedData.diary!.photos.length === 1 ? (
                    <Image source={{ uri: selectedData.diary!.photos[0].photo_url }} style={{ width: "100%", height: 180 }} contentFit="cover" />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 140 }}>
                      {selectedData.diary!.photos.map((photo) => (
                        <Image key={photo.id} source={{ uri: photo.photo_url }} style={{ width: 180, height: 140, marginRight: 2 }} contentFit="cover" />
                      ))}
                    </ScrollView>
                  )}
                </View>
              )}
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 28, marginRight: 10 }}>{EMOTIONS.find((e) => e.key === selectedData.diary!.emotion)?.emoji || "📝"}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#2D2D2D" }}>
                      {EMOTIONS.find((e) => e.key === selectedData.diary!.emotion)?.label || "일기"}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#FFB5C2" }}>{selectedData.diary!.week_number}주차</Text>
                  </View>
                </View>
                {selectedData.diary!.content && <Text style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 20 }} numberOfLines={3}>{selectedData.diary!.content}</Text>}
              </View>
            </TouchableOpacity>
          ) : null}

          {/* 이벤트 기록 카드들 - 타입별 */}
          {EVENT_TYPES.map((evtType) => {
            const typeEvents = selectedData?.events.filter((e) => e.type === evtType.key) || [];
            const hasEvents = typeEvents.length > 0;
            const memo = typeEvents.find((e) => e.memo)?.memo;

            return (
              <TouchableOpacity
                key={evtType.key}
                onPress={() => openModal(evtType.key)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                }}
              >
                {/* 헤더 */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: hasEvents ? 10 : 0 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: evtType.color + "18", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                    <Text style={{ fontSize: 16 }}>{evtType.icon}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D", flex: 1 }}>{evtType.label}</Text>
                  {hasEvents ? (
                    <Text style={{ fontSize: 12, color: evtType.color, fontWeight: "600" }}>수정</Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: "#C0C0C0" }}>+ 추가</Text>
                  )}
                </View>

                {/* 체크된 항목 칩 */}
                {hasEvents && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {typeEvents.map((evt) => (
                      <View
                        key={evt.id}
                        style={{
                          backgroundColor: evtType.color + "18",
                          borderRadius: 10,
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          marginRight: 6,
                          marginBottom: 6,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: evtType.color, fontWeight: "600" }}>{evt.title}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* 메모 */}
                {memo && (
                  <Text style={{ fontSize: 12, color: "#9B9B9B", marginTop: 4 }}>📝 {memo}</Text>
                )}
              </TouchableOpacity>
            );
          })}

          {/* 기록 없을 때 일기 쓰기 */}
          {!selectedData?.diary && (
            <TouchableOpacity onPress={() => router.push("/diary/write")} activeOpacity={0.7} style={{ backgroundColor: "#FF6B81", borderRadius: 16, padding: 18, alignItems: "center", marginTop: 4 }}>
              <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "700" }}>📝 일기 쓰기</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* 이벤트 체크 모달 */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
          {/* 상단 빈 영역 탭하면 닫기 */}
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowModal(false)} />

          {/* 모달 본체 */}
          <View style={{ backgroundColor: "#FFF8F0", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            {/* 핸들 */}
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#DDD" }} />
            </View>

            {/* 헤더 */}
            <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#2D2D2D" }}>
                {evtTypeInfo?.icon} {evtTypeInfo?.label}
              </Text>
              <Text style={{ fontSize: 13, color: "#9B9B9B", marginTop: 4 }}>
                {selectedDate.replace(/-/g, ".")} · 해당하는 항목을 체크하세요
              </Text>
            </View>

            {/* 체크리스트 */}
            <View style={{ paddingHorizontal: 24 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {getOrderedChips(modalType).map(({ label: item, tag }) => {
                  const checked = checkedItems.has(item);
                  const isFrequent = tag === "frequent";
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => toggleItem(item)}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: checked ? (evtTypeInfo?.color || "#FF6B81") : "#FFFFFF",
                        borderRadius: 20,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        marginRight: 8,
                        marginBottom: 8,
                        borderWidth: 1.5,
                        borderColor: checked ? (evtTypeInfo?.color || "#FF6B81") : isFrequent ? evtTypeInfo?.color + "60" : "#EEEEEE",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: checked ? "#FFF" : "#2D2D2D", fontWeight: checked || isFrequent ? "700" : "400" }}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
                {/* 직접입력 칩 */}
                <TouchableOpacity
                  onPress={() => setShowCustomInput(!showCustomInput)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: showCustomInput ? "#2D2D2D" : "#FFFFFF",
                    borderRadius: 20,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 1.5,
                    borderColor: showCustomInput ? "#2D2D2D" : "#EEEEEE",
                    borderStyle: "dashed",
                  }}
                >
                  <Text style={{ fontSize: 14, color: showCustomInput ? "#FFF" : "#9B9B9B" }}>+ 직접입력</Text>
                </TouchableOpacity>
              </View>

              {/* 직접입력 필드 */}
              {showCustomInput && (
                <TextInput
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  placeholder="항목명을 입력하세요"
                  placeholderTextColor="#C0C0C0"
                  autoFocus
                  style={{ backgroundColor: "#FFF", borderRadius: 12, padding: 14, fontSize: 14, color: "#2D2D2D", marginTop: 4 }}
                />
              )}
            </View>

            {/* 메모 (선택) */}
            <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
              <TextInput
                value={memoText}
                onChangeText={setMemoText}
                placeholder="메모 남기기 (선택) 예: 엽산 800μg 복용"
                placeholderTextColor="#C0C0C0"
                style={{ backgroundColor: "#FFF", borderRadius: 12, padding: 14, fontSize: 14, color: "#2D2D2D" }}
              />
            </View>

            {/* 버튼 */}
            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 36 }}>
              <TouchableOpacity onPress={handleSave} activeOpacity={0.7} style={{ backgroundColor: evtTypeInfo?.color || "#FF6B81", borderRadius: 14, paddingVertical: 16, alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>저장하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
