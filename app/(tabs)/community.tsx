import { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, ScrollView, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCommunityStore, COMMUNITY_CATEGORIES, Post } from "../../stores/communityStore";
import { Image } from "expo-image";
import { timeAgo } from "../../lib/utils";

const MOM_CAFES = [
  { name: "맘스홀릭 베이비", icon: "💛", color: "#FFF8E1", url: "https://cafe.naver.com/imsanbu" },
  { name: "레몬테라스", icon: "🍋", color: "#F1F8E9", url: "https://cafe.naver.com/remonterrace" },
  { name: "여성시대", icon: "👩", color: "#FCE4EC", url: "https://cafe.naver.com/womangeneration" },
  { name: "쭉빵카페", icon: "🍼", color: "#E8EAF6", url: "https://cafe.naver.com/jukbang" },
];


export default function CommunityScreen() {
  const router = useRouter();
  const { posts, loading, fetchPosts } = useCommunityStore();
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchPosts(category);
  }, [category]);

  const renderPost = useCallback(({ item }: { item: Post }) => {
    const cat = COMMUNITY_CATEGORIES.find((c) => c.key === item.category);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/community/${item.id}`)}
        activeOpacity={0.7}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 16,
          marginHorizontal: 20,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFF0F3", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
            <Text style={{ fontSize: 16 }}>👩</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#2D2D2D" }}>{item.nickname}</Text>
            <Text style={{ fontSize: 11, color: "#9B9B9B" }}>
              {item.week_number ? `${item.week_number}주차` : ""} · {timeAgo(item.created_at)}
            </Text>
          </View>
          {cat && (
            <View style={{ backgroundColor: "#FFF0F3", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, color: "#FF6B81" }}>{cat.icon} {cat.label}</Text>
            </View>
          )}
        </View>

        <Text style={{ fontSize: 15, fontWeight: "600", color: "#2D2D2D", marginBottom: 6 }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 13, color: "#6B6B6B", lineHeight: 19 }} numberOfLines={2}>
          {item.content}
        </Text>

        {(item as any).image_url && (
          <Image
            source={{ uri: (item as any).image_url }}
            style={{ width: "100%", height: 160, borderRadius: 10, marginTop: 10 }}
            contentFit="cover"
          />
        )}

        <View style={{ flexDirection: "row", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F5F5F5" }}>
          <Text style={{ fontSize: 13, color: "#9B9B9B", marginRight: 16 }}>❤️ {item.like_count}</Text>
          <Text style={{ fontSize: 13, color: "#9B9B9B" }}>💬 {item.comment_count}</Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const ListHeader = (
    <View>
      {/* 맘카페 바로가기 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14 }}
      >
        {MOM_CAFES.map((cafe) => (
          <TouchableOpacity
            key={cafe.name}
            onPress={() => Linking.openURL(cafe.url)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: cafe.color,
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 14,
              marginRight: 10,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 6 }}>{cafe.icon}</Text>
            <Text style={{ fontSize: 12, color: "#2D2D2D", fontWeight: "600" }}>{cafe.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 카테고리 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14 }}
      >
        {COMMUNITY_CATEGORIES.map((cat) => {
          const isActive = category === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setCategory(cat.key)}
              activeOpacity={0.7}
              style={{
                height: 36,
                paddingHorizontal: 14,
                borderRadius: 18,
                backgroundColor: isActive ? "#FF6B81" : "#FFFFFF",
                borderWidth: 1.5,
                borderColor: isActive ? "#FF6B81" : "#EEEEEE",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 13, color: isActive ? "#FFFFFF" : "#6B6B6B", fontWeight: "600", lineHeight: 16 }}>
                {cat.icon} {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F0" }}>
      {/* 헤더 - 고정 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 10,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#2D2D2D" }}>
          👩‍👩‍👧 커뮤니티
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/community/write")}
          activeOpacity={0.7}
          style={{ backgroundColor: "#FF6B81", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 }}
        >
          <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "600" }}>+ 글쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* 맘카페 + 카테고리 + 게시글 = 하나의 FlatList */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        refreshing={loading}
        onRefresh={() => fetchPosts(category)}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 50, marginBottom: 16 }}>🤰</Text>
            <Text style={{ fontSize: 16, color: "#9B9B9B", textAlign: "center" }}>
              아직 게시글이 없어요{"\n"}첫 번째 글을 작성해보세요!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
