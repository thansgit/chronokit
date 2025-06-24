import { create } from "zustand";

type SessionState = {
  isPlaying: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  isPlaying: false,
  start: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  reset: () => set({ isPlaying: false }),
}));
