import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface Post {
  id: string;
  user_id: string;
  nickname: string;
  week_number: number | null;
  category: string;
  title: string;
  content: string;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  nickname: string;
  content: string;
  created_at: string;
}

export const COMMUNITY_CATEGORIES = [
  { key: "all", label: "전체", icon: "📋" },
  { key: "daily", label: "일상", icon: "☀️" },
  { key: "question", label: "질문", icon: "❓" },
  { key: "hospital", label: "병원/검진", icon: "🏥" },
  { key: "symptoms", label: "증상/입덧", icon: "🤢" },
  { key: "items", label: "출산준비물", icon: "🎒" },
  { key: "tips", label: "꿀팁", icon: "💡" },
];

const DEMO_POSTS: Post[] = [
  {
    id: "post-1",
    user_id: "user-a",
    nickname: "행복한콩맘",
    week_number: 8,
    category: "daily",
    title: "입덧이 줄어들기 시작했어요! 🎉",
    content: "8주차인데 드디어 입덧이 좀 줄어든 느낌이에요. 아침에 레몬향 맡으니까 좀 나아지더라고요. 다들 힘내세요!",
    like_count: 12,
    comment_count: 3,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "post-2",
    user_id: "user-b",
    nickname: "예비맘지은",
    week_number: 12,
    category: "question",
    title: "1차 기형아 검사 받으셨나요?",
    content: "12주차인데 1차 기형아 검사를 받아야 한다고 하는데, 혹시 받으신 분 계시면 경험 공유해주세요! 아프진 않은지, 비용은 얼마나 드는지 궁금해요 🥺",
    like_count: 8,
    comment_count: 5,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "post-3",
    user_id: "user-c",
    nickname: "뚱이맘",
    week_number: 20,
    category: "items",
    title: "출산준비물 리스트 공유해요 📝",
    content: "20주차 되니까 슬슬 준비하고 있어요!\n\n필수:\n- 배냇저고리 5장\n- 기저귀 신생아용 1팩\n- 수유쿠션\n- 가제수건 10장\n- 체온계\n\n있으면 좋은 것:\n- 바운서\n- 쪽쪽이\n- 손싸개/발싸개\n\n추가로 필요한 거 있으면 알려주세요!",
    like_count: 25,
    comment_count: 8,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "post-4",
    user_id: "user-d",
    nickname: "소망이엄마",
    week_number: 6,
    category: "symptoms",
    title: "입덧에 효과 있었던 것들",
    content: "6주차부터 입덧이 시작됐는데 이것들이 도움이 됐어요:\n\n1. 새콤한 과일 (자몽, 귤)\n2. 소량씩 자주 먹기\n3. 레몬수\n4. 생강차\n5. 크래커 베개 옆에 두고 아침에 일어나자마자 먹기\n\n다들 힘내요 우리 💪",
    like_count: 18,
    comment_count: 6,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "post-5",
    user_id: "user-e",
    nickname: "별이맘",
    week_number: 16,
    category: "hospital",
    title: "정밀초음파 후기입니다",
    content: "오늘 정밀초음파 받고 왔어요! 아기 손가락 발가락 다 잘 있고 건강하대요 😭💕 너무 감동적이었어요. 다들 걱정 마시고 검사 잘 받으세요!",
    like_count: 30,
    comment_count: 4,
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

const DEMO_COMMENTS: Record<string, Comment[]> = {
  "post-1": [
    { id: "c1", post_id: "post-1", user_id: "user-b", nickname: "예비맘지은", content: "저도 8주쯤 줄어들었어요! 조금만 더 힘내세요 💪", created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: "c2", post_id: "post-1", user_id: "user-c", nickname: "뚱이맘", content: "레몬향 팁 감사해요! 저도 해봐야겠어요 🍋", created_at: new Date(Date.now() - 1200000).toISOString() },
    { id: "c3", post_id: "post-1", user_id: "user-d", nickname: "소망이엄마", content: "부럽... 저는 아직 입덧 중 ㅠㅠ", created_at: new Date(Date.now() - 600000).toISOString() },
  ],
  "post-2": [
    { id: "c4", post_id: "post-2", user_id: "user-a", nickname: "행복한콩맘", content: "저 받았어요! 피검사랑 초음파 하는데 전혀 안 아파요~ 비용은 10만원 정도였어요", created_at: new Date(Date.now() - 5400000).toISOString() },
    { id: "c5", post_id: "post-2", user_id: "user-e", nickname: "별이맘", content: "필수 검사니까 꼭 받으세요! 결과 나오기까지 1-2주 걸려요", created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
};

interface CommunityState {
  posts: Post[];
  currentPost: Post | null;
  comments: Comment[];
  loading: boolean;

  fetchPosts: (category?: string) => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  createPost: (data: {
    userId: string;
    nickname: string;
    weekNumber: number | null;
    category: string;
    title: string;
    content: string;
  }) => Promise<{ id: string | null; error: string | null }>;
  createComment: (data: {
    postId: string;
    userId: string;
    nickname: string;
    content: string;
  }) => Promise<{ error: string | null }>;
  likePost: (postId: string) => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  currentPost: null,
  comments: [],
  loading: false,

  fetchPosts: async (category) => {
    set({ loading: true });

    if (!isSupabaseConfigured) {
      const filtered = category && category !== "all"
        ? DEMO_POSTS.filter((p) => p.category === category)
        : DEMO_POSTS;
      set({ posts: filtered, loading: false });
      return;
    }

    let query = supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data } = await query;
    if (data) set({ posts: data });
    set({ loading: false });
  },

  fetchPost: async (id) => {
    if (!isSupabaseConfigured) {
      const post = DEMO_POSTS.find((p) => p.id === id) || get().posts.find((p) => p.id === id);
      set({ currentPost: post || null });
      return;
    }

    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("id", id)
      .single();
    if (data) set({ currentPost: data });
  },

  fetchComments: async (postId) => {
    if (!isSupabaseConfigured) {
      set({ comments: DEMO_COMMENTS[postId] || [] });
      return;
    }

    const { data } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (data) set({ comments: data });
  },

  createPost: async ({ userId, nickname, weekNumber, category, title, content }) => {
    if (!isSupabaseConfigured) {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        user_id: userId,
        nickname,
        week_number: weekNumber,
        category,
        title,
        content,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
      };
      set((state) => ({ posts: [newPost, ...state.posts] }));
      return { id: newPost.id, error: null };
    }

    const { data, error } = await supabase
      .from("community_posts")
      .insert({ user_id: userId, nickname, week_number: weekNumber, category, title, content })
      .select()
      .single();

    if (error) return { id: null, error: error.message };
    await get().fetchPosts();
    return { id: data.id, error: null };
  },

  createComment: async ({ postId, userId, nickname, content }) => {
    if (!isSupabaseConfigured) {
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        post_id: postId,
        user_id: userId,
        nickname,
        content,
        created_at: new Date().toISOString(),
      };
      set((state) => ({ comments: [...state.comments, newComment] }));
      // 댓글 수 업데이트
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p
        ),
        currentPost: state.currentPost?.id === postId
          ? { ...state.currentPost, comment_count: state.currentPost.comment_count + 1 }
          : state.currentPost,
      }));
      return { error: null };
    }

    const { error } = await supabase
      .from("community_comments")
      .insert({ post_id: postId, user_id: userId, nickname, content });

    if (error) return { error: error.message };

    await supabase.rpc("increment_comment_count", { post_id: postId });
    await get().fetchComments(postId);
    return { error: null };
  },

  likePost: async (postId) => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, like_count: p.like_count + 1 } : p
        ),
        currentPost: state.currentPost?.id === postId
          ? { ...state.currentPost!, like_count: state.currentPost!.like_count + 1 }
          : state.currentPost,
      }));
      return;
    }

    await supabase.rpc("increment_like_count", { post_id: postId });
    await get().fetchPost(postId);
  },
}));
