import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ScrollView, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useCommunityStore, COMMUNITY_CATEGORIES, Post } from "../../stores/communityStore";
import { timeAgo } from "../../lib/utils";
import { theme } from "../../constants/theme";
import { Button, Card, Chip, EmptyState, ScreenHeader } from "../../components/ui";

const MOM_CAFES = [
  { name: "맘스홀릭 베이비", icon: "💛", url: "https://cafe.naver.com/imsanbu" },
  { name: "레몬테라스", icon: "🍋", url: "https://cafe.naver.com/remonterrace" },
  { name: "여성시대", icon: "👩", url: "https://cafe.naver.com/womangeneration" },
  { name: "쭉빵카페", icon: "🍼", url: "https://cafe.naver.com/jukbang" },
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
      <View style={{ paddingHorizontal: theme.space[5], marginBottom: theme.space[3] - 2 }}>
        <Card variant="default" onPress={() => router.push(`/community/${item.id}`)}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.space[3] - 2 }}>
            <View
              style={{
                width: theme.iconBox.sm + 4,
                height: theme.iconBox.sm + 4,
                borderRadius: (theme.iconBox.sm + 4) / 2,
                backgroundColor: theme.color.pink[100],
                alignItems: "center",
                justifyContent: "center",
                marginRight: theme.space[3] - 2,
              }}
            >
              <Text style={{ fontSize: 16 }}>👩</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: theme.font.body.size, fontWeight: "600", color: theme.color.ink[900] }}>
                {item.nickname}
              </Text>
              <Text style={{ fontSize: theme.font.caption.size, color: theme.color.ink[400] }}>
                {item.week_number ? `${item.week_number}주차 · ` : ""}{timeAgo(item.created_at)}
              </Text>
            </View>
            {cat && (
              <Chip color="primary" variant="solid">
                {cat.label}
              </Chip>
            )}
          </View>

          <Text
            style={{
              fontSize: theme.font.bodyLg.size,
              fontWeight: "600",
              color: theme.color.ink[900],
              marginBottom: theme.space[2] - 2,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={{ fontSize: theme.font.label.size, color: theme.color.ink[700], lineHeight: 19 }}
            numberOfLines={2}
          >
            {item.content}
          </Text>

          {(item as any).image_url && (
            <Image
              source={{ uri: (item as any).image_url }}
              style={{
                width: "100%",
                height: 160,
                borderRadius: theme.radius.md - 2,
                marginTop: theme.space[3] - 2,
              }}
              contentFit="cover"
            />
          )}

          <View
            style={{
              flexDirection: "row",
              marginTop: theme.space[3],
              paddingTop: theme.space[3] - 2,
              borderTopWidth: 1,
              borderTopColor: theme.color.cream[100],
              gap: theme.space[4],
            }}
          >
            <Text style={{ fontSize: theme.font.label.size, color: theme.color.ink[400] }}>
              ♡ {item.like_count}
            </Text>
            <Text style={{ fontSize: theme.font.label.size, color: theme.color.ink[400] }}>
              💬 {item.comment_count}
            </Text>
          </View>
        </Card>
      </View>
    );
  }, [router]);

  const ListHeader = (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.space[5],
          paddingBottom: theme.space[3] + 2,
          gap: theme.space[2] + 2,
        }}
      >
        {MOM_CAFES.map((cafe) => (
          <Pressable
            key={cafe.name}
            onPress={() => Linking.openURL(cafe.url)}
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.color.cream[100],
                borderRadius: theme.radius.md,
                paddingVertical: theme.space[2] + 2,
                paddingHorizontal: theme.space[3] + 2,
                gap: theme.space[2] - 2,
              },
              pressed && { opacity: theme.opacity.pressed },
            ]}
          >
            <Text style={{ fontSize: 16 }}>{cafe.icon}</Text>
            <Text
              style={{
                fontSize: theme.font.caption.size + 1,
                color: theme.color.ink[900],
                fontWeight: "600",
              }}
            >
              {cafe.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.space[5],
          paddingBottom: theme.space[3] + 2,
          gap: theme.space[2],
        }}
      >
        {COMMUNITY_CATEGORIES.map((cat) => (
          <Chip
            key={cat.key}
            selected={category === cat.key}
            color="primary"
            onPress={() => setCategory(cat.key)}
          >
            {cat.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScreenHeader
        title="커뮤니티"
        rightAction={
          <Button size="sm" onPress={() => router.push("/community/write")}>
            + 글쓰기
          </Button>
        }
      />

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: theme.space[5], flexGrow: 1 }}
        refreshing={loading}
        onRefresh={() => fetchPosts(category)}
        ListEmptyComponent={
          <EmptyState
            illustration={<Text style={{ fontSize: 44 }}>🤰</Text>}
            title="아직 게시글이 없어요"
            description={"첫 번째 글을 작성해보세요!"}
            action={
              <Button variant="primary" onPress={() => router.push("/community/write")}>
                글쓰기
              </Button>
            }
          />
        }
      />
    </SafeAreaView>
  );
}
