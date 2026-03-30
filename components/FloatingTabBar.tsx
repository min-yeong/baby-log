import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Image } from "expo-image";
import { useRouter, usePathname } from "expo-router";
import { useUIStore } from "../stores/uiStore";

const TABS = [
  { route: "/(tabs)", icon: require("../assets/icons/home.png"), label: "홈" },
  { route: "/(tabs)/diary", icon: require("../assets/icons/diary.png"), label: "다이어리" },
  { route: "/(tabs)/community", icon: require("../assets/icons/community.png"), label: "커뮤니티" },
  { route: "/(tabs)/hospital", icon: require("../assets/icons/hospital.png"), label: "산부인과" },
  { route: "/(tabs)/profile", icon: require("../assets/icons/mypage.png"), label: "내 정보" },
];

export default function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const visible = useUIStore((s) => s.floatingTabVisible);
  const translateY = useRef(new Animated.Value(100)).current;

  const isTabScreen =
    pathname === "/" ||
    pathname === "/diary" ||
    pathname === "/community" ||
    pathname === "/hospital" ||
    pathname === "/chat" ||
    pathname === "/profile";

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible && !isTabScreen ? 0 : 100,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [visible, isTabScreen]);

  useEffect(() => {
    useUIStore.getState().hideFloatingTab();
  }, [pathname]);

  if (isTabScreen) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 24,
        left: 24,
        right: 24,
        transform: [{ translateY }],
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        paddingVertical: 10,
        paddingHorizontal: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.route}
          onPress={() => router.replace(tab.route as any)}
          activeOpacity={0.7}
          style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}
        >
          <Image source={tab.icon} style={{ width: 36, height: 36, borderRadius: 10 }} contentFit="cover" />
          <Text style={{ fontSize: 9, color: "#9B9B9B", marginTop: 3, fontWeight: "500" }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}
