export interface SupportInfo {
  id: string;
  title: string;
  category: "임신" | "출산" | "육아";
  target: string;
  amount: string;
  description: string;
  howToApply: string;
  icon: string;
}

export const SUPPORT_LIST: SupportInfo[] = [
  {
    id: "1",
    title: "임산부 건강관리 지원 (국민행복카드)",
    category: "임신",
    target: "모든 임산부",
    amount: "100만원 (다태아 140만원)",
    description: "임신·출산 관련 진료비를 국민행복카드로 지원받을 수 있어요.",
    howToApply: "국민건강보험공단 또는 카드사 신청",
    icon: "💳",
  },
  {
    id: "2",
    title: "엽산·철분제 지원",
    category: "임신",
    target: "모든 임산부",
    amount: "무료 (보건소)",
    description: "가까운 보건소에서 엽산과 철분제를 무료로 받을 수 있어요.",
    howToApply: "주소지 관할 보건소 방문",
    icon: "💊",
  },
  {
    id: "3",
    title: "임산부 교통비 지원",
    category: "임신",
    target: "모든 임산부 (일부 지역)",
    amount: "월 5~10만원 (지역별 상이)",
    description: "병원 방문을 위한 교통비를 지원받을 수 있어요.",
    howToApply: "거주지 지자체 또는 정부24 신청",
    icon: "🚗",
  },
  {
    id: "4",
    title: "출산축하금",
    category: "출산",
    target: "출산 가정",
    amount: "200만원 (첫만남이용권)",
    description: "아이 출생 시 200만원의 바우처를 지원받아요.",
    howToApply: "행복출산 원스톱 서비스 또는 주민센터 신청",
    icon: "🎁",
  },
  {
    id: "5",
    title: "부모급여",
    category: "육아",
    target: "만 0~1세 아동 가정",
    amount: "월 100만원 (0세) / 월 50만원 (1세)",
    description: "만 2세 미만 아동을 양육하는 가정에 매월 급여를 지급해요.",
    howToApply: "복지로 또는 주민센터 신청",
    icon: "👶",
  },
  {
    id: "6",
    title: "아동수당",
    category: "육아",
    target: "만 8세 미만 아동",
    amount: "월 10만원",
    description: "만 8세 미만 아동에게 매월 10만원을 지급해요.",
    howToApply: "복지로 또는 주민센터 신청",
    icon: "💰",
  },
  {
    id: "7",
    title: "영아수당 (아이돌봄서비스)",
    category: "육아",
    target: "만 0~1세 가정",
    amount: "월 30만원 바우처",
    description: "돌봄이 필요한 영아를 위한 바우처를 지원해요.",
    howToApply: "복지로 또는 주민센터 신청",
    icon: "🍼",
  },
  {
    id: "8",
    title: "산후조리비 지원",
    category: "출산",
    target: "출산 가정 (일부 지역)",
    amount: "50~100만원 (지역별 상이)",
    description: "산후조리원 또는 산후관리 비용을 지원받을 수 있어요.",
    howToApply: "거주지 지자체 또는 정부24 신청",
    icon: "🏥",
  },
];
