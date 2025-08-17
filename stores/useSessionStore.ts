import { create } from "zustand";
import { Session } from "../assets/data/mock";

interface SessionState {
  // State
  session: Session | null;
  isRunning: boolean;
  startAt: number | null; // ms timestamp when started
  elapsedOffsetMs: number; // accumulated elapsed across pauses

  // Actions
  setSession: (session: Session) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  session: null,
  isRunning: false,
  startAt: null,
  elapsedOffsetMs: 0,

  // Actions
  setSession: (session) => {
    set({
      session,
      isRunning: false,
      startAt: null,
      elapsedOffsetMs: 0,
    });
  },

  startTimer: () => {
    const { session, isRunning, startAt } = get();
    if (!session || isRunning) return;
    set({ isRunning: true, startAt: Date.now() });
  },

  stopTimer: () => {
    const { isRunning, startAt, elapsedOffsetMs } = get();
    if (!isRunning || startAt == null) {
      set({ isRunning: false, startAt: null });
      return;
    }
    const delta = Date.now() - startAt;
    set({
      isRunning: false,
      startAt: null,
      elapsedOffsetMs: elapsedOffsetMs + delta,
    });
  },

  resetTimer: () => {
    set({
      isRunning: false,
      startAt: null,
      elapsedOffsetMs: 0,
    });
  },
}));
