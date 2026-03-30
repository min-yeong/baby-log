import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Linking,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { searchYouTube, YouTubeVideo, SUGGESTED_KEYWORDS } from "../lib/youtube";
import { useAuthStore } from "../stores/authStore";
import { handleScroll } from "../stores/uiStore";
import { calculatePregnancyWeek } from "../lib/pregnancy";
import { timeAgo } from "../lib/utils";

export default function YouTubeScreen() {
  const { profile } = useAuthStore();
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    handleSearch(getWeekBasedQuery());
  }, []);

  const getWeekBasedQuery = () => {
    if (!profile?.due_date) return "임신 초기 주의사항";
    const { weeks } = calculatePregnancyWeek(profile.due_date);
    if (weeks <= 8) return "임신 초기 주의사항";
    if (weeks <= 12) return "임신 3개월 산전검사";
    if (weeks <= 20) return "임신 중기 태교";
    if (weeks <= 30) return "출산준비물 리스트";
    return "출산 준비 진통 대처";
  };

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    const { videos: result } = await searchYouTube(q);
    setVideos(result);
    setLoading(false);
  };

  const renderVideo = useCallback(({ item }: { item: YouTubeVideo }) => (
    <TouchableOpacity
      onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${item.id}`)}
      activeOpacity={0.7}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        marginHorizontal: 20,
        marginBottom: 14,
      }}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: item.thumbnail }}
          style={{ width: "100%", height: 200 }}
          contentFit="cover"
        />
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255,0,0,0.85)", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#FFF", fontSize: 20, marginLeft: 2 }}>▶</Text>
          </View>
        </View>
      </View>
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D", lineHeight: 20 }} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#9B9B9B", marginTop: 6 }}>
          {item.channelTitle}  ·  {timeAgo(item.publishedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  ), []);

  const ListHeader = (
    <View>
      {/* 검색바 */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            paddingHorizontal: 14,
            borderWidth: 1.5,
            borderColor: "#EEEEEE",
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="임신, 출산, 육아 영상 검색..."
            placeholderTextColor="#9B9B9B"
            returnKeyType="search"
            onSubmitEditing={() => handleSearch()}
            style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: "#2D2D2D" }}
          />
        </View>
        <TouchableOpacity
          onPress={() => handleSearch()}
          activeOpacity={0.7}
          style={{ backgroundColor: "#FF6B81", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, marginLeft: 8 }}
        >
          <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 추천 키워드 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14 }}
      >
        {SUGGESTED_KEYWORDS.map((kw) => (
          <TouchableOpacity
            key={kw.query}
            onPress={() => { setQuery(kw.query); handleSearch(kw.query); }}
            activeOpacity={0.7}
            style={{
              height: 34,
              paddingHorizontal: 14,
              borderRadius: 17,
              backgroundColor: "#FFFFFF",
              borderWidth: 1.5,
              borderColor: "#FFD6DE",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 13, color: "#FF6B81", fontWeight: "500" }}>{kw.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }} edges={["bottom"]}>
        {ListHeader}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FFB5C2" />
          <Text style={{ fontSize: 14, color: "#9B9B9B", marginTop: 12 }}>영상을 찾고 있어요...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }} edges={["bottom"]}>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        stickyHeaderIndices={[]}
        contentContainerStyle={{ paddingBottom: 80 }}
        onScroll={(e) => handleScroll(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        ListEmptyComponent={
          searched ? (
            <View style={{ alignItems: "center", padding: 40 }}>
              <Text style={{ fontSize: 50, marginBottom: 16 }}>🎬</Text>
              <Text style={{ fontSize: 16, color: "#9B9B9B", textAlign: "center" }}>
                검색 결과가 없어요{"\n"}다른 키워드로 검색해보세요
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
