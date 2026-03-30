import { useState, useEffect } from "react";
import { handleScroll } from "../stores/uiStore";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/authStore";
import { calculatePregnancyWeek } from "../lib/pregnancy";

interface Supplement {
  id: string;
  name: string;
  icon: string;
  weekFrom: number;
  weekTo: number;
  required: boolean;
  dosage: string;
  why: string;
  howTo: string;
  warning: string;
  foods: string[];
}

const SUPPLEMENTS: Supplement[] = [
  {
    id: "folic",
    name: "엽산",
    icon: "💚",
    weekFrom: 0,
    weekTo: 16,
    required: true,
    dosage: "하루 400~800μg (임신 초기 필수!)",
    why: "아기의 신경관(뇌, 척수) 발달에 필수적이에요. 부족하면 신경관 결손(이분척추, 무뇌증) 위험이 높아져요. 임신 전부터 먹는 게 가장 좋아요!",
    howTo: "식후 복용 추천. 활성형 엽산(5-MTHF)이 흡수가 더 잘 돼요.\n\n⚠️ 함량 계산법:\n- 식이엽산(Folate): 표시 그대로 계산\n- 합성엽산(Folic Acid): 흡수율 높아서 식이엽산 환산 시 x1.7\n- 예: 합성엽산 400μg = 식이엽산 680μg DFE\n\n종합비타민에 포함된 엽산 + 별도 엽산제 합쳐서 800μg DFE 이하로!",
    warning: "과다 복용(1,000μg 이상) 주의! 비타민B12 결핍을 가릴 수 있어요. 종합비타민에 들어있는 양도 합산해서 계산하세요.",
    foods: ["시금치", "브로콜리", "아보카도", "렌즈콩", "오렌지", "아스파라거스"],
  },
  {
    id: "iron",
    name: "철분",
    icon: "🔴",
    weekFrom: 16,
    weekTo: 40,
    required: true,
    dosage: "하루 24~30mg (16주부터 시작)",
    why: "임신 중 혈액량이 40~50% 증가해서 철분 요구량이 급격히 늘어요. 부족하면 빈혈, 조산, 저체중아 위험!",
    howTo: "공복(식전 1시간 or 식후 2시간)에 비타민C(오렌지주스 등)와 함께 먹으면 흡수율 UP!\n\n⚠️ 이것과 같이 먹지 마세요:\n- 칼슘제 (2시간 간격)\n- 커피/녹차 (탄닌이 흡수 방해)\n- 유제품 (칼슘이 방해)",
    warning: "변비, 검은 변이 생길 수 있어요 (정상). 속이 불편하면 취침 전에 복용하거나, 철분 비스글리시네이트(Bisglycinate) 형태가 위장 부담이 적어요.",
    foods: ["소고기(적색육)", "시금치", "두부", "달걀 노른자", "굴", "건포도"],
  },
  {
    id: "vitd",
    name: "비타민D",
    icon: "☀️",
    weekFrom: 0,
    weekTo: 40,
    required: true,
    dosage: "하루 400~1,000IU",
    why: "아기의 뼈 성장, 면역력 발달에 필수! 한국인 90%가 비타민D 부족이에요. 실내 생활이 많으면 필수 보충!",
    howTo: "지용성이라 식후에 기름진 음식과 함께 먹으면 흡수율 UP. 하루 15분 햇빛 쬐기도 도움이 돼요.",
    warning: "하루 4,000IU 초과하지 마세요. 혈액검사로 수치 확인 후 의사와 상담하는 게 가장 좋아요.",
    foods: ["연어", "고등어", "달걀 노른자", "표고버섯", "우유"],
  },
  {
    id: "omega3",
    name: "오메가3 (DHA)",
    icon: "🐟",
    weekFrom: 12,
    weekTo: 40,
    required: false,
    dosage: "하루 DHA 200~300mg",
    why: "아기의 뇌 발달과 시력 발달에 중요해요. 특히 임신 후기에 아기 뇌가 급성장하는 시기에 중요!",
    howTo: "EPA보다 DHA 함량이 높은 제품 선택. 식물성(해조류 추출) 오메가3도 좋아요.\n\n⚠️ 임산부용으로 중금속 검사 완료된 제품으로!",
    warning: "혈액 응고에 영향을 줄 수 있어서 출산 2~3주 전에는 중단하는 게 좋아요. 의사와 상담!",
    foods: ["연어", "고등어", "멸치", "호두", "아마씨"],
  },
  {
    id: "calcium",
    name: "칼슘",
    icon: "🦴",
    weekFrom: 16,
    weekTo: 40,
    required: false,
    dosage: "하루 800~1,000mg (음식 포함)",
    why: "아기의 뼈와 치아 형성에 필수. 부족하면 엄마의 뼈에서 칼슘을 가져가서 엄마 골밀도가 떨어져요!",
    howTo: "한 번에 500mg 이하로 나눠서 복용(흡수율). 비타민D와 함께 먹으면 흡수 UP.\n\n⚠️ 철분제와 2시간 간격으로 복용!",
    warning: "과다 복용 시 변비, 결석 위험. 유제품을 잘 먹으면 별도 보충 안 해도 될 수 있어요.",
    foods: ["우유", "치즈", "요거트", "두부", "멸치", "케일"],
  },
  {
    id: "probiotics",
    name: "유산균",
    icon: "🦠",
    weekFrom: 0,
    weekTo: 40,
    required: false,
    dosage: "100억 CFU 이상",
    why: "임신 중 변비 예방 + 아기 아토피 예방에 도움! 장 건강은 면역력과도 직결돼요.",
    howTo: "공복에 미지근한 물과 함께. 냉장 보관 제품이 균 생존율이 높아요.",
    warning: "특별한 부작용은 없지만, 처음 먹을 때 가스가 찰 수 있어요. 1~2주면 적응돼요.",
    foods: ["요거트", "김치", "된장", "콤부차", "낫또"],
  },
];

