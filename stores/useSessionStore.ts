import { Animated } from "react-native";
import { create } from "zustand";
import { Session } from "../assets/data/mock";

interface SessionState {
  // State
  session: Session | null;
  animatedValue: Animated.Value;
  remainingTime: number;
  isRunning: boolean;

  // Actions
  setSession: (session: Session) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  session: null,
  animatedValue: new Animated.Value(0),
  remainingTime: 0,
  isRunning: false,

  // Actions
  setSession: (session) => {
    const { animatedValue } = get();

    // Reset animation value
    animatedValue.setValue(0);

    // Set up listener for remaining time updates
    // First remove any existing listeners to prevent duplicates
    animatedValue.removeAllListeners();

    // Add new listener
    const listenerId = animatedValue.addListener((v) => {
      set({ remainingTime: Math.round(session.totalDuration - v.value) });
    });

    set({
      session,
      remainingTime: session.totalDuration,
      isRunning: false,
    });
  },

  startTimer: () => {
    const { session, animatedValue, isRunning } = get();

    if (!session || isRunning) {
      return;
    }

    // Stop any existing animation first
    animatedValue.stopAnimation();

    // Reset animation value to 0 before starting
    animatedValue.setValue(0);

    Animated.timing(animatedValue, {
      toValue: session.totalDuration,
      duration: session.totalDuration * 1000,
      useNativeDriver: true,
    }).start();

    set({ isRunning: true });
  },

  stopTimer: () => {
    const { animatedValue } = get();
    animatedValue.stopAnimation();
    set({ isRunning: false });
  },

  resetTimer: () => {
    const { session, animatedValue } = get();
    if (!session) return;

    animatedValue.setValue(0);
    set({
      remainingTime: session.totalDuration,
      isRunning: false,
    });
  },
}));
