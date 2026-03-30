import { View, Text, TouchableOpacity } from "react-native";
import { EMOTIONS, Emotion } from "../constants/emotions";

interface EmotionPickerProps {
  selected: string | null;
  onSelect: (emotion: string) => void;
}

export default function EmotionPicker({ selected, onSelect }: EmotionPickerProps) {
  return (
    <View>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#2D2D2D",
          marginBottom: 12,
        }}
      >
        오늘의 기분은 어때요?
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {EMOTIONS.map((emotion) => (
          <TouchableOpacity
            key={emotion.key}
            onPress={() => onSelect(emotion.key)}
            style={{
              alignItems: "center",
              backgroundColor:
                selected === emotion.key ? emotion.color + "40" : "#FFFFFF",
              borderRadius: 16,
              padding: 12,
              minWidth: 75,
              borderWidth: 2,
              borderColor:
                selected === emotion.key ? emotion.color : "#F0F0F0",
              marginRight: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 28 }}>{emotion.emoji}</Text>
            <Text
              style={{
                fontSize: 11,
                color: "#2D2D2D",
                marginTop: 4,
                fontWeight: selected === emotion.key ? "700" : "400",
              }}
            >
              {emotion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