// 입덧 정보
interface MorningSicknessType {
  icon: string;
  name: string;
  description: string;
  tips: string[];
}

const MORNING_SICKNESS_TYPES: MorningSicknessType[] = [
  {
    icon: "🤢",
    name: "먹덧",
    description: "배가 비면 속이 울렁거려서 계속 뭔가를 먹어야 하는 타입. 살이 찔 수 있어서 걱정되지만 정상이에요!",
    tips: ["소량씩 2시간마다 먹기", "크래커, 견과류 항상 가지고 다니기", "탄수화물 위주로 (빵, 떡)", "물 대신 이온음료도 OK"],
  },
  {
    icon: "🙅‍♀️",
    name: "토덧 (구토형)",
    description: "냄새만 맡아도, 먹기만 하면 토하는 타입. 심하면 탈수 주의! 수분 섭취가 중요해요.",
    tips: ["차가운 음식이 냄새가 덜 남", "레몬수, 생강차 도움", "비타민B6 (의사 상담 후)", "너무 심하면 병원에서 수액 치료"],
  },
  {
    icon: "🦷",
    name: "양치덧",
    description: "양치질할 때 구역질이 나는 타입. 치약 냄새, 칫솔이 입 안에 들어가는 게 트리거!",
    tips: ["어린이용 작은 칫솔 사용", "민트향 없는 치약으로 교체", "가글로 대체 (임시)", "식후 바로 말고 30분 후에 양치"],
  },
  {
    icon: "👃",
    name: "냄새덧",
    description: "특정 냄새(밥냄새, 고기냄새, 향수 등)에 극도로 민감해지는 타입. 후각이 10배 예민해져요!",
    tips: ["환기를 자주 하기", "레몬/자몽 향 손수건 들고다니기", "남편에게 향수/애프터쉐이브 금지 요청", "음식은 차가운 상태로 먹기"],
  },
  {
    icon: "😴",
    name: "잠덧",
    description: "극심한 졸음이 쏟아지는 타입. 입덧은 아니지만 호르몬 변화로 잠이 참을 수 없이 와요.",
    tips: ["낮잠 20분씩 허락하기", "무리한 일정 줄이기", "카페인은 하루 200mg 이하로", "밤 수면 환경 개선 (암막커튼 등)"],
  },
  {
    icon: "🤤",
    name: "침덧",
    description: "입에 침이 계속 고이는 타입. 침을 삼키면 속이 울렁거려서 뱉어야 하는 경우도!",
    tips: ["작은 비닐봉지 가지고 다니기", "신 사탕이나 레몬 도움", "얼음 조각 물고 있기", "침 삼키지 말고 뱉어도 괜찮아요"],
  },
];

