export interface WeeklyTip {
  id: string;
  weekFrom: number;
  weekTo: number;
  icon: string;
  title: string;
  description: string;
  detail: string;
  urgency: "now" | "soon" | "info"; // 지금 당장 / 곧 해야함 / 알아두면 좋은
  action?: {
    type: "search_place" | "youtube" | "link" | "chat" | "support";
    label: string;
    query?: string; // 장소검색 키워드 or 유튜브 검색어
    url?: string;
  };
}

export const WEEKLY_TIPS: WeeklyTip[] = [
  // ========== 4~8주 (초초기) ==========
  {
    id: "tip-001",
    weekFrom: 4,
    weekTo: 8,
    icon: "💊",
    title: "보건소 가면 엽산+철분 무료!",
    description: "보건소에 임신확인서만 가져가면 엽산, 철분제를 무료로 줘요. 약국에서 사면 몇 만원인데 공짜!",
    detail: "주소지 관할 보건소에 임신확인서(산부인과 발급)를 가져가면 엽산제(임신 초기~12주), 철분제(16주~출산)를 무료로 받을 수 있어요. 보건소마다 주는 브랜드가 달라요.",
    urgency: "now",
    action: {
      type: "search_place",
      label: "가까운 보건소 찾기",
      query: "보건소",
    },
  },
  {
    id: "tip-002",
    weekFrom: 4,
    weekTo: 8,
    icon: "💳",
    title: "국민행복카드 100만원 바로 신청!",
    description: "임산부 진료비 100만원 지원! 빨리 신청할수록 빨리 받아요. 다태아는 140만원!",
    detail: "국민건강보험공단에서 임신 확인 후 카드사(BC, 삼성, 롯데 등)에 신청하면 국민행복카드가 발급돼요. 산부인과 진료비, 약제비 등에 사용 가능해요.",
    urgency: "now",
    action: {
      type: "support",
      label: "지원금 상세보기",
    },
  },
  {
    id: "tip-003",
    weekFrom: 4,
    weekTo: 10,
    icon: "🤢",
    title: "입덧 줄이는 현실 꿀팁 7가지",
    description: "레몬, 생강차, 크래커 베개맡에 두기, 소량씩 자주 먹기... 실제로 효과 있는 방법들!",
    detail: "1. 아침에 일어나자마자 크래커 먹기\n2. 레몬수 or 레몬향 맡기\n3. 생강차 (시중 티백도 OK)\n4. 소량씩 2시간마다 먹기\n5. 찬 음식이 덜 역겨움\n6. 비타민B6 (의사 상담 후)\n7. 환기 자주 하기",
    urgency: "info",
    action: {
      type: "youtube",
      label: "입덧 극복 영상 보기",
      query: "입덧 줄이는 방법 현실 꿀팁",
    },
  },
  {
    id: "tip-004",
    weekFrom: 4,
    weekTo: 12,
    icon: "🏨",
    title: "산후조리원 얼리버드 할인! 12주 전에 예약",
    description: "산후조리원은 12주 이내에 예약하면 얼리버드 할인 10~30%! 인기 있는 곳은 금방 마감돼요.",
    detail: "산후조리원은 보통 12주 이내 예약 시 얼리버드 할인을 해줘요. 인기 조리원은 6개월 전에 마감되기도 해요!\n\n체크할 것:\n- 2주/4주 비용 비교\n- 모유수유 지원 여부\n- 신생아실 간호사 비율\n- 산모 식단 구성\n- 면회 규정",
    urgency: "now",
    action: {
      type: "search_place",
      label: "근처 산후조리원 검색",
      query: "산후조리원",
    },
  },
  {
    id: "tip-005",
    weekFrom: 4,
    weekTo: 8,
    icon: "📋",
    title: "임산부 등록하면 교통비 지원!",
    description: "임산부 교통비 월 5~10만원 지원! 지자체마다 다르니까 확인해보세요.",
    detail: "거주지 지자체에서 임산부 교통비를 지원해요. 서울은 월 10만원(최대 70만원), 지역마다 금액이 달라요. 정부24 또는 주민센터에서 신청 가능!",
    urgency: "now",
    action: {
      type: "support",
      label: "지원금 상세보기",
    },
  },

  // ========== 8~12주 ==========
  {
    id: "tip-006",
    weekFrom: 8,
    weekTo: 12,
    icon: "🔬",
    title: "1차 기형아 검사 11~13주에 받으세요",
    description: "1차 기형아 검사(목투명대 검사)는 11~13주에만 가능! 시기 놓치면 못 받아요.",
    detail: "1차 통합선별검사는 11주~13주 6일 사이에만 가능해요. 혈액검사 + 초음파(목투명대 측정)로 진행되고, 비용은 국민행복카드로 결제 가능해요.",
    urgency: "soon",
    action: {
      type: "youtube",
      label: "기형아 검사 후기 영상",
      query: "1차 기형아 검사 후기 비용",
    },
  },
  {
    id: "tip-007",
    weekFrom: 8,
    weekTo: 14,
    icon: "👩‍💼",
    title: "직장맘이면 출산휴가 미리 알아두기",
    description: "출산 전후 90일 유급휴가 + 육아휴직 1년! 회사에 미리 이야기하세요.",
    detail: "출산전후휴가: 90일(다태아 120일) 유급\n육아휴직: 최대 1년, 첫 6개월은 통상임금 80%\n배우자 출산휴가: 10일 유급\n\n임신 12주 이내에 회사에 알리고 단축근무(1일 2시간)도 가능해요!",
    urgency: "info",
    action: {
      type: "chat",
      label: "AI에게 자세히 물어보기",
    },
  },

  // ========== 12~20주 ==========
  {
    id: "tip-008",
    weekFrom: 12,
    weekTo: 16,
    icon: "🦷",
    title: "임산부 치과 무료! 스케일링 받으세요",
    description: "임산부는 건강보험으로 치과 스케일링 무료! 안정기(12~27주)에 받는 게 좋아요.",
    detail: "임신 중 호르몬 변화로 잇몸 질환이 생기기 쉬워요. 임산부는 연 1회 건강보험 스케일링이 무료이고, 안정기인 12~27주 사이에 받는 것을 추천해요!",
    urgency: "now",
    action: {
      type: "search_place",
      label: "가까운 치과 찾기",
      query: "치과",
    },
  },
  {
    id: "tip-009",
    weekFrom: 14,
    weekTo: 18,
    icon: "🔬",
    title: "2차 기형아 검사(쿼드검사) 시기!",
    description: "15~20주 사이에 2차 기형아 검사를 받아야 해요. 혈액검사로 간단하게!",
    detail: "쿼드검사(Quad test)는 15~20주에 혈액검사로 진행해요. 다운증후군, 에드워드증후군, 신경관결손 등을 선별해요. 국민행복카드로 결제 가능!",
    urgency: "soon",
    action: {
      type: "youtube",
      label: "2차 기형아 검사 알아보기",
      query: "쿼드검사 2차 기형아 검사",
    },
  },
  {
    id: "tip-010",
    weekFrom: 16,
    weekTo: 20,
    icon: "🎵",
    title: "태교 시작! 아기가 소리를 듣기 시작해요",
    description: "16주부터 아기가 소리를 들을 수 있어요. 태교 음악, 태담 시작하기 좋은 시기!",
    detail: "아기의 청각이 발달하기 시작하는 시기예요!\n\n추천 태교:\n- 클래식 음악 (모차르트, 비발디)\n- 엄마 아빠 목소리로 태담\n- 동화책 읽어주기\n- 자연의 소리\n\n하루 15~30분이면 충분해요!",
    urgency: "info",
    action: {
      type: "youtube",
      label: "태교 음악 & 방법 보기",
      query: "태교 음악 추천 태담 방법",
    },
  },

  // ========== 20~28주 ==========
  {
    id: "tip-011",
    weekFrom: 20,
    weekTo: 24,
    icon: "📸",
    title: "만삭사진 스튜디오 예약 타이밍!",
    description: "만삭사진은 보통 32~36주에 찍어요. 인기 스튜디오는 2~3달 전에 예약해야 해요!",
    detail: "만삭사진 촬영 적기: 32~36주\n예약 적기: 지금!(20~24주)\n\n체크할 것:\n- 커플촬영 가능 여부\n- 의상 대여 포함인지\n- 보정본 몇 장인지\n- 원본 제공 여부",
    urgency: "soon",
    action: {
      type: "search_place",
      label: "만삭사진 스튜디오 검색",
      query: "만삭 사진 스튜디오",
    },
  },
  {
    id: "tip-012",
    weekFrom: 24,
    weekTo: 28,
    icon: "🍬",
    title: "임신성 당뇨 검사 24~28주에 필수!",
    description: "당 50g 물 마시고 1시간 후 혈당 체크! 미리 알면 관리 가능해요.",
    detail: "임신성 당뇨검사(GCT)는 24~28주에 받아요. 당액 50g을 마시고 1시간 후 혈당을 측정해요. 140 이상이면 정밀검사(100g OGTT)를 받게 돼요.\n\n팁: 검사 전날 밤부터 단 음식 피하면 좀 더 편해요!",
    urgency: "soon",
    action: {
      type: "youtube",
      label: "임신성 당뇨 검사 후기",
      query: "임신성 당뇨 검사 후기 꿀팁",
    },
  },

  // ========== 28~36주 ==========
  {
    id: "tip-013",
    weekFrom: 28,
    weekTo: 34,
    icon: "🎒",
    title: "출산준비물 체크리스트 정리!",
    description: "30주 전후로 출산준비물을 챙기기 시작하세요. 필수 vs 있으면 좋은 것 구분이 중요!",
    detail: "필수 준비물:\n✅ 배냇저고리 5~7장\n✅ 기저귀 신생아용 2팩\n✅ 수유쿠션\n✅ 가제수건 10장\n✅ 체온계\n✅ 카시트\n\n있으면 좋은 것:\n- 바운서\n- 쪽쪽이\n- 아기 욕조\n- 손싸개/발싸개",
    urgency: "soon",
    action: {
      type: "youtube",
      label: "출산준비물 총정리 영상",
      query: "출산준비물 리스트 현실 후기",
    },
  },
  {
    id: "tip-014",
    weekFrom: 32,
    weekTo: 36,
    icon: "🧳",
    title: "입원 가방 미리 싸두세요!",
    description: "36주 전에 입원 가방을 싸두면 갑자기 진통 와도 당황하지 않아요!",
    detail: "입원 가방 체크리스트:\n\n엄마용:\n- 산모패드, 산모속옷\n- 수유브라\n- 세면도구\n- 긴 충전케이블\n- 간식(미역국용 재료)\n\n아기용:\n- 퇴원복\n- 기저귀 1팩\n- 손수건\n- 카시트(퇴원 시)",
    urgency: "soon",
    action: {
      type: "youtube",
      label: "입원 가방 싸기 영상",
      query: "출산 입원가방 리스트 꿀팁",
    },
  },

  // ========== 36~40주 ==========
  {
    id: "tip-015",
    weekFrom: 36,
    weekTo: 40,
    icon: "🚨",
    title: "진통 vs 가진통 구별법 알아두기",
    description: "진짜 진통은 규칙적이고 점점 강해져요! 5분 간격으로 1시간 지속되면 병원 GO!",
    detail: "진짜 진통:\n- 규칙적 간격 (점점 짧아짐)\n- 강도가 점점 세짐\n- 허리+배 전체가 아픔\n- 움직여도 안 사라짐\n\n가진통:\n- 불규칙\n- 강도 일정\n- 배 앞쪽만 아픔\n- 자세 바꾸면 사라짐\n\n5분 간격 1시간 지속 → 병원!",
    urgency: "info",
    action: {
      type: "youtube",
      label: "진통 구별법 영상",
      query: "출산 진통 가진통 구별법",
    },
  },
  {
    id: "tip-016",
    weekFrom: 36,
    weekTo: 40,
    icon: "🎁",
    title: "출생신고하면 첫만남이용권 200만원!",
    description: "아기 태어나면 출생신고 후 첫만남이용권 200만원 바우처를 받을 수 있어요!",
    detail: "출생신고 후 행복출산 원스톱 서비스로 한번에 신청 가능:\n\n- 첫만남이용권: 200만원 바우처\n- 아동수당: 월 10만원\n- 부모급여: 월 100만원(0세)\n- 건강보험 등록\n\n주민센터 한 번 방문으로 다 처리돼요!",
    urgency: "info",
    action: {
      type: "support",
      label: "지원금 상세보기",
    },
  },
];

export function getTipsForWeek(week: number): WeeklyTip[] {
  return WEEKLY_TIPS.filter((tip) => week >= tip.weekFrom && week <= tip.weekTo);
}

export function getUrgentTips(week: number): WeeklyTip[] {
  return getTipsForWeek(week).filter((tip) => tip.urgency === "now");
}
