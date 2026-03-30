import { View, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";

interface PhotoGridProps {
  photos: string[];
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  maxPhotos?: number;
  editable?: boolean;
}

export default function PhotoGrid({
  photos,
  onAdd,
  onRemove,
  maxPhotos = 5,
  editable = true,
}: PhotoGridProps) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {photos.map((uri, index) => (
        <View key={index} style={{ position: "relative", marginRight: 8, marginBottom: 8 }}>
          <Image
            source={{ uri }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 12,
            }}
            contentFit="cover"
          />
          {editable && onRemove && (
            <TouchableOpacity
              onPress={() => onRemove(index)}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                backgroundColor: "#FF6B81",
                borderRadius: 12,
                width: 24,
                height: 24,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "bold" }}>
                ×
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {editable && photos.length < maxPhotos && onAdd && (
        <TouchableOpacity
          onPress={onAdd}
          style={{
            width: 100,
            height: 100,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "#FFD6DE",
            borderStyle: "dashed",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFF0F3",
          }}
        >
          <Text style={{ fontSize: 30, color: "#FFB5C2" }}>+</Text>
          <Text style={{ fontSize: 11, color: "#FFB5C2", marginTop: 2 }}>
            사진 추가
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
