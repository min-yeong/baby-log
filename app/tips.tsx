import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Linking,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/authStore";
import { calculatePregnancyWeek } from "../lib/pregnancy";
import { handleScroll } from "../stores/uiStore";
import { WEEKLY_TIPS, getTipsForWeek, WeeklyTip } from "../constants/weeklyTips";
import { searchNearbyHospitals } from "../lib/kakaoLocal";
import * as Location from "expo-location";

const urgencyStyle = {
  now: { bg: "#FFE5E5", border: "#FF6B81", badge: "#FF6B81", label: "지금 바로!" },
  soon: { bg: "#FFF8E5", border: "#FFB84D", badge: "#FFB84D", label: "곧 해야해요" },
  info: { bg: "#E8F4FF", border: "#64B5F6", badge: "#64B5F6", label: "알아두세요" },
};

export default function TipsScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [currentWeek, setCurrentWeek] = useState(4);
  const [selectedTip, setSelectedTip] = useState<WeeklyTip | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [showPlaces, setShowPlaces] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");

  useEffect(() => {
    if (profile?.due_date) {
      const { weeks } = calculatePregnancyWeek(profile.due_date);
      setCurrentWeek(weeks);
    }
  }, [profile]);

  const myTips = getTipsForWeek(currentWeek);
  const allWeeks = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];

  const handleAction = async (tip: WeeklyTip) => {
    if (!tip.action) return;

    switch (tip.action.type) {
      case "youtube":
        router.push("/youtube");
        break;
      case "support":
        router.push("/support/");
        break;
      case "chat":
        router.push("/(tabs)/chat");
        break;
      case "search_place":
        if (tip.action.query) {
          setPlaceQuery(tip.action.query);
          await searchPlaces(tip.action.query);
          setShowPlaces(true);
        }
        break;
      case "link":
        if (tip.action.url) {
          Linking.openURL(tip.action.url);
        }
        break;
    }
  };

  const searchPlaces = async (query: string) => {
    setPlacesLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 37.5012;
      let lng = 127.0396;

      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }

      // 카카오 API 호출 (query 변경)
      const KAKAO_REST_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_KEY || "";
      if (!KAKAO_REST_KEY) {
        // 데모 데이터
        setNearbyPlaces(getDemoPlaces(query));
      } else {
        const response = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&x=${lng}&y=${lat}&radius=5000&sort=distance`,
          { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
        );
        const data = await response.json();
        setNearbyPlaces(
          data.documents?.map((d: any) => ({
            id: d.id,
            name: d.place_name,
            address: d.road_address_name || d.address_name,
            phone: d.phone,
            distance: parseInt(d.distance),
            url: d.place_url,
          })) || []
        );
      }
    } catch {
      setNearbyPlaces(getDemoPlaces(query));
    }
    setPlacesLoading(false);
  };

  const renderTip = ({ item }: { item: WeeklyTip }) => {
    const style = urgencyStyle[item.urgency];

    return (
      <TouchableOpacity
        onPress={() => setSelectedTip(item)}
        activeOpacity={0.7}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 18,
          marginHorizontal: 20,
          marginBottom: 10,
          borderLeftWidth: 4,
          borderLeftColor: style.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 26, marginRight: 12 }}>{item.icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <View
                style={{
                  backgroundColor: style.bg,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginRight: 6,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "700", color: style.badge }}>
                  {style.label}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: "#9B9B9B" }}>
                {item.weekFrom}~{item.weekTo}주
              </Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#2D2D2D" }}>
              {item.title}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 19 }}>
          {item.description}
        </Text>

        {item.action && (
          <TouchableOpacity
            onPress={() => handleAction(item)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: style.bg,
              borderRadius: 10,
              paddingVertical: 10,
              marginTop: 12,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: style.border }}>
              {item.action.label} →
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }} edges={["bottom"]}>
      <FlatList
        data={myTips}
        renderItem={renderTip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
        onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View>
            {/* 주차 선택 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
            >
              {allWeeks.map((w) => {
                const isCurrent = w === allWeeks.reduce((prev, curr) => (currentWeek >= curr ? curr : prev), 4);
                return (
                  <TouchableOpacity
                    key={w}
                    onPress={() => setCurrentWeek(w)}
                    activeOpacity={0.7}
                    style={{
                      height: 36,
                      paddingHorizontal: 14,
                      borderRadius: 18,
                      backgroundColor: isCurrent ? "#FF6B81" : currentWeek === w ? "#FFD6DE" : "#FFFFFF",
                      borderWidth: 1.5,
                      borderColor: isCurrent ? "#FF6B81" : "#EEEEEE",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: isCurrent ? "#FFFFFF" : "#6B6B6B", fontWeight: "600" }}>
                      {w}주
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 현재 주차 안내 */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
              <Text style={{ fontSize: 14, color: "#6B6B6B" }}>
                💡 <Text style={{ fontWeight: "700", color: "#FF6B81" }}>{currentWeek}주차</Text>에
                알아야 할 꿀팁 <Text style={{ fontWeight: "700" }}>{myTips.length}개</Text>
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
            <Text style={{ fontSize: 50, marginBottom: 16 }}>📚</Text>
            <Text style={{ fontSize: 16, color: "#9B9B9B", textAlign: "center" }}>
              이 주차의 꿀팁을 준비 중이에요!{"\n"}다른 주차를 선택해보세요
            </Text>
          </View>
        }
      />

      {/* 팁 상세 모달 */}
      <Modal visible={!!selectedTip} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF8F0",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "80%",
              paddingBottom: 40,
            }}
          >
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              {/* 핸들 */}
              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#DDD" }} />
              </View>

              {selectedTip && (
                <>
                  <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>
                    {selectedTip.icon}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#2D2D2D",
                      textAlign: "center",
                      marginBottom: 16,
                    }}
                  >
                    {selectedTip.title}
                  </Text>

                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: 18,
                      marginBottom: 16,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#2D2D2D", lineHeight: 22 }}>
                      {selectedTip.detail}
                    </Text>
                  </View>

                  {selectedTip.action && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedTip(null);
                        handleAction(selectedTip);
                      }}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: "#FF6B81",
                        borderRadius: 14,
                        paddingVertical: 16,
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
                        {selectedTip.action.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <TouchableOpacity
                onPress={() => setSelectedTip(null)}
                style={{ alignItems: "center", paddingVertical: 8 }}
              >
                <Text style={{ color: "#9B9B9B", fontSize: 14 }}>닫기</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 근처 장소 모달 */}
      <Modal visible={showPlaces} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF8F0",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "75%",
              paddingBottom: 40,
            }}
          >
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              <View style={{ alignItems: "center", marginBottom: 12 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#DDD" }} />
              </View>

              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#2D2D2D", marginBottom: 4 }}
              >
                🗺️ 근처 {placeQuery}
              </Text>
              <Text style={{ fontSize: 13, color: "#9B9B9B", marginBottom: 16 }}>
                내 위치 기준 5km 이내
              </Text>

              {placesLoading ? (
                <Text style={{ textAlign: "center", color: "#9B9B9B", paddingVertical: 30 }}>
                  검색 중...
                </Text>
              ) : nearbyPlaces.length === 0 ? (
                <Text style={{ textAlign: "center", color: "#9B9B9B", paddingVertical: 30 }}>
                  근처에서 찾을 수 없어요
                </Text>
              ) : (
                nearbyPlaces.map((place, i) => (
                  <TouchableOpacity
                    key={place.id || i}
                    onPress={() => {
                      if (place.url) Linking.openURL(place.url);
                    }}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: i < 3 ? "#FF6B81" : "#FFF0F3",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "bold", color: i < 3 ? "#FFF" : "#FF6B81" }}>
                        {i + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D" }}>
                        {place.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9B9B9B", marginTop: 2 }}>
                        {place.address}
                      </Text>
                      {place.phone && (
                        <Text style={{ fontSize: 12, color: "#9B9B9B" }}>
                          📞 {place.phone}
                        </Text>
                      )}
                    </View>
                    <View style={{ backgroundColor: "#E8F8F0", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 11, color: "#2DB783", fontWeight: "600" }}>
                        {place.distance < 1000 ? `${place.distance}m` : `${(place.distance / 1000).toFixed(1)}km`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}

              <TouchableOpacity
                onPress={() => setShowPlaces(false)}
                style={{ alignItems: "center", paddingVertical: 12, marginTop: 8 }}
              >
                <Text style={{ color: "#9B9B9B", fontSize: 14 }}>닫기</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getDemoPlaces(query: string): any[] {
  if (query.includes("산후조리원")) {
    return [
      { id: "p1", name: "해피맘 산후조리원", address: "서울 강남구 역삼동 123", phone: "02-1234-5678", distance: 500, url: "https://place.map.kakao.com" },
      { id: "p2", name: "미즈러브 산후조리원", address: "서울 강남구 삼성동 456", phone: "02-2345-6789", distance: 1200, url: "https://place.map.kakao.com" },
      { id: "p3", name: "아이조아 산후조리원", address: "서울 서초구 서초동 789", phone: "02-3456-7890", distance: 1800, url: "https://place.map.kakao.com" },
      { id: "p4", name: "예담 산후케어센터", address: "서울 강남구 대치동 100", phone: "02-4567-8901", distance: 2200, url: "https://place.map.kakao.com" },
    ];
  }
  if (query.includes("보건소")) {
    return [
      { id: "p1", name: "강남구 보건소", address: "서울 강남구 삼성로 110길 18", phone: "02-3423-7100", distance: 800, url: "https://place.map.kakao.com" },
      { id: "p2", name: "서초구 보건소", address: "서울 서초구 남부순환로 2584", phone: "02-2155-8000", distance: 1500, url: "https://place.map.kakao.com" },
    ];
  }
  if (query.includes("치과")) {
    return [
      { id: "p1", name: "미소치과의원", address: "서울 강남구 역삼동 200", phone: "02-555-1234", distance: 300, url: "https://place.map.kakao.com" },
      { id: "p2", name: "연세바른치과", address: "서울 강남구 논현동 100", phone: "02-555-5678", distance: 700, url: "https://place.map.kakao.com" },
      { id: "p3", name: "서울스마일치과", address: "서울 서초구 서초동 300", phone: "02-555-9012", distance: 1100, url: "https://place.map.kakao.com" },
    ];
  }
  return [
    { id: "p1", name: `${query} 검색결과 1`, address: "서울 강남구", phone: "02-000-0000", distance: 500, url: "https://place.map.kakao.com" },
    { id: "p2", name: `${query} 검색결과 2`, address: "서울 서초구", phone: "02-000-0001", distance: 1200, url: "https://place.map.kakao.com" },
  ];
}
