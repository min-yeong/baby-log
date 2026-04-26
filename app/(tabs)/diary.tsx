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
import { Button, Card, Chip, ScreenHeader, Sheet } from "../../components/ui";

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
        dots.push(theme.color.semantic[e.type]);
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

  const getOrderedChips = (type: EventType): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];

    const counts: Record<string, number> = {};
    events.filter((e) => e.type === type).forEach((e) => { counts[e.title] = (counts[e.title] || 0) + 1; });
    const frequent = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t]) => t);
    const recommended = WEEK_RECOMMENDED[type]?.[weekStage] || [];
    const popular = POPULAR_ITEMS[type] || [];

    for (const source of [frequent, recommended, popular]) {
      for (const item of source) {
        if (!seen.has(item)) { result.push(item); seen.add(item); }
      }
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

          {selectedData?.diary && (() => {
            const diary = selectedData.diary;
            const emotion = EMOTIONS.find((e) => e.key === diary.emotion);
            return (
              <View style={{ marginBottom: theme.space[3] }}>
                <Card variant="default" onPress={() => router.push(`/diary/${diary.id}`)} padding={0}>
                  {diary.photos && diary.photos.length > 0 && (
                    <View>
                      {diary.photos.length === 1 ? (
                        <Image
                          source={{ uri: diary.photos[0].photo_url }}
                          style={{ width: "100%", height: 180 }}
                          contentFit="cover"
                        />
                      ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: 140 }}>
                          {diary.photos.map((photo) => (
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
                        {emotion?.emoji || ""}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: theme.font.body.size, fontWeight: "700", color: theme.color.ink[900] }}>
                          {emotion?.label || "일기"}
                        </Text>
                        <Text style={{ fontSize: theme.font.caption.size, color: theme.color.pink[400] }}>
                          {diary.week_number}주차
                        </Text>
                      </View>
                    </View>
                    {diary.content && (
                      <Text
                        style={{ fontSize: theme.font.label.size, color: theme.color.ink[700], lineHeight: 20 }}
                        numberOfLines={3}
                      >
                        {diary.content}
                      </Text>
                    )}
                  </View>
                </Card>
              </View>
            );
          })()}

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
                        backgroundColor: theme.color.tint[evtType.key],
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
                        color: hasEvents ? theme.color.semantic[evtType.key] : theme.color.cream[300],
                        fontWeight: "600",
                      }}
                    >
                      {hasEvents ? "수정" : "+ 추가"}
                    </Text>
                  </View>

                  {hasEvents && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.space[2] - 2 }}>
                      {typeEvents.map((evt) => (
                        <Chip key={evt.id} color={evtType.key} variant="solid">
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

      <Sheet visible={showSheet} onClose={() => setShowSheet(false)}>
        <Sheet.Header
          title={`${evtTypeInfo?.icon || ""} ${evtTypeInfo?.label || ""}`}
          subtitle={`${selectedDate.replace(/-/g, ".")} · 해당하는 항목을 체크하세요`}
        />
        <Sheet.Content>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.space[2] }}>
            {getOrderedChips(modalType).map((item) => (
              <Chip
                key={item}
                selected={checkedItems.has(item)}
                color={modalType}
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
