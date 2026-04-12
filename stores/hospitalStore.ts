import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Hospital } from "../lib/kakaoLocal";

export interface FavoriteHospital {
  id: string;
  place_id: string;
  place_name: string;
  address: string;
  phone: string;
  place_url: string;
  naver_place_url: string;
  created_at: string;
}

// 데모 즐겨찾기
const DEMO_FAVORITES: FavoriteHospital[] = [
  {
    id: "fav-1",
    place_id: "demo-1",
    place_name: "미래여성병원",
    address: "서울 강남구 테헤란로 123",
    phone: "02-1234-5678",
    place_url: "https://place.map.kakao.com/12345",
    naver_place_url: "https://m.search.naver.com/search.naver?where=nexearch&query=미래여성병원 산부인과",
    created_at: "2026-04-01",
  },
];

interface HospitalState {
  favorites: FavoriteHospital[];
  loading: boolean;
  fetchFavorites: () => Promise<void>;
  addFavorite: (hospital: Hospital) => Promise<void>;
  removeFavorite: (placeId: string) => Promise<void>;
  isFavorite: (placeId: string) => boolean;
}

export const useHospitalStore = create<HospitalState>((set, get) => ({
  favorites: [],
  loading: false,

  fetchFavorites: async () => {
    if (!isSupabaseConfigured) {
      set({ favorites: DEMO_FAVORITES });
      return;
    }

    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ loading: false }); return; }

    const { data } = await supabase
      .from("favorite_hospitals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    set({ favorites: data || [], loading: false });
  },

  addFavorite: async (hospital) => {
    const naverUrl = `https://m.search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(hospital.name + ' 산부인과')}`;

    if (!isSupabaseConfigured) {
      // 데모 모드
      const newFav: FavoriteHospital = {
        id: `fav-${Date.now()}`,
        place_id: hospital.id,
        place_name: hospital.name,
        address: hospital.roadAddress,
        phone: hospital.phone,
        place_url: hospital.placeUrl,
        naver_place_url: naverUrl,
        created_at: new Date().toISOString(),
      };
      set((state) => ({ favorites: [newFav, ...state.favorites] }));
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("favorite_hospitals")
      .insert({
        user_id: user.id,
        place_id: hospital.id,
        place_name: hospital.name,
        address: hospital.roadAddress,
        phone: hospital.phone,
        place_url: hospital.placeUrl,
        naver_place_url: naverUrl,
      })
      .select()
      .single();

    if (data) {
      set((state) => ({ favorites: [data, ...state.favorites] }));
    }
  },

  removeFavorite: async (placeId) => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        favorites: state.favorites.filter((f) => f.place_id !== placeId),
      }));
      return;
    }

    const fav = get().favorites.find((f) => f.place_id === placeId);
    if (!fav) return;

    await supabase.from("favorite_hospitals").delete().eq("id", fav.id);
    set((state) => ({
      favorites: state.favorites.filter((f) => f.place_id !== placeId),
    }));
  },

  isFavorite: (placeId) => {
    return get().favorites.some((f) => f.place_id === placeId);
  },
}));
