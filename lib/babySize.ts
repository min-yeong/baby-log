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
