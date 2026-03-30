import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { searchNearbyHospitals, Hospital } from "../../lib/kakaoLocal";
import { handleScroll } from "../../stores/uiStore";
import { timeAgo } from "../../lib/utils";

interface Review {
  id: string;
  nickname: string;
  rating: number;
  content: string;
  created_at: string;
}

// 데모 리뷰 데이터
const DEMO_REVIEWS: Record<string, Review[]> = {
  "demo-1": [
    { id: "r1", nickname: "행복한콩맘", rating: 5, content: "원장님이 정말 친절하세요! 초음파도 자세히 설명해주시고 질문에도 꼼꼼하게 답해주세요. 첫 임신이라 불안했는데 안심이 됐어요 💕", created_at: "2026-03-25" },
    { id: "r2", nickname: "예비맘지은", rating: 4, content: "시설이 깨끗하고 좋아요. 대기 시간이 좀 있는 편이지만 진료는 만족스러워요.", created_at: "2026-03-20" },
    { id: "r3", nickname: "소망이엄마", rating: 5, content: "여기서 첫째 출산했는데 너무 좋아서 둘째도 여기 다녀요! 간호사분들도 다 친절해요 😊", created_at: "2026-03-15" },
  ],
  "demo-2": [
    { id: "r4", nickname: "별이맘", rating: 4, content: "원장님이 꼼꼼하시고 설명을 잘 해주세요. 주차가 좀 불편한 게 아쉬워요.", created_at: "2026-03-22" },
    { id: "r5", nickname: "뚱이맘", rating: 5, content: "입덧 상담 받으러 갔는데 처방도 잘 해주시고 생활 팁도 알려주셔서 많이 도움됐어요!", created_at: "2026-03-18" },
  ],
};

function StarRating({
  rating,
  onRate,
  size = 24,
}: {
  rating: number;
  onRate?: (r: number) => void;
  size?: number;
}) {
  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRate?.(star)}
          disabled={!onRate}
          activeOpacity={onRate ? 0.6 : 1}
          style={{ marginRight: 2 }}
        >
          <Text style={{ fontSize: size }}>
            {star <= rating ? "⭐" : "☆"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}


export default function HospitalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // 데모에서 병원 찾기
    loadHospital();
    loadReviews();
  }, [id]);

  const loadHospital = async () => {
    const { hospitals } = await searchNearbyHospitals(37.5012, 127.0396);
    const found = hospitals.find((h) => h.id === id);
    if (found) setHospital(found);
  };

  const loadReviews = () => {
    if (id && DEMO_REVIEWS[id]) {
      setReviews(DEMO_REVIEWS[id]);
    }
  };

  const handleSubmitReview = () => {
    if (!newReview.trim()) {
      Alert.alert("알림", "후기를 작성해주세요");
      return;
    }

    const review: Review = {
      id: `r-${Date.now()}`,
      nickname: profile?.nickname || "익명",
      rating: newRating,
      content: newReview.trim(),
      created_at: new Date().toISOString().split("T")[0],
    };

    setReviews((prev) => [review, ...prev]);
    setNewReview("");
    setNewRating(5);
    Alert.alert("감사해요!", "후기가 등록되었어요 💕");
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0";

  if (!hospital) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF8F0", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#9B9B9B" }}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF8F0" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 90 }}
        onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {/* 병원 정보 카드 */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            padding: 24,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#2D2D2D" }}>
            {hospital.name}
          </Text>
          <Text style={{ fontSize: 14, color: "#9B9B9B", marginTop: 6 }}>
            📍 {hospital.roadAddress}
          </Text>
          <Text style={{ fontSize: 14, color: "#9B9B9B", marginTop: 4 }}>
            📞 {hospital.phone}
          </Text>

          {/* 평점 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 16,
              backgroundColor: "#FFF8F0",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 32, fontWeight: "bold", color: "#FF6B81", marginRight: 12 }}>
              {avgRating}
            </Text>
            <View>
              <StarRating rating={Math.round(parseFloat(avgRating))} />
              <Text style={{ fontSize: 12, color: "#9B9B9B", marginTop: 2 }}>
                후기 {reviews.length}개
              </Text>
            </View>
          </View>

          {/* 액션 버튼 */}
          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${hospital.phone.replace(/-/g, "")}`)}
              style={{
                flex: 1,
                backgroundColor: "#FF6B81",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginRight: 8,
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                📞 전화하기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(hospital.placeUrl)}
              style={{
                flex: 1,
                backgroundColor: "#E8F8F0",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#2DB783", fontWeight: "700", fontSize: 14 }}>
                🗺️ 카카오맵
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 후기 작성 */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            padding: 20,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#2D2D2D", marginBottom: 12 }}>
            ✏️ 후기 남기기
          </Text>

          <View style={{ alignItems: "center", marginBottom: 14 }}>
            <StarRating rating={newRating} onRate={setNewRating} size={32} />
          </View>

          <TextInput
            value={newReview}
            onChangeText={setNewReview}
            placeholder="이 산부인과는 어떠셨나요? 다른 예비맘들에게 도움이 될 거예요!"
            placeholderTextColor="#9B9B9B"
            multiline
            textAlignVertical="top"
            style={{
              backgroundColor: "#FFF8F0",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              minHeight: 80,
              color: "#2D2D2D",
              lineHeight: 20,
            }}
          />

          <TouchableOpacity
            onPress={handleSubmitReview}
            activeOpacity={0.7}
            style={{
              backgroundColor: "#FF6B81",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
              후기 등록하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 후기 목록 */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#2D2D2D", marginBottom: 14 }}>
            💬 후기 {reviews.length}개
          </Text>

          {reviews.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 30 }}>
              <Text style={{ fontSize: 14, color: "#9B9B9B" }}>
                아직 후기가 없어요. 첫 후기를 남겨보세요!
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View
                key={review.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#FFF0F3",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>👩</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "#2D2D2D" }}>
                      {review.nickname}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#9B9B9B" }}>
                      {timeAgo(review.created_at)}
                    </Text>
                  </View>
                  <StarRating rating={review.rating} size={14} />
                </View>
                <Text style={{ fontSize: 14, color: "#2D2D2D", lineHeight: 20, marginLeft: 42 }}>
                  {review.content}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
