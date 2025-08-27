import { TimerState } from "@/types";
import { create } from "zustand";

// Time input interface
interface TimeInput {
  hours: string;
  minutes: string;
  seconds: string;
}

interface TimerStore extends TimerState {
  // Additional state
  timeInput: TimeInput;

  // Actions
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  toggleTimer: () => void;
  setTimeInput: (timeInput: TimeInput) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  // Initial state
  isRunning: false,
  startAt: null,
  elapsedOffsetMs: 0,
  timeInput: { hours: "", minutes: "", seconds: "" },

  // Actions
  startTimer: () => {
    const { isRunning } = get();
    if (isRunning) return;
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

  toggleTimer: () => {
    const { isRunning } = get();
    if (isRunning) {
      get().stopTimer();
    } else {
      get().startTimer();
    }
  },

  setTimeInput: (timeInput: TimeInput) => {
    set({ timeInput });
  },
}));
