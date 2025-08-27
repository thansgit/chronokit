import { create } from "zustand";
import { SoundStatus } from "@/types";

interface SoundStore extends SoundStatus {
  // Actions
  toggleMute: () => boolean;
  setMute: (isMuted: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  // Initial state
  isMuted: false,
  volume: 1.0,

  // Actions
  toggleMute: () => {
    const newMuteState = !get().isMuted;
    set({ isMuted: newMuteState });
    return newMuteState;
  },

  setMute: (isMuted) => {
    set({ isMuted });
  },

  setVolume: (volume) => {
    // Ensure volume is between 0 and 1
    const safeVolume = Math.max(0, Math.min(1, volume));
    set({ volume: safeVolume });
  },
}));
