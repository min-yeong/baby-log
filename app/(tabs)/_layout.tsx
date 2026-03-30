import { Tabs } from "expo-router";
import { View, Text, Platform, useWindowDimensions } from "react-native";
import { Image } from "expo-image";

function TabIcon({ source, label, focused }: { source: any; label: string; focused: boolean }) {
  const { width, height } = useWindowDimensions();
  const isMobileView = Platform.OS !== "web";

  // 화면 너비 500 이하 = 모바일 크기, 이상 = 데스크탑 크기
  const isMobileSize = width <= 500;
  const iconSize = isMobileSize
    ? Math.floor(width * 0.10)   // 모바일: 너비의 10% (390px → 39pt)
    : 32;                         // 데스크탑: 고정 32pt

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Image
        source={source}
        style={{ width: iconSize, height: iconSize }}
        contentFit="contain"
      />
      <Text
        style={{
          fontSize: isMobileSize ? Math.floor(width * 0.03) : 11,
          fontWeight: focused ? "700" : "500",
          color: focused ? "#FF6B81" : "#9B9B9B",
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { width, height } = useWindowDimensions();
  const isMobileView = width <= 500;
  const tabHeight = isMobileView ? Math.floor(height * 0.09) : 70;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#FFD6DE",
          borderTopWidth: 1,
          height: tabHeight,
          paddingTop: isMobileView ? 2 : 6,
          paddingBottom: isMobileView ? 2 : 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/home.png")} label="홈" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/diary.png")} label="다이어리" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/community.png")} label="커뮤니티" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="hospital"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/hospital.png")} label="산부인과" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/mypage.png")} label="내 정보" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
