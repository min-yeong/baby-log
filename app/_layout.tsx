import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "../stores/authStore";
import FloatingTabBar from "../components/FloatingTabBar";
import AnimatedSplash from "../components/AnimatedSplash";
import "../global.css";

// 네이티브 스플래시를 앱이 준비될 때까지 유지
SplashScreen.preventAutoHideAsync().catch(() => {});

const stackScreenStyle = {
  headerTintColor: "#FF6B81",
  headerStyle: { backgroundColor: "#FFF8F0" },
};

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initialize();
      } catch (e) {
        console.warn(e);
      } finally {
        SplashScreen.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, []);

  const onSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFF8F0" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ presentation: "fullScreenModal" }} />
        <Stack.Screen name="diary/write" options={{ headerShown: true, title: "일기 쓰기", ...stackScreenStyle, presentation: "modal" }} />
        <Stack.Screen name="diary/[id]" options={{ headerShown: true, title: "일기", ...stackScreenStyle }} />
        <Stack.Screen name="support/index" options={{ headerShown: true, title: "정부지원금 안내", ...stackScreenStyle }} />
        <Stack.Screen name="community/write" options={{ headerShown: true, title: "글쓰기", ...stackScreenStyle, presentation: "modal" }} />
        <Stack.Screen name="community/[id]" options={{ headerShown: true, title: "게시글", ...stackScreenStyle }} />
        <Stack.Screen name="nutrition" options={{ headerShown: true, title: "영양제 & 입덧 가이드", ...stackScreenStyle }} />
        <Stack.Screen name="tips" options={{ headerShown: true, title: "주차별 꿀팁", ...stackScreenStyle }} />
        <Stack.Screen name="youtube" options={{ headerShown: true, title: "임산부 영상", ...stackScreenStyle }} />
        <Stack.Screen name="hospital/[id]" options={{ headerShown: true, title: "산부인과 상세", ...stackScreenStyle }} />
        <Stack.Screen name="profile-setup" options={{ headerShown: true, title: "프로필 설정", ...stackScreenStyle }} />
      </Stack>
      <FloatingTabBar />
      {!splashDone && <AnimatedSplash onFinish={onSplashFinish} />}
    </View>
  );
}
