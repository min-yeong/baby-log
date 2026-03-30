import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCommunityStore, COMMUNITY_CATEGORIES, Comment } from "../../stores/communityStore";
import { useAuthStore } from "../../stores/authStore";
import { timeAgo } from "../../lib/utils";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuthStore();
  const {
    currentPost,
    comments,
    fetchPost,
    fetchComments,
    createComment,
    likePost,
  } = useCommunityStore();

  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(id);
      fetchComments(id);
    }
  }, [id]);

  const handleComment = async () => {
    if (!commentText.trim() || !user || !id) return;

    setSending(true);
    await createComment({
      postId: id,
      userId: user.id,
      nickname: profile?.nickname || "익명",
      content: commentText.trim(),
    });
    setCommentText("");
    setSending(false);
  };

  const handleLike = () => {
    if (id) likePost(id);
  };

  if (!currentPost) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#FFF8F0", justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: "#9B9B9B" }}>로딩 중...</Text>
      </View>
    );
  }

  const cat = COMMUNITY_CATEGORIES.find((c) => c.key === currentPost.category);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF8F0" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 게시글 */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            padding: 20,
            marginBottom: 8,
          }}
        >
          {/* 작성자 정보 */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "#FFF0F3",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 20 }}>👩</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#2D2D2D" }}>
                {currentPost.nickname}
              </Text>
              <Text style={{ fontSize: 12, color: "#9B9B9B" }}>
                {currentPost.week_number ? `${currentPost.week_number}주차` : ""} ·{" "}
                {timeAgo(currentPost.created_at)}
              </Text>
            </View>
            {cat && (
              <View
                style={{
                  backgroundColor: "#FFF0F3",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontSize: 12, color: "#FF6B81" }}>
                  {cat.icon} {cat.label}
                </Text>
              </View>
            )}
          </View>

          {/* 제목 + 내용 */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#2D2D2D",
              marginBottom: 12,
            }}
          >
            {currentPost.title}
          </Text>
          <Text style={{ fontSize: 15, color: "#2D2D2D", lineHeight: 24 }}>
            {currentPost.content}
          </Text>

          {/* 좋아요 + 댓글 수 */}
          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: "#F5F5F5",
            }}
          >
            <TouchableOpacity
              onPress={handleLike}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFF0F3",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 4 }}>❤️</Text>
              <Text style={{ fontSize: 14, color: "#FF6B81", fontWeight: "600" }}>
                {currentPost.like_count}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F5F5F5",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 14,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 4 }}>💬</Text>
              <Text style={{ fontSize: 14, color: "#6B6B6B", fontWeight: "600" }}>
                {currentPost.comment_count}
              </Text>
            </View>
          </View>
        </View>

        {/* 댓글 목록 */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Text
            style={{ fontSize: 15, fontWeight: "600", color: "#2D2D2D", marginBottom: 14 }}
          >
            댓글 {comments.length}개
          </Text>

          {comments.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 30 }}>
              <Text style={{ fontSize: 14, color: "#9B9B9B" }}>
                아직 댓글이 없어요. 첫 댓글을 남겨보세요!
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View
                key={comment.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#FFF0F3",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>👩</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#2D2D2D" }}>
                    {comment.nickname}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9B9B9B", marginLeft: 8 }}>
                    {timeAgo(comment.created_at)}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: "#2D2D2D", lineHeight: 20, marginLeft: 36 }}>
                  {comment.content}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 댓글 입력 */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: 30,
          borderTopWidth: 1,
          borderTopColor: "#FFD6DE",
          backgroundColor: "#FFFFFF",
        }}
      >
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="댓글을 남겨보세요..."
          placeholderTextColor="#9B9B9B"
          multiline
          style={{
            flex: 1,
            backgroundColor: "#FFF8F0",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            fontSize: 14,
            maxHeight: 80,
            color: "#2D2D2D",
          }}
        />
        <TouchableOpacity
          onPress={handleComment}
          disabled={!commentText.trim() || sending}
          style={{
            backgroundColor: commentText.trim() ? "#FF6B81" : "#FFD6DE",
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 8,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 16 }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
