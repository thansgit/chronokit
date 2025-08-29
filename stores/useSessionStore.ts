import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@/types";
import { generateId } from "@/helpers/id";

interface SessionState {
  // State
  session: Session | null;
  sessions: Session[];

  // Actions
  setSession: (session: Session) => void;
  startNewSession: () => void;
  addSession: (session: Session) => void;
  updateSession: (session: Session) => void;
  deleteSession: (sessionId: string) => void;
  getSessionById: (sessionId: string) => Session | undefined;
  saveCurrentSession: () => void;
  selectSession: (sessionId: string) => void;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      sessions: [],

      // Actions
      setSession: (session) => {
        set({ session });
      },

      startNewSession: () => {
        // Clear current working draft. Duration will be set on InputDurationScreen.
        set({ session: null });
      },

      addSession: (session) => {
        set((state) => ({ sessions: [...state.sessions, session] }));
      },

      updateSession: (updatedSession) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === updatedSession.id ? updatedSession : s
          ),
          // Also update current session if it's the one being updated
          session:
            state.session?.id === updatedSession.id
              ? updatedSession
              : state.session,
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          // Clear current session if it's the one being deleted
          session: state.session?.id === sessionId ? null : state.session,
        }));
      },

      getSessionById: (sessionId) => {
        return get().sessions.find((s) => s.id === sessionId);
      },

      saveCurrentSession: () => {
        const current = get().session;
        if (!current) return;
        set((state) => {
          const exists = state.sessions.some((s) => s.id === current.id);
          return exists
            ? {
                sessions: state.sessions.map((s) =>
                  s.id === current.id ? current : s
                ),
              }
            : { sessions: [...state.sessions, current] };
        });
      },

      selectSession: (sessionId) => {
        const found = get().sessions.find((s) => s.id === sessionId) || null;
        set({ session: found });
      },

      clearSessions: () => {
        set({ sessions: [] });
      },
    }),
    {
      name: "chronokit/sessions",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session, sessions: state.sessions }),
    }
  )
);
