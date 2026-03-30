export interface WeekInfo {
  week: number;
  size: string;
  sizeCompare: string;
  length: string;
  weight: string;
  description: string;
  tips: string[];
}

export const BABY_GROWTH: WeekInfo[] = [
  {
    week: 4,
    size: "0.1cm",
    sizeCompare: "양귀비 씨앗",
    length: "약 0.1cm",
    weight: "약 1g 미만",
    description: "아기가 자궁벽에 착상했어요! 태반이 만들어지기 시작해요.",
    tips: ["엽산 복용을 시작하세요", "술과 담배를 피하세요", "병원에서 임신 확인을 받으세요"],
  },
  {
    week: 5,
    size: "0.2cm",
    sizeCompare: "참깨",
    length: "약 0.2cm",
    weight: "약 1g 미만",
    description: "심장이 뛰기 시작해요! 뇌와 척수가 발달하기 시작합니다.",
    tips: ["입덧이 시작될 수 있어요", "충분한 수분 섭취를 하세요", "무리한 운동은 피하세요"],
  },
  {
    week: 6,
    size: "0.5cm",
    sizeCompare: "렌즈콩",
    length: "약 0.5cm",
    weight: "약 1g 미만",
    description: "코, 입, 귀가 형태를 잡아가고 있어요. 심장이 규칙적으로 뛰어요!",
    tips: ["첫 초음파 검사를 받아보세요", "입덧이 심해질 수 있어요", "소량씩 자주 먹어보세요"],
  },
  {
    week: 7,
    size: "1cm",
    sizeCompare: "블루베리",
    length: "약 1cm",
    weight: "약 1g",
    description: "손과 발이 생기기 시작해요. 뇌가 빠르게 성장하고 있어요!",
    tips: ["철분이 풍부한 음식을 먹으세요", "가벼운 산책을 즐기세요", "충분히 쉬세요"],
  },
  {
    week: 8,
    size: "1.6cm",
    sizeCompare: "강낭콩",
    length: "약 1.6cm",
    weight: "약 1g",
    description: "손가락과 발가락이 생기기 시작해요! 아기가 움직이기 시작해요.",
    tips: ["산전 검사 일정을 확인하세요", "카페인 섭취를 줄이세요", "편안한 옷을 입으세요"],
  },
  {
    week: 9,
    size: "2.3cm",
    sizeCompare: "포도알",
    length: "약 2.3cm",
    weight: "약 2g",
    description: "이제 배아에서 태아로 불려요! 모든 주요 장기가 형성되었어요.",
    tips: ["충분한 수면을 취하세요", "스트레스를 줄이세요", "엽산을 꾸준히 복용하세요"],
  },
  {
    week: 10,
    size: "3cm",
    sizeCompare: "금귤",
    length: "약 3cm",
    weight: "약 4g",
    description: "손톱이 자라기 시작하고 치아의 기초가 만들어져요!",
    tips: ["입덧이 줄어들기 시작할 수 있어요", "가벼운 스트레칭을 해보세요"],
  },
  {
    week: 11,
    size: "4cm",
    sizeCompare: "무화과",
    length: "약 4cm",
    weight: "약 7g",
    description: "손가락과 발가락이 분리되었어요. 아기가 하품도 할 수 있어요!",
    tips: ["임산부용 비타민을 꾸준히 복용하세요", "물을 자주 마시세요"],
  },
  {
    week: 12,
    size: "5.4cm",
    sizeCompare: "라임",
    length: "약 5.4cm",
    weight: "약 14g",
    description: "아기의 반사신경이 발달하고 있어요. 입을 열고 닫을 수 있어요!",
    tips: ["안정기에 접어들고 있어요", "1차 기형아 검사를 받으세요", "임신 사실을 주변에 알려도 좋아요"],
  },
  {
    week: 13,
    size: "7cm",
    sizeCompare: "복숭아",
    length: "약 7cm",
    weight: "약 23g",
    description: "지문이 형성되기 시작해요! 목이 발달하여 고개를 돌릴 수 있어요.",
    tips: ["안정기 진입! 가벼운 운동을 시작해보세요", "임산부 수영, 요가 추천"],
  },
  {
    week: 14,
    size: "8.5cm",
    sizeCompare: "레몬",
    length: "약 8.5cm",
    weight: "약 43g",
    description: "표정을 지을 수 있어요! 찡그리기, 눈 감기 등을 해요.",
    tips: ["입맛이 돌아올 수 있어요", "균형 잡힌 식사를 하세요"],
  },
  {
    week: 15,
    size: "10cm",
    sizeCompare: "사과",
    length: "약 10cm",
    weight: "약 70g",
    description: "아기가 빛을 감지할 수 있어요. 다리가 팔보다 길어졌어요!",
    tips: ["태교 음악을 들려주세요", "엄마 배에 이야기해주세요"],
  },
  {
    week: 16,
    size: "11.5cm",
    sizeCompare: "아보카도",
    length: "약 11.5cm",
    weight: "약 100g",
    description: "눈이 빛에 반응해요. 손으로 잡는 동작을 연습해요!",
    tips: ["2차 기형아 검사를 준비하세요", "태동을 느낄 수도 있어요"],
  },
  {
    week: 20,
    size: "16cm",
    sizeCompare: "바나나",
    length: "약 16cm",
    weight: "약 300g",
    description: "아기가 삼키기를 연습하고 태지가 몸을 덮기 시작해요.",
    tips: ["정밀 초음파 검사 시기예요", "태동이 뚜렷해져요", "임산부 체조를 해보세요"],
  },
  {
    week: 24,
    size: "30cm",
    sizeCompare: "옥수수",
    length: "약 30cm",
    weight: "약 600g",
    description: "폐가 발달하고 있어요. 엄마 목소리를 들을 수 있어요!",
    tips: ["임신성 당뇨 검사를 받으세요", "태명을 불러주세요"],
  },
  {
    week: 28,
    size: "37cm",
    sizeCompare: "가지",
    length: "약 37cm",
    weight: "약 1kg",
    description: "눈을 뜨고 감을 수 있어요. 꿈을 꿀 수도 있대요!",
    tips: ["출산 준비물을 알아보기 시작하세요", "좌측으로 눕는 자세가 좋아요"],
  },
  {
    week: 32,
    size: "42cm",
    sizeCompare: "코코넛",
    length: "약 42cm",
    weight: "약 1.7kg",
    description: "피하지방이 쌓이며 통통해지고 있어요!",
    tips: ["출산 준비물을 본격적으로 챙기세요", "출산 교실에 다녀보세요"],
  },
  {
    week: 36,
    size: "47cm",
    sizeCompare: "파파야",
    length: "약 47cm",
    weight: "약 2.6kg",
    description: "머리가 아래로 향하기 시작해요. 거의 다 자랐어요!",
    tips: ["입원 가방을 미리 싸두세요", "출산 계획을 세워보세요"],
  },
  {
    week: 40,
    size: "50cm",
    sizeCompare: "수박",
    length: "약 50cm",
    weight: "약 3.3kg",
    description: "드디어 만날 준비가 됐어요! 아기가 세상 밖으로 나올 거예요!",
    tips: ["진통 신호를 알아두세요", "침착하게, 곧 만나요!"],
  },
];

export function getWeekInfo(week: number): WeekInfo | undefined {
  // 정확한 주차가 없으면 가장 가까운 이전 주차 정보 반환
  const sorted = [...BABY_GROWTH].sort((a, b) => b.week - a.week);
  return sorted.find((info) => info.week <= week);
}
