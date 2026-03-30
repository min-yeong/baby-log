import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { searchNearbyHospitals, Hospital } from "../../lib/kakaoLocal";

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export default function HospitalScreen() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radius, setRadius] = useState(3000);

  const loadHospitals = useCallback(async (r: number) => {
    setLoading(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("위치 권한이 필요해요.\n설정에서 위치 권한을 허용해주세요.");
        // 데모 데이터라도 보여주기
        const { hospitals: demoData } = await searchNearbyHospitals(37.5012, 127.0396, r);
        setHospitals(demoData);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { hospitals: result, error } = await searchNearbyHospitals(
        location.coords.latitude,
        location.coords.longitude,
        r
      );

      if (error) {
        setLocationError(error);
      }
      setHospitals(result);
    } catch (err: any) {
      // 위치 못 가져와도 데모 데이터로 보여주기
      const { hospitals: demoData } = await searchNearbyHospitals(37.5012, 127.0396, r);
      setHospitals(demoData);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadHospitals(radius);
  }, [radius]);

  const openMap = (hospital: Hospital) => {
    // 카카오맵 앱 또는 웹으로 열기
    const kakaoUrl = hospital.placeUrl;
    const naverUrl = `https://map.naver.com/v5/search/${encodeURIComponent(hospital.name)}`;

    Alert.alert("지도에서 보기", "어디서 확인하시겠어요?", [
      {
        text: "카카오맵",
        onPress: () => Linking.openURL(kakaoUrl),
      },
      {
        text: "네이버지도",
        onPress: () => Linking.openURL(naverUrl),
      },
      { text: "취소", style: "cancel" },
    ]);
  };

  const callHospital = (phone: string) => {
    if (phone === "전화번호 없음") {
      Alert.alert("알림", "등록된 전화번호가 없어요");
      return;
    }
    Linking.openURL(`tel:${phone.replace(/-/g, "")}`);
  };

  const renderHospital = ({ item, index }: { item: Hospital; index: number }) => (
    <TouchableOpacity
      onPress={() => router.push(`/hospital/${item.id}`)}
      activeOpacity={0.7}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginHorizontal: 20,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      {/* 상단: 순위 + 이름 + 거리 */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: index < 3 ? "#FF6B81" : "#FFF0F3",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: index < 3 ? "#FFF" : "#FF6B81",
            }}
          >
            {index + 1}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#2D2D2D" }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 12, color: "#9B9B9B", marginTop: 2 }}>
            {item.roadAddress}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#E8F8F0",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#2DB783" }}>
            {formatDistance(item.distance)}
          </Text>
        </View>
      </View>

      {/* 하단: 전화 + 지도 + 후기 */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 14,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: "#F5F5F5",
        }}
      >
        <TouchableOpacity
          onPress={() => callHospital(item.phone)}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            backgroundColor: "#FFF0F3",
            borderRadius: 10,
            marginRight: 6,
          }}
        >
          <Text style={{ fontSize: 14 }}>📞</Text>
          <Text style={{ fontSize: 12, color: "#FF6B81", fontWeight: "600", marginLeft: 4 }}>
            전화
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openMap(item)}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            backgroundColor: "#E8F8F0",
            borderRadius: 10,
            marginRight: 6,
          }}
        >
          <Text style={{ fontSize: 14 }}>🗺️</Text>
          <Text style={{ fontSize: 12, color: "#2DB783", fontWeight: "600", marginLeft: 4 }}>
            지도
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/hospital/${item.id}`)}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            backgroundColor: "#F3EEFF",
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 14 }}>💬</Text>
          <Text style={{ fontSize: 12, color: "#8B5CF6", fontWeight: "600", marginLeft: 4 }}>
            후기
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      {/* 헤더 */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#2D2D2D" }}>
          🏥 근처 산부인과
        </Text>
        <Text style={{ fontSize: 13, color: "#9B9B9B", marginTop: 2 }}>
          내 위치 기준으로 가까운 산부인과를 찾아드려요
        </Text>
      </View>

      {/* 거리 필터 */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
      >
        {[
          { value: 1000, label: "1km" },
          { value: 3000, label: "3km" },
          { value: 5000, label: "5km" },
          { value: 10000, label: "10km" },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setRadius(option.value)}
            activeOpacity={0.7}
            style={{
              height: 34,
              paddingHorizontal: 16,
              borderRadius: 17,
              backgroundColor: radius === option.value ? "#FF6B81" : "#FFFFFF",
              borderWidth: 1.5,
              borderColor: radius === option.value ? "#FF6B81" : "#EEEEEE",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: radius === option.value ? "#FFFFFF" : "#6B6B6B",
                fontWeight: "600",
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 위치 에러 안내 */}
      {locationError && (
        <View
          style={{
            backgroundColor: "#FFF3B0",
            borderRadius: 10,
            padding: 12,
            marginHorizontal: 20,
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14, marginRight: 8 }}>📍</Text>
          <Text style={{ fontSize: 12, color: "#6B6B6B", flex: 1 }}>
            {locationError}{"\n"}데모 데이터를 보여드릴게요.
          </Text>
        </View>
      )}

      {/* 병원 목록 */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FFB5C2" />
          <Text style={{ fontSize: 14, color: "#9B9B9B", marginTop: 12 }}>
            근처 산부인과를 찾고 있어요...
          </Text>
        </View>
      ) : hospitals.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
          <Text style={{ fontSize: 50, marginBottom: 16 }}>🏥</Text>
          <Text style={{ fontSize: 16, color: "#9B9B9B", textAlign: "center" }}>
            반경 내 산부인과를 찾지 못했어요{"\n"}검색 범위를 넓혀보세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={hospitals}
          renderItem={renderHospital}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
          refreshing={loading}
          onRefresh={() => loadHospitals(radius)}
          ListHeaderComponent={
            <Text
              style={{
                fontSize: 13,
                color: "#9B9B9B",
                paddingHorizontal: 20,
                paddingBottom: 8,
              }}
            >
              {hospitals.length}개의 산부인과를 찾았어요
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
