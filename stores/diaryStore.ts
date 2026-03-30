import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface DiaryEntry {
  id: string;
  user_id: string;
  date: string;
  content: string | null;
  emotion: string | null;
  week_number: number | null;
  created_at: string;
  photos: DiaryPhoto[];
}

export interface DiaryPhoto {
  id: string;
  diary_id: string;
  photo_url: string;
  is_thumbnail: boolean;
  created_at: string;
}

// 데모용 샘플 데이터
const DEMO_ENTRIES: DiaryEntry[] = [
  {
    id: "demo-1",
    user_id: "demo-user",
    date: new Date().toISOString().split("T")[0],
    content: "오늘 병원에서 아기 심장소리를 들었어요! 콩닥콩닥 너무 신기하고 감동적이었어요 🥰 건강하게 자라고 있대요!",
    emotion: "love",
    week_number: 4,
    created_at: new Date().toISOString(),
    photos: [],
  },
  {
    id: "demo-2",
    user_id: "demo-user",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    content: "입덧이 조금 있었지만 남편이 죽을 끓여줘서 따뜻하게 먹었어요. 고마운 사람 💕",
    emotion: "happy",
    week_number: 4,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    photos: [],
  },
  {
    id: "demo-3",
    user_id: "demo-user",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    content: "엽산 먹기 시작! 보건소에서 무료로 받아왔어요. 우리 콩이를 위해 꼼꼼히 챙겨먹을게 😊",
    emotion: "excited",
    week_number: 4,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    photos: [],
  },
];

interface DiaryState {
  entries: DiaryEntry[];
  loading: boolean;
  currentEntry: DiaryEntry | null;

  fetchEntries: (userId: string) => Promise<void>;
  fetchEntry: (id: string) => Promise<void>;
  createEntry: (data: {
    userId: string;
    date: string;
    content: string;
    emotion: string;
    weekNumber: number;
    photoUrls: string[];
  }) => Promise<{ id: string | null; error: string | null }>;
  updateEntry: (
    id: string,
    data: { content?: string; emotion?: string }
  ) => Promise<{ error: string | null }>;
  deleteEntry: (id: string) => Promise<{ error: string | null }>;
  uploadPhoto: (
    userId: string,
    uri: string
  ) => Promise<{ url: string | null; error: string | null }>;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  entries: [],
  loading: false,
  currentEntry: null,

  fetchEntries: async (userId) => {
    set({ loading: true });

    if (!isSupabaseConfigured) {
      set({ entries: DEMO_ENTRIES, loading: false });
      return;
    }

    const { data, error } = await supabase
      .from("diaries")
      .select("*, photos:diary_photos(*)")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (!error && data) {
      set({ entries: data });
    }
    set({ loading: false });
  },

  fetchEntry: async (id) => {
    if (!isSupabaseConfigured) {
      const entry = DEMO_ENTRIES.find((e) => e.id === id) ||
        get().entries.find((e) => e.id === id);
      set({ currentEntry: entry || null });
      return;
    }

    const { data } = await supabase
      .from("diaries")
      .select("*, photos:diary_photos(*)")
      .eq("id", id)
      .single();

    if (data) {
      set({ currentEntry: data });
    }
  },

  createEntry: async ({ userId, date, content, emotion, weekNumber, photoUrls }) => {
    if (!isSupabaseConfigured) {
      const newEntry: DiaryEntry = {
        id: `demo-${Date.now()}`,
        user_id: userId,
        date,
        content,
        emotion,
        week_number: weekNumber,
        created_at: new Date().toISOString(),
        photos: [],
      };
      set((state) => ({ entries: [newEntry, ...state.entries] }));
      return { id: newEntry.id, error: null };
    }

    const { data, error } = await supabase
      .from("diaries")
      .insert({
        user_id: userId,
        date,
        content,
        emotion,
        week_number: weekNumber,
      })
      .select()
      .single();

    if (error) return { id: null, error: error.message };

    if (photoUrls.length > 0) {
      const photoInserts = photoUrls.map((url, index) => ({
        diary_id: data.id,
        photo_url: url,
        is_thumbnail: index === 0,
      }));
      await supabase.from("diary_photos").insert(photoInserts);
    }

    await get().fetchEntries(userId);
    return { id: data.id, error: null };
  },

  updateEntry: async (id, updates) => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      }));
      return { error: null };
    }

    const { error } = await supabase
      .from("diaries")
      .update(updates)
      .eq("id", id);

    if (error) return { error: error.message };
    return { error: null };
  },

  deleteEntry: async (id) => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }));
      return { error: null };
    }

    const { error } = await supabase.from("diaries").delete().eq("id", id);
    if (error) return { error: error.message };

    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }));
    return { error: null };
  },

  uploadPhoto: async (userId, uri) => {
    if (!isSupabaseConfigured) {
      return { url: uri, error: null };
    }

    try {
      const fileName = `${userId}/${Date.now()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from("diary-photos")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (error) return { url: null, error: error.message };

      const {
        data: { publicUrl },
      } = supabase.storage.from("diary-photos").getPublicUrl(fileName);

      return { url: publicUrl, error: null };
    } catch (err: any) {
      return { url: null, error: err.message };
    }
  },
}));
