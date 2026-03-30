import { create } from "zustand";

interface UIState {
  floatingTabVisible: boolean;
  showFloatingTab: () => void;
  hideFloatingTab: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  floatingTabVisible: false,
  showFloatingTab: () => { if (!get().floatingTabVisible) set({ floatingTabVisible: true }); },
  hideFloatingTab: () => { if (get().floatingTabVisible) set({ floatingTabVisible: false }); },
}));

let lastScrollY = 0;

export function handleScroll(currentY: number) {
  const diff = currentY - lastScrollY;
  if (diff > 3) useUIStore.getState().showFloatingTab();
  else if (diff < -3) useUIStore.getState().hideFloatingTab();
  lastScrollY = currentY;
}
