import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../stores/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithPhone, verifyOtp, startDemo } = useAuthStore();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPhone = (text: string) => {
    // 숫자만 추출
    const numbers = text.replace(/[^0-9]/g, "");
    // 010-1234-5678 형식으로 자동 포맷
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const getE164Phone = () => {
    const numbers = phone.replace(/[^0-9]/g, "");
    if (numbers.startsWith("010")) {
      return `+82${numbers.slice(1)}`;
    }
    return `+82${numbers}`;
  };

  const handleSendOtp = async () => {
    const numbers = phone.replace(/[^0-9]/g, "");
    if (numbers.length < 10) {
      Alert.alert("알림", "올바른 전화번호를 입력해주세요");
      return;
    }

    setLoading(true);
    const result = await signInWithPhone(getE164Phone());
    setLoading(false);

    if (result.error) {
      Alert.alert("오류", result.error);
    } else {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      Alert.alert("알림", "인증번호 6자리를 입력해주세요");
      return;
    }

    setLoading(true);
    const result = await verifyOtp(getE164Phone(), otp);
    setLoading(false);

    if (result.error) {
      Alert.alert("오류", result.error);
    } else {
      router.back();
    }
  };

  const handleResend = () => {
    setOtpSent(false);
    setOtp("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 30 }}
        >
          {/* 로고 */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Text style={{ fontSize: 60 }}>👶</Text>
            <Text
              style={{ fontSize: 28, fontWeight: "bold", color: "#2D2D2D", marginTop: 12 }}
            >
              베이비로그
            </Text>
            <Text style={{ fontSize: 14, color: "#9B9B9B", marginTop: 6 }}>
              우리 아기의 소중한 기록
            </Text>
          </View>

          {!otpSent ? (
            <>
              {/* 전화번호 입력 */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#2D2D2D",
                  marginBottom: 8,
                }}
              >
                전화번호로 시작하기
              </Text>
              <Text style={{ fontSize: 13, color: "#9B9B9B", marginBottom: 20 }}>
                가입도 로그인도 전화번호 하나면 OK!
              </Text>

              <TextInput
                value={phone}
                onChangeText={(text) => setPhone(formatPhone(text))}
                placeholder="010-0000-0000"
                placeholderTextColor="#C0C0C0"
                keyboardType="phone-pad"
                maxLength={13}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 18,
                  fontSize: 20,
                  marginBottom: 16,
                  color: "#2D2D2D",
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              />

              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={loading || phone.replace(/[^0-9]/g, "").length < 10}
                style={{
                  backgroundColor:
                    phone.replace(/[^0-9]/g, "").length >= 10
                      ? "#FF6B81"
                      : "#FFD6DE",
                  borderRadius: 14,
                  paddingVertical: 18,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
                  {loading ? "전송 중..." : "인증번호 받기 📱"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* 인증번호 입력 */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#2D2D2D",
                  marginBottom: 8,
                }}
              >
                인증번호를 입력해주세요
              </Text>
              <Text style={{ fontSize: 13, color: "#9B9B9B", marginBottom: 20 }}>
                {phone}(으)로 전송된 인증번호 6자리
              </Text>

              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                placeholderTextColor="#C0C0C0"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 18,
                  fontSize: 28,
                  marginBottom: 16,
                  color: "#2D2D2D",
                  textAlign: "center",
                  letterSpacing: 12,
                  fontWeight: "bold",
                }}
              />

              <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                style={{
                  backgroundColor: otp.length >= 6 ? "#FF6B81" : "#FFD6DE",
                  borderRadius: 14,
                  paddingVertical: 18,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
                  {loading ? "확인 중..." : "확인"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResend}
                style={{ alignItems: "center", paddingVertical: 8 }}
              >
                <Text style={{ color: "#FF6B81", fontSize: 14 }}>
                  인증번호 다시 받기
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* 구분선 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 28,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#FFD6DE" }} />
            <Text style={{ color: "#9B9B9B", fontSize: 12, marginHorizontal: 12 }}>
              또는
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#FFD6DE" }} />
          </View>

          {/* 둘러보기 (데모) */}
          <TouchableOpacity
            onPress={() => {
              startDemo();
              router.back();
            }}
            style={{
              borderWidth: 1.5,
              borderColor: "#FFB5C2",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FF6B81", fontSize: 15, fontWeight: "600" }}>
              먼저 둘러볼게요 👀
            </Text>
          </TouchableOpacity>

          {/* 닫기 */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 20, alignItems: "center" }}
          >
            <Text style={{ color: "#9B9B9B", fontSize: 14 }}>닫기</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
