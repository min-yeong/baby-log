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
import { useHospitalStore } from "../../stores/hospitalStore";

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

type TabMode = "search" | "favorites";

export default function HospitalScreen() {
  const router = useRouter();
  const [tabMode, setTabMode] = useState<TabMode>("search");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radius, setRadius] = useState(3000);

  const { favorites, fetchFavorites, addFavorite, removeFavorite, isFavorite } =
    useHospitalStore();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const loadHospitals = useCallback(async (r: number) => {
    setLoading(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("위치 권한이 필요해요.\n설정에서 위치 권한을 허용해주세요.");
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

      if (error) setLocationError(error);
      setHospitals(result);
    } catch (err: any) {
      const { hospitals: demoData } = await searchNearbyHospitals(37.5012, 127.0396, r);
      setHospitals(demoData);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (tabMode === "search") loadHospitals(radius);
  }, [radius, tabMode]);

  const toggleFavorite = (hospital: Hospital) => {
    if (isFavorite(hospital.id)) {
      removeFavorite(hospital.id);
    } else {
      addFavorite(hospital);
    }
  };

  const openMap = (hospital: Hospital) => {
    const naverUrl = `https://map.naver.com/v5/search/${encodeURIComponent(hospital.name)}`;
    Alert.alert("지도에서 보기", "어디서 확인하시겠어요?", [
      { text: "카카오맵", onPress: () => Linking.openURL(hospital.placeUrl) },
      { text: "네이버지도", onPress: () => Linking.openURL(naverUrl) },
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

  const openNaverPlace = (name: string) => {
    Linking.openURL(
      `https://m.search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(name + ' 산부인과')}`
    );
  };

  // ── 병원 카드 (검색 결과용) ──
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
      {/* 상단: 순위 + 이름 + 거리 + 즐겨찾기 */}
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
          <Text style={{ fontSize: 14, fontWeight: "bold", color: index < 3 ? "#FFF" : "#FF6B81" }}>
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
        <TouchableOpacity
          onPress={() => toggleFavorite(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginRight: 8 }}
        >
          <Text style={{ fontSize: 22 }}>{isFavorite(item.id) ? "💖" : "🤍"}</Text>
        </TouchableOpacity>
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

      {/* 하단: 전화 + 지도 + 후기 + 네이버예약 */}
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
          <Text style={{ fontSize: 12, color: "#FF6B81", fontWeight: "600", marginLeft: 4 }}>전화</Text>
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
          <Text style={{ fontSize: 12, color: "#2DB783", fontWeight: "600", marginLeft: 4 }}>지도</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openNaverPlace(item.name)}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            backgroundColor: "#E8FFE8",
            borderRadius: 10,
            marginRight: 6,
          }}
        >
          <Text style={{ fontSize: 12, color: "#03C75A", fontWeight: "700" }}>네이버</Text>
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
          <Text style={{ fontSize: 12, color: "#8B5CF6", fontWeight: "600", marginLeft: 4 }}>후기</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ── 즐겨찾기 카드 ──
  const renderFavorite = ({ item }: { item: typeof favorites[0] }) => (
    <View
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
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#2D2D2D" }}>
            {item.place_name}
          </Text>
          <Text style={{ fontSize: 12, color: "#9B9B9B", marginTop: 4 }}>
            {item.address}
          </Text>
          {item.phone && item.phone !== "전화번호 없음" && (
            <TouchableOpacity onPress={() => callHospital(item.phone)}>
              <Text style={{ fontSize: 13, color: "#FF6B81", marginTop: 4 }}>
                📞 {item.phone}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => removeFavorite(item.place_id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 22 }}>💖</Text>
        </TouchableOpacity>
      </View>

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
          onPress={() => openNaverPlace(item.place_name)}
          style={{
            flex: 1,
            paddingVertical: 10,
            backgroundColor: "#03C75A",
            borderRadius: 10,
            alignItems: "center",
            marginRight: 6,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>네이버 예약/후기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL(item.place_url)}
          style={{
            flex: 1,
            paddingVertical: 10,
            backgroundColor: "#FEE500",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#3C1E1E" }}>카카오맵</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      {/* 헤더 */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#2D2D2D" }}>
          🏥 산부인과
        </Text>
      </View>

      {/* 탭 전환: 검색 / 즐겨찾기 */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          marginBottom: 10,
          backgroundColor: "#FFF0F3",
          borderRadius: 12,
          padding: 3,
        }}
      >
        <TouchableOpacity
          onPress={() => setTabMode("search")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: tabMode === "search" ? "#FF6B81" : "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: tabMode === "search" ? "#FFFFFF" : "#9B9B9B",
            }}
          >
            근처 검색
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTabMode("favorites")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: tabMode === "favorites" ? "#FF6B81" : "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: tabMode === "favorites" ? "#FFFFFF" : "#9B9B9B",
            }}
          >
            즐겨찾기 ({favorites.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── 검색 모드 ── */}
      {tabMode === "search" && (
        <>
          {/* 거리 필터 */}
          <View style={{ flexDirection: "row", paddingHorizontal: 20, paddingBottom: 10 }}>
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
                <Text style={{ fontSize: 13, color: "#9B9B9B", paddingHorizontal: 20, paddingBottom: 8 }}>
                  {hospitals.length}개의 산부인과를 찾았어요
                </Text>
              }
            />
          )}
        </>
      )}

      {/* ── 즐겨찾기 모드 ── */}
      {tabMode === "favorites" && (
        favorites.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
            <Text style={{ fontSize: 50, marginBottom: 16 }}>💖</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#2D2D2D", textAlign: "center" }}>
              즐겨찾기한 병원이 없어요
            </Text>
            <Text style={{ fontSize: 14, color: "#9B9B9B", textAlign: "center", marginTop: 8 }}>
              근처 검색에서 하트를 눌러{"\n"}자주 가는 병원을 저장해보세요
            </Text>
            <TouchableOpacity
              onPress={() => setTabMode("search")}
              style={{
                backgroundColor: "#FF6B81",
                borderRadius: 14,
                paddingHorizontal: 28,
                paddingVertical: 12,
                marginTop: 20,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>병원 찾기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderFavorite}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
          />
        )
      )}
    </SafeAreaView>
  );
}
