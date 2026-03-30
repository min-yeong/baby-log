import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export type EventType = "hospital" | "checkup" | "symptom" | "medicine";

export interface CalendarEvent {
  id: string;
  user_id: string;
  date: string;
  type: EventType;
  title: string;
  memo: string;
  created_at: string;
}

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    user_id: "demo-user",
    date: new Date().toISOString().split("T")[0],
    type: "medicine",
    title: "엽산 복용",
    memo: "아침 식후 엽산 400μg",
    created_at: new Date().toISOString(),
  },
  {
    id: "evt-2",
    user_id: "demo-user",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    type: "hospital",
    title: "산부인과 정기검진",
    memo: "심장소리 확인! 건강하대요",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "evt-3",
    user_id: "demo-user",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    type: "symptom",
    title: "입덧",
    memo: "아침에 좀 울렁거렸지만 레몬수 마시니까 나아짐",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

interface EventState {
  events: CalendarEvent[];
  loading: boolean;
  fetchEvents: (userId: string) => Promise<void>;
  createEvent: (data: {
    userId: string;
    date: string;
    type: EventType;
    title: string;
    memo: string;
  }) => Promise<{ error: string | null }>;
  deleteEvent: (id: string) => Promise<{ error: string | null }>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,

  fetchEvents: async (userId) => {
    set({ loading: true });
    if (!isSupabaseConfigured) {
      set({ events: DEMO_EVENTS, loading: false });
      return;
    }
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (data) set({ events: data });
    set({ loading: false });
  },

  createEvent: async ({ userId, date, type, title, memo }) => {
    if (!isSupabaseConfigured) {
      const newEvt: CalendarEvent = {
        id: `evt-${Date.now()}`,
        user_id: userId,
        date,
        type,
        title,
        memo,
        created_at: new Date().toISOString(),
      };
      set((s) => ({ events: [newEvt, ...s.events] }));
      return { error: null };
    }
    const { error } = await supabase
      .from("calendar_events")
      .insert({ user_id: userId, date, type, title, memo });
    if (error) return { error: error.message };
    await get().fetchEvents(userId);
    return { error: null };
  },

  deleteEvent: async (id) => {
    if (!isSupabaseConfigured) {
      set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
      return { error: null };
    }
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) return { error: error.message };
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
    return { error: null };
  },
}));
