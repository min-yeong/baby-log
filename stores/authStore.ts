import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  nickname: string | null;
  due_date: string | null;
  baby_nickname: string | null;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  startDemo: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
}

const DEMO_USER = {
  id: "demo-user",
  email: "demo@babylog.app",
} as User;

const DEMO_PROFILE: Profile = {
  id: "demo-user",
  nickname: "예비맘",
  due_date: "2026-11-20",
  baby_nickname: "콩이",
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isDemo: false,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      // Supabase 미설정 시 데모 모드로 자동 시작
      set({
        user: DEMO_USER,
        profile: DEMO_PROFILE,
        loading: false,
        isDemo: true,
      });
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false });

      if (session?.user) {
        await get().fetchProfile();
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
        if (session?.user) {
          get().fetchProfile();
        } else {
          set({ profile: null });
        }
      });
    } catch {
      set({ loading: false });
    }
  },

  startDemo: () => {
    set({
      user: DEMO_USER,
      profile: DEMO_PROFILE,
      loading: false,
      isDemo: true,
    });
  },

  signUp: async (email, password) => {
    if (!isSupabaseConfigured) {
      get().startDemo();
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      get().startDemo();
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return { error: null };
  },

  signInWithPhone: async (phone) => {
    if (!isSupabaseConfigured) return { error: "Supabase 설정이 필요해요" };
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) return { error: error.message };
    return { error: null };
  },

  verifyOtp: async (phone, token) => {
    if (!isSupabaseConfigured) return { error: "Supabase 설정이 필요해요" };
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (error) return { error: error.message };
    return { error: null };
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ session: null, user: null, profile: null, isDemo: false });
  },

  fetchProfile: async () => {
    if (get().isDemo) return;
    const user = get().user;
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      set({ profile: data });
    }
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return { error: "로그인이 필요해요" };

    if (get().isDemo) {
      // 데모 모드에서는 로컬에서만 업데이트
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
      }));
      return { error: null };
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...updates });

    if (error) return { error: error.message };

    await get().fetchProfile();
    return { error: null };
  },
}));
