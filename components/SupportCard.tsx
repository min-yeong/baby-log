import { View, Text, TouchableOpacity } from "react-native";
import type { SupportInfo } from "../constants/supports";

interface SupportCardProps {
  item: SupportInfo;
}

const categoryColors = {
  임신: "#FFB5C2",
  출산: "#D4BBFF",
  육아: "#B5EAD7",
};

export default function SupportCard({ item }: SupportCardProps) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginHorizontal: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 28, marginRight: 10 }}>{item.icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#2D2D2D",
                flex: 1,
              }}
            >
              {item.title}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: categoryColors[item.category] + "40",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 2,
              alignSelf: "flex-start",
              marginTop: 4,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: categoryColors[item.category],
                fontWeight: "600",
              }}
            >
              {item.category}
            </Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 20, marginBottom: 10 }}>
        {item.description}
      </Text>

      <View style={{ backgroundColor: "#FFF8F0", borderRadius: 10, padding: 12 }}>
        <View style={{ flexDirection: "row", marginBottom: 4 }}>
          <Text style={{ fontSize: 13, color: "#9B9B9B", width: 60 }}>대상</Text>
          <Text style={{ fontSize: 13, color: "#2D2D2D", flex: 1 }}>{item.target}</Text>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 4 }}>
          <Text style={{ fontSize: 13, color: "#9B9B9B", width: 60 }}>금액</Text>
          <Text style={{ fontSize: 13, color: "#FF6B81", fontWeight: "600", flex: 1 }}>
            {item.amount}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 13, color: "#9B9B9B", width: 60 }}>신청</Text>
          <Text style={{ fontSize: 13, color: "#2D2D2D", flex: 1 }}>{item.howToApply}</Text>
        </View>
      </View>
    </View>
  );
}
