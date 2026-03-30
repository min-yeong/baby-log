import { View, Text } from "react-native";
import { formatPregnancyWeek, getDaysUntilDue, calculatePregnancyWeek } from "../lib/pregnancy";
import { getWeekInfo } from "../constants/babyGrowth";

interface WeekBannerProps {
  dueDate: string;
}

export default function WeekBanner({ dueDate }: WeekBannerProps) {
  const { weeks, days } = calculatePregnancyWeek(dueDate);
  const daysLeft = getDaysUntilDue(dueDate);
  const weekInfo = getWeekInfo(weeks);

  return (
    <View
      style={{
        backgroundColor: "#FFB5C2",
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 20,
        marginTop: 10,
      }}
    >
      <Text style={{ fontSize: 14, color: "#FFFFFF", opacity: 0.9 }}>
        우리 아기와 함께한 지
      </Text>
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: "#FFFFFF",
          marginTop: 4,
        }}
      >
        {weeks}주 {days}일 💕
      </Text>
      {weekInfo && (
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: 12,
            padding: 12,
            marginTop: 12,
          }}
        >
          <Text style={{ fontSize: 15, color: "#FFFFFF", fontWeight: "600" }}>
            🍒 지금 아기는 {weekInfo.sizeCompare} 크기예요!
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#FFFFFF",
              marginTop: 4,
              opacity: 0.9,
            }}
          >
            {weekInfo.description}
          </Text>
        </View>
      )}
      <Text
        style={{
          fontSize: 13,
          color: "#FFFFFF",
          marginTop: 10,
          opacity: 0.8,
        }}
      >
        D-{daysLeft} 만날 날이 다가오고 있어요! ✨
      </Text>
    </View>
  );
}
