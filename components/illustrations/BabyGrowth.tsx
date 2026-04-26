import { View, Text } from "react-native";
import { theme } from "../../constants/theme";

interface BabyGrowthProps {
  weeks: number;
  size?: number;
}

const EMOJI_TABLE: { fromWeek: number; emoji: string }[] = [
  { fromWeek: 4, emoji: "🌱" },
  { fromWeek: 6, emoji: "🫘" },
  { fromWeek: 8, emoji: "🍇" },
  { fromWeek: 10, emoji: "🍓" },
  { fromWeek: 12, emoji: "🍋" },
  { fromWeek: 14, emoji: "🍑" },
  { fromWeek: 16, emoji: "🥑" },
  { fromWeek: 18, emoji: "🫑" },
  { fromWeek: 20, emoji: "🍌" },
  { fromWeek: 22, emoji: "🥭" },
  { fromWeek: 24, emoji: "🌽" },
  { fromWeek: 26, emoji: "🥬" },
  { fromWeek: 28, emoji: "🍆" },
  { fromWeek: 30, emoji: "🥥" },
  { fromWeek: 32, emoji: "🍍" },
  { fromWeek: 34, emoji: "🍈" },
  { fromWeek: 36, emoji: "🍉" },
  { fromWeek: 38, emoji: "🎃" },
  { fromWeek: 40, emoji: "👶" },
];

function getWeekEmoji(weeks: number): string {
  for (let i = EMOJI_TABLE.length - 1; i >= 0; i--) {
    if (weeks >= EMOJI_TABLE[i].fromWeek) return EMOJI_TABLE[i].emoji;
  }
  return EMOJI_TABLE[0].emoji;
}

export function BabyGrowth({ weeks, size = 80 }: BabyGrowthProps) {
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
      <Text style={{ fontSize: Math.floor(size * 0.5) }}>{getWeekEmoji(weeks)}</Text>
    </View>
  );
}
