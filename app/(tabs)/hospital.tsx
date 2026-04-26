import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { searchNearbyHospitals, Hospital } from "../../lib/kakaoLocal";
import { useHospitalStore } from "../../stores/hospitalStore";
import { theme } from "../../constants/theme";
import { Button, Card, Chip, EmptyState, ScreenHeader } from "../../components/ui";

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

type TabMode = "search" | "favorites";

const NAVER_GREEN = theme.color.semantic.checkup;
const KAKAO_YELLOW = theme.color.cream[100];

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

  const renderHospital = ({ item, index }: { item: Hospital; index: number }) => (
    <View style={{ paddingHorizontal: theme.space[5], marginBottom: theme.space[2] + 2 }}>
      <Card variant="default" onPress={() => router.push(`/hospital/${item.id}`)} padding={theme.space[5] - 2}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: theme.iconBox.sm + 4,
              height: theme.iconBox.sm + 4,
              borderRadius: (theme.iconBox.sm + 4) / 2,
              backgroundColor: index < 3 ? theme.color.pink[500] : theme.color.pink[100],
              alignItems: "center",
              justifyContent: "center",
              marginRight: theme.space[3],
            }}
          >
            <Text
              style={{
                fontSize: theme.font.body.size,
                fontWeight: "bold",
                color: index < 3 ? theme.color.ink[0] : theme.color.pink[500],
              }}
            >
              {index + 1}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: theme.font.heading.size - 1, fontWeight: "700", color: theme.color.ink[900] }}>
              {item.name}
            </Text>
            <Text style={{ fontSize: theme.font.caption.size + 1, color: theme.color.ink[400], marginTop: 2 }}>
              {item.roadAddress}
            </Text>
          </View>
          <Pressable
            onPress={() => toggleFavorite(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginRight: theme.space[2] }}
          >
            <Text style={{ fontSize: 22 }}>{isFavorite(item.id) ? "💖" : "🤍"}</Text>
          </Pressable>
          <View
            style={{
              backgroundColor: theme.color.tint.checkup,
              borderRadius: theme.radius.sm + 2,
              paddingHorizontal: theme.space[3] - 2,
              paddingVertical: theme.space[1],
            }}
          >
            <Text style={{ fontSize: theme.font.caption.size + 1, fontWeight: "600", color: theme.color.semantic.checkup }}>
              {formatDistance(item.distance)}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: theme.space[3] + 2,
            paddingTop: theme.space[3],
            borderTopWidth: 1,
            borderTopColor: theme.color.cream[100],
            gap: theme.space[2] - 2,
          }}
        >
          <Pressable
            onPress={() => callHospital(item.phone)}
            style={({ pressed }) => [
              {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: theme.space[2],
                backgroundColor: theme.color.pink[100],
                borderRadius: theme.radius.sm + 2,
              },
              pressed && { opacity: theme.opacity.pressed },
            ]}
          >
            <Text style={{ fontSize: theme.font.body.size }}>📞</Text>
            <Text style={{ fontSize: theme.font.caption.size + 1, color: theme.color.pink[500], fontWeight: "600", marginLeft: 4 }}>전화</Text>
          </Pressable>

          <Pressable
            onPress={() => openMap(item)}
            style={({ pressed }) => [
              {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: theme.space[2],
                backgroundColor: theme.color.tint.checkup,
                borderRadius: theme.radius.sm + 2,
              },
              pressed && { opacity: theme.opacity.pressed },
            ]}
          >
            <Text style={{ fontSize: theme.font.body.size }}>🗺️</Text>
            <Text style={{ fontSize: theme.font.caption.size + 1, color: theme.color.semantic.checkup, fontWeight: "600", marginLeft: 4 }}>지도</Text>
          </Pressable>

          <Pressable
            onPress={() => openNaverPlace(item.name)}
            style={({ pressed }) => [
              {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: theme.space[2],
                backgroundColor: theme.color.tint.checkup,
                borderRadius: theme.radius.sm + 2,
              },
              pressed && { opacity: theme.opacity.pressed },
            ]}
          >
            <Text style={{ fontSize: theme.font.caption.size + 1, color: NAVER_GREEN, fontWeight: "700" }}>네이버</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push(`/hospital/${item.id}`)}
            style={({ pressed }) => [
              {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: theme.space[2],
                backgroundColor: theme.color.tint.medicine,
                borderRadius: theme.radius.sm + 2,
              },
              pressed && { opacity: theme.opacity.pressed },
            ]}
          >
            <Text style={{ fontSize: theme.font.body.size }}>💬</Text>
            <Text style={{ fontSize: theme.font.caption.size + 1, color: theme.color.semantic.medicine, fontWeight: "600", marginLeft: 4 }}>후기</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );

  const renderFavorite = ({ item }: { item: typeof favorites[0] }) => (
    <View style={{ paddingHorizontal: theme.space[5], marginBottom: theme.space[2] + 2 }}>
      <Card variant="default" padding={theme.space[5] - 2}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: theme.font.heading.size - 1, fontWeight: "700", color: theme.color.ink[900] }}>
              {item.place_name}
            </Text>
            <Text style={{ fontSize: theme.font.caption.size + 1, color: theme.color.ink[400], marginTop: 4 }}>
              {item.address}
            </Text>
            {item.phone && item.phone !== "전화번호 없음" && (
              <Pressable onPress={() => callHospital(item.phone)}>
                <Text style={{ fontSize: theme.font.label.size, color: theme.color.pink[500], marginTop: 4 }}>
                  📞 {item.phone}
                </Text>
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={() => removeFavorite(item.place_id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={{ fontSize: 22 }}>💖</Text>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: theme.space[3] + 2,
            paddingTop: theme.space[3],
            borderTopWidth: 1,
            borderTopColor: theme.color.cream[100],
            gap: theme.space[2] - 2,
          }}
        >
          <Pressable
            onPress={() => openNaverPlace(item.place_name)}
            style={({ pressed }) => [
              {
                flex: 1,
                paddingVertical: theme.space[3] - 2,
                backgroundColor: NAVER_GREEN,
                borderRadius: theme.radius.sm + 2,
                alignItems: "center",
              },
              pressed && { opacity: theme.opacity.pressed },
            ]}
          >
            <Text style={{ fontSize: theme.font.label.size, fontWeight: "700", color: theme.color.ink[0] }}>네이버 예약/후기</Text>
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL(item.place_url)}
            style={({ pressed }) => [
              {
                flex: 1,
                paddingVertical: theme.space[3] - 2,
                backgroundColor: KAKAO_YELLOW,
                borderRadius: theme.radius.sm + 2,
                alignItems: "center",
              },
              pressed && { opacity: theme.opacity.pressed },
            ]}
          >
            <Text style={{ fontSize: theme.font.label.size, fontWeight: "700", color: theme.color.ink[900] }}>카카오맵</Text>
          </Pressable>
        </View>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScreenHeader title="산부인과" />

      {/* 탭 전환 */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: theme.space[5],
          marginBottom: theme.space[3] - 2,
          backgroundColor: theme.color.pink[100],
          borderRadius: theme.radius.md,
          padding: 3,
        }}
      >
        <Pressable
          onPress={() => setTabMode("search")}
          style={{
            flex: 1,
            paddingVertical: theme.space[3] - 2,
            borderRadius: theme.radius.md - 2,
            backgroundColor: tabMode === "search" ? theme.color.pink[500] : "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: theme.font.body.size,
              fontWeight: "700",
              color: tabMode === "search" ? theme.color.ink[0] : theme.color.ink[400],
            }}
          >
            근처 검색
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTabMode("favorites")}
          style={{
            flex: 1,
            paddingVertical: theme.space[3] - 2,
            borderRadius: theme.radius.md - 2,
            backgroundColor: tabMode === "favorites" ? theme.color.pink[500] : "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: theme.font.body.size,
              fontWeight: "700",
              color: tabMode === "favorites" ? theme.color.ink[0] : theme.color.ink[400],
            }}
          >
            즐겨찾기 ({favorites.length})
          </Text>
        </Pressable>
      </View>

      {tabMode === "search" && (
        <>
          {/* 거리 필터 */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: theme.space[5],
              paddingBottom: theme.space[3] - 2,
              gap: theme.space[2],
            }}
          >
            {[
              { value: 1000, label: "1km" },
              { value: 3000, label: "3km" },
              { value: 5000, label: "5km" },
              { value: 10000, label: "10km" },
            ].map((option) => (
              <Chip
                key={option.value}
                selected={radius === option.value}
                color="primary"
                onPress={() => setRadius(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </View>

          {locationError && (
            <View
              style={{
                backgroundColor: theme.color.tint.symptom,
                borderRadius: theme.radius.sm + 2,
                padding: theme.space[3],
                marginHorizontal: theme.space[5],
                marginBottom: theme.space[2],
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: theme.font.body.size, marginRight: theme.space[2] }}>📍</Text>
              <Text style={{ fontSize: theme.font.caption.size + 1, color: theme.color.ink[700], flex: 1 }}>
                {locationError}{"\n"}데모 데이터를 보여드릴게요.
              </Text>
            </View>
          )}

          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={theme.color.pink[400]} />
              <Text style={{ fontSize: theme.font.body.size, color: theme.color.ink[400], marginTop: theme.space[3] }}>
                근처 산부인과를 찾고 있어요...
              </Text>
            </View>
          ) : hospitals.length === 0 ? (
            <EmptyState
              illustration={<Text style={{ fontSize: 44 }}>🏥</Text>}
              title="반경 내 산부인과를 찾지 못했어요"
              description="검색 범위를 넓혀보세요"
            />
          ) : (
            <FlatList
              data={hospitals}
              renderItem={renderHospital}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingTop: 4, paddingBottom: theme.space[5] }}
              refreshing={loading}
              onRefresh={() => loadHospitals(radius)}
              ListHeaderComponent={
                <Text style={{ fontSize: theme.font.label.size, color: theme.color.ink[400], paddingHorizontal: theme.space[5], paddingBottom: theme.space[2] }}>
                  {hospitals.length}개의 산부인과를 찾았어요
                </Text>
              }
            />
          )}
        </>
      )}

      {tabMode === "favorites" && (
        favorites.length === 0 ? (
          <EmptyState
            illustration={<Text style={{ fontSize: 44 }}>💖</Text>}
            title="즐겨찾기한 병원이 없어요"
            description={"근처 검색에서 하트를 눌러\n자주 가는 병원을 저장해보세요"}
            action={
              <Button variant="primary" onPress={() => setTabMode("search")}>
                병원 찾기
              </Button>
            }
          />
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderFavorite}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: theme.space[5] }}
          />
        )
      )}
    </SafeAreaView>
  );
}
