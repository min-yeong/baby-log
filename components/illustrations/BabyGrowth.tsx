import { View, Text } from "react-native";
import { theme } from "../../constants/theme";
import { getBabySize } from "../../lib/babySize";

interface BabyGrowthProps {
  weeks: number;
  size?: number;
}

export function BabyGrowth({ weeks, size = 80 }: BabyGrowthProps) {
  const info = getBabySize(weeks);
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
      <Text style={{ fontSize: Math.floor(size * 0.5) }}>{info.emoji}</Text>
    </View>
  );
}
