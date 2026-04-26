import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { theme } from "../../constants/theme";

const ICON_SIZE = 24;
const TAB_HEIGHT = 64;

function TabIcon({ source, label, focused }: { source: any; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Image
        source={source}
        style={{ width: ICON_SIZE, height: ICON_SIZE }}
        contentFit="contain"
      />
      <Text
        style={{
          fontSize: theme.font.caption.size,
          fontWeight: focused ? "700" : "500",
          color: focused ? theme.color.pink[500] : theme.color.ink[400],
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.color.ink[0],
          borderTopColor: theme.color.cream[200],
          borderTopWidth: 1,
          height: TAB_HEIGHT,
          paddingTop: 6,
          paddingBottom: 6,
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
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/ai_chat.png")} label="AI상담" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="hospital"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require("../../assets/icons/mypage.png")} label="내정보" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