export default function NutritionScreen() {
  const { profile } = useAuthStore();
  const [currentWeek, setCurrentWeek] = useState(4);
  const [selectedSupplement, setSelectedSupplement] = useState<Supplement | null>(null);
  const [tab, setTab] = useState<"supplements" | "sickness">("supplements");

  useEffect(() => {
    if (profile?.due_date) {
      const { weeks } = calculatePregnancyWeek(profile.due_date);
      setCurrentWeek(weeks);
    }
  }, [profile]);

  const currentSupplements = SUPPLEMENTS.filter(
    (s) => currentWeek >= s.weekFrom && currentWeek <= s.weekTo
  );

  const showSicknessInfo = currentWeek >= 4 && currentWeek <= 16;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }} edges={["bottom"]}>
      {/* 탭 */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          marginTop: 10,
          marginBottom: 12,
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => setTab("supplements")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: tab === "supplements" ? "#FF6B81" : "transparent",
            alignItems: "center",
          }}
        >
          <Text style={{ color: tab === "supplements" ? "#FFF" : "#9B9B9B", fontWeight: "700", fontSize: 14 }}>
            💊 영양제 가이드
          </Text>
        </TouchableOpacity>
        {showSicknessInfo && (
          <TouchableOpacity
            onPress={() => setTab("sickness")}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: tab === "sickness" ? "#FF6B81" : "transparent",
              alignItems: "center",
            }}
          >
            <Text style={{ color: tab === "sickness" ? "#FFF" : "#9B9B9B", fontWeight: "700", fontSize: 14 }}>
              🤢 입덧 가이드
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 90 }}
        onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {tab === "supplements" ? (
          <>
            {/* 현재 주차 */}
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: "#6B6B6B" }}>
                현재 <Text style={{ fontWeight: "700", color: "#FF6B81" }}>{currentWeek}주차</Text>에 필요한 영양제
              </Text>
            </View>

            {/* 타임라인 차트 */}
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 18,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#2D2D2D", marginBottom: 14 }}>
                  📊 영양제 복용 타임라인
                </Text>
                {SUPPLEMENTS.map((sup) => {
                  const totalWeeks = 40;
                  const left = (sup.weekFrom / totalWeeks) * 100;
                  const width = ((sup.weekTo - sup.weekFrom) / totalWeeks) * 100;
                  const isActive = currentWeek >= sup.weekFrom && currentWeek <= sup.weekTo;

                  return (
                    <View key={sup.id} style={{ marginBottom: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                        <Text style={{ fontSize: 14, marginRight: 6 }}>{sup.icon}</Text>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: isActive ? "#FF6B81" : "#9B9B9B" }}>
                          {sup.name}
                        </Text>
                        {sup.required && (
                          <View style={{ backgroundColor: "#FFE5E5", borderRadius: 4, paddingHorizontal: 4, marginLeft: 4 }}>
                            <Text style={{ fontSize: 9, color: "#FF6B81", fontWeight: "700" }}>필수</Text>
                          </View>
                        )}
                        <Text style={{ fontSize: 10, color: "#9B9B9B", marginLeft: "auto" }}>
                          {sup.weekFrom === 0 ? "임신 전" : `${sup.weekFrom}주`}~{sup.weekTo}주
                        </Text>
                      </View>
                      {/* 바 */}
                      <View style={{ height: 8, backgroundColor: "#F0F0F0", borderRadius: 4, overflow: "hidden" }}>
                        <View
                          style={{
                            position: "absolute",
                            left: `${left}%`,
                            width: `${width}%`,
                            height: 8,
                            backgroundColor: isActive ? (sup.required ? "#FF6B81" : "#FFB5C2") : "#DDD",
                            borderRadius: 4,
                          }}
                        />
                        {/* 현재 위치 마커 */}
                        <View
                          style={{
                            position: "absolute",
                            left: `${(currentWeek / totalWeeks) * 100}%`,
                            top: -2,
                            width: 3,
                            height: 12,
                            backgroundColor: "#FF6B81",
                            borderRadius: 1.5,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
                {/* 범례 */}
                <View style={{ flexDirection: "row", marginTop: 8, justifyContent: "center" }}>
                  <Text style={{ fontSize: 10, color: "#9B9B9B" }}>
                    | = 현재 {currentWeek}주
                  </Text>
                </View>
              </View>
            </View>

            {/* 현재 필요한 영양제 카드 */}
            {currentSupplements.map((sup) => (
              <TouchableOpacity
                key={sup.id}
                onPress={() => setSelectedSupplement(sup)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 18,
                  marginHorizontal: 20,
                  marginBottom: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: sup.required ? "#FF6B81" : "#FFB5C2",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 30, marginRight: 12 }}>{sup.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ fontSize: 17, fontWeight: "700", color: "#2D2D2D" }}>
                        {sup.name}
                      </Text>
                      {sup.required && (
                        <View style={{ backgroundColor: "#FFE5E5", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 }}>
                          <Text style={{ fontSize: 10, color: "#FF6B81", fontWeight: "700" }}>필수</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 12, color: "#FF6B81", marginTop: 2 }}>
                      {sup.dosage}
                    </Text>
                  </View>
                  <Text style={{ color: "#9B9B9B", fontSize: 18 }}>›</Text>
                </View>
                <Text style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 19 }} numberOfLines={2}>
                  {sup.why}
                </Text>
                {/* 추천 음식 */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
                  {sup.foods.slice(0, 4).map((food) => (
                    <View
                      key={food}
                      style={{
                        backgroundColor: "#FFF8F0",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        marginRight: 6,
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: "#6B6B6B" }}>{food}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            {/* 입덧 가이드 */}
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#2D2D2D", marginBottom: 8 }}>
                  🤢 입덧이란?
                </Text>
                <Text style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 20 }}>
                  임산부의 약 70~80%가 경험해요. 보통 <Text style={{ fontWeight: "700", color: "#FF6B81" }}>6~8주</Text>에 시작해서{" "}
                  <Text style={{ fontWeight: "700", color: "#FF6B81" }}>12~16주</Text>에 줄어들어요.{"\n\n"}
                  "아침 구토(Morning Sickness)"라고 하지만 실제로는 하루 종일 올 수 있어요!{"\n\n"}
                  원인은 hCG 호르몬 급증 + 에스트로겐 증가 + 후각 민감화 등이 복합적이에요.
                </Text>
              </View>

              {/* 입덧 타임라인 */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#2D2D2D", marginBottom: 12 }}>
                  📊 입덧 강도 변화
                </Text>
                <View style={{ flexDirection: "row", alignItems: "flex-end", height: 60 }}>
                  {[
                    { w: "4주", h: 10 }, { w: "6주", h: 30 }, { w: "8주", h: 55 },
                    { w: "10주", h: 50 }, { w: "12주", h: 35 }, { w: "14주", h: 15 },
                    { w: "16주", h: 5 },
                  ].map((bar, i) => (
                    <View key={i} style={{ flex: 1, alignItems: "center" }}>
                      <View
                        style={{
                          width: "60%",
                          height: bar.h,
                          backgroundColor: bar.h > 40 ? "#FF6B81" : bar.h > 20 ? "#FFB5C2" : "#FFD6DE",
                          borderRadius: 4,
                        }}
                      />
                      <Text style={{ fontSize: 9, color: "#9B9B9B", marginTop: 4 }}>{bar.w}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ fontSize: 11, color: "#9B9B9B", textAlign: "center", marginTop: 8 }}>
                  8~10주가 피크! 대부분 16주 이후 완화돼요 💪
                </Text>
              </View>

              {/* 입덧 유형 */}
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#2D2D2D", marginBottom: 12 }}>
                입덧 유형별 대처법
              </Text>

              {MORNING_SICKNESS_TYPES.map((type) => (
                <View
                  key={type.name}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <Text style={{ fontSize: 28, marginRight: 10 }}>{type.icon}</Text>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: "#2D2D2D" }}>
                        {type.name}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 19, marginBottom: 12 }}>
                    {type.description}
                  </Text>
                  <View style={{ backgroundColor: "#FFF8F0", borderRadius: 10, padding: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#FF6B81", marginBottom: 6 }}>
                      💡 대처법
                    </Text>
                    {type.tips.map((tip, i) => (
                      <Text key={i} style={{ fontSize: 12, color: "#2D2D2D", lineHeight: 18 }}>
                        • {tip}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}

              {/* 병원 가야 할 때 */}
              <View
                style={{
                  backgroundColor: "#FFE5E5",
                  borderRadius: 16,
                  padding: 18,
                  marginTop: 6,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#FF6B81", marginBottom: 8 }}>
                  🚨 이럴 때는 꼭 병원에 가세요!
                </Text>
                <Text style={{ fontSize: 13, color: "#2D2D2D", lineHeight: 20 }}>
                  • 하루에 5회 이상 구토{"\n"}
                  • 물도 못 마시는 상태가 24시간 이상{"\n"}
                  • 소변이 진한 갈색이거나 거의 안 나옴{"\n"}
                  • 체중이 2주에 2kg 이상 빠짐{"\n"}
                  • 어지럽고 기절할 것 같은 느낌{"\n\n"}
                  → <Text style={{ fontWeight: "700" }}>임신오조(Hyperemesis Gravidarum)</Text>일 수 있어요.{"\n"}
                  수액 치료가 필요할 수 있으니 참지 마세요!
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* 영양제 상세 모달 */}
      <Modal visible={!!selectedSupplement} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#FFF8F0", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85%", paddingBottom: 40 }}>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              <View style={{ alignItems: "center", marginBottom: 12 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#DDD" }} />
              </View>

              {selectedSupplement && (
                <>
                  <Text style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>
                    {selectedSupplement.icon}
                  </Text>
                  <Text style={{ fontSize: 22, fontWeight: "bold", color: "#2D2D2D", textAlign: "center", marginBottom: 4 }}>
                    {selectedSupplement.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#FF6B81", textAlign: "center", marginBottom: 16 }}>
                    {selectedSupplement.dosage}
                  </Text>

                  {/* 왜 필요한지 */}
                  <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#2D2D2D", marginBottom: 6 }}>
                      왜 필요해요?
                    </Text>
                    <Text style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 20 }}>
                      {selectedSupplement.why}
                    </Text>
                  </View>

                  {/* 복용법 */}
                  <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#2D2D2D", marginBottom: 6 }}>
                      💊 복용법 & 꿀팁
                    </Text>
                    <Text style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 20 }}>
                      {selectedSupplement.howTo}
                    </Text>
                  </View>

                  {/* 주의사항 */}
                  <View style={{ backgroundColor: "#FFE5E5", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#FF6B81", marginBottom: 6 }}>
                      ⚠️ 주의사항
                    </Text>
                    <Text style={{ fontSize: 13, color: "#2D2D2D", lineHeight: 20 }}>
                      {selectedSupplement.warning}
                    </Text>
                  </View>

                  {/* 추천 음식 */}
                  <View style={{ backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#2D2D2D", marginBottom: 8 }}>
                      🍽️ 이 음식에 많아요
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                      {selectedSupplement.foods.map((food) => (
                        <View
                          key={food}
                          style={{
                            backgroundColor: "#E8F8F0",
                            borderRadius: 10,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            marginRight: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ fontSize: 13, color: "#2DB783" }}>{food}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity
                onPress={() => setSelectedSupplement(null)}
                style={{ alignItems: "center", paddingVertical: 8 }}
              >
                <Text style={{ color: "#9B9B9B", fontSize: 14 }}>닫기</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
